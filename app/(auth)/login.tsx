import React, { useState } from 'react';
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
import { ArrowLeft } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { repositories } from '../../src/data';
import { loginSchema } from '../../src/features/auth/schemas';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('+91 98765 43210');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const parsed = loginSchema.safeParse({ identifier: identifier.trim() });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const challenge = await repositories.auth.login(identifier.trim());
      router.push({
        pathname: '/(auth)/otp',
        params: {
          challengeId: challenge.challengeId,
          identifier: identifier.trim(),
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unable to start login. Please try again.';
      setError(msg);
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
          <Text style={styles.topTitle}>Log In</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>
              Enter your registered phone number or email to receive a verification code.
            </Text>

            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Phone number or email"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <PillButton
              label="Send Verification Code"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            {/* Trouble signing in? -> AUTH-06 Account Recovery */}
            <Pressable
              onPress={() => router.push('/(auth)/recovery')}
              style={styles.troubleLink}
            >
              <Text style={styles.troubleLinkText}>Trouble signing in?</Text>
            </Pressable>

            {/* Switch to Signup */}
            <Pressable
              onPress={() => router.push('/(auth)/signup')}
              style={styles.signupLink}
            >
              <Text style={styles.signupLinkText}>
                New to LIGHT? <Text style={styles.signupLinkBold}>Create an account</Text>
              </Text>
            </Pressable>
          </GlassCard>
        </ScrollView>
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
  scrollContent: {
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
    marginBottom: spacing.lg,
    maxWidth: 290,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontFamily: typography.fontFamily.sans,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.destructive,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  submitBtn: {
    width: '100%',
  },
  troubleLink: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  troubleLinkText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  signupLink: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  signupLinkText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  signupLinkBold: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
