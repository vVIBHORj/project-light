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
import { ArrowLeft, Calendar, Sparkles, Check } from 'lucide-react-native';
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
import { AvailabilitySlot, LifestyleComfort } from '../../src/domain/types';

interface SlotOption {
  key: AvailabilitySlot;
  label: string;
  timeRange: string;
}

const AVAILABILITY_SLOTS: SlotOption[] = [
  { key: 'weekday_morning', label: 'Weekday Morning', timeRange: '7:00 AM – 9:00 AM' },
  { key: 'weekday_evening', label: 'Weekday Evening', timeRange: '6:30 PM – 9:30 PM' },
  { key: 'weekend_morning', label: 'Weekend Morning', timeRange: '8:00 AM – 11:30 AM' },
  { key: 'weekend_afternoon', label: 'Weekend Afternoon', timeRange: '2:00 PM – 5:30 PM' },
  { key: 'weekend_evening', label: 'Weekend Evening', timeRange: '6:00 PM – 9:30 PM' },
];

const LIFESTYLE_COMFORTS: { key: LifestyleComfort; label: string; icon: string }[] = [
  { key: 'student', label: 'Student', icon: '🎓' },
  { key: 'working_professional', label: 'Working Professional', icon: '💼' },
  { key: 'alcohol_free', label: 'Alcohol-free meetups', icon: '☕' },
  { key: 'vegetarian_friendly', label: 'Vegetarian-friendly', icon: '🥗' },
  { key: 'early_bird', label: 'Early Bird', icon: '🌅' },
  { key: 'night_owl', label: 'Night Owl', icon: '🌙' },
];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    draft.availabilitySlots || ['weekend_morning', 'weekday_evening']
  );
  const [comforts, setComforts] = useState<LifestyleComfort[]>(
    draft.lifestyleComforts || ['alcohol_free', 'vegetarian_friendly']
  );

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  const toggleSlot = (key: AvailabilitySlot) => {
    if (slots.includes(key)) {
      if (slots.length === 1) return; // Keep at least one
      setSlots(slots.filter((s) => s !== key));
    } else {
      setSlots([...slots, key]);
    }
  };

  const toggleComfort = (key: LifestyleComfort) => {
    if (comforts.includes(key)) {
      setComforts(comforts.filter((c) => c !== key));
    } else {
      setComforts([...comforts, key]);
    }
  };

  const handleContinue = () => {
    updateDraft({
      availabilitySlots: slots,
      lifestyleComforts: comforts,
      stepIndex: 8,
    });

    analytics.track('onboarding_step_completed', {
      step: 'availability_lifestyle',
      slot_count: slots.length,
      comfort_count: comforts.length,
    });

    router.push('/(onboarding)/location');
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
            <OnboardingProgress currentStep={7} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 7 OF {totalSteps}</Text>
            <Text style={styles.headline}>When are you free to meet?</Text>
            <Text style={styles.subhead}>
              Circles meet around real recurring schedules. Pick when you’re typically available.
            </Text>
          </View>

          {/* Availability Slots Card */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Preferred Time Slots</Text>
            </View>

            <View style={styles.slotsList}>
              {AVAILABILITY_SLOTS.map((slot) => {
                const isSelected = slots.includes(slot.key);
                return (
                  <Pressable
                    key={slot.key}
                    onPress={() => toggleSlot(slot.key)}
                    style={[styles.slotItem, isSelected && styles.slotItemSelected]}
                  >
                    <View style={styles.slotTextCol}>
                      <Text style={[styles.slotLabel, isSelected && styles.slotLabelSelected]}>
                        {slot.label}
                      </Text>
                      <Text style={styles.slotTime}>{slot.timeRange}</Text>
                    </View>
                    <View style={[styles.slotCheck, isSelected && styles.slotCheckSelected]}>
                      {isSelected && <Check size={14} color={colors.textOnDark} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Lifestyle & Event Comforts */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Sparkles size={18} color={colors.intent.friendship} />
              <Text style={styles.cardTitle}>Lifestyle & Comforts</Text>
            </View>
            <Text style={styles.cardSubhead}>
              Optional preferences to help us curate comfortable event atmospheres for you.
            </Text>

            <View style={styles.comfortsGrid}>
              {LIFESTYLE_COMFORTS.map((item) => {
                const isSelected = comforts.includes(item.key);
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => toggleComfort(item.key)}
                    style={[styles.comfortChip, isSelected && styles.comfortChipSelected]}
                  >
                    <Text style={styles.comfortIcon}>{item.icon}</Text>
                    <Text style={[styles.comfortText, isSelected && styles.comfortTextSelected]}>
                      {item.label}
                    </Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardSubhead: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  slotsList: {
    gap: spacing.xs,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  slotItemSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  slotTextCol: {
    flex: 1,
  },
  slotLabel: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  slotLabelSelected: {
    color: colors.primary,
  },
  slotTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  slotCheck: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  slotCheckSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  comfortsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  comfortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
    gap: 6,
  },
  comfortChipSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  comfortIcon: {
    fontSize: 14,
  },
  comfortText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  comfortTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  footerWrap: {
    marginTop: spacing.sm,
  },
  continueBtn: {
    width: '100%',
  },
});
