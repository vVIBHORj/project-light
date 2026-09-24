import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldAlert } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  OTPInput,
  typography,
  colors,
  spacing,
} from '../../src/design-system';
import { repositories } from '../../src/data';
import { analytics } from '../../src/lib/analytics';
import { useSessionStore } from '../../src/state/useSessionStore';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    challengeId?: string;
    identifier?: string;
    isDuplicate?: string;
  }>();

  const challengeId = params.challengeId || 'mock_challenge';
  const identifier = params.identifier || '+91 98765 43210';

  const { setUser, setToken, setProfile } = useSessionStore();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendTimer]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await repositories.auth.verifyOtp(challengeId, code);
      setUser(result.user);
      setToken(result.token);

      analytics.track('signup_completed', {
        method: identifier.includes('@') ? 'email' : 'phone',
      });

      // Check if user has an existing completed profile
      const profile = await repositories.profile.getProfile(result.user.id);
      if (profile && profile.completionPercentage > 50) {
        setProfile(profile);
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/age');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid verification code';
      if (errorMessage === 'SECURITY_CHALLENGE_REQUIRED') {
        router.push({
          pathname: '/(auth)/security-challenge',
          params: { challengeId, identifier },
        });
        return;
      }
      setError(errorMessage);
      setAttemptsRemaining((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError(null);
    try {
      await repositories.auth.resendOtp(challengeId);
      setResendTimer(30);
      setAttemptsRemaining(5);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to resend code. Please try again.';
      setError(msg);
    }
  };

  const handleOtpChange = (newVal: string) => {
    setOtp(newVal);
    setError(null);
    if (newVal.length === 6) {
      handleVerify(newVal);
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
          <Text style={styles.topTitle}>Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <Text style={styles.heading}>Enter Verification Code</Text>
            <Text style={styles.subheading}>
              We sent a 6-digit code to <Text style={styles.boldText}>{identifier}</Text>
            </Text>

            {/* Hint for tester */}
            <View style={styles.testHint}>
              <Text style={styles.testHintText}>
                Demo OTP: <Text style={styles.boldText}>123456</Text> (Use 999999 for expired, 000000 for security challenge)
              </Text>
            </View>

            {/* 6-box OTP Input */}
            <OTPInput
              value={otp}
              onChange={handleOtpChange}
              error={Boolean(error)}
            />

            {error && (
              <View style={styles.errorBox}>
                <ShieldAlert size={15} color={colors.destructive} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {attemptsRemaining < 5 && attemptsRemaining > 0 && (
              <Text style={styles.attemptsText}>
                {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining before temporary lockout
              </Text>
            )}

            {/* Verify CTA */}
            <PillButton
              label="Verify & Continue"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={otp.length !== 6}
              onPress={() => handleVerify()}
              style={styles.submitBtn}
            />

            {/* 30s Resend Timer */}
            <View style={styles.resendRow}>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend code in <Text style={styles.boldText}>{resendTimer}s</Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend} style={styles.resendBtn}>
                  <Text style={styles.resendBtnText}>Resend verification code</Text>
                </Pressable>
              )}
            </View>
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
  heading: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xs,
    maxWidth: 290,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  testHint: {
    backgroundColor: 'rgba(47, 128, 237, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  testHintText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.primary,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: spacing.sm,
    gap: 6,
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.destructive,
    textAlign: 'center',
  },
  attemptsText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.destructive,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  submitBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  resendRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  resendTimerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendBtn: {
    paddingVertical: spacing.xs,
  },
  resendBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
