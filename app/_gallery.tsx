import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Users,
  Heart,
  MapPin,
  Calendar,
  Shield,
} from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  SwipeToStart,
  Orb,
  CategoryIcon3D,
  TabBar,
  ReasonChip,
  InterestChip,
  IntentPill,
  VerifiedBadge,
  StatCard,
  PersonCard,
  CircleCard,
  EventCard,
  BottomSheet,
  SafetySheet,
  ConnectionPrompt,
  ModerationBanner,
  RadarView,
  OnboardingProgress,
  OTPInput,
  Skeleton,
  EmptyState,
  ErrorState,
  OfflineBanner,
  Toast,
  typography,
  colors,
  spacing,
} from '../src/design-system';
import { mockUsers } from '../src/data/mocks/seedData';

export default function DesignSystemGalleryScreen() {
  const router = useRouter();

  // Component state toggles
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'circles' | 'messages' | 'me'>('home');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [safetySheetOpen, setSafetySheetOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('492');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Photography', 'Coffee']);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const toggleInterest = (name: string) => {
    if (selectedInterests.includes(name)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== name));
    } else {
      setSelectedInterests([...selectedInterests, name]);
    }
  };

  const triggerToast = (type: 'success' | 'error' | 'info') => {
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Design System Gallery</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Typography & Stickers */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>1. Sticker & Display Typography</Text>
            <GlassCard style={styles.cardPadding}>
              <View style={styles.stickerContainer}>
                <Text style={styles.chewySticker}>WE CROSSED PATHS</Text>
              </View>
              <Text style={styles.heroText}>Your Perfect Match Is One Swipe Away</Text>
              <Text style={styles.bodyText}>
                Discover genuine connections, meaningful chats, and exciting opportunities ahead.
              </Text>
            </GlassCard>
          </View>

          {/* Section: 3D Glossy Orb & Category Icons */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>2. 3D Glossy Orb & 3D Category Squircles</Text>
            <GlassCard style={styles.cardPadding}>
              <View style={styles.orbRow}>
                <View style={styles.centerItem}>
                  <Orb size={64} pulse />
                  <Text style={styles.captionText}>Active Pulse Orb (64px)</Text>
                </View>
                <View style={styles.centerItem}>
                  <Orb size={44} pulse={false} />
                  <Text style={styles.captionText}>Static Orb (44px)</Text>
                </View>
              </View>

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Category Squircles (56px SVG Gradient + Specular Bevel)</Text>
              <View style={styles.categoriesRow}>
                <CategoryIcon3D icon={Users} label="All" colorScheme="blue" selected />
                <CategoryIcon3D icon={Sparkles} label="New" colorScheme="purple" />
                <CategoryIcon3D icon={Users} label="Online" colorScheme="green" />
                <CategoryIcon3D icon={Calendar} label="Today" colorScheme="orange" />
                <CategoryIcon3D icon={Heart} label="Favored" colorScheme="red" />
              </View>
            </GlassCard>
          </View>

          {/* Section: SwipeToStart & Pill Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>3. SwipeToStart & Pill Buttons</Text>
            <GlassCard style={styles.cardPadding}>
              <Text style={styles.subHeader}>SwipeToStart (52px with track fill)</Text>
              <SwipeToStart
                label="Get Started"
                onComplete={() => triggerToast('success')}
              />

              <Text style={[styles.subHeader, { marginTop: 18 }]}>PillButton Variants</Text>
              <View style={styles.buttonStack}>
                <PillButton label="Primary (Near Black #0B0F1A)" variant="primary" />
                <PillButton label="Secondary (Frosted Glass)" variant="secondary" />
                <PillButton label="Destructive Action" variant="destructive" />
                <PillButton label="Ghost Button" variant="ghost" />
                <PillButton label="Loading Button" variant="primary" loading />
              </View>
            </GlassCard>
          </View>

          {/* Section: ReasonChips, IntentPills, VerifiedBadge, StatCards */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>4. ReasonChips & Intent Indicators</Text>
            <GlassCard style={styles.cardPadding}>
              <Text style={styles.subHeader}>Reason Chips (No fake % match)</Text>
              <View style={styles.chipsWrap}>
                <ReasonChip label="3 shared interests" highlight />
                <ReasonChip label="Both free Sunday evening" />
                <ReasonChip label="Same photography Circle" />
                <ReasonChip label="Within 3 km" />
              </View>

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Intent Pills (Always Color + Glyph + Label)</Text>
              <View style={styles.chipsWrap}>
                <IntentPill intent="friendship" selected />
                <IntentPill intent="dating" selected />
                <IntentPill intent="community" selected />
                <IntentPill intent="explore" selected />
              </View>

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Stat Cards & Verified Badge</Text>
              <View style={styles.rowCentered}>
                <Text style={styles.bodyBold}>Aisha Rao, 26</Text>
                <VerifiedBadge size={20} />
              </View>
              <View style={styles.statsRow}>
                <StatCard icon={MapPin} value="2 to 5 km" caption="from you" />
                <StatCard icon={Sparkles} value="2 Encounters" caption="with you" />
                <StatCard icon={Calendar} value="Today, 9:47" caption="last crossed" />
              </View>
            </GlassCard>
          </View>

          {/* Section: Selectable Interest Chips & OTP Input */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>5. Interest Chips & OTP Verification</Text>
            <GlassCard style={styles.cardPadding}>
              <Text style={styles.subHeader}>Interactive Interest Chips</Text>
              <View style={styles.chipsWrap}>
                {['Photography', 'Badminton', 'Indie Music', 'Film & Cinema', 'Formula 1', 'Coffee'].map((name) => (
                  <InterestChip
                    key={name}
                    label={name}
                    selected={selectedInterests.includes(name)}
                    onPress={() => toggleInterest(name)}
                  />
                ))}
                <InterestChip label="Disabled Tag" disabled />
              </View>

              <Text style={[styles.subHeader, { marginTop: 16 }]}>6-Digit OTP Input</Text>
              <OTPInput value={otpValue} onChange={setOtpValue} />

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Onboarding Progress Bar</Text>
              <OnboardingProgress currentStep={3} totalSteps={6} />
            </GlassCard>
          </View>

          {/* Section: Radar View */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>6. Radar View (Concentric 2s Pulse Loops)</Text>
            <GlassCard style={styles.cardPadding}>
              <RadarView
                size={280}
                items={[
                  {
                    id: '1',
                    type: 'circle',
                    name: '35mm Film Walk',
                    category: 'Photo',
                    distanceBand: 'Within 2 km',
                    bandIndex: 1,
                    angleDegree: 45,
                    spotsLeftOrMembersText: '3 spots left',
                    zone: 'Indiranagar',
                    coverImage: mockUsers[0].photos[0],
                  },
                  {
                    id: '2',
                    type: 'activity',
                    name: 'F1 Screening',
                    category: 'Motorsport',
                    distanceBand: '2 to 5 km',
                    bandIndex: 2,
                    angleDegree: 210,
                    spotsLeftOrMembersText: '1 spot left',
                    zone: 'Koramangala',
                    coverImage: mockUsers[1].photos[0],
                  },
                ]}
              />
            </GlassCard>
          </View>

          {/* Section: Hero PersonCard */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>7. Concept Hero Person Card</Text>
            <PersonCard
              id="gallery_card"
              name="Aisha"
              age={26}
              occupation="Marketing Manager"
              locationZone="Indiranagar"
              distanceBand="2 to 5 km"
              photoUri={mockUsers[0].photos[0]}
              isNew
              reasonChips={['3 shared interests', 'Both free Sunday evening']}
              interests={['Coffee', 'Photography', 'Indie Music']}
              onConnect={() => triggerToast('success')}
              onLike={() => triggerToast('info')}
              onDismiss={() => triggerToast('error')}
            />
          </View>

          {/* Section: Circle Card, Event Card & Context Card */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>8. Context, Circle & Event Cards</Text>
            <CircleCard
              id="c1"
              title="Indiranagar 35mm Photo Walkers"
              category="Photography"
              locationZone="Indiranagar 100ft Rd"
              memberCount={5}
              maxCapacity={6}
              activityName="Street Photography Walk + Filter Coffee"
              cadence="Every Saturday 7:30 AM"
              hostName="Aisha Rao"
              reasonChips={['3 shared interests', 'Indiranagar zone']}
            />

            <EventCard
              id="e1"
              title="Monza GP Live Watch Party"
              activityType="Formula 1"
              dateStr="Sunday"
              timeStr="6:30 PM"
              venueZone="Koramangala 5th Block"
              capacityState="4 spots left"
              priceBand="₹250 (F&B Cover)"
              hostName="Rohan Mehta"
            />

            <ConnectionPrompt
              sharedContext="Both of you joined Indiranagar 35mm Photo Walkers"
              proposedAction="Propose a coffee meetup before Saturday's walk"
              onAccept={() => triggerToast('success')}
              onDecline={() => triggerToast('info')}
            />

            <ModerationBanner
              type="info"
              title="Community Guidelines Notice"
              message="This Circle is moderated for respectful and safe group activities."
            />
          </View>

          {/* Section: States & Feedback (Skeleton, Empty, Error, Offline, Toast, Sheets) */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>9. System States & Sheets</Text>
            <GlassCard style={styles.cardPadding}>
              <Text style={styles.subHeader}>Skeleton Shimmer Loaders</Text>
              <Skeleton width="100%" height={24} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={16} style={{ marginBottom: 16 }} />

              <Text style={styles.subHeader}>Offline Banner</Text>
              <OfflineBanner />

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Toast Triggers</Text>
              <View style={styles.rowSpaced}>
                <PillButton label="Success Toast" size="sm" onPress={() => triggerToast('success')} />
                <PillButton label="Error Toast" size="sm" variant="destructive" onPress={() => triggerToast('error')} />
              </View>

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Bottom Sheets</Text>
              <View style={styles.rowSpaced}>
                <PillButton
                  label="Open Generic Sheet"
                  variant="secondary"
                  size="sm"
                  onPress={() => setBottomSheetOpen(true)}
                />
                <PillButton
                  label="Open Safety Sheet"
                  variant="secondary"
                  size="sm"
                  icon={<Shield size={14} color={colors.safety} />}
                  onPress={() => setSafetySheetOpen(true)}
                />
              </View>

              <Text style={[styles.subHeader, { marginTop: 16 }]}>Empty & Error States</Text>
              <EmptyState
                title="No active Circles yet"
                description="There are no photography Circles in Indiranagar right now."
                actionLabel="Create a Circle"
                onAction={() => triggerToast('info')}
              />
              <ErrorState
                title="Service Unavailable"
                message="We could not reach the server right now."
                onRetry={() => triggerToast('info')}
              />
            </GlassCard>
          </View>

          {/* Section: TabBar Interactive Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>10. Concept TabBar (5 Items + Raised Center Orb)</Text>
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
          </View>
        </ScrollView>

        {/* Global Sheets & Toast */}
        <BottomSheet visible={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
          <View style={{ padding: 16 }}>
            <Text style={styles.heroText}>BottomSheet Container</Text>
            <Text style={styles.bodyText}>
              Custom 32 top radius, smooth drag handle, and gesture dismissal physics.
            </Text>
            <PillButton
              label="Close Sheet"
              variant="primary"
              onPress={() => setBottomSheetOpen(false)}
              style={{ marginTop: 24 }}
            />
          </View>
        </BottomSheet>

        <SafetySheet
          visible={safetySheetOpen}
          onClose={() => setSafetySheetOpen(false)}
          targetName="Aisha Rao"
          onBlock={() => triggerToast('error')}
          onReport={() => triggerToast('error')}
          onRestrict={() => triggerToast('info')}
        />

        <Toast
          visible={toastVisible}
          type={toastType}
          message={
            toastType === 'success'
              ? 'Action completed successfully!'
              : toastType === 'error'
              ? 'Report received. Target restricted.'
              : 'Preference updated.'
          }
          onDismiss={() => setToastVisible(false)}
        />
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
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.screenTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 60,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  subHeader: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardPadding: {
    padding: spacing.md,
  },
  stickerContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
    transform: [{ rotate: '-5deg' }],
  },
  chewySticker: {
    fontFamily: 'Chewy',
    fontSize: 34,
    color: '#FFFFFF',
    textShadowColor: colors.orbNavy,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  heroText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bodyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  orbRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  centerItem: {
    alignItems: 'center',
  },
  captionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  buttonStack: {
    gap: 8,
    marginTop: spacing.xs,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: spacing.xs,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: 8,
  },
});
