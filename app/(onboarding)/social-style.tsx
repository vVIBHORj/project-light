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
import { ArrowLeft, Users, Zap, Clock, MessageSquare } from 'lucide-react-native';
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
import { SocialStyle } from '../../src/domain/types';

export default function SocialStyleScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [groupSize, setGroupSize] = useState<SocialStyle['groupSize']>(
    draft.socialStyle?.groupSize || '4-6'
  );
  const [interactionStyle, setInteractionStyle] = useState<SocialStyle['interactionStyle']>(
    draft.socialStyle?.interactionStyle || 'balanced'
  );
  const [energy, setEnergy] = useState<SocialStyle['energy']>(
    draft.socialStyle?.energy || 'balanced'
  );
  const [pace, setPace] = useState<SocialStyle['pace']>(
    draft.socialStyle?.pace || 'steady'
  );

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  const handleContinue = () => {
    updateDraft({
      socialStyle: {
        groupSize,
        interactionStyle,
        energy,
        pace,
      },
      stepIndex: 7,
    });

    analytics.track('onboarding_step_completed', {
      step: 'social_style',
      group_size: groupSize,
      interaction_style: interactionStyle,
      energy,
    });

    router.push('/(onboarding)/availability');
  };

  const handleSkip = () => {
    analytics.track('onboarding_step_skipped', { step: 'social_style' });
    updateDraft({ stepIndex: 7 });
    router.push('/(onboarding)/availability');
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header Progress + Skip */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={6} totalSteps={totalSteps} />
          </View>
          <Pressable onPress={handleSkip} style={styles.skipHeaderBtn}>
            <Text style={styles.skipHeaderText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 6 OF {totalSteps}</Text>
            <Text style={styles.headline}>Your Social Style</Text>
            <Text style={styles.subhead}>
              Tell us how you thrive in social settings so we can place you in Circles that match your comfort.
            </Text>
          </View>

          {/* 1. Preferred Group Size */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Users size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Preferred Group Size</Text>
            </View>
            <View style={styles.optionsRow}>
              {[
                { key: '2-3', label: '2 to 3', sub: 'Intimate' },
                { key: '4-6', label: '4 to 6', sub: 'Small circle' },
                { key: '6-8', label: '6 to 8', sub: 'Lively group' },
                { key: 'any', label: 'Any', sub: 'Flexible' },
              ].map((item) => {
                const isSelected = groupSize === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setGroupSize(item.key as SocialStyle['groupSize'])}
                    style={[styles.segmentBtn, isSelected && styles.segmentBtnSelected]}
                  >
                    <Text style={[styles.segmentBtnText, isSelected && styles.segmentBtnTextSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.segmentBtnSub, isSelected && styles.segmentBtnSubSelected]}>
                      {item.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* 2. Activity vs Chat */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <MessageSquare size={18} color={colors.intent.dating} />
              <Text style={styles.cardTitle}>Interaction First Step</Text>
            </View>
            <View style={styles.optionsRow}>
              {[
                { key: 'activity_first', label: 'Activity First', sub: 'Focus on doing things together' },
                { key: 'balanced', label: 'Balanced', sub: 'Activity + conversation' },
                { key: 'chat_first', label: 'Chat First', sub: 'Coffee & sit-down talk' },
              ].map((item) => {
                const isSelected = interactionStyle === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setInteractionStyle(item.key as SocialStyle['interactionStyle'])}
                    style={[styles.segmentBtn, isSelected && styles.segmentBtnSelected]}
                  >
                    <Text style={[styles.segmentBtnText, isSelected && styles.segmentBtnTextSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.segmentBtnSub, isSelected && styles.segmentBtnSubSelected]}>
                      {item.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* 3. Energy Preference */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Zap size={18} color={colors.intent.friendship} />
              <Text style={styles.cardTitle}>Group Energy</Text>
            </View>
            <View style={styles.optionsRow}>
              {[
                { key: 'quiet', label: 'Quiet & Calm', sub: 'Cozy and relaxed' },
                { key: 'balanced', label: 'Balanced', sub: 'Engaged & pleasant' },
                { key: 'lively', label: 'High Energy', sub: 'Vibrant & animated' },
              ].map((item) => {
                const isSelected = energy === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setEnergy(item.key as SocialStyle['energy'])}
                    style={[styles.segmentBtn, isSelected && styles.segmentBtnSelected]}
                  >
                    <Text style={[styles.segmentBtnText, isSelected && styles.segmentBtnTextSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.segmentBtnSub, isSelected && styles.segmentBtnSubSelected]}>
                      {item.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* 4. Pace of Getting to Know People */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Clock size={18} color={colors.intent.explore} />
              <Text style={styles.cardTitle}>Pace of Forming Connections</Text>
            </View>
            <View style={styles.optionsRow}>
              {[
                { key: 'slow', label: 'Gradual', sub: 'Take time over multiple meetings' },
                { key: 'steady', label: 'Steady', sub: 'Comfortable natural pace' },
                { key: 'fast', label: 'Quick', sub: 'Fast conversationalists' },
              ].map((item) => {
                const isSelected = pace === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setPace(item.key as SocialStyle['pace'])}
                    style={[styles.segmentBtn, isSelected && styles.segmentBtnSelected]}
                  >
                    <Text style={[styles.segmentBtnText, isSelected && styles.segmentBtnTextSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.segmentBtnSub, isSelected && styles.segmentBtnSubSelected]}>
                      {item.sub}
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
  skipHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipHeaderText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textSecondary,
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
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  segmentBtnSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  segmentBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  segmentBtnTextSelected: {
    color: colors.primary,
  },
  segmentBtnSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  segmentBtnSubSelected: {
    color: colors.textPrimary,
  },
  footerWrap: {
    marginTop: spacing.sm,
  },
  continueBtn: {
    width: '100%',
  },
});
