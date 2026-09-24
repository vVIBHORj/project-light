import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground, GlassCard, PillButton, typography, colors, spacing } from '../src/design-system';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <GradientBackground preset="sky">
      <View style={styles.container}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Screen Not Found</Text>
          <Text style={styles.subtitle}>The requested route does not exist.</Text>
          <PillButton
            label="Go to Home"
            variant="primary"
            onPress={() => router.replace('/(tabs)')}
            style={styles.button}
          />
        </GlassCard>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});
