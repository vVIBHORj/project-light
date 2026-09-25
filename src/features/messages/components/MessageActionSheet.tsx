import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { useChatStore } from '../state/useChatStore';

interface MessageActionSheetProps {
  currentUserId: string;
}

export const MessageActionSheet: React.FC<MessageActionSheetProps> = ({ currentUserId }) => {
  const { actionSheetMessage, setActionSheetMessage, deleteMessageForMe } = useChatStore();

  if (!actionSheetMessage) return null;

  const handleCopy = () => {
    setActionSheetMessage(null);
    Alert.alert('Copied', 'Message text copied to clipboard.');
  };

  const handleDeleteForMe = async () => {
    await deleteMessageForMe(actionSheetMessage.id, currentUserId);
  };

  const handleReport = () => {
    setActionSheetMessage(null);
    Alert.alert(
      'Message Reported',
      'Thank you. Our moderation team will review this message against community standards.'
    );
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => setActionSheetMessage(null)}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setActionSheetMessage(null)}
        />
        <GlassCard style={styles.sheet}>
          <Text style={styles.previewText} numberOfLines={2}>
            &ldquo;{actionSheetMessage.body}&rdquo;
          </Text>

          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionRow} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.actionLabel}>Copy Text</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleDeleteForMe}>
              <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.actionLabel}>Delete for me</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleReport}>
              <Ionicons name="flag-outline" size={20} color={colors.destructive} />
              <Text style={[styles.actionLabel, { color: colors.destructive }]}>Report Message</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.45)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  previewText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionsList: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});
