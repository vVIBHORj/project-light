import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  GradientBackground,
  PillButton,
  typography,
  colors,
  spacing,
} from '../../src/design-system';
import { repositories } from '../../src/data';
import { analytics } from '../../src/lib/analytics';
import { useSessionStore } from '../../src/state/useSessionStore';

export default function SplashScreen() {
  const router = useRouter();
  const { setUser, setToken, setProfile } = useSessionStore();
  const [error, setError] = useState<string | null>(null);

  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Pulse animation on the pin dot
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 1200,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim, scaleAnim]);

  const runBootstrap = React.useCallback(async () => {
    setError(null);
    try {
      analytics.track('app_opened', { app_version: '1.0.0', source: 'cold_launch' });

      // Parallel config bootstrap & session check
      const [config, session] = await Promise.all([
        repositories.auth.getBootstrapConfig(),
        repositories.auth.getSession(),
      ]);

      if (config.maintenance) {
        router.replace('/(auth)/maintenance');
        return;
      }

      if (config.forceUpdate) {
        router.replace('/(auth)/force-update');
        return;
      }

      if (session.user && session.token) {
        setUser(session.user);
        setToken(session.token);

        if (session.user.status === 'restricted') {
          router.replace('/(auth)/safe-hold');
          return;
        }

        const profile = await repositories.profile.getProfile(session.user.id);
        if (profile) {
          setProfile(profile);
          analytics.track('home_viewed', { state: 'authenticated', local_density_bucket: 'high' });
          router.replace('/(tabs)');
        } else {
          router.replace('/(onboarding)/age');
        }
      } else {
        // New user goes to Welcome
        router.replace('/(auth)/welcome');
      }
    } catch {
      setError('We could not reach the service right now. Please check your internet connection.');
    }
  }, [router, setUser, setToken, setProfile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runBootstrap();
    }, 1200);
    return () => clearTimeout(timer);
  }, [runBootstrap]);

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          {/* Logo with animated glowing location pin dot */}
          <View style={styles.brandRow}>
            <Animated.View
              style={[
                styles.pinGlow,
                {
                  opacity: glowAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.pinDot} />
            </Animated.View>
            <Text style={styles.brandText}>light</Text>
          </View>

          <Text style={styles.tagline}>Find your people nearby</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <PillButton
                label="Retry"
                size="sm"
                variant="primary"
                onPress={runBootstrap}
                style={styles.retryBtn}
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made for Bengaluru</Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinGlow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 128, 237, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  brandText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 42,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  errorBox: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.destructive,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  retryBtn: {
    marginTop: spacing.xs,
  },
  footer: {
    paddingBottom: spacing.sm,
  },
  footerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});
