import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  MapPin,
  Users as UsersIcon,
  Sparkles,
  Calendar,
  Sun,
  Bookmark,
  MessageCircle,
  Heart,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GradientBackground,
  Avatar,
  GlassCard,
  GlassIconButton,
  CategoryIcon3D,
  CircleCard,
  ContextCard,
  ReasonChip,
  PillButton,
  EmptyState,
  VerifiedBadge,
  Toast,
  typography,
  colors,
  spacing,
  radii,
  shadows,
} from '../../src/design-system';
import { mockUsers, mockCircles } from '../../src/data/mocks/seedData';
import { useSessionStore } from '../../src/state/useSessionStore';
import { analytics } from '../../src/lib/analytics';
import { Circle, UserProfile } from '../../src/domain/types';

type CategoryFilter = 'all' | 'new' | 'this_week' | 'today' | 'saved';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useSessionStore();

  const currentUser: UserProfile = profile || mockUsers[0];

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [dismissedHero, setDismissedHero] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    analytics.track('home_viewed', {
      state: 'authenticated',
      local_density_bucket: 'high',
    });
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setToastMessage('Neighborhood updated');
    }, 600);
  }, []);

  const toggleSaveCircle = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
      setToastMessage('Removed from Saved');
    } else {
      setSavedIds([...savedIds, id]);
      setToastMessage('Saved to your Circles list');
    }
  };

  // Hero Card item
  const heroCircle: Circle = mockCircles[0];

  // Filtered circles
  const filteredCircles = mockCircles.filter((circle) => {
    if (selectedCategory === 'saved') return savedIds.includes(circle.id);
    if (selectedCategory === 'new') return circle.id === 'circle_1' || circle.id === 'circle_3';
    if (selectedCategory === 'today') return circle.id === 'circle_2';
    if (selectedCategory === 'this_week') return circle.cadence.toLowerCase().includes('saturday') || circle.cadence.toLowerCase().includes('sunday');
    return true; // 'all'
  });

  // Suggested contextual items (bounded to max 2)
  const suggestedCircles = mockCircles.slice(1, 3);

  // Determine state-driven Next Action card
  const getNextActionConfig = () => {
    if (currentUser.completionPercentage < 90) {
      return {
        title: 'Complete your taste fingerprint',
        sub: 'Add favorite music and books to unlock richer Circle matching.',
        actionText: 'Update Profile',
        onPress: () => router.push('/(onboarding)/taste'),
        icon: <Sparkles size={16} color={colors.primary} />,
      };
    }
    return {
      title: 'Post-Event Follow-up Ready',
      sub: 'Review attendees from Saturday’s Indiranagar Photo Walk.',
      actionText: 'Review Attendees',
      onPress: () => router.push('/event/followup'),
      icon: <CheckCircle2 size={16} color={colors.intent.friendship} />,
    };
  };

  const nextAction = getNextActionConfig();

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Header Bar on Sky-Cyan Gradient */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.push('/(tabs)/me')}
              style={styles.headerLeft}
              accessibilityRole="button"
              accessibilityLabel="View profile"
            >
              <Avatar
                uri={currentUser.photos[0]}
                name={currentUser.displayName}
                size={44}
                verified={currentUser.isVerified}
              />
              <View style={styles.headerTitleContainer}>
                <Text style={styles.greetingText}>{getTimeGreeting()}</Text>
                <Text style={styles.userNameText}>{currentUser.displayName}</Text>
              </View>
            </Pressable>

            <View style={styles.headerRight}>
              {/* Around you glass pill -> Opens Discover radar view */}
              <Pressable
                onPress={() => router.push('/(tabs)/discover')}
                style={styles.aroundYouPill}
                accessibilityRole="button"
                accessibilityLabel="Discover around you"
              >
                <MapPin size={14} color={colors.textPrimary} strokeWidth={2.2} />
                <Text style={styles.aroundYouText}>Around you</Text>
              </Pressable>

              {/* Notification Bell Button */}
              <View style={styles.bellWrap}>
                <GlassIconButton
                  icon={<Bell size={18} color={colors.textPrimary} strokeWidth={2.2} />}
                  size={42}
                  onPress={() => router.push('/notifications')}
                  accessibilityLabel="Notifications"
                />
                <View style={styles.notifDot} />
              </View>
            </View>
          </View>

          {/* 5 Category Squircles (Concept Layout) */}
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <CategoryIcon3D
                icon={UsersIcon}
                label="All"
                colorScheme="blue"
                selected={selectedCategory === 'all'}
                onPress={() => setSelectedCategory('all')}
              />
              <CategoryIcon3D
                icon={Sparkles}
                label="New"
                colorScheme="purple"
                selected={selectedCategory === 'new'}
                onPress={() => setSelectedCategory('new')}
              />
              <CategoryIcon3D
                icon={Calendar}
                label="This week"
                colorScheme="green"
                selected={selectedCategory === 'this_week'}
                onPress={() => setSelectedCategory('this_week')}
              />
              <CategoryIcon3D
                icon={Sun}
                label="Today"
                colorScheme="orange"
                selected={selectedCategory === 'today'}
                onPress={() => setSelectedCategory('today')}
              />
              <CategoryIcon3D
                icon={Bookmark}
                label="Saved"
                colorScheme="red"
                selected={selectedCategory === 'saved'}
                onPress={() => setSelectedCategory('saved')}
              />
            </ScrollView>
          </View>

          {/* Concept Recreation: "Next up" Hero Card (28 radius, photo overlay, vertical side actions) */}
          {!dismissedHero && selectedCategory !== 'saved' && (
            <View style={styles.heroSection}>
              <Pressable
                onPress={() => router.push(`/circle/${heroCircle.id}`)}
                style={[styles.heroCard, shadows.card]}
              >
                {/* Background Image with Blue-tinted Gradient Overlay */}
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={[
                    'rgba(74, 144, 226, 0.1)',
                    'rgba(74, 144, 226, 0.45)',
                    'rgba(11, 15, 26, 0.88)',
                  ]}
                  locations={[0, 0.4, 0.9]}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Optional Translucent Background Typography: "SEE YOU THERE" */}
                <View style={styles.ghostTextContainer} pointerEvents="none">
                  <Text style={styles.ghostText}>SEE YOU THERE</Text>
                </View>

                {/* Top Row: Left "New" chip + Right glass ReasonChip */}
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>Starts in 2 days</Text>
                  </View>
                  <ReasonChip label="3 shared interests" highlight />
                </View>

                {/* Right Edge: Vertical Stack of Circular Glass Action Buttons */}
                <View style={styles.heroSideActions}>
                  <GlassIconButton
                    icon={<MessageCircle size={18} color="#FFFFFF" strokeWidth={2.2} />}
                    size={40}
                    onPress={() => router.push(`/circle/${heroCircle.id}`)}
                    accessibilityLabel="Circle Chat"
                    style={styles.sideBtn}
                  />
                  <GlassIconButton
                    icon={<Heart size={18} color={savedIds.includes(heroCircle.id) ? colors.destructive : '#FFFFFF'} strokeWidth={2.2} />}
                    size={40}
                    onPress={() => toggleSaveCircle(heroCircle.id)}
                    accessibilityLabel="Save Circle"
                    style={styles.sideBtn}
                  />
                  <GlassIconButton
                    icon={<X size={18} color="#FFFFFF" strokeWidth={2.2} />}
                    size={40}
                    onPress={() => setDismissedHero(true)}
                    accessibilityLabel="Dismiss recommendation"
                    style={styles.sideBtn}
                  />
                </View>

                {/* Bottom-Left Details Area */}
                <View style={styles.heroBottomContent}>
                  <Text style={styles.heroTitle}>{heroCircle.title}</Text>
                  <View style={styles.heroHostRow}>
                    <Text style={styles.heroHostText}>Hosted by {heroCircle.hostName}</Text>
                    <VerifiedBadge size={14} />
                    <Text style={styles.heroZoneText}>• {heroCircle.locationZone}</Text>
                  </View>

                  {/* 3 Glass Pill Tags */}
                  <View style={styles.heroPillRow}>
                    <View style={styles.heroPill}>
                      <Text style={styles.heroPillText}>📷 {heroCircle.activityName}</Text>
                    </View>
                    <View style={styles.heroPill}>
                      <Text style={styles.heroPillText}>⏰ {heroCircle.cadence}</Text>
                    </View>
                    <View style={styles.heroPill}>
                      <Text style={styles.heroPillText}>👥 {heroCircle.currentMemberCount}/{heroCircle.capacity} spots</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {/* Section: Your Circles (Horizontal Scroll, bounded) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Circles</Text>
            <Pressable onPress={() => router.push('/(tabs)/circles')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          {filteredCircles.length > 0 ? (
            <View style={styles.circlesList}>
              {filteredCircles.map((circle) => (
                <CircleCard
                  key={circle.id}
                  id={circle.id}
                  title={circle.title}
                  category={circle.category}
                  locationZone={circle.locationZone}
                  memberCount={circle.currentMemberCount}
                  activityName={circle.activityName}
                  cadence={circle.cadence}
                  hostName={circle.hostName}
                  reasonChips={circle.reasonChips}
                  onPress={() => router.push(`/circle/${circle.id}`)}
                />
              ))}
            </View>
          ) : (
            /* Low-density / Empty State (Blueprint Section 18) */
            <EmptyState
              title="No nearby Circles match this filter"
              description="Try expanding your discovery radius or check community groups in neighboring zones."
              actionLabel="Explore Communities"
              onAction={() => router.push('/(tabs)/discover')}
            />
          )}

          {/* Section: Suggested for You (ContextCards with concrete "why this" reason lines) */}
          {selectedCategory === 'all' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suggested for You</Text>
              </View>

              {suggestedCircles.map((circle) => (
                <ContextCard
                  key={`sug-${circle.id}`}
                  title={circle.title}
                  category={circle.category}
                  hostSignal={circle.hostName}
                  locationZone={circle.locationZone}
                  memberCount={circle.currentMemberCount}
                  timeInfo={circle.cadence}
                  reasonChips={circle.reasonChips}
                  actionLabel="View Circle Hub"
                  onActionPress={() => router.push(`/circle/${circle.id}`)}
                />
              ))}
            </>
          )}

          {/* Section: Next Action Card (State-Driven) */}
          <GlassCard style={styles.nextActionCard}>
            <View style={styles.nextActionRow}>
              <View style={styles.nextActionIconBox}>{nextAction.icon}</View>
              <View style={styles.nextActionInfo}>
                <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
                <Text style={styles.nextActionSub}>{nextAction.sub}</Text>
              </View>
            </View>
            <PillButton
              label={nextAction.actionText}
              variant="primary"
              size="sm"
              icon={<ArrowRight size={14} color={colors.textOnDark} />}
              onPress={nextAction.onPress}
              style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}
            />
          </GlassCard>

          {/* Safety Transparency Banner */}
          <View style={styles.safetyFooter}>
            <ShieldCheck size={14} color={colors.safety} />
            <Text style={styles.safetyFooterText}>
              Project LIGHT verifies adult identity. Exact GPS coordinates are never broadcast.
            </Text>
          </View>
        </ScrollView>

        <Toast
          visible={Boolean(toastMessage)}
          message={toastMessage || ''}
          type="info"
          onDismiss={() => setToastMessage(null)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 100, // accommodate bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    marginLeft: spacing.xs,
  },
  greetingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  userNameText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aroundYouPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    gap: 4,
    ...shadows.chip,
  },
  aroundYouText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  bellWrap: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: radii.full,
    backgroundColor: colors.destructive,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  categoriesSection: {
    marginVertical: spacing.xs,
  },
  categoriesScroll: {
    paddingVertical: 6,
    gap: 12,
  },
  heroSection: {
    marginVertical: spacing.sm,
  },
  heroCard: {
    height: 400,
    borderRadius: radii.card,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  ghostTextContainer: {
    position: 'absolute',
    top: 80,
    left: 10,
    right: 10,
    alignItems: 'center',
    opacity: 0.15,
  },
  ghostText: {
    fontFamily: typography.fontFamily.display,
    fontSize: 48,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  heroBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  heroSideActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 120,
    zIndex: 4,
    alignItems: 'center',
    gap: 8,
  },
  sideBtn: {
    marginBottom: 2,
  },
  heroBottomContent: {
    zIndex: 3,
    paddingRight: 50,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroHostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  heroHostText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: '#BAE6FD',
  },
  heroZoneText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  heroPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroPillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  circlesList: {
    gap: spacing.xs,
  },
  nextActionCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextActionIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: '#DDEBFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextActionInfo: {
    flex: 1,
  },
  nextActionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  nextActionSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  safetyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  safetyFooterText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
