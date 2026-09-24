import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ArrowUpCircle } from 'lucide-react-native';
import { colors, typography, radii, spacing } from '../../src/design-system/tokens';
import { GradientBackground } from '../../src/design-system/components/GradientBackground';
import { GlassCard } from '../../src/design-system/components/GlassCard';
import { PillButton } from '../../src/design-system/components/PillButton';

export default function ForceUpdateScreen() {
  const handleUpdate = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/project-light').catch(() => {});
    } else if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.projectlight.app').catch(() => {});
    } else {
      Linking.openURL('https://projectlight.app').catch(() => {});
    }
  };

  return (
    <GradientBackground preset="sky" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.iconWrapper}>
              <Sparkles size={40} color={colors.primary} />
            </View>

            <Text style={styles.title}>Update Required</Text>

            <Text style={styles.description}>
              A new, enhanced version of Project LIGHT is available with important new safety features and improvements.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                To ensure a secure and reliable experience for everyone in our community, please update to the latest version.
              </Text>
            </View>

            <View style={styles.actionContainer}>
              <PillButton
                label="Update App Now"
                variant="primary"
                icon={<ArrowUpCircle size={18} color={colors.textOnDark} />}
                onPress={handleUpdate}
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
    backgroundColor: '#DDEBFB',
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
  actionContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
