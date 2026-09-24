import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Users } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import { Avatar } from '../../../design-system/components/Avatar';
import { ReasonChip } from '../../../design-system/components/ReasonChip';
import { VerifiedBadge } from '../../../design-system/components/VerifiedBadge';
import { useConnectionsStore } from '../state/useConnectionsStore';

interface ConnectionDecisionSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpenChat?: (connectionId: string) => void;
}

export const ConnectionDecisionSheet: React.FC<ConnectionDecisionSheetProps> = ({
  visible,
  onClose,
  onOpenChat,
}) => {
  const {
    targetConnectionForDecision,
    acceptConnection,
    declineConnection,
    restrictConnection,
  } = useConnectionsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetConnectionForDecision) return null;

  const otherUser = targetConnectionForDecision.otherUser;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await acceptConnection(targetConnectionForDecision.id);
      onClose();
      if (onOpenChat) {
        onOpenChat(targetConnectionForDecision.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await declineConnection(targetConnectionForDecision.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestrict = async () => {
    setIsSubmitting(true);
    try {
      await restrictConnection(targetConnectionForDecision.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header / Person Info */}
            <View style={styles.userRow}>
              <Avatar
                uri={otherUser.photos?.[0]}
                name={otherUser.displayName}
                size={64}
              />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{otherUser.displayName}</Text>
                  {otherUser.isVerified && <VerifiedBadge size={16} />}
                </View>
                {otherUser.bio ? (
                  <Text style={styles.bioText} numberOfLines={2}>
                    {otherUser.bio}
                  </Text>
                ) : (
                  <Text style={styles.bioText}>{otherUser.zone}</Text>
                )}
              </View>
            </View>

            {/* Shared Context Banner (Required) */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SHARED CONTEXT</Text>
              <View style={styles.contextContainer}>
                <ReasonChip
                  label={targetConnectionForDecision.sharedContextDescription}
                  icon={Users}
                />
              </View>
            </View>

            {/* Requested Intent */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>REQUESTED INTENT</Text>
              <View style={styles.intentBadge}>
                <Text style={styles.intentText}>
                  {targetConnectionForDecision.requesterIntent === 'dating'
                    ? '💫 Dating Connection'
                    : targetConnectionForDecision.requesterIntent === 'community'
                    ? '⚡ Community Connection'
                    : targetConnectionForDecision.requesterIntent === 'explore'
                    ? '🧭 Explore & Activities'
                    : '🤝 Friendship'}
                </Text>
              </View>
            </View>

            {/* Sender Note */}
            {targetConnectionForDecision.note ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>PERSONAL NOTE</Text>
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>&ldquo;{targetConnectionForDecision.note}&rdquo;</Text>
                </View>
              </View>
            ) : null}

            {/* Connection Prompt Explanation */}
            <View style={styles.promptBox}>
              <Text style={styles.promptTitle}>How connection works</Text>
              <Text style={styles.promptSubtitle}>
                Accepting unlocks a 1:1 direct chat with shared context banners. Declining is silent and respectful—they will never receive a rejection notification.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <PillButton
                label={isSubmitting ? 'Accepting...' : 'Accept Connection'}
                onPress={handleAccept}
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                style={styles.acceptButton}
              />

              <View style={styles.secondaryRow}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={handleDecline}
                  disabled={isSubmitting}
                >
                  <Text style={styles.declineText}>Decline Silently</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.restrictButton}
                  onPress={handleRestrict}
                  disabled={isSubmitting}
                >
                  <Text style={styles.restrictText}>Restrict</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    maxHeight: '85%',
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
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  userName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  bioText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  contextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  intentText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  noteBox: {
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  noteText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontStyle: 'italic',
    color: colors.textPrimary,
  },
  promptBox: {
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  promptTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  promptSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  acceptButton: {
    width: '100%',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  declineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
  },
  declineText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  restrictButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(229, 72, 77, 0.08)',
  },
  restrictText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.destructive,
  },
});
