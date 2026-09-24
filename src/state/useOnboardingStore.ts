import { create } from 'zustand';
import { OnboardingDraft, UserProfile } from '../domain/types';
import { storage } from '../lib/storage';
import { repositories } from '../data';
import { calculateProfileCompletion } from '../domain/dataClassification';

const ONBOARDING_STORAGE_KEY = 'light_onboarding_draft';

const initialDraft: OnboardingDraft = {
  stepIndex: 1,
  dateOfBirth: undefined,
  age: undefined,
  ageBand: undefined,
  displayName: '',
  gender: undefined,
  languages: ['English'],
  primaryIntent: undefined,
  openToIntents: [],
  datingPreferences: undefined,
  interests: [],
  tasteFingerprint: {
    music: [],
    movies: [],
    books: [],
    games: [],
  },
  socialStyle: {
    groupSize: '4-6',
    interactionStyle: 'balanced',
    energy: 'balanced',
    pace: 'steady',
  },
  availabilitySlots: ['weekend_morning', 'weekday_evening'],
  lifestyleComforts: ['alcohol_free', 'vegetarian_friendly'],
  city: 'Bengaluru',
  zone: 'Indiranagar',
  discoveryRadiusBand: '5km',
  privacySettings: {
    discoverability: 'eligible_only',
    showAgeBand: true,
    showZone: true,
    communityOnlyMode: false,
    messageRequests: 'mutual_only',
  },
  photoUri: undefined,
  bio: '',
  completed: false,
};

interface OnboardingState {
  draft: OnboardingDraft;
  isLoading: boolean;
  totalSteps: number;

  updateDraft: (updates: Partial<OnboardingDraft>) => void;
  setStep: (stepIndex: number) => void;
  loadDraft: () => Promise<void>;
  persistDraftLocally: () => Promise<void>;
  saveToServer: (userId: string) => Promise<UserProfile>;
  resetDraft: () => Promise<void>;
  hasMinimumInterests: () => boolean;
  getCompletionPercentage: () => number;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: initialDraft,
  isLoading: false,
  totalSteps: 11,

  updateDraft: (updates) => {
    set((state) => {
      const nextDraft = { ...state.draft, ...updates };
      // Async background save to local storage
      storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextDraft)).catch(() => {});
      return { draft: nextDraft };
    });
  },

  setStep: (stepIndex) => {
    set((state) => {
      const nextDraft = { ...state.draft, stepIndex };
      storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextDraft)).catch(() => {});
      return { draft: nextDraft };
    });
  },

  loadDraft: async () => {
    set({ isLoading: true });
    try {
      const savedStr = await storage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedStr) {
        const parsed = JSON.parse(savedStr) as OnboardingDraft;
        set({ draft: { ...initialDraft, ...parsed } });
      }
    } catch {
      // Use defaults if load fails
    } finally {
      set({ isLoading: false });
    }
  },

  persistDraftLocally: async () => {
    const { draft } = get();
    await storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(draft));
  },

  saveToServer: async (userId: string) => {
    const { draft } = get();
    const completion = calculateProfileCompletion(draft as unknown as Partial<UserProfile>);

    const profilePayload: Partial<UserProfile> = {
      userId,
      displayName: draft.displayName || 'Anonymous Member',
      bio: draft.bio || '',
      age: draft.age || 21,
      ageBand: draft.ageBand || '21-25',
      gender: draft.gender || 'prefer_not_to_say',
      city: draft.city || 'Bengaluru',
      zone: draft.zone || 'Indiranagar',
      distanceBand: draft.discoveryRadiusBand ? `Within ${draft.discoveryRadiusBand}` : 'Within 5 km',
      languages: draft.languages && draft.languages.length > 0 ? draft.languages : ['English'],
      primaryIntent: draft.primaryIntent || 'friendship',
      openToIntents: draft.openToIntents && draft.openToIntents.length > 0 ? draft.openToIntents : [draft.primaryIntent || 'friendship'],
      occupation: 'New Member',
      photos: draft.photoUri ? [draft.photoUri] : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'],
      interests: draft.interests || [],
      isVerified: false,
      completionPercentage: completion,
      photoModerationState: draft.photoUri ? 'pending' : undefined,
      socialStyle: draft.socialStyle,
      availabilitySlots: draft.availabilitySlots,
      lifestyleComforts: draft.lifestyleComforts,
      tasteFingerprint: draft.tasteFingerprint,
      datingPreferences: draft.datingPreferences,
      privacySettings: draft.privacySettings,
    };

    const savedProfile = await repositories.profile.updateProfile(userId, profilePayload);
    await storage.removeItem(ONBOARDING_STORAGE_KEY);
    set({ draft: { ...initialDraft, completed: true } });
    return savedProfile;
  },

  resetDraft: async () => {
    await storage.removeItem(ONBOARDING_STORAGE_KEY);
    set({ draft: initialDraft });
  },

  hasMinimumInterests: () => {
    const { draft } = get();
    return Boolean(draft.interests && draft.interests.length >= 5);
  },

  getCompletionPercentage: () => {
    const { draft } = get();
    return calculateProfileCompletion(draft as unknown as Partial<UserProfile>);
  },
}));
