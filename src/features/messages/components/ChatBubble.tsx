import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { Avatar } from '../../../design-system/components/Avatar';
import { Message } from '../../../domain/types';

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showSenderName?: boolean;
  onLongPress?: (msg: Message) => void;
  onRetry?: (msgId: string) => void;
  onActionPress?: (actionType: string, payload?: import('../../../domain/types').SystemCardPayload) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isCurrentUser,
  showSenderName = false,
  onLongPress,
  onRetry,
  onActionPress,
}) => {
  const isImage = message.type === 'image' && message.mediaUri;
  const isSystemCard = message.type === 'system_card' && message.systemCardPayload;
  const isUnsafeMedia = message.mediaModerationState === 'flagged' || message.mediaModerationState === 'unsafe';

  // Format time (e.g. 10:24 AM)
  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // 1. System announcement card rendering (MSG-03)
  if (isSystemCard && message.systemCardPayload) {
    const payload = message.systemCardPayload;
    return (
      <View style={styles.systemCardWrapper}>
        <View style={styles.systemCard}>
          <View style={styles.systemCardHeader}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.systemCardLabel}>CIRCLE EVENT</Text>
          </View>
          <Text style={styles.systemCardTitle}>{payload.title}</Text>
          {payload.subtitle && <Text style={styles.systemCardSubtitle}>{payload.subtitle}</Text>}
          {payload.actionLabel && (
            <TouchableOpacity
              style={styles.systemCardBtn}
              onPress={() => onActionPress && onActionPress(payload.actionType || 'rsvp_event', payload)}
            >
              <Text style={styles.systemCardBtnText}>{payload.actionLabel}</Text>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.rowContainer, isCurrentUser ? styles.rowRight : styles.rowLeft]}>
      {/* Sender Avatar for incoming group messages */}
      {!isCurrentUser && showSenderName && (
        <View style={styles.avatarCol}>
          <Avatar
            uri={message.senderAvatar}
            name={message.senderName}
            size={32}
          />
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => onLongPress && onLongPress(message)}
        style={[styles.bubbleWrapper, isCurrentUser ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}
      >
        {/* Sender Name in Circle / Group chats (MSG-03) */}
        {!isCurrentUser && showSenderName && (
          <Text style={styles.senderNameText}>{message.senderName}</Text>
        )}

        {isCurrentUser ? (
          // Outgoing: Primary blue gradient, 20px radius with tighter bottom-right corner
          <LinearGradient
            colors={['#2F80ED', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubbleGradient, styles.outgoingCorners]}
          >
            {isImage ? (
              isUnsafeMedia ? (
                <View style={styles.unsafeMediaPlaceholder}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.unsafeText}>Image flagged by safety filter</Text>
                </View>
              ) : (
                <Image source={{ uri: message.mediaUri }} style={styles.mediaImage} resizeMode="cover" />
              )
            ) : null}

            {message.body ? <Text style={styles.outgoingText}>{message.body}</Text> : null}

            <View style={styles.metaRow}>
              <Text style={styles.outgoingTime}>{formatTime(message.createdAt)}</Text>
              {message.status === 'sending' && (
                <Ionicons name="time-outline" size={11} color="rgba(255, 255, 255, 0.7)" />
              )}
              {message.status === 'sent' && (
                <Ionicons name="checkmark" size={11} color="#FFFFFF" />
              )}
              {message.status === 'failed' && (
                <TouchableOpacity onPress={() => onRetry && onRetry(message.id)}>
                  <Ionicons name="alert-circle" size={13} color="#FFD2D2" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        ) : (
          // Incoming: White glass, 20px radius with tighter bottom-left corner
          <View style={[styles.incomingGlass, styles.incomingCorners]}>
            {isImage ? (
              isUnsafeMedia ? (
                <View style={styles.unsafeMediaPlaceholder}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.unsafeText}>Image flagged by safety filter</Text>
                </View>
              ) : (
                <Image source={{ uri: message.mediaUri }} style={styles.mediaImage} resizeMode="cover" />
              )
            ) : null}

            {message.body ? <Text style={styles.incomingText}>{message.body}</Text> : null}

            <View style={styles.metaRowLeft}>
              <Text style={styles.incomingTime}>{formatTime(message.createdAt)}</Text>
            </View>
          </View>
        )}

        {/* Failed error reason with Retry button */}
        {message.status === 'failed' && isCurrentUser && (
          <View style={styles.failedRow}>
            <Text style={styles.failedText}>{message.errorReason || 'Sending failed'}</Text>
            <TouchableOpacity onPress={() => onRetry && onRetry(message.id)}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: spacing.sm,
    alignItems: 'flex-end',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  avatarCol: {
    marginRight: spacing.xs,
    marginBottom: 2,
  },
  bubbleWrapper: {
    maxWidth: '78%',
  },
  bubbleWrapperRight: {
    alignItems: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignItems: 'flex-start',
  },
  senderNameText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubbleGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    ...shadows.card,
  },
  incomingGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    ...shadows.card,
  },
  // 20px radius with tighter corner
  outgoingCorners: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 6, // Tighter corner for outgoing
  },
  incomingCorners: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 6, // Tighter corner for incoming
    borderBottomRightRadius: 20,
  },
  outgoingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    lineHeight: 21,
    color: '#FFFFFF',
  },
  incomingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  metaRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  outgoingTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  incomingTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
  },
  mediaImage: {
    width: 210,
    height: 150,
    borderRadius: radii.sm,
    marginBottom: 6,
  },
  unsafeMediaPlaceholder: {
    width: 210,
    height: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: spacing.xs,
  },
  unsafeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.destructive,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  failedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginRight: 4,
  },
  failedText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.destructive,
  },
  retryBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  systemCardWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  systemCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.3)',
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
  systemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  systemCardLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  systemCardTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  systemCardSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  systemCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginTop: 4,
  },
  systemCardBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
