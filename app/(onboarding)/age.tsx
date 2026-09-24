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
import { ArrowLeft, ShieldCheck, Calendar, AlertTriangle } from 'lucide-react-native';
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
import { isAdult } from '../../src/lib/permissions';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AgeGateScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // June (0-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(1999);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStep(1);
    if (draft.dateOfBirth) {
      const parts = draft.dateOfBirth.split('-');
      if (parts.length === 3) {
        setSelectedYear(parseInt(parts[0], 10));
        setSelectedMonth(parseInt(parts[1], 10) - 1);
        setSelectedDay(parseInt(parts[2], 10));
      }
    }
  }, [draft.dateOfBirth, setStep]);

  const calculateAgeDetails = (year: number, month: number, day: number) => {
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }

    let ageBand = '18-21';
    if (age >= 22 && age <= 25) ageBand = '22-25';
    else if (age >= 26 && age <= 29) ageBand = '26-29';
    else if (age >= 30 && age <= 34) ageBand = '30-34';
    else if (age >= 35 && age <= 39) ageBand = '35-39';
    else if (age >= 40) ageBand = '40+';

    return { age, ageBand };
  };

  const currentDobString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const { age, ageBand } = calculateAgeDetails(selectedYear, selectedMonth, selectedDay);
  const isOver18 = isAdult(currentDobString);

  const handleContinue = () => {
    setError(null);

    if (!isOver18) {
      analytics.track('onboarding_age_blocked', { attempted_age: age });
      router.replace('/(auth)/safe-hold');
      return;
    }

    // Save only privacy-safe data into draft
    updateDraft({
      dateOfBirth: currentDobString,
      age,
      ageBand,
      stepIndex: 2,
    });

    analytics.track('onboarding_step_completed', {
      step: 'age_gate',
      age_band: ageBand,
    });

    router.push('/(onboarding)/identity');
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
            <OnboardingProgress currentStep={1} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Focused Question */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 1 OF {totalSteps}</Text>
            <Text style={styles.headline}>When is your birthday?</Text>
            <Text style={styles.subhead}>
              Project LIGHT is built exclusively for adults 18+. We only share your age band (e.g. {ageBand}), never your exact birth date.
            </Text>
          </View>

          {/* DOB Selector Card */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={22} color={colors.primary} />
              <Text style={styles.cardTitle}>Date of Birth</Text>
            </View>

            {/* Quick selectors for Day, Month, Year */}
            <View style={styles.selectorRow}>
              {/* Day */}
              <View style={styles.column}>
                <Text style={styles.columnLabel}>DAY</Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    onPress={() => setSelectedDay((d) => Math.max(1, d - 1))}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>{selectedDay}</Text>
                  <Pressable
                    onPress={() => setSelectedDay((d) => Math.min(31, d + 1))}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Month */}
              <View style={[styles.column, { flex: 1.4 }]}>
                <Text style={styles.columnLabel}>MONTH</Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    onPress={() => setSelectedMonth((m) => (m === 0 ? 11 : m - 1))}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>‹</Text>
                  </Pressable>
                  <Text style={[styles.stepperValue, { fontSize: 13 }]} numberOfLines={1}>
                    {MONTHS[selectedMonth]}
                  </Text>
                  <Pressable
                    onPress={() => setSelectedMonth((m) => (m === 11 ? 0 : m + 1))}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>›</Text>
                  </Pressable>
                </View>
              </View>

              {/* Year */}
              <View style={styles.column}>
                <Text style={styles.columnLabel}>YEAR</Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    onPress={() => setSelectedYear((y) => Math.max(1940, y - 1))}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>{selectedYear}</Text>
                  <Pressable
                    onPress={() => setSelectedYear((y) => Math.min(2015, y + 1))}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Calculated Preview & Age assurance notice */}
            <View style={[styles.ageStatusBox, !isOver18 && styles.ageStatusUnder]}>
              {isOver18 ? (
                <>
                  <ShieldCheck size={18} color={colors.intent.friendship} />
                  <Text style={styles.ageStatusText}>
                    Age: <Text style={styles.boldText}>{age} years old</Text> • Age Band: <Text style={styles.boldText}>{ageBand}</Text>
                  </Text>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} color={colors.destructive} />
                  <Text style={[styles.ageStatusText, { color: colors.destructive }]}>
                    Must be 18 or older to join Project LIGHT
                  </Text>
                </>
              )}
            </View>

            <View style={styles.assuranceNote}>
              <Text style={styles.assuranceText}>
                🛡️ Privacy Guarantee: Exact DOB is stored encrypted for age-assurance and never shown on your public profile.
              </Text>
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </GlassCard>

          <View style={styles.footerWrap}>
            <PillButton
              label={isOver18 ? 'Continue' : 'Check Eligibility'}
              variant={isOver18 ? 'primary' : 'destructive'}
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
  },
  questionSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
    padding: spacing.lg,
    borderRadius: radii.card,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    width: '100%',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 28,
    height: 32,
    borderRadius: radii.xs,
    backgroundColor: '#DDEBFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 16,
    color: colors.primary,
  },
  stepperValue: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  ageStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  ageStatusUnder: {
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
  },
  ageStatusText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
  },
  assuranceNote: {
    backgroundColor: 'rgba(11, 15, 26, 0.04)',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  assuranceText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.destructive,
    textAlign: 'center',
  },
  footerWrap: {
    marginTop: spacing.xl,
  },
  continueBtn: {
    width: '100%',
  },
});
