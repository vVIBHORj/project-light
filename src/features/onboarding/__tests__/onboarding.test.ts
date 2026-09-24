import { useOnboardingStore } from '../../../state/useOnboardingStore';
import { storage } from '../../../lib/storage';

describe('Onboarding State & Flow Unit Tests (Blueprint Sections 4 & 5)', () => {
  beforeEach(async () => {
    await useOnboardingStore.getState().resetDraft();
  });

  it('initializes with default step and conservative privacy defaults', () => {
    const draft = useOnboardingStore.getState().draft;
    expect(draft.stepIndex).toBe(1);
    expect(draft.languages).toContain('English');
    expect(draft.privacySettings?.discoverability).toBe('eligible_only');
    expect(draft.privacySettings?.showAgeBand).toBe(true);
    expect(draft.privacySettings?.messageRequests).toBe('mutual_only');
  });

  it('updates draft fields and persists to local storage', async () => {
    const { updateDraft } = useOnboardingStore.getState();

    updateDraft({
      displayName: 'Kabir Verma',
      age: 27,
      ageBand: '26-29',
      primaryIntent: 'community',
      zone: 'Koramangala',
      interests: ['Formula 1', 'Running', 'Tech & Startups', 'Book Club', 'Craft Beer & Breweries'],
    });

    const currentDraft = useOnboardingStore.getState().draft;
    expect(currentDraft.displayName).toBe('Kabir Verma');
    expect(currentDraft.age).toBe(27);
    expect(currentDraft.primaryIntent).toBe('community');

    // Test load from storage
    const stored = await storage.getItem('light_onboarding_draft');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!).displayName).toBe('Kabir Verma');
  });

  it('enforces minimum 5 interests validation gate', () => {
    const { updateDraft, hasMinimumInterests } = useOnboardingStore.getState();

    updateDraft({ interests: ['Badminton', 'Running', 'Artisan Coffee'] });
    expect(hasMinimumInterests()).toBe(false);

    updateDraft({
      interests: [
        'Badminton',
        'Running',
        'Artisan Coffee',
        'Indie Music',
        'Photography (35mm / Digital)',
      ],
    });
    expect(hasMinimumInterests()).toBe(true);
  });

  it('saves completed onboarding draft to server and clears local storage draft', async () => {
    const { updateDraft, saveToServer } = useOnboardingStore.getState();

    updateDraft({
      displayName: 'Anya Sen',
      age: 24,
      ageBand: '22-25',
      primaryIntent: 'friendship',
      zone: 'Indiranagar',
      interests: [
        'Badminton',
        'Running',
        'Artisan Coffee',
        'Indie Music',
        'Board Games (Strategy)',
      ],
    });

    const savedProfile = await saveToServer('user_test_1');
    expect(savedProfile).toBeDefined();
    expect(savedProfile.displayName).toBe('Anya Sen');
    expect(savedProfile.completionPercentage).toBeGreaterThanOrEqual(80);

    // Stored draft should be cleaned up
    const storedAfterSave = await storage.getItem('light_onboarding_draft');
    expect(storedAfterSave).toBeNull();
  });
});
