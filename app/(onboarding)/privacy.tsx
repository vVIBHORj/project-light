import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Eye, Users, Lock } from 'lucide-react-native';
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
import { PrivacySettings } from '../../src/domain/types';

export default function PrivacyControlsScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [discoverability, setDiscoverability] = useState<PrivacySettings['discoverability']>(
    draft.privacySettings?.discoverability || 'eligible_only'
  );
  const [showAgeBand, setShowAgeBand] = useState<boolean>(
    draft.privacySettings?.showAgeBand ?? true
  );
  const [showZone, setShowZone] = useState<boolean>(
    draft.privacySettings?.showZone ?? true
  );
  const [communityOnlyMode, setCommunityOnlyMode] = useState<boolean>(
    draft.privacySettings?.communityOnlyMode ?? false
  );
  const [messageRequests, setMessageRequests] = useState<PrivacySettings['messageRequests']>(
    draft.privacySettings?.messageRequests || 'mutual_only'
  );

  useEffect(() => {
    setStep(9);
  }, [setStep]);

  const handleContinue = () => {
    updateDraft({
      privacySettings: {
        discoverability,
        showAgeBand,
        showZone,
        communityOnlyMode,
        messageRequests,
      },
      stepIndex: 10,
    });

    analytics.track('onboarding_step_completed', {
      step: 'privacy_controls',
      discoverability,
      community_only_mode: communityOnlyMode,
      message_requests: messageRequests,
    });

    router.push('/(onboarding)/photo');
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
            <OnboardingProgress currentStep={9} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 9 OF {totalSteps}</Text>
            <Text style={styles.headline}>Your Privacy Controls</Text>
            <Text style={styles.subhead}>
              You control how you appear to others. All settings can be updated anytime in Settings.
            </Text>
          </View>

          {/* 1. Who Can Discover Me */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Eye size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Who Can Discover Me</Text>
            </View>

            <View style={styles.optionList}>
              {[
                {
                  key: 'eligible_only',
                  label: 'Eligible Members Only (Recommended)',
                  desc: 'Only verified adults matching your intent and age preferences.',
                },
                {
                  key: 'circles_only',
                  label: 'Circles & Events Only',
                  desc: 'Only members who share an active Circle or event RSVP with you.',
                },
                {
                  key: 'hidden',
                  label: 'Incognito Mode',
                  desc: 'Hidden from discovery feeds; only you can initiate interactions.',
                },
              ].map((item) => {
                const isSelected = discoverability === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setDiscoverability(item.key as PrivacySettings['discoverability'])}
                    style={[styles.radioItem, isSelected && styles.radioItemSelected]}
                  >
                    <View style={styles.radioTextCol}>
                      <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                        {item.label}
                      </Text>
                      <Text style={styles.radioDesc}>{item.desc}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* 2. Public Visibility Toggles */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Users size={18} color={colors.intent.friendship} />
              <Text style={styles.cardTitle}>Profile Visibility</Text>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleLabel}>Display Age Band</Text>
                <Text style={styles.toggleSub}>Shows &quot;{draft.ageBand || '22-26'}&quot; instead of exact age</Text>
              </View>
              <Switch
                value={showAgeBand}
                onValueChange={setShowAgeBand}
                trackColor={{ false: 'rgba(11, 15, 26, 0.1)', true: colors.primary }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleLabel}>Display Neighborhood Zone</Text>
                <Text style={styles.toggleSub}>Shows &quot;{draft.zone || 'Indiranagar'}&quot; on profile card</Text>
              </View>
              <Switch
                value={showZone}
                onValueChange={setShowZone}
                trackColor={{ false: 'rgba(11, 15, 26, 0.1)', true: colors.primary }}
              />
            </View>
          </GlassCard>

          {/* 3. Community-Only Mode & Direct Messages */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Lock size={18} color={colors.intent.dating} />
              <Text style={styles.cardTitle}>Connection Controls</Text>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleLabel}>Community-Only Mode</Text>
                <Text style={styles.toggleSub}>
                  Turn off 1:1 person discovery. Only participate in group Circles and public communities.
                </Text>
              </View>
              <Switch
                value={communityOnlyMode}
                onValueChange={setCommunityOnlyMode}
                trackColor={{ false: 'rgba(11, 15, 26, 0.1)', true: colors.intent.dating }}
              />
            </View>

            <View style={styles.messagePrefRow}>
              <Text style={styles.messagePrefLabel}>DIRECT MESSAGE POLICY</Text>
              <View style={styles.msgOptions}>
                {[
                  { key: 'mutual_only', label: 'Mutual Connections Only (Safe Default)' },
                  { key: 'filtered', label: 'Allow Circle Introductions' },
                ].map((item) => {
                  const isSelected = messageRequests === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setMessageRequests(item.key as PrivacySettings['messageRequests'])}
                      style={[styles.msgChip, isSelected && styles.msgChipSelected]}
                    >
                      <Text style={[styles.msgChipText, isSelected && styles.msgChipTextSelected]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </GlassCard>

          {/* Safety Promise */}
          <View style={styles.safetyCard}>
            <Shield size={18} color={colors.safety} />
            <Text style={styles.safetyText}>
              Project LIGHT does not permit unsolicited 1:1 direct messages. Connections always require mutual consent.
            </Text>
          </View>

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label="Continue to Profile Photo"
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
  optionList: {
    gap: spacing.xs,
  },
  radioItem: {
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
  radioItemSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  radioTextCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  radioLabel: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  radioLabelSelected: {
    color: colors.primary,
  },
  radioDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  toggleSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  messagePrefRow: {
    marginTop: spacing.xs,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11, 15, 26, 0.06)',
  },
  messagePrefLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  msgOptions: {
    gap: spacing.xs,
  },
  msgChip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  msgChipSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  msgChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  msgChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    padding: spacing.md,
    borderRadius: radii.card,
  },
  safetyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  footerWrap: {
    marginTop: spacing.sm,
  },
  continueBtn: {
    width: '100%',
  },
});
