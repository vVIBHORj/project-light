import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, ExternalLink } from 'lucide-react-native';
import { colors, typography, radii, spacing } from '../../src/design-system/tokens';
import { GradientBackground } from '../../src/design-system/components/GradientBackground';
import { GlassCard } from '../../src/design-system/components/GlassCard';
import { PillButton } from '../../src/design-system/components/PillButton';
import { useSessionStore } from '../../src/state/useSessionStore';

export default function SafeHoldScreen() {
  const router = useRouter();
  const clearSession = useSessionStore((state) => state.clearSession);

  const handleReturn = async () => {
    await clearSession();
    router.replace('/(auth)/welcome');
  };

  const handleOpenResources = () => {
    Linking.openURL('https://www.childlineindia.org/').catch(() => {});
  };

  return (
    <GradientBackground preset="sky" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.iconWrapper}>
              <ShieldAlert size={40} color={colors.destructive} />
            </View>

            <Text style={styles.title}>Safety & Age Policy</Text>

            <Text style={styles.description}>
              Project LIGHT is built exclusively for adults aged 18 and older to form meaningful, real-world connections.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Because our community requires verified adult membership to maintain safety and compliance with youth protection standards, we cannot activate this account.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenResources}
              style={styles.resourceLink}
              accessibilityRole="link"
            >
              <Text style={styles.resourceText}>Learn more about youth digital safety</Text>
              <ExternalLink size={14} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.actionContainer}>
              <PillButton
                label="Return to Welcome"
                variant="primary"
                onPress={handleReturn}
              />
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  card: {
    padding: spacing.xl,
    borderRadius: radii.card,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: 'rgba(229, 72, 77, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'rgba(11, 15, 26, 0.05)',
    padding: spacing.md,
    borderRadius: radii.md,
    width: '100%',
  },
  infoText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  resourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  resourceText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
  actionContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
