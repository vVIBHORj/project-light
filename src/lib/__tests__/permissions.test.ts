import {
  isAdult,
  canViewInDatingContext,
  canSendDirectMessage,
  isInteractionPermitted,
  formatPrivacySafeDistance,
} from '../permissions';
import { Connection } from '../../domain/types';

describe('Permissions & Eligibility Helpers', () => {
  describe('isAdult', () => {
    it('returns true for 18+ years old', () => {
      const adultDob = '2000-01-01';
      expect(isAdult(adultDob)).toBe(true);
    });

    it('returns false for under 18', () => {
      const today = new Date();
      const under18Year = today.getFullYear() - 16;
      const under18Dob = `${under18Year}-01-01`;
      expect(isAdult(under18Dob)).toBe(false);
    });

    it('handles invalid dates gracefully', () => {
      expect(isAdult('invalid-date')).toBe(false);
    });
  });

  describe('canViewInDatingContext', () => {
    it('allows when both viewer and candidate have dating intent', () => {
      const viewer = { primaryIntent: 'dating' as const, openToIntents: [] };
      const candidate = { primaryIntent: 'dating' as const, openToIntents: [] };
      expect(canViewInDatingContext(viewer, candidate)).toBe(true);
    });

    it('allows when viewer has friendship but is open to dating and candidate has dating', () => {
      const viewer = { primaryIntent: 'friendship' as const, openToIntents: ['dating' as const] };
      const candidate = { primaryIntent: 'dating' as const, openToIntents: [] };
      expect(canViewInDatingContext(viewer, candidate)).toBe(true);
    });

    it('blocks when viewer is strictly friendship and candidate is dating', () => {
      const viewer = { primaryIntent: 'friendship' as const, openToIntents: ['community' as const] };
      const candidate = { primaryIntent: 'dating' as const, openToIntents: [] };
      expect(canViewInDatingContext(viewer, candidate)).toBe(false);
    });

    it('blocks when viewer wants dating but candidate is strictly community', () => {
      const viewer = { primaryIntent: 'dating' as const, openToIntents: [] };
      const candidate = { primaryIntent: 'community' as const, openToIntents: [] };
      expect(canViewInDatingContext(viewer, candidate)).toBe(false);
    });
  });

  describe('canSendDirectMessage', () => {
    it('returns true only if connection is accepted', () => {
      const acceptedConn: Connection = {
        id: 'c1',
        requesterId: 'u1',
        recipientId: 'u2',
        state: 'accepted',
        requesterIntent: 'friendship',
        createdAt: '2026-09-24',
        updatedAt: '2026-09-24',
      };
      expect(canSendDirectMessage(acceptedConn)).toBe(true);
    });

    it('returns false if connection is pending or null', () => {
      const pendingConn: Connection = {
        id: 'c2',
        requesterId: 'u1',
        recipientId: 'u2',
        state: 'pending',
        requesterIntent: 'friendship',
        createdAt: '2026-09-24',
        updatedAt: '2026-09-24',
      };
      expect(canSendDirectMessage(pendingConn)).toBe(false);
      expect(canSendDirectMessage(null)).toBe(false);
    });
  });

  describe('isInteractionPermitted', () => {
    it('blocks user if in blocked list', () => {
      const result = isInteractionPermitted('user-bad', ['user-bad', 'user-other'], []);
      expect(result.permitted).toBe(false);
      expect(result.reason).toBe('blocked');
    });

    it('marks restricted if in restricted list', () => {
      const result = isInteractionPermitted('user-annoying', [], ['user-annoying']);
      expect(result.permitted).toBe(true);
      expect(result.reason).toBe('restricted');
    });

    it('allows clean user', () => {
      const result = isInteractionPermitted('user-good', [], []);
      expect(result.permitted).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('formatPrivacySafeDistance', () => {
    it('returns distance bands without raw exact distance', () => {
      expect(formatPrivacySafeDistance(0.4)).toBe('Within 1 km');
      expect(formatPrivacySafeDistance(2.1)).toBe('1 to 3 km');
      expect(formatPrivacySafeDistance(4.5)).toBe('2 to 6 km');
      expect(formatPrivacySafeDistance(9.0)).toBe('5 to 12 km');
      expect(formatPrivacySafeDistance(25.0)).toBe('In your city');
    });
  });
});
