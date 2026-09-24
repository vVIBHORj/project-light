import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import { useConnectionsStore } from '../state/useConnectionsStore';

interface RemoveConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
}

const REASONS = [
  'We grew apart',
  'Different activity interests',
  'No longer active',
  'Prefer not to say',
  'Uncomfortable behavior',
];

export const RemoveConnectionModal: React.FC<RemoveConnectionModalProps> = ({
  visible,
  onClose,
  onBlock,
  onReport,
}) => {
  const { targetConnectionForRemove, removeConnection } = useConnectionsStore();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!targetConnectionForRemove) return null;

  const otherUser = targetConnectionForRemove.otherUser;

  const handleConfirmRemove = async () => {
    setIsSubmitting(true);
    try {
      await removeConnection(targetConnectionForRemove.id, selectedReason || undefined);
      setSelectedReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlockShortcut = () => {
    onClose();
    if (onBlock) {
      onBlock(otherUser.userId);
    }
  };

  const handleReportShortcut = () => {
    onClose();
    if (onReport) {
      onReport(otherUser.userId);
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
            <Ionicons name="person-remove-outline" size={26} color={colors.destructive} />
          </View>

          <Text style={styles.title}>Remove Connection</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to remove <Text style={styles.boldText}>{otherUser.displayName}</Text>?
          </Text>

          {/* Explanation */}
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              • This will immediately close and archive your direct 1:1 conversation.
              {'\n'}• Shared circle activities will remain accessible unless you block each other.
            </Text>
          </View>

          {/* Reason selector (optional) */}
          <Text style={styles.sectionLabel}>REASON (OPTIONAL)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reasonsContainer}
          >
            {REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonChip,
                    isSelected && styles.reasonChipSelected,
                  ]}
                  onPress={() => setSelectedReason(isSelected ? '' : reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      isSelected && styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action CTAs */}
          <View style={styles.buttonGroup}>
            <PillButton
              label={isSubmitting ? 'Removing...' : 'Remove Connection'}
              onPress={handleConfirmRemove}
              variant="destructive"
              size="lg"
              disabled={isSubmitting}
              style={styles.dangerBtn}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Keep Connection</Text>
            </TouchableOpacity>
          </View>

          {/* Safety Shortcuts */}
          <View style={styles.safetyRow}>
            <TouchableOpacity style={styles.safetyAction} onPress={handleBlockShortcut}>
              <Ionicons name="ban-outline" size={14} color={colors.destructive} />
              <Text style={styles.safetyActionText}>Block User</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.safetyAction} onPress={handleReportShortcut}>
              <Ionicons name="flag-outline" size={14} color={colors.destructive} />
              <Text style={styles.safetyActionText}>Report User</Text>
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
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
    marginBottom: spacing.md,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  warningBox: {
    backgroundColor: 'rgba(229, 72, 77, 0.06)',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  warningText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    alignSelf: 'flex-start',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  reasonsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  reasonChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonChipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
  },
  reasonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  reasonTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dangerBtn: {
    width: '100%',
    backgroundColor: colors.destructive,
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
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  safetyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: spacing.xs,
  },
  safetyActionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.destructive,
    fontWeight: typography.fontWeight.semibold,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },
});
