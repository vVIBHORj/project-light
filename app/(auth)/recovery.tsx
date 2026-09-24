import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
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
import { recoverySchema } from '../../src/features/auth/schemas';

export default function RecoveryScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecover = async () => {
    setError(null);
    const parsed = recoverySchema.safeParse({ identifier: identifier.trim() });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await repositories.auth.requestRecovery(identifier.trim());
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unable to request recovery. Please try again.';
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
          <Text style={styles.topTitle}>Account Recovery</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <GlassCard style={styles.card}>
            {submitted ? (
              <View style={styles.successBox}>
                <View style={styles.iconCircle}>
                  <CheckCircle2 size={32} color={colors.intent.friendship} />
                </View>
                <Text style={styles.heading}>Check Your Messages</Text>
                <Text style={styles.subheading}>
                  If an account exists for <Text style={styles.boldText}>{identifier}</Text>, we have sent instructions to restore your access.
                </Text>
                <PillButton
                  label="Back to Log In"
                  variant="primary"
                  size="md"
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.submitBtn}
                />
              </View>
            ) : (
              <>
                <Text style={styles.heading}>Recover Your Account</Text>
                <Text style={styles.subheading}>
                  Enter the phone number or email address associated with your account.
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
                  label="Send Recovery Instructions"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onPress={handleRecover}
                  style={styles.submitBtn}
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
    marginBottom: spacing.lg,
    maxWidth: 290,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
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
  successBox: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
