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
import { Check, ArrowLeft } from 'lucide-react-native';
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
import { analytics } from '../../src/lib/analytics';
import { createAccountSchema } from '../../src/features/auth/schemas';

export default function SignupScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const identifier = method === 'phone' ? (phone ? `+91 ${phone}` : '') : email;

  const handleMethodChange = (newMethod: 'phone' | 'email') => {
    setMethod(newMethod);
    setError(null);
    analytics.track('signup_started', { method: newMethod });
  };

  const handleCreateAccount = async () => {
    setError(null);
    const parsed = createAccountSchema.safeParse({
      method,
      identifier: method === 'phone' ? phone.trim() : email.trim(),
      termsAccepted,
      marketingConsent,
      referralCode: referralCode.trim() || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const challenge = await repositories.auth.signUp(
        identifier,
        method,
        referralCode.trim() || undefined
      );

      // If duplicate account, route silently to login challenge without revealing account existence
      router.push({
        pathname: '/(auth)/otp',
        params: {
          challengeId: challenge.challengeId,
          identifier,
          isDuplicate: challenge.isExistingAccount ? 'true' : 'false',
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Service temporarily unavailable. Please try again.';
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
          <Text style={styles.topTitle}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card}>
            <Text style={styles.heading}>Join Project LIGHT</Text>
            <Text style={styles.subheading}>
              Connect with genuine people around shared activities in your neighborhood.
            </Text>

            {/* Method Tabs: Phone / Email */}
            <View style={styles.methodTabs}>
              <Pressable
                onPress={() => handleMethodChange('phone')}
                style={[
                  styles.tabButton,
                  method === 'phone' && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    method === 'phone' && styles.tabButtonTextActive,
                  ]}
                >
                  Phone Number
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleMethodChange('email')}
                style={[
                  styles.tabButton,
                  method === 'email' && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    method === 'email' && styles.tabButtonTextActive,
                  ]}
                >
                  Email Address
                </Text>
              </Pressable>
            </View>

            {/* Input Field */}
            {method === 'phone' ? (
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ) : (
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.emailInput}
                placeholderTextColor={colors.textMuted}
              />
            )}

            {/* Optional Referral Code */}
            <TextInput
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="Referral code (optional)"
              autoCapitalize="characters"
              style={styles.referralInput}
              placeholderTextColor={colors.textMuted}
            />

            {/* Required Terms & Privacy Checkbox */}
            <Pressable
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>
                I confirm I am <Text style={styles.bold}>18 or older</Text> and accept the{' '}
                <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </Pressable>

            {/* Separate Optional Marketing Consent */}
            <Pressable
              onPress={() => setMarketingConsent(!marketingConsent)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
                {marketingConsent && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>
                Receive occasional updates about new local Circles and community activities (optional).
              </Text>
            </Pressable>

            {/* Error Message */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Primary Submit CTA */}
            <PillButton
              label="Send Verification Code"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleCreateAccount}
              style={styles.submitBtn}
            />

            {/* Link to Login */}
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Log in</Text>
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
    paddingBottom: 40,
  },
  card: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
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
    marginBottom: spacing.md,
    maxWidth: 290,
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 15, 26, 0.06)',
    borderRadius: radii.pill,
    padding: 3,
    width: '100%',
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  phoneInputRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.sm,
    gap: 8,
  },
  countryCodeBox: {
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontFamily: typography.fontFamily.sans,
    color: colors.textPrimary,
  },
  emailInput: {
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
    marginBottom: spacing.sm,
  },
  referralInput: {
    width: '100%',
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: spacing.md,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  bold: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
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
    marginTop: spacing.xs,
  },
  loginLink: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  loginLinkText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginLinkBold: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
