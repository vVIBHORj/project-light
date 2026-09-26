import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import { Event, EventRsvpState } from '../../../domain/types';

interface RsvpStatusCardProps {
  event: Event;
  rsvpStatus: EventRsvpState | 'none';
  waitlistPosition?: number;
  onRsvpPress: () => void;
  onCancelPress: () => void;
  onOpenCheckInPress: () => void;
  onOpenRecapPress: () => void;
  isHost: boolean;
  onCancelEventAsHost?: () => void;
}

export const RsvpStatusCard: React.FC<RsvpStatusCardProps> = ({
  event,
  rsvpStatus,
  waitlistPosition = 1,
  onRsvpPress,
  onCancelPress,
  onOpenCheckInPress,
  onOpenRecapPress,
  isHost,
  onCancelEventAsHost,
}) => {
  const isFull = event.rsvpsCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.rsvpsCount);

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Sync 📅',
      `"${event.title}" on ${event.dateStr} at ${event.timeStr} added to your personal device calendar.`
    );
  };

  // Host view
  if (isHost) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadgeHost}>
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            <Text style={styles.statusBadgeText}>You are Hosting</Text>
          </View>
          <Text style={styles.attendeeCount}>
            {event.rsvpsCount} / {event.capacity} Confirmed
          </Text>
        </View>

        <Text style={styles.subtext}>
          Check-in code for your attendees: <Text style={styles.codeText}>{event.checkInCode || '3582'}</Text>
        </Text>

        <View style={styles.btnRow}>
          <PillButton
            label="Pre-Event Checklist & Venue"
            variant="primary"
            size="md"
            onPress={onOpenCheckInPress}
            style={styles.flexBtn}
          />
          {onCancelEventAsHost && (
            <TouchableOpacity style={styles.cancelHostBtn} onPress={onCancelEventAsHost}>
              <Text style={styles.cancelHostText}>Cancel Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>
    );
  }

  // Checked in view
  if (rsvpStatus === 'checked_in') {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadgeSuccess}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.statusBadgeText}>Checked In</Text>
          </View>
          <TouchableOpacity onPress={handleAddToCalendar}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtext}>
          You’re checked in for this session. Enjoy the meetup and connect with fellow circle members!
        </Text>

        <PillButton
          label="Leave Feedback & Recap"
          variant="primary"
          size="md"
          onPress={onOpenRecapPress}
        />
      </GlassCard>
    );
  }

  // Confirmed Going view
  if (rsvpStatus === 'going') {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadgeSuccess}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.statusBadgeText}>{"You're Going! 🎉"}</Text>
          </View>
          <TouchableOpacity onPress={handleAddToCalendar} style={styles.calBtn}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.calText}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtext}>
          Exact address and pre-event safety checklist are now unlocked.
        </Text>

        <View style={styles.actionRow}>
          <PillButton
            label="Pre-Event Safety & Check-In"
            variant="primary"
            size="md"
            onPress={onOpenCheckInPress}
            style={styles.flexBtn}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancelPress}>
            <Text style={styles.cancelBtnText}>Cancel RSVP</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  }

  // Waitlisted view
  if (rsvpStatus === 'waitlist') {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadgeWaitlist}>
            <Ionicons name="time" size={14} color="#FFFFFF" />
            <Text style={styles.statusBadgeText}>
              On Waitlist (#{waitlistPosition})
            </Text>
          </View>
          <Text style={styles.subtextMuted}>Event is full</Text>
        </View>

        <Text style={styles.subtext}>
          You will automatically be promoted to Going if a confirmed member cancels.
        </Text>

        <PillButton
          label="Leave Waitlist"
          variant="secondary"
          size="md"
          onPress={onCancelPress}
        />
      </GlassCard>
    );
  }

  // Default: Not RSVP'd view
  return (
    <View style={styles.floatingBar}>
      <View style={styles.floatingInfo}>
        <Text style={styles.priceLabel}>{event.priceBand}</Text>
        <Text style={styles.spotsLabel}>
          {isFull
            ? `Full • Waitlist (${event.waitlistCount || 0})`
            : `${spotsLeft} spots available`}
        </Text>
      </View>

      <PillButton
        label={isFull ? 'Join Waitlist' : 'RSVP for Event'}
        variant="primary"
        size="md"
        onPress={onRsvpPress}
        style={styles.rsvpBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.card,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadgeHost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#27AE60',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeWaitlist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2B93B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  attendeeCount: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  subtext: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  subtextMuted: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
  codeText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  calBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  calText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  flexBtn: {
    flex: 1,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.destructive,
    fontWeight: typography.fontWeight.semibold,
  },
  cancelHostBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  cancelHostText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.destructive,
    fontWeight: typography.fontWeight.semibold,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    ...shadows.card,
  },
  floatingInfo: {
    flex: 1,
  },
  priceLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  spotsLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rsvpBtn: {
    minWidth: 140,
  },
});
