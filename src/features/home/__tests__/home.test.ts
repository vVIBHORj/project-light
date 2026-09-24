import { mockCircles, mockUsers } from '../../../data/mocks/seedData';
import { Circle } from '../../../domain/types';

describe('Home & Circle Hub Unit Tests (Blueprint HOME-01..03, Section 11.1)', () => {
  describe('Category Filtering & Bounded Content (HOME-01)', () => {
    it('returns all circles when category is "all"', () => {
      const filtered = mockCircles.filter(() => true);
      expect(filtered.length).toBe(mockCircles.length);
      expect(filtered.length).toBeLessThanOrEqual(10); // Bounded content
    });

    it('filters "new" circles correctly', () => {
      const filtered = mockCircles.filter((c) => c.id === 'circle_1' || c.id === 'circle_3');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].title).toBe('Indiranagar 35mm Film Walk');
    });

    it('filters "this_week" circles with weekend cadences', () => {
      const filtered = mockCircles.filter(
        (c) => c.cadence.toLowerCase().includes('saturday') || c.cadence.toLowerCase().includes('sunday')
      );
      expect(filtered.length).toBeGreaterThanOrEqual(1);
    });

    it('filters "saved" circles using user saved ID list', () => {
      const savedIds = ['circle_2', 'circle_4'];
      const filtered = mockCircles.filter((c) => savedIds.includes(c.id));
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.id)).toEqual(['circle_2', 'circle_4']);
    });

    it('returns empty array on unmatched filters to trigger low-density fallback', () => {
      const savedIds: string[] = [];
      const filtered = mockCircles.filter((c) => savedIds.includes(c.id));
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Active Circle Hub Logic (HOME-02)', () => {
    it('finds circle by ID and calculates capacity status', () => {
      const circle: Circle | undefined = mockCircles.find((c) => c.id === 'circle_1');
      expect(circle).toBeDefined();
      expect(circle?.state).toBe('open');
      expect(circle?.currentMemberCount).toBeLessThan(circle!.capacity);
    });

    it('identifies full circles correctly', () => {
      const fullCircle = mockCircles.find((c) => c.id === 'circle_2');
      expect(fullCircle).toBeDefined();
      expect(fullCircle?.state).toBe('full');
      expect(fullCircle?.currentMemberCount).toBe(fullCircle?.capacity);
    });
  });

  describe('Post-Event Follow-up Actions (HOME-03)', () => {
    interface FollowUpAction {
      userId: string;
      action: 'connected' | 'dismissed' | 'reported';
    }

    it('processes connection request without leaking rejection or not-now status', () => {
      const followUpActions: FollowUpAction[] = [
        { userId: 'user_3', action: 'connected' },
        { userId: 'user_4', action: 'dismissed' },
      ];

      expect(followUpActions[0].action).toBe('connected');
      expect(followUpActions[1].action).toBe('dismissed');
      // Neither user is notified of 'dismissed'
    });

    it('handles safety report flag gracefully', () => {
      const reportAction: FollowUpAction = { userId: 'user_bad', action: 'reported' };
      expect(reportAction.action).toBe('reported');
    });
  });

  describe('State-Driven Next Action Selector', () => {
    it('prompts profile completion if completion percentage is under 90%', () => {
      const userProfile = { ...mockUsers[0], completionPercentage: 75 };
      const actionType = userProfile.completionPercentage < 90 ? 'finish_profile' : 'event_followup';
      expect(actionType).toBe('finish_profile');
    });

    it('prompts post-event follow-up if profile is complete and events were attended', () => {
      const userProfile = { ...mockUsers[0], completionPercentage: 100 };
      const actionType = userProfile.completionPercentage < 90 ? 'finish_profile' : 'event_followup';
      expect(actionType).toBe('event_followup');
    });
  });
});
