import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Music, Film, BookOpen, Gamepad2, Check } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  OnboardingProgress,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { analytics } from '../../src/lib/analytics';
import { mockTasteCatalog } from '../../src/data/mocks/seedData';

export default function TasteFingerprintScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [music, setMusic] = useState<string[]>(draft.tasteFingerprint?.music || []);
  const [movies, setMovies] = useState<string[]>(draft.tasteFingerprint?.movies || []);
  const [books, setBooks] = useState<string[]>(draft.tasteFingerprint?.books || []);
  const [games, setGames] = useState<string[]>(draft.tasteFingerprint?.games || []);

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  const toggleItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSaveAndContinue = () => {
    updateDraft({
      tasteFingerprint: { music, movies, books, games },
      stepIndex: 6,
    });

    analytics.track('onboarding_step_completed', {
      step: 'taste_fingerprint',
      total_items: music.length + movies.length + books.length + games.length,
    });

    router.push('/(onboarding)/social-style');
  };

  const handleSkip = () => {
    analytics.track('onboarding_step_skipped', { step: 'taste_fingerprint' });
    updateDraft({ stepIndex: 6 });
    router.push('/(onboarding)/social-style');
  };

  const totalSelected = music.length + movies.length + books.length + games.length;

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header Progress + Skip */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={5} totalSteps={totalSteps} />
          </View>
          <Pressable onPress={handleSkip} style={styles.skipHeaderBtn}>
            <Text style={styles.skipHeaderText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 5 OF {totalSteps}</Text>
            <Text style={styles.headline}>Your Taste Fingerprint</Text>
            <Text style={styles.subhead}>
              Optional. Pick artists, films, or games you resonate with to unlock deeper conversational icebreakers.
            </Text>
          </View>

          {/* Music Section */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Music size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Music & Artists</Text>
            </View>
            <View style={styles.chipsWrap}>
              {mockTasteCatalog.music.map((item) => {
                const isSelected = music.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(music, setMusic, item)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={12} color={colors.textOnDark} style={{ marginLeft: 4 }} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Movies Section */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Film size={18} color={colors.intent.dating} />
              <Text style={styles.sectionTitle}>Movies & Cinema</Text>
            </View>
            <View style={styles.chipsWrap}>
              {mockTasteCatalog.movies.map((item) => {
                const isSelected = movies.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(movies, setMovies, item)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={12} color={colors.textOnDark} style={{ marginLeft: 4 }} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Books Section */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <BookOpen size={18} color={colors.intent.friendship} />
              <Text style={styles.sectionTitle}>Books & Reads</Text>
            </View>
            <View style={styles.chipsWrap}>
              {mockTasteCatalog.books.map((item) => {
                const isSelected = books.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(books, setBooks, item)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={12} color={colors.textOnDark} style={{ marginLeft: 4 }} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Games Section */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Gamepad2 size={18} color={colors.intent.explore} />
              <Text style={styles.sectionTitle}>Games</Text>
            </View>
            <View style={styles.chipsWrap}>
              {mockTasteCatalog.games.map((item) => {
                const isSelected = games.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(games, setGames, item)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={12} color={colors.textOnDark} style={{ marginLeft: 4 }} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Footer CTAs */}
          <View style={styles.footerWrap}>
            <PillButton
              label={totalSelected > 0 ? `Continue (${totalSelected} selected)` : 'Continue'}
              variant="primary"
              size="lg"
              onPress={handleSaveAndContinue}
              style={styles.continueBtn}
            />
            <Pressable onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>I’ll add this later</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrap: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  skipHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipHeaderText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  questionSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  stepIndicator: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  headline: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.hero,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.hero,
  },
  subhead: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.bold,
  },
  footerWrap: {
    marginTop: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
  },
  skipBtn: {
    paddingVertical: spacing.xs,
  },
  skipBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
