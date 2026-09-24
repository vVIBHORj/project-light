import { UserProfile, PublicUserProfile, FieldVisibility } from './types';

export const FIELD_CLASSIFICATIONS: Record<string, FieldVisibility> = {
  // Public (viewable by other users)
  userId: 'public',
  displayName: 'public',
  bio: 'public',
  ageBand: 'public',
  gender: 'public',
  pronouns: 'public',
  city: 'public',
  zone: 'public',
  distanceBand: 'public',
  languages: 'public',
  primaryIntent: 'public',
  openToIntents: 'public',
  occupation: 'public',
  photos: 'public',
  interests: 'public',
  isVerified: 'public',
  completionPercentage: 'public',

  // Matching Only (internal engine use only; never sent to clients in public profile payloads)
  socialStyle: 'matching_only',
  availabilitySlots: 'matching_only',
  lifestyleComforts: 'matching_only',
  tasteFingerprint: 'matching_only',
  discoveryRadiusBand: 'matching_only',
  age: 'matching_only',

  // Sensitive (strictly restricted & user-consented)
  datingPreferences: 'sensitive',

  // Private (strictly confidential; never exposed in public responses)
  dateOfBirth: 'private',
  phone: 'private',
  email: 'private',
  privacySettings: 'private',
};

/**
 * Transforms a UserProfile into a sanitized PublicUserProfile, ensuring that
 * private, sensitive, and matching-only fields can never be leaked to public profile selectors.
 */
export function toPublicProfile(profile: UserProfile): PublicUserProfile {
  const privacy = profile.privacySettings;

  return {
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio || '',
    ageBand: privacy?.showAgeBand !== false ? profile.ageBand : undefined,
    gender: profile.gender,
    pronouns: profile.pronouns,
    city: profile.city,
    zone: privacy?.showZone !== false ? profile.zone : undefined,
    distanceBand: profile.distanceBand,
    languages: profile.languages || [],
    primaryIntent: profile.primaryIntent,
    openToIntents: profile.openToIntents || [],
    occupation: profile.occupation,
    photos: profile.photos || [],
    interests: profile.interests || [],
    isVerified: Boolean(profile.isVerified),
    completionPercentage: profile.completionPercentage || 0,
  };
}

/**
 * Calculates profile completion percentage based on Blueprint 4.1 requirements.
 */
export function calculateProfileCompletion(profile: Partial<UserProfile>): number {
  let score = 0;
  if (profile.displayName && profile.displayName.trim().length > 0) score += 15;
  if (profile.age && profile.age >= 18) score += 15;
  if (profile.primaryIntent) score += 15;
  if (profile.interests && profile.interests.length >= 5) score += 20;
  if (profile.zone && profile.zone.trim().length > 0) score += 10;
  if (profile.photos && profile.photos.length > 0) score += 10;
  if (profile.bio && profile.bio.trim().length > 0) score += 5;
  if (profile.languages && profile.languages.length > 0) score += 5;
  if (profile.socialStyle || profile.availabilitySlots) score += 5;
  return Math.min(100, score);
}

/**
 * Checks if the user profile satisfies minimum activation criteria (Blueprint Section 4.1):
 * - Age 18+ verified
 * - Display name provided
 * - Primary intent selected
 * - Minimum 5 interests selected
 * - Location zone assigned
 */
export function isActivationEligible(profile: Partial<UserProfile>): boolean {
  if (!profile.age || profile.age < 18) return false;
  if (!profile.displayName || profile.displayName.trim().length === 0) return false;
  if (!profile.primaryIntent) return false;
  if (!profile.interests || profile.interests.length < 5) return false;
  if (!profile.zone || profile.zone.trim().length === 0) return false;
  return true;
}
