import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  typography,
  colors,
  spacing,
} from '../../src/design-system';
import { repositories } from '../../src/data';
import { useSessionStore } from '../../src/state/useSessionStore';

export default function SecurityChallengeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    challengeId?: string;
    identifier?: string;
  }>();

  const challengeId = params.challengeId || 'mock_challenge';
  const identifier = params.identifier || 'your account';

  const { setToken } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [secured, setSecured] = useState(false);

  const handleConfirmMe = async () => {
    setLoading(true);
    try {
      const res = await repositories.auth.resolveSecurityChallenge(challengeId, 'confirm_me');
      if (res.token) {
        setToken(res.token);
      }
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleNotMe = async () => {
    setLoading(true);
    try {
      await repositories.auth.resolveSecurityChallenge(challengeId, 'not_me');
      setSecured(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>Security Check</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.iconCircle}>
              <ShieldAlert size={32} color={colors.destructive} />
            </View>

            {secured ? (
              <View style={styles.securedBox}>
                <Text style={styles.heading}>Account Secured</Text>
                <Text style={styles.subheading}>
                  We have blocked that sign-in attempt and temporarily secured your account. Please log in with your verified credentials.
                </Text>
                <PillButton
                  label="Back to Log In"
                  variant="primary"
                  size="md"
                  onPress={() => router.replace('/(auth)/login')}
                  style={styles.submitBtn}
                />
              </View>
            ) : (
              <>
                <Text style={styles.heading}>Unusual Sign-In Attempt</Text>
                <Text style={styles.subheading}>
                  We detected a login attempt for <Text style={styles.boldText}>{identifier}</Text> from a new device or browser in Bengaluru.
                </Text>

                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Lock size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>Location: Bengaluru, KA</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Lock size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>Time: Just now</Text>
                  </View>
                </View>

                <PillButton
                  label="Yes, it was me"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onPress={handleConfirmMe}
                  style={styles.submitBtn}
                />

                <PillButton
                  label="No, secure my account"
                  variant="destructive"
                  size="md"
                  loading={loading}
                  onPress={handleNotMe}
                  style={styles.notMeBtn}
                />
              </>
            )}
          </GlassCard>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.md,
  },
  card: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 72, 77, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heading: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subheading: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
    maxWidth: 290,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  detailText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  submitBtn: {
    width: '100%',
    marginTop: spacing.xs,
  },
  notMeBtn: {
    width: '100%',
    marginTop: spacing.xs,
  },
  securedBox: {
    alignItems: 'center',
    width: '100%',
  },
});
