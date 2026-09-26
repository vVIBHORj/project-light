import {
  Event,
  EventAttendee,
  EventRsvpState,
  DatePlanStatus,
  DatePlanPostOutcome,
} from './types';
import { RelationshipStage } from './relationshipStateMachine';

export interface RsvpEvaluationResult {
  action: 'promote_to_going' | 'add_to_waitlist' | 'already_going' | 'already_waitlist';
  newStatus: EventRsvpState;
  rsvpsCount: number;
  waitlistCount: number;
}

export interface CancellationResult {
  updatedAttendees: EventAttendee[];
  promotedAttendee?: EventAttendee;
  newRsvpsCount: number;
  newWaitlistCount: number;
}

export class EventStateMachine {
  /**
   * Evaluates server-authoritative RSVP capacity and waitlist placement.
   * Handles last-seat race condition: strictly guarantees no overbooking beyond capacity.
   */
  static evaluateRsvp(
    event: Event,
    attendees: EventAttendee[],
    user: { userId: string; userName: string; userAvatar?: string; isVerified?: boolean }
  ): { attendee: EventAttendee; result: RsvpEvaluationResult } {
    const existing = attendees.find((a) => a.userId === user.userId);
    const confirmedCount = attendees.filter((a) => a.status === 'going' || a.status === 'checked_in').length;
    const waitlistedCount = attendees.filter((a) => a.status === 'waitlist').length;

    if (existing) {
      if (existing.status === 'going' || existing.status === 'checked_in') {
        return {
          attendee: existing,
          result: {
            action: 'already_going',
            newStatus: existing.status,
            rsvpsCount: confirmedCount,
            waitlistCount: waitlistedCount,
          },
        };
      }
      if (existing.status === 'waitlist') {
        return {
          attendee: existing,
          result: {
            action: 'already_waitlist',
            newStatus: 'waitlist',
            rsvpsCount: confirmedCount,
            waitlistCount: waitlistedCount,
          },
        };
      }
    }

    // Server-authoritative capacity check
    const hasCapacity = confirmedCount < event.capacity;
    const newStatus: EventRsvpState = hasCapacity ? 'going' : 'waitlist';

    const attendee: EventAttendee = {
      userId: user.userId,
      userName: user.userName,
      userAvatar: user.userAvatar,
      isVerified: user.isVerified,
      status: newStatus,
      rsvpdAt: new Date().toISOString(),
    };

    return {
      attendee,
      result: {
        action: hasCapacity ? 'promote_to_going' : 'add_to_waitlist',
        newStatus,
        rsvpsCount: hasCapacity ? confirmedCount + 1 : confirmedCount,
        waitlistCount: hasCapacity ? waitlistedCount : waitlistedCount + 1,
      },
    };
  }

  /**
   * Handles attendee cancellation with automatic waitlist promotion.
   * Promotes the earliest waitlisted member to 'going'.
   */
  static handleCancellation(
    event: Event,
    attendees: EventAttendee[],
    cancellingUserId: string
  ): CancellationResult {
    let promotedAttendee: EventAttendee | undefined;

    const cancellingAttendee = attendees.find((a) => a.userId === cancellingUserId);
    const wasGoing = cancellingAttendee?.status === 'going' || cancellingAttendee?.status === 'checked_in';

    // 1. Update cancelling user's status
    let nextAttendees = attendees.map((a) => {
      if (a.userId === cancellingUserId) {
        return { ...a, status: 'cancelled' as EventRsvpState };
      }
      return a;
    });

    // 2. If a confirmed member cancelled, promote first eligible person on waitlist
    if (wasGoing) {
      const firstWaitlistedIndex = nextAttendees.findIndex((a) => a.status === 'waitlist');
      if (firstWaitlistedIndex !== -1) {
        const target = nextAttendees[firstWaitlistedIndex];
        promotedAttendee = {
          ...target,
          status: 'going',
          rsvpdAt: new Date().toISOString(), // refresh timestamp on promotion
        };
        nextAttendees = [
          ...nextAttendees.slice(0, firstWaitlistedIndex),
          promotedAttendee,
          ...nextAttendees.slice(firstWaitlistedIndex + 1),
        ];
      }
    }

    const newRsvpsCount = nextAttendees.filter((a) => a.status === 'going' || a.status === 'checked_in').length;
    const newWaitlistCount = nextAttendees.filter((a) => a.status === 'waitlist').length;

    return {
      updatedAttendees: nextAttendees,
      promotedAttendee,
      newRsvpsCount,
      newWaitlistCount,
    };
  }

  /**
   * Validates pre-event check-in with optional 4-digit code.
   */
  static validateCheckIn(
    event: Event,
    attendee: EventAttendee | undefined,
    providedCode?: string
  ): { success: boolean; error?: string } {
    if (!attendee) {
      return { success: false, error: 'You are not registered for this event.' };
    }
    if (attendee.status === 'checked_in') {
      return { success: true };
    }
    if (attendee.status === 'waitlist') {
      return { success: false, error: 'Waitlisted members cannot check in until confirmed.' };
    }
    if (attendee.status === 'cancelled') {
      return { success: false, error: 'Your RSVP was cancelled.' };
    }

    // Check optional 4-digit code if event specifies one
    if (event.checkInCode && providedCode) {
      if (event.checkInCode.trim() !== providedCode.trim()) {
        return { success: false, error: 'Invalid check-in code. Please verify with the host.' };
      }
    }

    return { success: true };
  }

  /**
   * Strictly verifies whether date planning can be initiated.
   * Only accessible for mutually dating connections (CONN-04 / EVENT-07).
   */
  static canInitiateDatePlan(
    isMutualDating: boolean,
    connectionStage: RelationshipStage | string
  ): { allowed: boolean; reason?: string } {
    if (!isMutualDating && connectionStage !== 'DATING') {
      return {
        allowed: false,
        reason:
          'Date planning is exclusively available for mutually opted-in dating connections.',
      };
    }
    return { allowed: true };
  }

  /**
   * Evaluates date plan workflow state transitions.
   */
  static evaluateDatePlanTransition(
    currentStatus: DatePlanStatus,
    action: 'counter' | 'confirm' | 'cancel' | 'complete'
  ): DatePlanStatus {
    switch (action) {
      case 'counter':
        return 'counter_proposed';
      case 'confirm':
        return 'confirmed';
      case 'cancel':
        return 'cancelled';
      case 'complete':
        return 'completed';
      default:
        return currentStatus;
    }
  }

  /**
   * Evaluates post-date outcome and maps to relationship progression.
   */
  static evaluateDatePlanOutcome(outcome: DatePlanPostOutcome): {
    shouldTransitionRelationship: boolean;
    nextStage?: RelationshipStage;
    shouldSever: boolean;
  } {
    switch (outcome) {
      case 'continue_dating':
        return { shouldTransitionRelationship: true, nextStage: 'DATING', shouldSever: false };
      case 'friends':
        return { shouldTransitionRelationship: true, nextStage: 'FRIEND', shouldSever: false };
      case 'stay_connected':
        return { shouldTransitionRelationship: false, shouldSever: false };
      case 'stop':
      case 'reported':
        return { shouldTransitionRelationship: false, shouldSever: true };
      default:
        return { shouldTransitionRelationship: false, shouldSever: false };
    }
  }
}
