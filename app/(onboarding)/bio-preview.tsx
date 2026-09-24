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
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  PersonCard,
  OnboardingProgress,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { analytics } from '../../src/lib/analytics';

export default function BioPreviewScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [bio, setBio] = useState(draft.bio || '');

  useEffect(() => {
    setStep(11);
  }, [setStep]);

  const handleContinue = () => {
    updateDraft({
      bio: bio.trim(),
      stepIndex: 12,
    });

    analytics.track('onboarding_step_completed', {
      step: 'bio_preview',
      bio_length: bio.trim().length,
    });

    router.push('/(onboarding)/activation');
  };

  const charsRemaining = 140 - bio.length;
  const reasonChips = draft.interests ? draft.interests.slice(0, 3) : ['Local Resident', 'Explorer'];

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
            <OnboardingProgress currentStep={11} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 11 OF {totalSteps}</Text>
            <Text style={styles.headline}>Your Profile Preview</Text>
            <Text style={styles.subhead}>
              Here is exactly how members in your city will see your card. Add a short bio to complete your profile.
            </Text>
          </View>

          {/* Live Interactive PersonCard Preview */}
          <View style={styles.previewWrap}>
            <PersonCard
              id="preview-card"
              name={draft.displayName || 'You'}
              age={draft.privacySettings?.showAgeBand ? draft.ageBand || '22-26' : 'Member'}
              locationZone={draft.privacySettings?.showZone ? draft.zone || 'Bengaluru' : 'Bengaluru'}
              distanceBand={draft.discoveryRadiusBand ? `Within ${draft.discoveryRadiusBand}` : 'Within 5 km'}
              photoUri={draft.photoUri}
              verified={false}
              isNew={true}
              intent={draft.primaryIntent}
              reasonChips={reasonChips}
              occupation={bio || 'Add a short bio below to personalize your intro.'}
            />
          </View>

          {/* Short Bio Input Card */}
          <GlassCard style={styles.card}>
            <View style={styles.bioHeaderRow}>
              <Text style={styles.fieldLabel}>SHORT BIO (OPTIONAL)</Text>
              <Text style={[styles.charCounter, charsRemaining < 20 && styles.charCounterWarning]}>
                {charsRemaining} chars left
              </Text>
            </View>

            <TextInput
              value={bio}
              onChangeText={(text) => {
                if (text.length <= 140) {
                  setBio(text);
                }
              }}
              placeholder="Tell others what you’re currently excited about or exploring..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
              maxLength={140}
            />
          </GlassCard>

          {/* Verification Deep-link Stub (Phase 10 teaser) */}
          <GlassCard style={styles.verificationPrompt}>
            <View style={styles.verifRow}>
              <View style={styles.verifIconBox}>
                <ShieldCheck size={22} color={colors.verified} />
              </View>
              <View style={styles.verifTextCol}>
                <Text style={styles.verifTitle}>Get the Blue Verified Badge</Text>
                <Text style={styles.verifDesc}>
                  Adult photo-verification boosts match quality and Circle invites. (Available anytime in Settings).
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label="Review & Activate Account"
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
  previewWrap: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
  },
  bioHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  charCounter: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  charCounterWarning: {
    color: colors.destructive,
  },
  bioInput: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  verificationPrompt: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  verifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(45, 156, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifTextCol: {
    flex: 1,
  },
  verifTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  verifDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footerWrap: {
    marginTop: spacing.sm,
  },
  continueBtn: {
    width: '100%',
  },
});
