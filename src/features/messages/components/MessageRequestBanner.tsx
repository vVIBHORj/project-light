import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { Conversation } from '../../../domain/types';
import { Avatar } from '../../../design-system/components/Avatar';
import { useChatStore } from '../state/useChatStore';

interface MessageRequestBannerProps {
  conversation: Conversation;
}

export const MessageRequestBanner: React.FC<MessageRequestBannerProps> = ({ conversation }) => {
  const { respondToRequest } = useChatStore();

  if (conversation.type !== 'request' || conversation.requestStatus !== 'pending') {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.headerRow}>
        <Avatar uri={conversation.avatar} name={conversation.title || 'User'} size={40} />
        <View style={styles.infoCol}>
          <Text style={styles.title}>{conversation.title}</Text>
          <Text style={styles.contextText}>{conversation.sharedContext}</Text>
        </View>
      </View>

      {conversation.requestOpeningMessage ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            &ldquo;{conversation.requestOpeningMessage}&rdquo;
          </Text>
        </View>
      ) : null}

      <Text style={styles.noticeText}>
        Accept to unlock direct replies. Declining is silent and respectful.
      </Text>

      {/* Decision Buttons (MSG-04) */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => respondToRequest('accepted')}>
          <Text style={styles.acceptBtnText}>Accept Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineBtn} onPress={() => respondToRequest('declined')}>
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.blockBtn} onPress={() => respondToRequest('blocked')}>
          <Ionicons name="ban-outline" size={14} color={colors.destructive} />
          <Text style={styles.blockBtnText}>Block</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.3)',
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  contextText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  messageBox: {
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  messageText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontStyle: 'italic',
    color: colors.textPrimary,
  },
  noticeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  blockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(229, 72, 77, 0.08)',
  },
  blockBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.destructive,
  },
});
