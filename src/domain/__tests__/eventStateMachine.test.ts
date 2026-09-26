import { EventStateMachine } from '../eventStateMachine';
import { Event, EventAttendee } from '../types';

describe('Phase 8: EventStateMachine Pure Domain Tests', () => {
  const sampleEvent: Event = {
    id: 'ev_test_1',
    title: 'Indiranagar 35mm Film Photowalk',
    activityType: 'Photography',
    hostId: 'host_1',
    hostName: 'Aisha Rao',
    dateStr: 'Saturday, Oct 12',
    timeStr: '8:00 AM',
    venueZone: 'Indiranagar',
    venueCategory: 'Public Street Walk',
    capacity: 3,
    rsvpsCount: 0,
    state: 'upcoming',
    priceBand: 'Free',
    checkInCode: '4921',
  };

  describe('EVENT-04: RSVP Capacity & Waitlist State Machine', () => {
    it('grants "going" status when event has available capacity', () => {
      const attendees: EventAttendee[] = [
        {
          userId: 'u1',
          userName: 'Rohan',
          status: 'going',
          rsvpdAt: '2026-10-01T10:00:00Z',
        },
      ];

      const { attendee, result } = EventStateMachine.evaluateRsvp(sampleEvent, attendees, {
        userId: 'u2',
        userName: 'Sneha',
      });

      expect(result.action).toBe('promote_to_going');
      expect(result.newStatus).toBe('going');
      expect(attendee.status).toBe('going');
      expect(result.rsvpsCount).toBe(2);
      expect(result.waitlistCount).toBe(0);
    });

    it('enforces server-authoritative capacity limit and places overflow on waitlist', () => {
      const fullAttendees: EventAttendee[] = [
        { userId: 'u1', userName: 'User 1', status: 'going', rsvpdAt: '2026-10-01T10:00:00Z' },
        { userId: 'u2', userName: 'User 2', status: 'going', rsvpdAt: '2026-10-01T10:05:00Z' },
        { userId: 'u3', userName: 'User 3', status: 'going', rsvpdAt: '2026-10-01T10:10:00Z' },
      ];

      const { attendee, result } = EventStateMachine.evaluateRsvp(sampleEvent, fullAttendees, {
        userId: 'u4',
        userName: 'Overflow User',
      });

      expect(result.action).toBe('add_to_waitlist');
      expect(result.newStatus).toBe('waitlist');
      expect(attendee.status).toBe('waitlist');
      expect(result.rsvpsCount).toBe(3);
      expect(result.waitlistCount).toBe(1);
    });

    it('handles last-seat race condition deterministically', () => {
      // 2 confirmed out of 3 capacity (1 seat left)
      let currentAttendees: EventAttendee[] = [
        { userId: 'u1', userName: 'User 1', status: 'going', rsvpdAt: '2026-10-01T10:00:00Z' },
        { userId: 'u2', userName: 'User 2', status: 'going', rsvpdAt: '2026-10-01T10:05:00Z' },
      ];

      // Racer A attempts RSVP
      const resA = EventStateMachine.evaluateRsvp(sampleEvent, currentAttendees, {
        userId: 'u_racer_a',
        userName: 'Racer A',
      });
      expect(resA.result.newStatus).toBe('going');
      currentAttendees = [...currentAttendees, resA.attendee];

      // Racer B attempts RSVP concurrently right after
      const resB = EventStateMachine.evaluateRsvp(sampleEvent, currentAttendees, {
        userId: 'u_racer_b',
        userName: 'Racer B',
      });
      expect(resB.result.newStatus).toBe('waitlist');
      currentAttendees = [...currentAttendees, resB.attendee];

      expect(currentAttendees.filter((a) => a.status === 'going').length).toBe(3);
      expect(currentAttendees.filter((a) => a.status === 'waitlist').length).toBe(1);
    });

    it('automatically promotes first waitlisted member when a confirmed attendee cancels', () => {
      const attendeesWithWaitlist: EventAttendee[] = [
        { userId: 'u1', userName: 'User 1', status: 'going', rsvpdAt: '2026-10-01T10:00:00Z' },
        { userId: 'u2', userName: 'User 2', status: 'going', rsvpdAt: '2026-10-01T10:05:00Z' },
        { userId: 'u3', userName: 'User 3', status: 'going', rsvpdAt: '2026-10-01T10:10:00Z' },
        { userId: 'u4_wait', userName: 'Waitlist 1', status: 'waitlist', rsvpdAt: '2026-10-01T10:15:00Z' },
        { userId: 'u5_wait', userName: 'Waitlist 2', status: 'waitlist', rsvpdAt: '2026-10-01T10:20:00Z' },
      ];

      // User 2 cancels
      const cancelRes = EventStateMachine.handleCancellation(
        sampleEvent,
        attendeesWithWaitlist,
        'u2'
      );

      expect(cancelRes.promotedAttendee?.userId).toBe('u4_wait');
      expect(cancelRes.promotedAttendee?.status).toBe('going');
      expect(cancelRes.newRsvpsCount).toBe(3); // Capacity remains capped at 3
      expect(cancelRes.newWaitlistCount).toBe(1); // Only Waitlist 2 remains on waitlist

      const cancelledUser = cancelRes.updatedAttendees.find((a) => a.userId === 'u2');
      expect(cancelledUser?.status).toBe('cancelled');
    });
  });

  describe('EVENT-05: Pre-Event Safety & Check-In Validation', () => {
    it('validates successful check-in for confirmed attendees with correct 4-digit code', () => {
      const attendee: EventAttendee = {
        userId: 'u1',
        userName: 'Aisha',
        status: 'going',
        rsvpdAt: '2026-10-01T10:00:00Z',
      };

      const validCheck = EventStateMachine.validateCheckIn(sampleEvent, attendee, '4921');
      expect(validCheck.success).toBe(true);

      const invalidCodeCheck = EventStateMachine.validateCheckIn(sampleEvent, attendee, '0000');
      expect(invalidCodeCheck.success).toBe(false);
      expect(invalidCodeCheck.error).toContain('Invalid check-in code');
    });

    it('rejects check-in for waitlisted or cancelled attendees', () => {
      const waitAttendee: EventAttendee = {
        userId: 'u_wait',
        userName: 'Wait',
        status: 'waitlist',
        rsvpdAt: '2026-10-01T10:00:00Z',
      };

      const res = EventStateMachine.validateCheckIn(sampleEvent, waitAttendee, '4921');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Waitlisted members cannot check in');
    });
  });

  describe('EVENT-07: Date Planning Guards & Outcomes', () => {
    it('strictly denies date planning for non-dating connections', () => {
      const nonDatingCheck = EventStateMachine.canInitiateDatePlan(false, 'FRIEND');
      expect(nonDatingCheck.allowed).toBe(false);
      expect(nonDatingCheck.reason).toContain('exclusively available for mutually opted-in dating');
    });

    it('permits date planning for mutually dating connections', () => {
      const datingCheck = EventStateMachine.canInitiateDatePlan(true, 'DATING');
      expect(datingCheck.allowed).toBe(true);
    });

    it('handles date plan proposal state transitions', () => {
      expect(EventStateMachine.evaluateDatePlanTransition('proposed', 'counter')).toBe('counter_proposed');
      expect(EventStateMachine.evaluateDatePlanTransition('counter_proposed', 'confirm')).toBe('confirmed');
      expect(EventStateMachine.evaluateDatePlanTransition('confirmed', 'complete')).toBe('completed');
    });

    it('maps post-date outcomes to relationship progression and safety controls', () => {
      const datingOutcome = EventStateMachine.evaluateDatePlanOutcome('continue_dating');
      expect(datingOutcome.shouldTransitionRelationship).toBe(true);
      expect(datingOutcome.nextStage).toBe('DATING');

      const friendOutcome = EventStateMachine.evaluateDatePlanOutcome('friends');
      expect(friendOutcome.shouldTransitionRelationship).toBe(true);
      expect(friendOutcome.nextStage).toBe('FRIEND');

      const stopOutcome = EventStateMachine.evaluateDatePlanOutcome('stop');
      expect(stopOutcome.shouldSever).toBe(true);
    });
  });
});
