import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
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

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
];

export default function ProfilePhotoScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    draft.photoUri || SAMPLE_AVATARS[0]
  );
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    setStep(10);
  }, [setStep]);

  const handleContinue = () => {
    updateDraft({
      photoUri: selectedPhoto,
      stepIndex: 11,
    });

    analytics.track('onboarding_step_completed', {
      step: 'profile_photo',
      has_photo: Boolean(selectedPhoto),
    });

    router.push('/(onboarding)/bio-preview');
  };

  const handleSkipForCommunityOnly = () => {
    updateDraft({
      photoUri: undefined,
      privacySettings: {
        ...(draft.privacySettings || {
          discoverability: 'circles_only',
          showAgeBand: true,
          showZone: true,
          messageRequests: 'mutual_only',
        }),
        communityOnlyMode: true,
      },
      stepIndex: 11,
    });

    analytics.track('onboarding_step_skipped', {
      step: 'profile_photo',
      reason: 'community_only',
    });

    router.push('/(onboarding)/bio-preview');
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
            <OnboardingProgress currentStep={10} totalSteps={totalSteps} />
          </View>
          <Pressable onPress={handleSkipForCommunityOnly} style={styles.skipHeaderBtn}>
            <Text style={styles.skipHeaderText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 10 OF {totalSteps}</Text>
            <Text style={styles.headline}>Add a profile photo</Text>
            <Text style={styles.subhead}>
              A clear photo builds safety and trust in small Circles. Required before 1:1 discovery.
            </Text>
          </View>

          {/* Photo Preview & Moderation State */}
          <GlassCard style={styles.previewCard}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: selectedPhoto }} style={styles.avatarImage} />
              <View style={styles.cameraBadge}>
                <Camera size={16} color={colors.textOnDark} />
              </View>
            </View>

            {/* Moderation Pending Indicator */}
            <View style={styles.moderationStatusBox}>
              <Sparkles size={14} color={colors.primary} />
              <Text style={styles.moderationStatusText}>
                Automated Photo Review: <Text style={styles.statusPending}>Pending Verification</Text>
              </Text>
            </View>

            <Text style={styles.helperText}>
              Select a photo preset below or verify your image during account setup:
            </Text>

            {/* Preset Selector */}
            <View style={styles.presetsRow}>
              {SAMPLE_AVATARS.map((uri, idx) => {
                const isSelected = selectedPhoto === uri;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedPhoto(uri)}
                    style={[styles.presetThumbWrap, isSelected && styles.presetThumbWrapSelected]}
                  >
                    <Image source={{ uri }} style={styles.presetThumb} />
                    {isSelected && (
                      <View style={styles.selectedCheck}>
                        <CheckCircle size={14} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Guidelines Link */}
            <Pressable
              onPress={() => setShowGuidelines(!showGuidelines)}
              style={styles.guidelinesBtn}
            >
              <Info size={15} color={colors.primary} />
              <Text style={styles.guidelinesBtnText}>
                {showGuidelines ? 'Hide Photo Guidelines' : 'View Safety & Photo Guidelines'}
              </Text>
            </Pressable>

            {/* Photo Guidelines Box */}
            {showGuidelines && (
              <View style={styles.guidelinesBox}>
                <View style={styles.guidelineItem}>
                  <CheckCircle size={14} color={colors.intent.friendship} />
                  <Text style={styles.guidelineText}>Your face is clearly visible with good lighting</Text>
                </View>
                <View style={styles.guidelineItem}>
                  <AlertCircle size={14} color={colors.destructive} />
                  <Text style={styles.guidelineText}>No photos of minors, celebrities, or other people</Text>
                </View>
                <View style={styles.guidelineItem}>
                  <AlertCircle size={14} color={colors.destructive} />
                  <Text style={styles.guidelineText}>No offensive, graphic, or commercial images</Text>
                </View>
              </View>
            )}
          </GlassCard>

          {/* Community Mode Note */}
          <View style={styles.communityNote}>
            <ShieldCheck size={16} color={colors.safety} />
            <Text style={styles.communityNoteText}>
              Prefer not to upload a photo yet? You can skip and browse community hobby circles.
            </Text>
          </View>

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label="Continue to Bio & Preview"
              variant="primary"
              size="lg"
              onPress={handleContinue}
              style={styles.continueBtn}
            />
            <Pressable onPress={handleSkipForCommunityOnly} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip and browse communities only</Text>
            </Pressable>
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
  previewCard: {
    padding: spacing.lg,
    borderRadius: radii.card,
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: radii.full,
    backgroundColor: 'rgba(11, 15, 26, 0.08)',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moderationStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDEBFB',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    gap: 6,
  },
  moderationStatusText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  statusPending: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  helperText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetThumbWrap: {
    position: 'relative',
    borderRadius: radii.full,
    padding: 2,
  },
  presetThumbWrapSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  presetThumb: {
    width: 50,
    height: 50,
    borderRadius: radii.full,
  },
  selectedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.full,
  },
  guidelinesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  guidelinesBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
    color: colors.primary,
  },
  guidelinesBox: {
    backgroundColor: 'rgba(11, 15, 26, 0.04)',
    padding: spacing.md,
    borderRadius: radii.md,
    width: '100%',
    gap: 6,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidelineText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  communityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    padding: spacing.md,
    borderRadius: radii.card,
  },
  communityNoteText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  footerWrap: {
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  continueBtn: {
    width: '100%',
  },
  skipBtn: {
    paddingVertical: spacing.xs,
  },
  skipBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
