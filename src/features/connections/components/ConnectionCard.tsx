import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sparkles } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { Avatar } from '../../../design-system/components/Avatar';
import { VerifiedBadge } from '../../../design-system/components/VerifiedBadge';
import { ReasonChip } from '../../../design-system/components/ReasonChip';
import { ConnectionItem } from '../../../data/repositories';

interface ConnectionCardProps {
  connection: ConnectionItem;
  currentUserId: string;
  onPress?: () => void;
  onMessage?: () => void;
  onRespond?: () => void;
  onInviteCircle?: () => void;
  onMarkFriend?: () => void;
  onDatingOptIn?: () => void;
  onRemove?: () => void;
  onJoinActivity?: (activityTitle: string) => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  currentUserId,
  onPress,
  onMessage,
  onRespond,
  onInviteCircle,
  onMarkFriend,
  onDatingOptIn,
  onRemove,
  onJoinActivity,
}) => {
  const isPending = connection.state === 'pending';
  const isRecipient = connection.recipientId === currentUserId;
  const isFriend = connection.stage === 'FRIEND';
  const isDating = connection.stage === 'DATING';
  const otherUser = connection.otherUser;

  const getStageBadgeText = () => {
    if (isPending) return '⏳ Pending Request';
    switch (connection.stage) {
      case 'FRIEND':
        return '🤝 Friend';
      case 'ACTIVITY_PARTNER':
        return '⚡ Activity Partner';
      case 'DATING':
        return '💫 Dating';
      case 'MUTUAL_CONNECTION':
        return '🌱 Connected';
      default:
        return '💬 Connected';
    }
  };

  const getStageBadgeColor = () => {
    if (isPending) return colors.textMuted;
    switch (connection.stage) {
      case 'FRIEND':
        return colors.primary;
      case 'ACTIVITY_PARTNER':
        return colors.intent.explore;
      case 'DATING':
        return colors.intent.dating;
      case 'MUTUAL_CONNECTION':
        return colors.safety;
      default:
        return colors.primary;
    }
  };

  const cardContent = (
    <GlassCard style={styles.card}>
      {/* Top row: Avatar, Name, Stage Badge */}
      <View style={styles.headerRow}>
        <Avatar
          uri={otherUser.photos?.[0]}
          name={otherUser.displayName}
          size={48}
        />
        <View style={styles.titleInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser.displayName}
            </Text>
            {otherUser.isVerified && <VerifiedBadge size={14} />}
          </View>
          <View style={styles.chipRow}>
            <ReasonChip
              label={connection.sharedContextDescription}
              icon={Sparkles}
            />
          </View>
        </View>

        <View
          style={[
            styles.stageBadge,
            { borderColor: getStageBadgeColor(), backgroundColor: `${getStageBadgeColor()}12` },
          ]}
        >
          <Text style={[styles.stageBadgeText, { color: getStageBadgeColor() }]}>
            {getStageBadgeText()}
          </Text>
        </View>
      </View>

      {/* Note if pending */}
      {isPending && connection.note ? (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText} numberOfLines={2}>
            &ldquo;{connection.note}&rdquo;
          </Text>
        </View>
      ) : null}

      {/* Suggested next shared activity (CONN-04) */}
      {connection.suggestedActivity && !isPending ? (
        <View style={styles.activityBox}>
          <View style={styles.activityIcon}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityLabel}>Suggested Next Step</Text>
            <Text style={styles.activityTitle} numberOfLines={1}>
              {connection.suggestedActivity}
            </Text>
          </View>
          {onJoinActivity && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => onJoinActivity(connection.suggestedActivity!)}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        {isPending ? (
          isRecipient ? (
            <TouchableOpacity style={styles.respondButton} onPress={onRespond}>
              <Text style={styles.respondButtonText}>Respond to Request</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>Request Sent • Waiting for response</Text>
            </View>
          )
        ) : (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={onMessage}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>

            {!isFriend && onMarkFriend && (
              <TouchableOpacity style={styles.actionBtn} onPress={onMarkFriend}>
                <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.actionBtnSecondaryText}>Mark Friend</Text>
              </TouchableOpacity>
            )}

            {onInviteCircle && (
              <TouchableOpacity style={styles.actionBtn} onPress={onInviteCircle}>
                <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.actionBtnSecondaryText}>Invite Circle</Text>
              </TouchableOpacity>
            )}

            {!isDating && onDatingOptIn && (
              <TouchableOpacity style={styles.actionBtn} onPress={onDatingOptIn}>
                <Ionicons name="sparkles-outline" size={16} color={colors.intent.dating} />
                <Text style={[styles.actionBtnSecondaryText, { color: colors.intent.dating }]}>Dating</Text>
              </TouchableOpacity>
            )}

            {onRemove && (
              <TouchableOpacity style={styles.moreBtn} onPress={onRemove}>
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </GlassCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.card,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
  },
  stageBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  stageBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  noteContainer: {
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  noteText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  activityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.bold,
  },
  activityTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  joinButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
  },
  actionBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  actionBtnSecondaryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  moreBtn: {
    padding: spacing.xs,
    marginLeft: 'auto',
  },
  respondButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  respondButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  waitingBadge: {
    paddingVertical: spacing.xs,
  },
  waitingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
