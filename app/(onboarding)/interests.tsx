import React, { useState, useEffect, useMemo } from 'react';
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
import { ArrowLeft, Search, Check, Sparkles, AlertCircle } from 'lucide-react-native';
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
import { mockInterests } from '../../src/data/mocks/seedData';

const CATEGORIES = [
  'All',
  'Sports',
  'Music',
  'Movies & Shows',
  'Food & Cafés',
  'Outdoors',
  'Creative',
  'Tech',
  'Games',
  'Wellness',
  'Books',
  'Travel',
  'Learning',
];

export default function InterestsScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    draft.interests || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const filteredInterests = useMemo(() => {
    return mockInterests.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleInterest = (name: string) => {
    setValidationError(null);
    if (selectedInterests.includes(name)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== name));
    } else {
      if (selectedInterests.length >= 15) {
        setValidationError('You can select up to 15 interests.');
        return;
      }
      setSelectedInterests([...selectedInterests, name]);
    }
  };

  const handleContinue = () => {
    if (selectedInterests.length < 5) {
      setValidationError('Please select at least 5 interests so we can find your first Circles.');
      return;
    }

    setValidationError(null);
    updateDraft({
      interests: selectedInterests,
      stepIndex: 5,
    });

    analytics.track('onboarding_step_completed', {
      step: 'interests',
      interest_count: selectedInterests.length,
    });

    router.push('/(onboarding)/taste');
  };

  const count = selectedInterests.length;
  const isEligible = count >= 5;

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
            <OnboardingProgress currentStep={4} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 4 OF {totalSteps}</Text>
            <Text style={styles.headline}>What do you love doing?</Text>
            <Text style={styles.subhead}>
              Pick 5 to 15 interests. This is how we match you with your first small Circles.
            </Text>
          </View>

          {/* Live Status Counter Banner */}
          <GlassCard style={styles.counterBanner}>
            <View style={styles.counterRow}>
              <View style={[styles.counterPill, isEligible && styles.counterPillSuccess]}>
                <Text style={[styles.counterText, isEligible && styles.counterTextSuccess]}>
                  {count} / 5 Minimum
                </Text>
              </View>
              <Text style={styles.counterExplainer}>
                {isEligible
                  ? `Great! You've picked ${count} passions.`
                  : `Select ${5 - count} more to continue.`}
              </Text>
            </View>
          </GlassCard>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search interests (e.g. Coffee, F1, Hiking...)"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.catTab, isSelected && styles.catTabSelected]}
                >
                  <Text style={[styles.catTabText, isSelected && styles.catTabTextSelected]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Interest Chips Grid */}
          <View style={styles.chipsGrid}>
            {filteredInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.name);
              return (
                <Pressable
                  key={interest.id}
                  onPress={() => toggleInterest(interest.name)}
                  style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                >
                  <Text style={[styles.interestChipText, isSelected && styles.interestChipTextSelected]}>
                    {interest.name}
                  </Text>
                  {isSelected && <Check size={14} color={colors.textOnDark} style={{ marginLeft: 4 }} />}
                </Pressable>
              );
            })}
          </View>

          {validationError && (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={colors.destructive} />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label={isEligible ? 'Continue' : `Select ${5 - count} More Interests`}
              variant={isEligible ? 'primary' : 'secondary'}
              size="lg"
              icon={isEligible ? <Sparkles size={18} color={colors.textOnDark} /> : undefined}
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
  counterBanner: {
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  counterPill: {
    backgroundColor: 'rgba(11, 15, 26, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  counterPillSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  counterText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  counterTextSuccess: {
    color: colors.intent.friendship,
  },
  counterExplainer: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoriesRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  catTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.06)',
  },
  catTabSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  catTabText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  catTabTextSelected: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.bold,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    minHeight: 200,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  interestChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  interestChipTextSelected: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.bold,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    gap: 6,
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.destructive,
    flex: 1,
  },
  footerWrap: {
    marginTop: spacing.md,
  },
  continueBtn: {
    width: '100%',
  },
});
