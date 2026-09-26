import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { Avatar } from '../../../design-system/components/Avatar';
import { VerifiedBadge } from '../../../design-system/components/VerifiedBadge';
import { UserProfile } from '../../../domain/types';
import { useEventStore } from '../state/useEventStore';
import { RsvpStatusCard } from './RsvpStatusCard';
import { PreEventSafetyCheckinModal } from './PreEventSafetyCheckinModal';
import { PostEventRecapModal } from './PostEventRecapModal';

interface EventDetailViewProps {
  eventId: string;
  currentUser: UserProfile;
  onBack: () => void;
  onNavigateToCircle?: (circleId: string) => void;
  onConnectWithAttendee?: (userId: string, name: string) => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  eventId,
  currentUser,
  onBack,
  onNavigateToCircle,
  onConnectWithAttendee,
}) => {
  const {
    selectedEvent,
    attendees,
    isLoadingAttendees,
    myRsvpStatus,
    isPreEventSafetyOpen,
    isPostEventRecapOpen,
    openEventDetail,
    rsvpEvent,
    cancelRsvp,
    cancelEventAsHost,
    setPreEventSafetyOpen,
    setPostEventRecapOpen,
  } = useEventStore();

  useEffect(() => {
    openEventDetail(eventId, currentUser.userId);
  }, [openEventDetail, eventId, currentUser.userId]);

  if (!selectedEvent || isLoadingAttendees) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  const isHost = selectedEvent.hostId === currentUser.userId;
  const isFull = selectedEvent.rsvpsCount >= selectedEvent.capacity;
  const spotsLeft = Math.max(0, selectedEvent.capacity - selectedEvent.rsvpsCount);

  const confirmedAttendees = attendees.filter(
    (a) => a.status === 'going' || a.status === 'checked_in'
  );
  const waitlistedAttendees = attendees.filter((a) => a.status === 'waitlist');
  const myWaitlistIndex = waitlistedAttendees.findIndex(
    (a) => a.userId === currentUser.userId
  );

  const handleRsvp = async () => {
    const success = await rsvpEvent(currentUser);
    if (success) {
      if (isFull) {
        Alert.alert(
          'Added to Waitlist ⏳',
          'You are on the waitlist. You will be automatically promoted if a spot opens up.'
        );
      } else {
        Alert.alert(
          'RSVP Confirmed! 🎉',
          'You are going! Venue address and safety checklist are now unlocked.'
        );
      }
    }
  };

  const handleCancelRsvp = () => {
    Alert.alert(
      'Cancel RSVP?',
      'Are you sure you want to cancel? Your spot will be offered to the first person on the waitlist.',
      [
        { text: 'Keep RSVP', style: 'cancel' },
        {
          text: 'Cancel Spot',
          style: 'destructive',
          onPress: () => cancelRsvp(currentUser.userId),
        },
      ]
    );
  };

  const handleCancelEventHost = () => {
    Alert.alert(
      'Cancel Session?',
      'This will cancel the event and notify all confirmed attendees.',
      [
        { text: 'Keep Session', style: 'cancel' },
        {
          text: 'Cancel Event',
          style: 'destructive',
          onPress: () =>
            cancelEventAsHost(selectedEvent.id, currentUser.userId, 'Host cancelled'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image & Glass Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri:
                selectedEvent.coverImage ||
                'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.heroImage}
          />

          {/* Floating Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Floating Top Chips */}
          <View style={styles.heroOverlayBottom}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{selectedEvent.activityType}</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{selectedEvent.priceBand}</Text>
            </View>
            <View
              style={[
                styles.heroPill,
                isFull ? styles.heroPillFull : styles.heroPillSpots,
              ]}
            >
              <Text style={styles.heroPillText}>
                {isFull
                  ? `Waitlist (${selectedEvent.waitlistCount || 0})`
                  : `${spotsLeft} spots left`}
              </Text>
            </View>
          </View>
        </View>

        {/* Title & Key Metas */}
        <View style={styles.bodySection}>
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>

          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.metaText}>
                {selectedEvent.dateStr} • {selectedEvent.timeStr}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.metaText}>
                {selectedEvent.venueCategory} in {selectedEvent.venueZone}
              </Text>
            </View>

            {selectedEvent.circleTitle && (
              <TouchableOpacity
                style={styles.circleLinkRow}
                onPress={() => {
                  if (selectedEvent.circleId && onNavigateToCircle) {
                    onNavigateToCircle(selectedEvent.circleId);
                  }
                }}
              >
                <Ionicons name="people" size={16} color={colors.primary} />
                <Text style={styles.circleLinkText}>
                  Part of {selectedEvent.circleTitle}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Host Card */}
          <Text style={styles.sectionHeader}>Host</Text>
          <GlassCard style={styles.hostCard}>
            <Avatar
              uri={selectedEvent.hostAvatar}
              name={selectedEvent.hostName}
              size={48}
              verified={selectedEvent.isHostVerified}
            />
            <View style={styles.hostCardInfo}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostCardName}>{selectedEvent.hostName}</Text>
                {selectedEvent.isHostVerified && <VerifiedBadge size={14} />}
              </View>
              <Text style={styles.hostRoleText}>Circle Host • Bengaluru</Text>
            </View>
          </GlassCard>

          {/* What to Expect / Description */}
          <Text style={styles.sectionHeader}>What to Expect</Text>
          <Text style={styles.descriptionText}>
            {selectedEvent.description ||
              'Join fellow circle members for a focused, small-group real-world session. Bring your enthusiasm and curiosity!'}
          </Text>

          {/* Who's Going (Avatars only, no follower counts) (EVENT-03) */}
          <View style={styles.attendeesHeaderRow}>
            <Text style={styles.sectionHeader}>
              {"Who's Going"} ({confirmedAttendees.length} / {selectedEvent.capacity})
            </Text>
            {waitlistedAttendees.length > 0 && (
              <Text style={styles.waitlistCountText}>
                +{waitlistedAttendees.length} on waitlist
              </Text>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarRow}>
            {confirmedAttendees.map((att) => (
              <TouchableOpacity
                key={att.userId}
                style={styles.attendeeAvatarItem}
                onPress={() => {
                  if (onConnectWithAttendee && att.userId !== currentUser.userId) {
                    onConnectWithAttendee(att.userId, att.userName);
                  }
                }}
              >
                <Avatar
                  uri={att.userAvatar}
                  name={att.userName}
                  size={48}
                  verified={att.isVerified}
                />
                <Text style={styles.attendeeFirstName} numberOfLines={1}>
                  {att.userName.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Neighborhood Map Zone Preview (EVENT-03) */}
          <Text style={styles.sectionHeader}>Location Preview</Text>
          <GlassCard style={styles.mapCard}>
            <View style={styles.mapHeaderRow}>
              <Ionicons name="map-outline" size={18} color={colors.primary} />
              <Text style={styles.mapZoneTitle}>
                {selectedEvent.venueZone} Neighborhood Area
              </Text>
            </View>

            <View style={styles.zoneRingPreview}>
              <Ionicons name="radio-outline" size={48} color={colors.primary} />
              <Text style={styles.zoneRingText}>
                {selectedEvent.venueCategory}
              </Text>
            </View>

            <Text style={styles.mapPrivacyNote}>
              🔒 Exact meeting landmark is private and unlocked for confirmed attendees.
            </Text>
          </GlassCard>

          {/* House Rules & Safety Notes */}
          {selectedEvent.houseRules && selectedEvent.houseRules.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>House Rules</Text>
              <View style={styles.rulesCard}>
                {selectedEvent.houseRules.map((rule, idx) => (
                  <View key={`rule_${idx}`} style={styles.ruleItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Safety & Emergency Helper */}
          <Text style={styles.sectionHeader}>Safety Protections</Text>
          <View style={styles.safetyCard}>
            <View style={styles.safetyRow}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
              <Text style={styles.safetyText}>
                Public space gathering with in-app check-in and emergency contacts.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom RSVP Status Card / CTA Bar */}
      <RsvpStatusCard
        event={selectedEvent}
        rsvpStatus={myRsvpStatus}
        waitlistPosition={myWaitlistIndex !== -1 ? myWaitlistIndex + 1 : 1}
        onRsvpPress={handleRsvp}
        onCancelPress={handleCancelRsvp}
        onOpenCheckInPress={() => setPreEventSafetyOpen(true)}
        onOpenRecapPress={() => setPostEventRecapOpen(true)}
        isHost={isHost}
        onCancelEventAsHost={handleCancelEventHost}
      />

      {/* Pre-Event Safety & Checkin Modal */}
      <PreEventSafetyCheckinModal
        visible={isPreEventSafetyOpen}
        event={selectedEvent}
        currentUser={currentUser}
        onClose={() => setPreEventSafetyOpen(false)}
        isCheckedIn={myRsvpStatus === 'checked_in'}
      />

      {/* Post-Event Feedback & Recap Modal */}
      <PostEventRecapModal
        visible={isPostEventRecapOpen}
        event={selectedEvent}
        attendees={attendees}
        currentUser={currentUser}
        onClose={() => setPostEventRecapOpen(false)}
        onConnectWithAttendee={(att) => {
          if (onConnectWithAttendee) {
            onConnectWithAttendee(att.userId, att.userName);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroContainer: {
    position: 'relative',
    height: 240,
    width: '100%',
    backgroundColor: '#CBD5E1',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlayBottom: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heroPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  heroPillSpots: {
    backgroundColor: 'rgba(47, 128, 237, 0.95)',
  },
  heroPillFull: {
    backgroundColor: 'rgba(235, 87, 87, 0.95)',
  },
  heroPillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  bodySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  eventTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.screenTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  metaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  circleLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    padding: spacing.xs,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  circleLinkText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: spacing.xs,
  },
  hostCardInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostCardName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  hostRoleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  attendeesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waitlistCountText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
  avatarRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  attendeeAvatarItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 54,
  },
  attendeeFirstName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  mapCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: spacing.md,
    borderRadius: radii.card,
    marginVertical: spacing.xs,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  mapZoneTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  zoneRingPreview: {
    height: 100,
    borderRadius: radii.card,
    backgroundColor: 'rgba(47, 128, 237, 0.06)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  zoneRingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  mapPrivacyNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  rulesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  ruleText: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  safetyCard: {
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    padding: spacing.md,
    borderRadius: radii.card,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  safetyText: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
  },
});
