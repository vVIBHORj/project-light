import React from 'react';
import { StyleSheet, View, Text, ViewStyle, Pressable } from 'react-native';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../tokens';
import { GlassCard } from './GlassCard';

export interface EventCardProps {
  id: string;
  title: string;
  activityType: string;
  dateStr: string;
  timeStr: string;
  venueZone: string;
  capacityState: string; // e.g. "4 spots left" or "Full"
  priceBand?: string; // e.g. "Free" or "₹200 (venue cost)"
  hostName?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  activityType,
  dateStr,
  timeStr,
  venueZone,
  capacityState,
  priceBand = 'Free',
  hostName,
  onPress,
  style,
}) => {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={[styles.card, style]}>
        <View style={styles.topRow}>
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>{activityType}</Text>
          </View>
          <View style={styles.priceBadge}>
            <Ticket size={11} color={colors.primary} />
            <Text style={styles.priceText}>{priceBand}</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Calendar size={13} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {dateStr} • {timeStr}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={13} color={colors.textSecondary} />
            <Text style={styles.detailText}>{venueZone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Users size={13} color={colors.textSecondary} />
            <Text style={styles.detailText}>{capacityState}</Text>
          </View>
        </View>

        {hostName && (
          <Text style={styles.hostText}>Hosted by {hostName}</Text>
        )}
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activityBadge: {
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  activityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  priceText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginLeft: 3,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 17,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailsGrid: {
    marginVertical: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  hostText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
});

export default EventCard;
