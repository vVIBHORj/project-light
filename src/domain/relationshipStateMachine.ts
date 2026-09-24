import { UserProfile, RelationshipIntent } from './types';

export type RelationshipStage =
  | 'STRANGER'
  | 'SAME_INTEREST'
  | 'SAME_COMMUNITY'
  | 'SAME_CIRCLE'
  | 'REPEATED_INTERACTION'
  | 'MUTUAL_CONNECTION'
  | 'FRIEND'
  | 'ACTIVITY_PARTNER'
  | 'DATING';

export type SafetyAction = 'MUTE' | 'RESTRICT' | 'BLOCK' | 'REPORT';

export interface RelationshipSignals {
  hasSharedInterests: boolean;
  hasSharedCommunity: boolean;
  hasSharedCircle: boolean;
  interactionCount: number;
  isMutualAccepted: boolean;
  isMarkedAsFriend?: boolean;
  isMarkedAsActivityPartner?: boolean;
  isMutualDatingOptIn?: boolean;
}

export interface ConnectEligibilityResult {
  allowed: boolean;
  reason?: string;
  allowedIntents: RelationshipIntent[];
}

/**
 * Pure domain state machine for relationship progression.
 * Progression:
 * STRANGER → SAME_INTEREST → SAME_COMMUNITY → SAME_CIRCLE → REPEATED_INTERACTION → MUTUAL_CONNECTION → FRIEND / ACTIVITY_PARTNER → [OPTIONAL] DATING
 */
export class RelationshipStateMachine {
  /**
   * Evaluate the highest organic relationship stage based on recorded signals.
   */
  static evaluateStage(signals: RelationshipSignals): RelationshipStage {
    if (signals.isMutualDatingOptIn && signals.isMutualAccepted) {
      return 'DATING';
    }

    if (signals.isMarkedAsFriend && signals.isMutualAccepted) {
      return 'FRIEND';
    }

    if (signals.isMarkedAsActivityPartner && signals.isMutualAccepted) {
      return 'ACTIVITY_PARTNER';
    }

    if (signals.isMutualAccepted) {
      return 'MUTUAL_CONNECTION';
    }

    if (signals.interactionCount >= 3) {
      return 'REPEATED_INTERACTION';
    }

    if (signals.hasSharedCircle) {
      return 'SAME_CIRCLE';
    }

    if (signals.hasSharedCommunity) {
      return 'SAME_COMMUNITY';
    }

    if (signals.hasSharedInterests) {
      return 'SAME_INTEREST';
    }

    return 'STRANGER';
  }

  /**
   * Determine if a user can send a connection request to another user.
   * Hard rules:
   * 1. Blocked users can never send or receive requests.
   * 2. Under-18 users cannot connect with standard users.
   * 3. Users cannot connect with themselves.
   * 4. Must share at least one context (shared interest, community, or circle).
   * 5. Dating intent is ONLY allowed if BOTH users have 'dating' in their allowed intents.
   */
  static canSendConnectRequest(
    requester: UserProfile,
    recipient: UserProfile,
    intent: RelationshipIntent,
    blockedUserIds: string[]
  ): ConnectEligibilityResult {
    const blockedSet = new Set(blockedUserIds);

    if (requester.userId === recipient.userId) {
      return { allowed: false, reason: 'Cannot connect with yourself.', allowedIntents: [] };
    }

    if (blockedSet.has(recipient.userId) || blockedSet.has(requester.userId)) {
      return { allowed: false, reason: 'Unable to send request to this profile.', allowedIntents: [] };
    }

    if (requester.age < 18 || recipient.age < 18) {
      return { allowed: false, reason: 'Age assurance hold.', allowedIntents: [] };
    }

    // Check shared context
    const requesterInterests = new Set(requester.interests || []);
    const hasSharedInterest = (recipient.interests || []).some((i) => requesterInterests.has(i));
    const hasSharedZone = requester.zone === recipient.zone;

    if (!hasSharedInterest && !hasSharedZone) {
      return {
        allowed: false,
        reason: 'Connection requests require shared context (shared interest, circle, or neighborhood).',
        allowedIntents: [],
      };
    }

    // Calculate allowed intents
    const requesterIntents = [requester.primaryIntent, ...(requester.openToIntents || [])];
    const recipientIntents = [recipient.primaryIntent, ...(recipient.openToIntents || [])];

    const allowedIntents: RelationshipIntent[] = [];

    if (requesterIntents.includes('friendship') && recipientIntents.includes('friendship')) {
      allowedIntents.push('friendship');
    }

    if (requesterIntents.includes('community') && recipientIntents.includes('community')) {
      allowedIntents.push('community');
    }

    if (requesterIntents.includes('explore') && recipientIntents.includes('explore')) {
      allowedIntents.push('explore');
    }

    // Dating intent is strictly mutual opt-in
    const datingPermitted = requesterIntents.includes('dating') && recipientIntents.includes('dating');
    if (datingPermitted) {
      allowedIntents.push('dating');
    }

    if (intent === 'dating' && !datingPermitted) {
      return {
        allowed: false,
        reason: 'Dating intent is only available when both individuals have mutually enabled dating preferences.',
        allowedIntents,
      };
    }

    return { allowed: true, allowedIntents };
  }

  /**
   * Evaluate Dating progression (CONN-05).
   * Strict rule: One-sided opt-in remains a standard non-dating connection,
   * and the other person is never notified who opted in or declined.
   */
  static evaluateDatingProgression(
    requesterOptedIn: boolean,
    recipientOptedIn: boolean
  ): { isMutualDating: boolean; stage: RelationshipStage } {
    if (requesterOptedIn && recipientOptedIn) {
      return { isMutualDating: true, stage: 'DATING' };
    }
    return { isMutualDating: false, stage: 'MUTUAL_CONNECTION' };
  }

  /**
   * Apply safety action (MUTE, RESTRICT, BLOCK, REPORT) available at any point.
   */
  static applySafetyAction(
    currentStage: RelationshipStage,
    action: SafetyAction
  ): { isChatAllowed: boolean; isVisible: boolean; nextStage: RelationshipStage } {
    switch (action) {
      case 'BLOCK':
        return { isChatAllowed: false, isVisible: false, nextStage: 'STRANGER' };
      case 'RESTRICT':
        return { isChatAllowed: false, isVisible: true, nextStage: currentStage };
      case 'MUTE':
        return { isChatAllowed: true, isVisible: true, nextStage: currentStage };
      case 'REPORT':
        return { isChatAllowed: false, isVisible: true, nextStage: currentStage };
    }
  }
}
