import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { MapPin, Users, Clock } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../tokens';
import { GlassCard } from './GlassCard';
import { ReasonChip } from './ReasonChip';
import { PillButton } from './PillButton';

export interface ContextCardProps {
  title: string;
  category?: string;
  reasonChips: string[];
  locationZone: string;
  memberCount?: number;
  timeInfo?: string;
  hostSignal?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const ContextCard: React.FC<ContextCardProps> = ({
  title,
  category,
  reasonChips,
  locationZone,
  memberCount,
  timeInfo,
  hostSignal,
  actionLabel = 'Join Circle',
  onActionPress,
  style,
}) => {
  return (
    <GlassCard style={[styles.card, style]}>
      <View style={styles.header}>
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}
        {hostSignal && (
          <Text style={styles.hostSignal}>Hosted by {hostSignal}</Text>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      {/* 2 to 4 Reason Chips */}
      <View style={styles.chipsRow}>
        {reasonChips.slice(0, 4).map((chip, idx) => (
          <ReasonChip key={idx} label={chip} />
        ))}
      </View>

      {/* Meta context: Zone, group size, timing */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={13} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.metaText}>{locationZone}</Text>
        </View>

        {memberCount !== undefined && (
          <View style={styles.metaItem}>
            <Users size={13} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={styles.metaText}>{memberCount} members</Text>
          </View>
        )}

        {timeInfo && (
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={styles.metaText}>{timeInfo}</Text>
          </View>
        )}
      </View>

      {/* Primary CTA */}
      <PillButton
        label={actionLabel}
        onPress={onActionPress}
        size="sm"
        variant="primary"
        style={styles.actionBtn}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
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
  hostSignal: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  actionBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});

export default ContextCard;
