import {
  SafetyCaseStatus,
  SafetyTimelineItem,
  EmergencyHelpline,
} from './safetyTypes';

export class SafetyStateMachine {
  /**
   * Generates a deterministic, trackable Case ID for safety audits (SAFE-02, SAFE-03).
   */
  static generateCaseId(): string {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `CASE-${randomPart}-${year}`;
  }

  /**
   * Masks a phone number for privacy-safe display (SAFE-06).
   * E.g. '+91 9876543210' -> '+91 98****3210'
   */
  static maskPhoneNumber(phone: string): string {
    const cleaned = phone.trim();
    if (cleaned.length < 6) return '****';

    const first4 = cleaned.slice(0, Math.min(6, Math.floor(cleaned.length / 2) - 1));
    const last4 = cleaned.slice(-4);
    return `${first4}****${last4}`;
  }

  /**
   * Evaluates mutual visibility and messaging permissions between two users (SAFE-04).
   * - Block: mutual invisibility (neither can see or message the other).
   * - Restrict: quiet, one-way boundary (target cannot message actor, but target is never notified).
   */
  static evaluateVisibility(
    actorUserId: string,
    targetUserId: string,
    blockedUsers: Set<string>, // Set of 'userIdA:userIdB' pairs representing blocks
    restrictedUsers: Set<string> // Set of 'actorId:targetId' representing restrictions
  ): {
    isVisible: boolean;
    canMessage: boolean;
    isRestricted: boolean;
    isBlocked: boolean;
  } {
    // 1. Check mutual block
    const isBlockedByActor = blockedUsers.has(`${actorUserId}:${targetUserId}`);
    const isBlockedByTarget = blockedUsers.has(`${targetUserId}:${actorUserId}`);
    const isDirectBlocked = isBlockedByActor || isBlockedByTarget;

    if (isDirectBlocked) {
      return {
        isVisible: false,
        canMessage: false,
        isRestricted: false,
        isBlocked: true,
      };
    }

    // 2. Check restriction
    const isRestrictedByActor = restrictedUsers.has(`${actorUserId}:${targetUserId}`);
    const isRestrictedByTarget = restrictedUsers.has(`${targetUserId}:${actorUserId}`);

    if (isRestrictedByActor || isRestrictedByTarget) {
      return {
        isVisible: true,
        canMessage: false,
        isRestricted: true,
        isBlocked: false,
      };
    }

    return {
      isVisible: true,
      canMessage: true,
      isRestricted: false,
      isBlocked: false,
    };
  }

  /**
   * Evaluates safety report case timeline progression (SAFE-07).
   */
  static evaluateCaseTransition(
    currentStatus: SafetyCaseStatus,
    action:
      | 'start_review'
      | 'take_action'
      | 'close_no_action'
      | 'submit_appeal'
      | 'resolve_appeal'
  ): { nextStatus: SafetyCaseStatus; timelineItem: SafetyTimelineItem } {
    const now = new Date().toISOString();

    switch (action) {
      case 'start_review':
        return {
          nextStatus: 'in_review',
          timelineItem: {
            status: 'in_review',
            title: 'Under Moderator Review',
            description:
              'A safety team member is reviewing the report against Project LIGHT Community Guidelines.',
            timestamp: now,
          },
        };
      case 'take_action':
        return {
          nextStatus: 'action_taken',
          timelineItem: {
            status: 'action_taken',
            title: 'Action Taken',
            description:
              'Corrective enforcement was applied to the account in accordance with our safety policy.',
            timestamp: now,
          },
        };
      case 'close_no_action':
        return {
          nextStatus: 'no_action',
          timelineItem: {
            status: 'no_action',
            title: 'Review Concluded',
            description:
              'Based on available context, no direct violation was confirmed. Your report remains logged on record.',
            timestamp: now,
          },
        };
      case 'submit_appeal':
        return {
          nextStatus: 'appealed',
          timelineItem: {
            status: 'appealed',
            title: 'Appeal Submitted',
            description:
              'Your appeal request has been submitted for secondary senior review.',
            timestamp: now,
          },
        };
      case 'resolve_appeal':
        return {
          nextStatus: 'appeal_resolved',
          timelineItem: {
            status: 'appeal_resolved',
            title: 'Appeal Resolved',
            description:
              'Senior moderation has concluded review of your submitted appeal.',
            timestamp: now,
          },
        };
      default:
        return {
          nextStatus: currentStatus,
          timelineItem: {
            status: currentStatus,
            title: 'Status Updated',
            description: 'Case status updated.',
            timestamp: now,
          },
        };
    }
  }

  /**
   * Formats Indian Emergency helpline contact with calm informational advisory (SAFE-01).
   */
  static formatHelplineAdvisory(helpline: EmergencyHelpline): string {
    return `${helpline.name} (${helpline.number}) — ${helpline.description} [${helpline.available}]`;
  }
}
