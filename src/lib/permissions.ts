import { UserProfile, Connection } from '../domain/types';

/**
 * Validates whether user is 18 or older based on birth date.
 */
export function isAdult(dobString: string): boolean {
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
}

/**
 * Checks if user A can view user B under Dating intent rules (Blueprint 0.3, 3.1).
 * Dating candidates can only be surfaced when BOTH users' intent settings allow dating.
 */
export function canViewInDatingContext(
  viewer: Pick<UserProfile, 'primaryIntent' | 'openToIntents'>,
  candidate: Pick<UserProfile, 'primaryIntent' | 'openToIntents'>
): boolean {
  const viewerOpenToDating =
    viewer.primaryIntent === 'dating' || viewer.openToIntents?.includes('dating');
  const candidateOpenToDating =
    candidate.primaryIntent === 'dating' || candidate.openToIntents?.includes('dating');

  return Boolean(viewerOpenToDating && candidateOpenToDating);
}

/**
 * Checks whether user A is eligible to send a 1:1 direct message to user B.
 * No unsolicited 1:1 DMs by default (Blueprint Rule 4).
 * Must have an accepted connection.
 */
export function canSendDirectMessage(connection?: Connection | null): boolean {
  if (!connection) return false;
  return connection.state === 'accepted';
}

/**
 * Checks if candidate is blocked or restricted.
 */
export function isInteractionPermitted(
  userId: string,
  blockedUserIds: string[],
  restrictedUserIds: string[] = []
): { permitted: boolean; reason?: 'blocked' | 'restricted' } {
  if (blockedUserIds.includes(userId)) {
    return { permitted: false, reason: 'blocked' };
  }
  if (restrictedUserIds.includes(userId)) {
    return { permitted: true, reason: 'restricted' };
  }
  return { permitted: true };
}

/**
 * Privacy safe distance band generator (Blueprint Rule 3).
 * Never exposes raw meters or exact GPS.
 */
export function formatPrivacySafeDistance(distanceInKm: number): string {
  if (distanceInKm <= 1) {
    return 'Within 1 km';
  } else if (distanceInKm <= 3) {
    return '1 to 3 km';
  } else if (distanceInKm <= 6) {
    return '2 to 6 km';
  } else if (distanceInKm <= 12) {
    return '5 to 12 km';
  } else {
    return 'In your city';
  }
}
