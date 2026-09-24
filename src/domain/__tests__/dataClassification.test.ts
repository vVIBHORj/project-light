import {
  toPublicProfile,
  calculateProfileCompletion,
  isActivationEligible,
  FIELD_CLASSIFICATIONS,
} from '../dataClassification';
import { UserProfile } from '../types';

describe('Data Classification & Privacy Guarantees (Blueprint 7.1)', () => {
  const fullMockProfile: UserProfile = {
    userId: 'u_100',
    displayName: 'Priya Sharma',
    bio: 'Photographer & coffee enthusiast in Indiranagar',
    age: 25,
    ageBand: '22-26',
    dateOfBirth: '1999-05-15',
    phone: '+919876543210',
    email: 'priya@example.com',
    gender: 'woman',
    pronouns: 'she/her',
    city: 'Bengaluru',
    zone: 'Indiranagar',
    distanceBand: 'Within 2 km',
    languages: ['English', 'Hindi', 'Kannada'],
    primaryIntent: 'friendship',
    openToIntents: ['friendship', 'explore'],
    occupation: 'Senior Product Designer',
    photos: ['https://example.com/photo1.jpg'],
    interests: ['Photography (35mm / Digital)', 'Artisan Coffee', 'Indie Music', 'Badminton', 'Board Games (Strategy)'],
    isVerified: true,
    completionPercentage: 95,
    socialStyle: {
      groupSize: '4-6',
      interactionStyle: 'balanced',
      energy: 'balanced',
      pace: 'steady',
    },
    availabilitySlots: ['weekend_morning', 'weekday_evening'],
    lifestyleComforts: ['alcohol_free', 'vegetarian_friendly'],
    tasteFingerprint: {
      music: ['Prateek Kuhad'],
      movies: ['Interstellar'],
      books: ['Dune'],
      games: ['Catan'],
    },
    datingPreferences: {
      interestedInGenders: ['man'],
      ageRangeMin: 24,
      ageRangeMax: 30,
      consentVersion: 'v1_2026',
    },
    privacySettings: {
      discoverability: 'eligible_only',
      showAgeBand: true,
      showZone: true,
      communityOnlyMode: false,
      messageRequests: 'mutual_only',
    },
  };

  describe('Field Classification Registry', () => {
    it('correctly maps private fields', () => {
      expect(FIELD_CLASSIFICATIONS.phone).toBe('private');
      expect(FIELD_CLASSIFICATIONS.email).toBe('private');
      expect(FIELD_CLASSIFICATIONS.dateOfBirth).toBe('private');
      expect(FIELD_CLASSIFICATIONS.privacySettings).toBe('private');
    });

    it('correctly maps matching-only internal fields', () => {
      expect(FIELD_CLASSIFICATIONS.socialStyle).toBe('matching_only');
      expect(FIELD_CLASSIFICATIONS.availabilitySlots).toBe('matching_only');
      expect(FIELD_CLASSIFICATIONS.tasteFingerprint).toBe('matching_only');
    });

    it('correctly maps sensitive fields', () => {
      expect(FIELD_CLASSIFICATIONS.datingPreferences).toBe('sensitive');
    });
  });

  describe('toPublicProfile Sanitizer', () => {
    it('strips all private fields (phone, email, dateOfBirth) from public profile', () => {
      const sanitized = toPublicProfile(fullMockProfile);

      // Verify sanitized object does not leak private fields
      expect((sanitized as unknown as Record<string, unknown>).phone).toBeUndefined();
      expect((sanitized as unknown as Record<string, unknown>).email).toBeUndefined();
      expect((sanitized as unknown as Record<string, unknown>).dateOfBirth).toBeUndefined();
      expect((sanitized as unknown as Record<string, unknown>).privacySettings).toBeUndefined();
    });

    it('strips matching-only internal vectors (socialStyle, availabilitySlots, tasteFingerprint)', () => {
      const sanitized = toPublicProfile(fullMockProfile);

      expect((sanitized as unknown as Record<string, unknown>).socialStyle).toBeUndefined();
      expect((sanitized as unknown as Record<string, unknown>).availabilitySlots).toBeUndefined();
      expect((sanitized as unknown as Record<string, unknown>).tasteFingerprint).toBeUndefined();
      expect((sanitized as unknown as Record<string, unknown>).datingPreferences).toBeUndefined();
    });

    it('preserves public identity fields', () => {
      const sanitized = toPublicProfile(fullMockProfile);

      expect(sanitized.displayName).toBe('Priya Sharma');
      expect(sanitized.ageBand).toBe('22-26');
      expect(sanitized.zone).toBe('Indiranagar');
      expect(sanitized.interests).toHaveLength(5);
      expect(sanitized.isVerified).toBe(true);
    });

    it('respects privacy settings when user hides age band or zone', () => {
      const restrictedPrivacyProfile: UserProfile = {
        ...fullMockProfile,
        privacySettings: {
          ...fullMockProfile.privacySettings!,
          showAgeBand: false,
          showZone: false,
        },
      };

      const sanitized = toPublicProfile(restrictedPrivacyProfile);
      expect(sanitized.ageBand).toBeUndefined();
      expect(sanitized.zone).toBeUndefined();
    });
  });

  describe('Profile Completion & Activation Checks (Blueprint 4.1)', () => {
    it('calculates profile completion percentage accurately', () => {
      expect(calculateProfileCompletion({})).toBe(0);

      const partialProfile: Partial<UserProfile> = {
        displayName: 'Rohan',
        age: 24,
        primaryIntent: 'friendship',
      };
      expect(calculateProfileCompletion(partialProfile)).toBe(45);

      expect(calculateProfileCompletion(fullMockProfile)).toBe(100);
    });

    it('validates activation eligibility strictly', () => {
      // Under 18 fails
      expect(isActivationEligible({ ...fullMockProfile, age: 17 })).toBe(false);

      // Fewer than 5 interests fails
      expect(isActivationEligible({ ...fullMockProfile, interests: ['Indie Music', 'Artisan Coffee'] })).toBe(false);

      // Missing primary intent fails
      expect(isActivationEligible({ ...fullMockProfile, primaryIntent: undefined })).toBe(false);

      // Missing zone fails
      expect(isActivationEligible({ ...fullMockProfile, zone: '' })).toBe(false);

      // Valid profile passes
      expect(isActivationEligible(fullMockProfile)).toBe(true);
    });
  });
});
