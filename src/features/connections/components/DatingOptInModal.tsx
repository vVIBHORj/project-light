import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import { Avatar } from '../../../design-system/components/Avatar';
import { useConnectionsStore } from '../state/useConnectionsStore';

interface DatingOptInModalProps {
  visible: boolean;
  currentUserId: string;
  onClose: () => void;
}

export const DatingOptInModal: React.FC<DatingOptInModalProps> = ({
  visible,
  currentUserId,
  onClose,
}) => {
  const { targetConnectionForDating, setDatingOptIn } = useConnectionsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetConnectionForDating) return null;

  const otherUser = targetConnectionForDating.otherUser;

  const handleConfirmDating = async () => {
    setIsSubmitting(true);
    try {
      await setDatingOptIn(targetConnectionForDating.id, currentUserId, true);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <GlassCard style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={28} color={colors.intent.dating} />
          </View>

          <Text style={styles.title}>Dating Intent</Text>
          <Text style={styles.subtitle}>
            Explore a romantic connection with {otherUser.displayName}
          </Text>

          <View style={styles.userPreview}>
            <Avatar
              uri={otherUser.photos?.[0]}
              name={otherUser.displayName}
              size={56}
            />
            <Text style={styles.userName}>{otherUser.displayName}</Text>
          </View>

          {/* Privacy & Mutual Consent Notice */}
          <View style={styles.noticeBox}>
            <View style={styles.noticeRow}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
              <Text style={styles.noticeText}>
                <Text style={styles.boldText}>Strict Two-Sided Consent: </Text>
                Dating features only unlock if both you and {otherUser.displayName} independently opt in.
              </Text>
            </View>

            <View style={styles.noticeRow}>
              <Ionicons name="eye-off-outline" size={18} color={colors.primary} />
              <Text style={styles.noticeText}>
                <Text style={styles.boldText}>Zero Pressure: </Text>
                If they haven&apos;t opted in, your friendship remains completely unaffected and they will never know you expressed dating interest.
              </Text>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.buttonGroup}>
            <PillButton
              label={isSubmitting ? 'Updating...' : `Opt In with ${otherUser.displayName}`}
              onPress={handleConfirmDating}
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              style={styles.confirmBtn}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Keep as Friendship</Text>
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
    backgroundColor: 'rgba(11, 19, 43, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 91, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  userPreview: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  userName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  noticeBox: {
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
    width: '100%',
  },
  noticeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  noticeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: colors.intent.dating,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
  },
  cancelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});
