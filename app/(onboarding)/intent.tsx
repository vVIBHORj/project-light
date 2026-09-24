import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Sparkles, Heart } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  IntentPill,
  OnboardingProgress,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { analytics } from '../../src/lib/analytics';
import { RelationshipIntent, Gender } from '../../src/domain/types';

interface IntentOption {
  key: RelationshipIntent;
  title: string;
  badge: string;
  tagline: string;
  visibilityNote: string;
}

const INTENT_OPTIONS: IntentOption[] = [
  {
    key: 'friendship',
    title: 'Friendship',
    badge: 'Platonic & Social',
    tagline: 'Connect with genuine local friends and activity partners around your neighborhood.',
    visibilityNote: 'Visible to other members seeking friendship, community, and open explore.',
  },
  {
    key: 'dating',
    title: 'Dating',
    badge: 'Intentional Romance',
    tagline: 'Meet thoughtful single adults in your city who share your lifestyle and passions.',
    visibilityNote: 'Only visible to other verified members seeking dating or open to dating.',
  },
  {
    key: 'community',
    title: 'Community',
    badge: 'Group Hobby Circles',
    tagline: 'Join small Circles of 4 to 8 for shared weekend activities, sports, and discussions.',
    visibilityNote: 'Visible across all Circles and group community gatherings.',
  },
  {
    key: 'explore',
    title: 'Explore / Undecided',
    badge: 'At Your Pace',
    tagline: 'Not sure yet? Explore local events and join Circles without any expectations.',
    visibilityNote: 'A gentle, low-pressure way to start forming connections.',
  },
];

const DATING_GENDERS: { key: Gender; label: string }[] = [
  { key: 'woman', label: 'Women' },
  { key: 'man', label: 'Men' },
  { key: 'non_binary', label: 'Non-binary' },
];

export default function IntentScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [primaryIntent, setPrimaryIntent] = useState<RelationshipIntent>(
    draft.primaryIntent || 'friendship'
  );
  const [openToIntents, setOpenToIntents] = useState<RelationshipIntent[]>(
    draft.openToIntents || ['friendship', 'explore']
  );

  // Dating Preferences sub-form
  const [datingGenders, setDatingGenders] = useState<Gender[]>(
    draft.datingPreferences?.interestedInGenders || ['woman', 'man']
  );
  const [ageMin, setAgeMin] = useState<number>(draft.datingPreferences?.ageRangeMin || 22);
  const [ageMax, setAgeMax] = useState<number>(draft.datingPreferences?.ageRangeMax || 32);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const handleSelectPrimary = (key: RelationshipIntent) => {
    setPrimaryIntent(key);
    if (!openToIntents.includes(key)) {
      setOpenToIntents([...openToIntents, key]);
    }
  };

  const toggleSecondaryIntent = (key: RelationshipIntent) => {
    if (key === primaryIntent) return; // Cannot deselect primary
    if (openToIntents.includes(key)) {
      setOpenToIntents(openToIntents.filter((k) => k !== key));
    } else {
      setOpenToIntents([...openToIntents, key]);
    }
  };

  const toggleDatingGender = (g: Gender) => {
    if (datingGenders.includes(g)) {
      if (datingGenders.length === 1) return;
      setDatingGenders(datingGenders.filter((item) => item !== g));
    } else {
      setDatingGenders([...datingGenders, g]);
    }
  };

  const handleContinue = () => {
    const isDatingSelected = primaryIntent === 'dating' || openToIntents.includes('dating');

    updateDraft({
      primaryIntent,
      openToIntents,
      datingPreferences: isDatingSelected
        ? {
            interestedInGenders: datingGenders,
            ageRangeMin: ageMin,
            ageRangeMax: ageMax,
            consentVersion: 'v1_2026',
          }
        : undefined,
      stepIndex: 4,
    });

    analytics.track('onboarding_step_completed', {
      step: 'intent',
      primary_intent: primaryIntent,
      secondary_intents: openToIntents,
      is_dating_enabled: isDatingSelected,
    });

    router.push('/(onboarding)/interests');
  };

  const isDatingActive = primaryIntent === 'dating' || openToIntents.includes('dating');

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
            <OnboardingProgress currentStep={3} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 3 OF {totalSteps}</Text>
            <Text style={styles.headline}>What brings you to LIGHT?</Text>
            <Text style={styles.subhead}>
              Pick your primary intent. You can change this anytime and customize secondary intents.
            </Text>
          </View>

          {/* 4 Large Intent Cards */}
          <View style={styles.cardsList}>
            {INTENT_OPTIONS.map((opt) => {
              const isPrimary = primaryIntent === opt.key;
              const isOpenTo = openToIntents.includes(opt.key);

              return (
                <Pressable
                  key={opt.key}
                  onPress={() => handleSelectPrimary(opt.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isPrimary }}
                >
                  <GlassCard style={[styles.intentCard, isPrimary && styles.intentCardSelected]}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.pillContainer}>
                        <IntentPill intent={opt.key} size="md" selected={isPrimary} />
                      </View>
                      <View style={styles.badgeWrap}>
                        <Text style={[styles.badgeText, isPrimary && styles.badgeTextSelected]}>
                          {opt.badge}
                        </Text>
                      </View>
                      {isPrimary && (
                        <View style={styles.primaryIndicator}>
                          <Text style={styles.primaryIndicatorText}>PRIMARY</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.intentTitle}>{opt.title}</Text>
                    <Text style={styles.intentTagline}>{opt.tagline}</Text>

                    <View style={styles.visibilityBox}>
                      <Text style={styles.visibilityText}>👁️ {opt.visibilityNote}</Text>
                    </View>

                    {/* Secondary checkbox toggle if not primary */}
                    {!isPrimary && (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleSecondaryIntent(opt.key);
                        }}
                        style={styles.secondaryToggleRow}
                      >
                        <View style={[styles.checkbox, isOpenTo && styles.checkboxChecked]}>
                          {isOpenTo && <Check size={12} color={colors.textOnDark} />}
                        </View>
                        <Text style={styles.secondaryToggleText}>
                          Also open to {opt.title.toLowerCase()}
                        </Text>
                      </Pressable>
                    )}
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>

          {/* Sensitive Dating Preferences Mini-Step (Blueprint Section 5 ONB-03) */}
          {isDatingActive && (
            <GlassCard style={styles.datingCard}>
              <View style={styles.datingHeader}>
                <Heart size={20} color={colors.intent.dating} />
                <Text style={styles.datingTitle}>Dating Preferences & Consent</Text>
              </View>
              <Text style={styles.datingExplainer}>
                Because you are open to dating, tell us who you’d like to meet. These preferences remain private and user-controlled.
              </Text>

              {/* Interested In Genders */}
              <Text style={styles.subFieldLabel}>INTERESTED IN</Text>
              <View style={styles.genderOptionsRow}>
                {DATING_GENDERS.map((dg) => {
                  const isChecked = datingGenders.includes(dg.key);
                  return (
                    <Pressable
                      key={dg.key}
                      onPress={() => toggleDatingGender(dg.key)}
                      style={[styles.datingChip, isChecked && styles.datingChipSelected]}
                    >
                      <Text style={[styles.datingChipText, isChecked && styles.datingChipTextSelected]}>
                        {dg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Age Range Stepper */}
              <Text style={styles.subFieldLabel}>PREFERRED AGE RANGE</Text>
              <View style={styles.ageRangeRow}>
                <View style={styles.rangeBox}>
                  <Text style={styles.rangeLabel}>MIN</Text>
                  <View style={styles.miniStepper}>
                    <Pressable onPress={() => setAgeMin((a) => Math.max(18, a - 1))} style={styles.miniBtn}>
                      <Text style={styles.miniBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.rangeVal}>{ageMin}</Text>
                    <Pressable onPress={() => setAgeMin((a) => Math.min(ageMax - 1, a + 1))} style={styles.miniBtn}>
                      <Text style={styles.miniBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.rangeToText}>to</Text>

                <View style={styles.rangeBox}>
                  <Text style={styles.rangeLabel}>MAX</Text>
                  <View style={styles.miniStepper}>
                    <Pressable onPress={() => setAgeMax((a) => Math.max(ageMin + 1, a - 1))} style={styles.miniBtn}>
                      <Text style={styles.miniBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.rangeVal}>{ageMax}</Text>
                    <Pressable onPress={() => setAgeMax((a) => Math.min(65, a + 1))} style={styles.miniBtn}>
                      <Text style={styles.miniBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label="Continue to Interests"
              variant="primary"
              size="lg"
              icon={<Sparkles size={18} color={colors.textOnDark} />}
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
  cardsList: {
    gap: spacing.md,
  },
  intentCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  intentCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  pillContainer: {
    flexDirection: 'row',
  },
  badgeWrap: {
    backgroundColor: 'rgba(11, 15, 26, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  badgeTextSelected: {
    color: colors.primary,
  },
  primaryIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  primaryIndicatorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textOnDark,
  },
  intentTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 2,
  },
  intentTagline: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  visibilityBox: {
    backgroundColor: 'rgba(47, 128, 237, 0.07)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.xs,
    marginTop: 4,
  },
  visibilityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textPrimary,
  },
  secondaryToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11, 15, 26, 0.06)',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondaryToggleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  datingCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 240, 243, 0.9)',
    borderColor: 'rgba(255, 107, 91, 0.3)',
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  datingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  datingTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  datingExplainer: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  subFieldLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    marginTop: 4,
  },
  genderOptionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  datingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 91, 0.2)',
  },
  datingChipSelected: {
    backgroundColor: colors.intent.dating,
    borderColor: colors.intent.dating,
  },
  datingChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  datingChipTextSelected: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.bold,
  },
  ageRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rangeBox: {
    flex: 1,
  },
  rangeLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    marginBottom: 4,
  },
  miniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  miniBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.xs,
    backgroundColor: '#FFE9E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.intent.dating,
  },
  rangeVal: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rangeToText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 14,
  },
  footerWrap: {
    marginTop: spacing.md,
  },
  continueBtn: {
    width: '100%',
  },
});
