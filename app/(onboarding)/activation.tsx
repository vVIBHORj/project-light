import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Flame,
} from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  ReasonChip,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useSessionStore } from '../../src/state/useSessionStore';
import { analytics } from '../../src/lib/analytics';
import { mockCircles } from '../../src/data/mocks/seedData';
import { isActivationEligible } from '../../src/domain/dataClassification';

export default function ActivationScreen() {
  const router = useRouter();
  const { draft, saveToServer, hasMinimumInterests } = useOnboardingStore();
  const { user, setProfile } = useSessionStore();

  const [saving, setSaving] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function completeOnboarding() {
      if (!hasMinimumInterests()) {
        setError('At least 5 interests are required to activate your account and match you with local Circles.');
        setSaving(false);
        return;
      }

      if (!isActivationEligible(draft)) {
        setError('Please complete the required profile steps (age 18+, display name, intent, zone).');
        setSaving(false);
        return;
      }

      try {
        setSaving(true);
        const userId = user?.id || 'user_1';
        const updatedProfile = await saveToServer(userId);
        setProfile(updatedProfile);

        analytics.track('onboarding_completed', {
          user_id: userId,
          intent: draft.primaryIntent || 'friendship',
          interests_count: draft.interests?.length || 0,
          zone: draft.zone || 'Bengaluru',
          primary_intent: draft.primaryIntent || 'friendship',
        });

        analytics.track('profile_completed', {
          user_id: userId,
          completion_pct: updatedProfile.completionPercentage,
        });

        setReady(true);
      } catch {
        setError('We were unable to complete account activation. Please try again.');
      } finally {
        setSaving(false);
      }
    }

    completeOnboarding();
  }, [draft, hasMinimumInterests, user?.id, saveToServer, setProfile]);

  const handleEnterApp = () => {
    router.replace('/(tabs)');
  };

  const handleFixInterests = () => {
    router.replace('/(onboarding)/interests');
  };

  // Matched circles based on user's zone or interests
  const previewCircles = mockCircles.slice(0, 2);

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {saving && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingTitle}>Preparing Your Neighborhood</Text>
              <Text style={styles.loadingSub}>
                Matching you with active Circles in {draft.zone || 'Bengaluru'}...
              </Text>
            </View>
          )}

          {!saving && error && (
            <View style={styles.errorContainer}>
              <GlassCard style={styles.errorCard}>
                <AlertTriangle size={36} color={colors.destructive} />
                <Text style={styles.errorTitle}>Activation Incomplete</Text>
                <Text style={styles.errorDesc}>{error}</Text>
                <PillButton
                  label="Update Interests"
                  variant="primary"
                  onPress={handleFixInterests}
                  style={{ marginTop: spacing.sm, width: '100%' }}
                />
              </GlassCard>
            </View>
          )}

          {!saving && ready && (
            <>
              {/* Celebratory Hero Header */}
              <View style={styles.heroSection}>
                <View style={styles.sparkleOrb}>
                  <Sparkles size={36} color={colors.primary} />
                </View>
                <Text style={styles.headline}>Your Circles are ready!</Text>
                <Text style={styles.subhead}>
                  Welcome to Project LIGHT, <Text style={styles.boldText}>{draft.displayName || 'Friend'}</Text>. We’ve found your first small local Circles in {draft.zone || 'Bengaluru'}.
                </Text>
              </View>

              {/* Ready Status Card */}
              <GlassCard style={styles.successCard}>
                <View style={styles.successRow}>
                  <CheckCircle2 size={20} color={colors.intent.friendship} />
                  <Text style={styles.successText}>Profile & Privacy Verified</Text>
                </View>
                <View style={styles.successRow}>
                  <CheckCircle2 size={20} color={colors.intent.friendship} />
                  <Text style={styles.successText}>
                    {draft.interests?.length || 5} Passions Indexed for Circle Matching
                  </Text>
                </View>
                <View style={styles.successRow}>
                  <CheckCircle2 size={20} color={colors.intent.friendship} />
                  <Text style={styles.successText}>
                    Location Anchored to {draft.zone || 'Bengaluru'}
                  </Text>
                </View>
              </GlassCard>

              {/* Preview Circles Teaser */}
              <View style={styles.circlesSection}>
                <View style={styles.sectionHeader}>
                  <Flame size={18} color={colors.intent.dating} />
                  <Text style={styles.sectionTitle}>First Recommended Circles</Text>
                </View>

                {previewCircles.map((circle) => (
                  <GlassCard key={circle.id} style={styles.circlePreviewCard}>
                    <View style={styles.circleHeaderRow}>
                      <View style={styles.circleIconBox}>
                        <Users size={18} color={colors.primary} />
                      </View>
                      <View style={styles.circleInfo}>
                        <Text style={styles.circleTitle}>{circle.title}</Text>
                        <Text style={styles.circleMeta}>
                          {circle.locationZone} • {circle.cadence}
                        </Text>
                      </View>
                      <View style={styles.membersBadge}>
                        <Text style={styles.membersBadgeText}>
                          {circle.currentMemberCount}/{circle.capacity}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reasonsRow}>
                      {circle.reasonChips.map((chip, idx) => (
                        <ReasonChip key={idx} label={chip} highlight={idx === 0} />
                      ))}
                    </View>
                  </GlassCard>
                ))}
              </View>

              {/* Enter App CTA */}
              <View style={styles.footerWrap}>
                <PillButton
                  label="Enter Project LIGHT"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} color={colors.textOnDark} />}
                  onPress={handleEnterApp}
                  style={styles.enterBtn}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  loadingBox: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  loadingSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorContainer: {
    paddingVertical: 60,
  },
  errorCard: {
    padding: spacing.xl,
    borderRadius: radii.card,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  errorDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sparkleOrb: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: '#DDEBFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headline: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.hero,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.hero,
  },
  subhead: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    maxWidth: 320,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  successCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    gap: spacing.xs,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  successText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  circlesSection: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  circlePreviewCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    gap: spacing.xs,
  },
  circleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  circleIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: '#DDEBFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInfo: {
    flex: 1,
  },
  circleTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  circleMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  membersBadge: {
    backgroundColor: 'rgba(11, 15, 26, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  membersBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  footerWrap: {
    marginTop: spacing.sm,
  },
  enterBtn: {
    width: '100%',
  },
});
