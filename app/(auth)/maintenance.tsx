import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, RefreshCw } from 'lucide-react-native';
import { colors, typography, radii, spacing } from '../../src/design-system/tokens';
import { GradientBackground } from '../../src/design-system/components/GradientBackground';
import { GlassCard } from '../../src/design-system/components/GlassCard';
import { PillButton } from '../../src/design-system/components/PillButton';
import { mockAuthRepo } from '../../src/data/mocks';

export default function MaintenanceScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRetry = async () => {
    try {
      setChecking(true);
      setStatusMessage(null);
      const config = await mockAuthRepo.getBootstrapConfig();
      if (!config.maintenance) {
        router.replace('/(auth)/splash');
      } else {
        setStatusMessage('Maintenance is still underway. Thank you for your patience!');
      }
    } catch {
      setStatusMessage('Unable to reach server. Please check your connection.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <GradientBackground preset="sky" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.iconWrapper}>
              <Wrench size={40} color={colors.textPrimary} />
            </View>

            <Text style={styles.title}>Scheduled Maintenance</Text>

            <Text style={styles.description}>
              We’re making improvements to Project LIGHT to keep your experience fast, secure, and delightful.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Our servers are currently undergoing brief routine maintenance. We expect to be back online shortly.
              </Text>
            </View>

            {statusMessage && (
              <Text style={styles.statusMessage}>{statusMessage}</Text>
            )}

            <View style={styles.actionContainer}>
              <PillButton
                label={checking ? 'Checking Status...' : 'Check Again'}
                variant="primary"
                icon={<RefreshCw size={18} color={colors.textOnDark} />}
                onPress={handleRetry}
                loading={checking}
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
  statusMessage: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.destructive,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
