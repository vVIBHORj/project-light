import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import { useCirclesStore } from '../../circles/state/useCirclesStore';
import { useConnectionsStore } from '../state/useConnectionsStore';
import { Circle } from '../../../domain/types';

interface InviteToCircleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InviteToCircleModal: React.FC<InviteToCircleModalProps> = ({
  visible,
  onClose,
}) => {
  const { targetConnectionForInvite } = useConnectionsStore();
  const { myCirclesList } = useCirclesStore();
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!targetConnectionForInvite) return null;

  const otherUser = targetConnectionForInvite.otherUser;

  const handleSendInvite = () => {
    if (!selectedCircleId) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onClose();
      Alert.alert(
        'Circle Invite Sent! 🎉',
        `Invitation to join your Circle was sent to ${otherUser.displayName}.`
      );
    }, 400);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <GlassCard style={styles.sheet}>
          <View style={styles.grabber} />

          <Text style={styles.title}>Invite to Circle</Text>
          <Text style={styles.subtitle}>
            Choose one of your Circles to invite {otherUser.displayName} to join:
          </Text>

          <ScrollView style={styles.circlesList} showsVerticalScrollIndicator={false}>
            {myCirclesList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>You are not in any active Circles yet.</Text>
              </View>
            ) : (
              myCirclesList.map((circle: Circle) => {
                const isSelected = selectedCircleId === circle.id;
                return (
                  <TouchableOpacity
                    key={circle.id}
                    style={[
                      styles.circleItem,
                      isSelected && styles.circleItemSelected,
                    ]}
                    onPress={() => setSelectedCircleId(circle.id)}
                  >
                    <View style={styles.circleInfo}>
                      <Text style={styles.circleName}>{circle.title}</Text>
                      <Text style={styles.circleMeta}>
                        {circle.activityName} • {circle.currentMemberCount}/{circle.capacity} members
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={styles.actions}>
            <PillButton
              label={isSending ? 'Sending...' : 'Send Circle Invite'}
              onPress={handleSendInvite}
              variant="primary"
              size="lg"
              disabled={!selectedCircleId || isSending}
              style={styles.sendButton}
            />

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
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
  },
  sheet: {
    borderTopLeftRadius: radii.bottomSheet,
    borderTopRightRadius: radii.bottomSheet,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.card,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  circlesList: {
    maxHeight: 240,
    marginBottom: spacing.md,
  },
  emptyBox: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
  circleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  circleItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  circleMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  actions: {
    gap: spacing.sm,
  },
  sendButton: {
    width: '100%',
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});
