import { RelationshipStateMachine, RelationshipSignals } from '../relationshipStateMachine';
import { UserProfile } from '../types';

describe('Relationship State Machine (Pure Domain Module)', () => {
  const userA: UserProfile = {
    userId: 'user_a',
    displayName: 'Aisha Rao',
    bio: 'Designer',
    age: 26,
    ageBand: '25-29',
    gender: 'woman',
    city: 'Bengaluru',
    zone: 'Indiranagar',
    languages: ['English', 'Hindi'],
    primaryIntent: 'friendship',
    openToIntents: ['friendship', 'explore', 'dating'],
    photos: ['https://example.com/a.jpg'],
    interests: ['Photography (35mm / Digital)', 'Badminton', 'Artisan Coffee'],
    isVerified: true,
    completionPercentage: 100,
  };

  const userB_MutualDating: UserProfile = {
    userId: 'user_b',
    displayName: 'Pooja Iyer',
    bio: 'Filmmaker',
    age: 24,
    ageBand: '22-24',
    gender: 'woman',
    city: 'Bengaluru',
    zone: 'Indiranagar',
    languages: ['English', 'Tamil'],
    primaryIntent: 'dating',
    openToIntents: ['dating', 'friendship'],
    photos: ['https://example.com/b.jpg'],
    interests: ['Photography (35mm / Digital)', 'Artisan Coffee'],
    isVerified: true,
    completionPercentage: 100,
  };

  const userC_NoDating: UserProfile = {
    userId: 'user_c',
    displayName: 'Rohan Mehta',
    bio: 'Engineer',
    age: 28,
    ageBand: '25-29',
    gender: 'man',
    city: 'Bengaluru',
    zone: 'Indiranagar',
    languages: ['English'],
    primaryIntent: 'community',
    openToIntents: ['community', 'friendship'], // No dating
    photos: ['https://example.com/c.jpg'],
    interests: ['Badminton'],
    isVerified: true,
    completionPercentage: 90,
  };

  describe('Stage Progression Evaluation', () => {
    it('returns STRANGER when no signals exist', () => {
      const signals: RelationshipSignals = {
        hasSharedInterests: false,
        hasSharedCommunity: false,
        hasSharedCircle: false,
        interactionCount: 0,
        isMutualAccepted: false,
      };
      expect(RelationshipStateMachine.evaluateStage(signals)).toBe('STRANGER');
    });

    it('progresses through SAME_INTEREST, SAME_COMMUNITY, and SAME_CIRCLE', () => {
      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: false,
          hasSharedCircle: false,
          interactionCount: 0,
          isMutualAccepted: false,
        })
      ).toBe('SAME_INTEREST');

      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: true,
          hasSharedCircle: false,
          interactionCount: 0,
          isMutualAccepted: false,
        })
      ).toBe('SAME_COMMUNITY');

      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: true,
          hasSharedCircle: true,
          interactionCount: 0,
          isMutualAccepted: false,
        })
      ).toBe('SAME_CIRCLE');
    });

    it('evaluates REPEATED_INTERACTION when interaction count >= 3', () => {
      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: true,
          hasSharedCircle: true,
          interactionCount: 3,
          isMutualAccepted: false,
        })
      ).toBe('REPEATED_INTERACTION');
    });

    it('evaluates MUTUAL_CONNECTION, FRIEND, and DATING stages', () => {
      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: true,
          hasSharedCircle: true,
          interactionCount: 5,
          isMutualAccepted: true,
        })
      ).toBe('MUTUAL_CONNECTION');

      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: true,
          hasSharedCircle: true,
          interactionCount: 5,
          isMutualAccepted: true,
          isMarkedAsFriend: true,
        })
      ).toBe('FRIEND');

      expect(
        RelationshipStateMachine.evaluateStage({
          hasSharedInterests: true,
          hasSharedCommunity: true,
          hasSharedCircle: true,
          interactionCount: 5,
          isMutualAccepted: true,
          isMutualDatingOptIn: true,
        })
      ).toBe('DATING');
    });
  });

  describe('Connect Request Eligibility Rules (CONN-01)', () => {
    it('allows connection request between users with shared context', () => {
      const res = RelationshipStateMachine.canSendConnectRequest(userA, userB_MutualDating, 'friendship', []);
      expect(res.allowed).toBe(true);
      expect(res.allowedIntents).toContain('friendship');
      expect(res.allowedIntents).toContain('dating');
    });

    it('blocks connection request to blocked users', () => {
      const res = RelationshipStateMachine.canSendConnectRequest(
        userA,
        userB_MutualDating,
        'friendship',
        ['user_b']
      );
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Unable to send request');
    });

    it('prevents dating intent when one user has not enabled dating', () => {
      const res = RelationshipStateMachine.canSendConnectRequest(userA, userC_NoDating, 'dating', []);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Dating intent is only available when both individuals have mutually enabled dating');
      expect(res.allowedIntents).toContain('friendship');
      expect(res.allowedIntents).not.toContain('dating');
    });
  });

  describe('Two-Sided Dating Progression (CONN-05)', () => {
    it('progresses to DATING stage ONLY when BOTH users mutually opt in', () => {
      const mutual = RelationshipStateMachine.evaluateDatingProgression(true, true);
      expect(mutual.isMutualDating).toBe(true);
      expect(mutual.stage).toBe('DATING');
    });

    it('keeps stage as non-dating when only one user opts in', () => {
      const oneSided1 = RelationshipStateMachine.evaluateDatingProgression(true, false);
      expect(oneSided1.isMutualDating).toBe(false);
      expect(oneSided1.stage).toBe('MUTUAL_CONNECTION');

      const oneSided2 = RelationshipStateMachine.evaluateDatingProgression(false, true);
      expect(oneSided2.isMutualDating).toBe(false);
      expect(oneSided2.stage).toBe('MUTUAL_CONNECTION');
    });
  });

  describe('Safety Actions at Any Stage', () => {
    it('revokes chat and visibility on BLOCK', () => {
      const res = RelationshipStateMachine.applySafetyAction('FRIEND', 'BLOCK');
      expect(res.isChatAllowed).toBe(false);
      expect(res.isVisible).toBe(false);
      expect(res.nextStage).toBe('STRANGER');
    });

    it('revokes chat while maintaining safety reporting on RESTRICT', () => {
      const res = RelationshipStateMachine.applySafetyAction('MUTUAL_CONNECTION', 'RESTRICT');
      expect(res.isChatAllowed).toBe(false);
      expect(res.isVisible).toBe(true);
    });
  });
});
