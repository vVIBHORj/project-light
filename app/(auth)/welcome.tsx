/* eslint-disable @typescript-eslint/no-require-imports */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import {
  GlassCard,
  SwipeToStart,
  ReasonChip,
  BottomSheet,
  PillButton,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { analytics } from '../../src/lib/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const welcomeHeroImage = require('../../assets/images/welcome-hero.png');
const welcomeSubjectImage = require('../../assets/images/welcome-subject.png');

export default function WelcomeScreen() {
  const router = useRouter();
  const [safetyExplainerOpen, setSafetyExplainerOpen] = useState(false);

  useEffect(() => {
    analytics.track('app_opened', { app_version: '1.0.0', source: 'welcome' });
  }, []);

  return (
    <View style={styles.container}>
      {/* Layer 1: Saturated Blue Sky Background */}
      <Image
        source={welcomeHeroImage}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Layer 2: Giant Translucent Frosted Letters "LIGHT" */}
      <View style={styles.giantLettersContainer} pointerEvents="none">
        <Text style={styles.giantLettersText}>LIGHT</Text>
      </View>

      {/* Layer 3: Cut-out Subject Overlapping the Letters */}
      <View style={styles.subjectContainer} pointerEvents="none">
        <Image
          source={welcomeSubjectImage}
          style={styles.subjectImage}
          resizeMode="contain"
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Top Center: Small White "light" Wordmark with Pin */}
        <View style={styles.topHeader}>
          <View style={styles.pinDot} />
          <Text style={styles.topBrandText}>light</Text>
        </View>

        {/* Layer 4: Sticker Headline "FIND YOUR PEOPLE" in Chewy */}
        <View style={styles.stickerWrap}>
          {/* Hand-drawn Doodle Sparkle Dashes (SVG) */}
          <Svg width={24} height={24} viewBox="0 0 24 24" style={styles.doodleSparkle}>
            <Line x1="12" y1="2" x2="12" y2="7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="4" y1="8" x2="8" y2="11" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="20" y1="8" x2="16" y2="11" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
          <Text style={styles.chewySticker}>FIND</Text>
          <Text style={styles.chewySticker}>YOUR PEOPLE</Text>
        </View>

        {/* Layer 5: Frosted Bottom Sheet Container (32 Radius) */}
        <GlassCard style={styles.bottomCard} borderRadius={radii.bottomSheet}>
          <Text style={styles.bottomHeading}>
            Your people are closer than you think
          </Text>

          <Text style={styles.bottomSubtitle}>
            Join small local Circles around what you love. Friendship, dating or just exploring, at your pace.
          </Text>

          {/* 3 Proof Chips */}
          <View style={styles.proofChipsRow}>
            <ReasonChip label="Small Circles of 4 to 8" />
            <ReasonChip label="Verified adults only" />
            <ReasonChip label="You set the pace" />
          </View>

          {/* SwipeToStart -> AUTH-03 Create Account */}
          <View style={styles.swipeWrap}>
            <SwipeToStart
              label="Get Started"
              onComplete={() => {
                analytics.track('signup_started', { method: 'phone' });
                router.push('/(auth)/signup');
              }}
            />
          </View>

          {/* Text link: "I already have an account" -> AUTH-04 Login */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginLink}
            accessibilityRole="button"
            accessibilityLabel="I already have an account"
          >
            <Text style={styles.loginLinkText}>
              I already have an account • <Text style={styles.loginLinkBold}>Log in</Text>
            </Text>
          </Pressable>

          {/* Footer link: "How we keep you safe" */}
          <Pressable
            onPress={() => setSafetyExplainerOpen(true)}
            style={styles.safetyFooterLink}
            accessibilityRole="button"
            accessibilityLabel="How we keep you safe"
          >
            <Text style={styles.safetyFooterText}>How we keep you safe 🛡️</Text>
          </Pressable>
        </GlassCard>
      </SafeAreaView>

      {/* Safety & Privacy Explainer Sheet */}
      <BottomSheet
        visible={safetyExplainerOpen}
        onClose={() => setSafetyExplainerOpen(false)}
        height={400}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>How LIGHT Keeps You Safe</Text>
          <View style={styles.safetyPoint}>
            <Text style={styles.pointTitle}>1. 18+ Verified Adult Community</Text>
            <Text style={styles.pointDesc}>
              No minors. Age verification guarantees you are connecting with real young adults.
            </Text>
          </View>

          <View style={styles.safetyPoint}>
            <Text style={styles.pointTitle}>2. No Cold Unsolicited DMs</Text>
            <Text style={styles.pointDesc}>
              Private messaging unlocks only after both members mutually connect or join the same small Circle.
            </Text>
          </View>

          <View style={styles.safetyPoint}>
            <Text style={styles.pointTitle}>3. Privacy-Safe Neighborhoods</Text>
            <Text style={styles.pointDesc}>
              We never share continuous GPS or exact distance. Your area is shown only in privacy bands (e.g., 2 to 5 km).
            </Text>
          </View>

          <PillButton
            label="Got it"
            variant="primary"
            onPress={() => setSafetyExplainerOpen(false)}
            style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
          />
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38A4F8',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  giantLettersContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  giantLettersText: {
    fontFamily: 'Chewy',
    fontSize: SCREEN_WIDTH * 0.32,
    color: '#FFFFFF',
    opacity: 0.35,
    letterSpacing: 4,
  },
  subjectContainer: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  subjectImage: {
    width: SCREEN_WIDTH * 0.82,
    height: 380,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    zIndex: 10,
  },
  pinDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  topBrandText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  stickerWrap: {
    alignItems: 'flex-start',
    paddingLeft: spacing.xl,
    marginTop: 40,
    transform: [{ rotate: '-5deg' }],
    zIndex: 10,
    position: 'relative',
  },
  doodleSparkle: {
    position: 'absolute',
    top: -12,
    left: 10,
  },
  chewySticker: {
    fontFamily: 'Chewy',
    fontSize: 42,
    color: '#FFFFFF',
    textShadowColor: colors.orbNavy,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
    letterSpacing: 1.5,
    lineHeight: 46,
  },
  bottomCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomHeading: {
    fontFamily: 'Chewy',
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  bottomSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.sm,
    maxWidth: 300,
  },
  proofChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  swipeWrap: {
    width: '100%',
    marginVertical: spacing.xs,
  },
  loginLink: {
    paddingVertical: spacing.xs,
    marginTop: 4,
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
  safetyFooterLink: {
    paddingTop: 2,
    paddingBottom: 4,
  },
  safetyFooterText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.safety,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  safetyPoint: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  pointTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pointDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
});
