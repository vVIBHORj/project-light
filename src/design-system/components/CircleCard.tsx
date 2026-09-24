import React from 'react';
import { StyleSheet, View, Text, ViewStyle, Pressable } from 'react-native';
import { Users, Calendar, MapPin } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../tokens';
import { GlassCard } from './GlassCard';
import { ReasonChip } from './ReasonChip';

export interface CircleCardProps {
  id: string;
  title: string;
  category: string;
  locationZone: string;
  memberCount: number;
  maxCapacity?: number;
  activityName: string;
  cadence?: string;
  hostName?: string;
  reasonChips?: string[];
  onPress?: () => void;
  style?: ViewStyle;
}

export const CircleCard: React.FC<CircleCardProps> = ({
  title,
  category,
  locationZone,
  memberCount,
  maxCapacity = 8,
  activityName,
  cadence = 'Weekly meetups',
  hostName,
  reasonChips = [],
  onPress,
  style,
}) => {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={[styles.card, style]}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          <View style={styles.capacityBadge}>
            <Users size={12} color={colors.textSecondary} />
            <Text style={styles.capacityText}>
              {memberCount}/{maxCapacity}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.activityText}>Activity: {activityName}</Text>

        {reasonChips.length > 0 && (
          <View style={styles.chipsRow}>
            {reasonChips.slice(0, 3).map((chip, idx) => (
              <ReasonChip key={idx} label={chip} />
            ))}
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.metaItem}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{locationZone}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{cadence}</Text>
          </View>
          {hostName && (
            <Text style={styles.hostText}>Host: {hostName}</Text>
          )}
        </View>
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
  categoryBadge: {
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  categoryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  capacityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 17,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  activityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  hostText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
});

export default CircleCard;
