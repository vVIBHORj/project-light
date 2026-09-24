import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User as UserIcon, Check } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  OnboardingProgress,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { analytics } from '../../src/lib/analytics';
import { Gender } from '../../src/domain/types';
import { mockLanguages } from '../../src/data/mocks/seedData';

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: 'woman', label: 'Woman' },
  { key: 'man', label: 'Man' },
  { key: 'non_binary', label: 'Non-binary' },
  { key: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function IdentityBasicsScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [displayName, setDisplayName] = useState(draft.displayName || '');
  const [selectedGender, setSelectedGender] = useState<Gender | undefined>(draft.gender);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    draft.languages && draft.languages.length > 0 ? draft.languages : ['English']
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length === 1) return; // Keep at least one
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleContinue = () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Please enter what you would like people to call you.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }

    setError(null);
    updateDraft({
      displayName: trimmed,
      gender: selectedGender || 'prefer_not_to_say',
      languages: selectedLanguages,
      stepIndex: 3,
    });

    analytics.track('onboarding_step_completed', {
      step: 'identity_basics',
      has_gender: Boolean(selectedGender),
      language_count: selectedLanguages.length,
    });

    router.push('/(onboarding)/intent');
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header Progress */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={2} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Header */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 2 OF {totalSteps}</Text>
            <Text style={styles.headline}>What should people call you?</Text>
            <Text style={styles.subhead}>
              Your first name or chosen name. Real identities foster honest local community.
            </Text>
          </View>

          {/* Name Input Card */}
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>DISPLAY NAME (REQUIRED)</Text>
            <View style={styles.inputContainer}>
              <UserIcon size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  setError(null);
                }}
                placeholder="e.g. Aisha, Rohan, Alex"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                maxLength={40}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </GlassCard>

          {/* Gender Picker Card (Inclusive, optional) */}
          <GlassCard style={styles.card}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>GENDER IDENTITY</Text>
              <Text style={styles.optionalTag}>OPTIONAL</Text>
            </View>
            <View style={styles.genderGrid}>
              {GENDER_OPTIONS.map((g) => {
                const isSelected = selectedGender === g.key;
                return (
                  <Pressable
                    key={g.key}
                    onPress={() => setSelectedGender(g.key)}
                    style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                  >
                    <Text style={[styles.genderChipText, isSelected && styles.genderChipTextSelected]}>
                      {g.label}
                    </Text>
                    {isSelected && <Check size={14} color={colors.textOnDark} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Languages Multi-Select */}
          <GlassCard style={styles.card}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>LANGUAGES YOU SPEAK</Text>
              <Text style={styles.selectedCountTag}>{selectedLanguages.length} selected</Text>
            </View>
            <Text style={styles.fieldHelper}>
              Select all languages you are comfortable socializing in:
            </Text>
            <View style={styles.languageChipsRow}>
              {mockLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <Pressable
                    key={lang}
                    onPress={() => toggleLanguage(lang)}
                    style={[styles.langChip, isSelected && styles.langChipSelected]}
                  >
                    <Text style={[styles.langChipText, isSelected && styles.langChipTextSelected]}>
                      {lang}
                    </Text>
                    {isSelected && <Check size={12} color={colors.primary} style={{ marginLeft: 4 }} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label="Continue"
              variant="primary"
              size="lg"
              onPress={handleContinue}
              style={styles.continueBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrap: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  questionSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  stepIndicator: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  headline: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.hero,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.hero,
  },
  subhead: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.sm,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  optionalTag: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  selectedCountTag: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  fieldHelper: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.1)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.destructive,
    marginTop: 2,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
    gap: 6,
  },
  genderChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  genderChipTextSelected: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.bold,
  },
  languageChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  langChipSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  langChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  langChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  footerWrap: {
    marginTop: spacing.md,
  },
  continueBtn: {
    width: '100%',
  },
});
