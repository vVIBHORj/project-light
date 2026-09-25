import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import { useChatStore } from '../state/useChatStore';

export const ConversationSafetyPromptSheet: React.FC = () => {
  const { safetyPromptTarget, closeSafetyPrompt, blockActiveParticipant } = useChatStore();

  if (!safetyPromptTarget) return null;

  const { checkResult, onConfirmSend } = safetyPromptTarget;

  const handleReportAndBlock = async () => {
    closeSafetyPrompt();
    await blockActiveParticipant('current_user');
    Alert.alert(
      'User Blocked & Reported',
      'The conversation has been closed and reported to our safety review team.'
    );
  };

  const handleLearnMore = () => {
    Alert.alert(
      'LIGHT Safety Guidelines',
      '• Keep payments within official event booking.\n• Avoid sharing private phone numbers until you meet in person.\n• Group Circles are the safest place to connect.'
    );
  };

  const getIcon = () => {
    switch (checkResult.triggerType) {
      case 'upi_payment':
        return 'card-outline';
      case 'phone_number':
        return 'call-outline';
      case 'off_platform':
        return 'arrow-redo-outline';
      case 'external_link':
        return 'link-outline';
      default:
        return 'shield-checkmark-outline';
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeSafetyPrompt}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeSafetyPrompt} />
        <GlassCard style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons name={getIcon()} size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>{checkResult.friendlyTitle || 'Safety Reminder'}</Text>

          {checkResult.detectedSnippet && (
            <View style={styles.snippetBox}>
              <Text style={styles.snippetLabel}>DETECTED PATTERN</Text>
              <Text style={styles.snippetText}>&ldquo;{checkResult.detectedSnippet}&rdquo;</Text>
            </View>
          )}

          <Text style={styles.message}>
            {checkResult.friendlyMessage ||
              'For your privacy and security, we recommend keeping conversations and activities inside Project LIGHT verified circles.'}
          </Text>

          {/* Action CTAs */}
          <View style={styles.buttonGroup}>
            <PillButton
              label="Keep Chatting & Send Anyway"
              onPress={onConfirmSend}
              variant="primary"
              size="lg"
              style={styles.primaryBtn}
            />

            <TouchableOpacity style={styles.learnBtn} onPress={handleLearnMore}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.learnBtnText}>Learn Safety Guidelines</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportBtn} onPress={handleReportAndBlock}>
              <Ionicons name="shield-outline" size={14} color={colors.destructive} />
              <Text style={styles.reportBtnText}>Report & Block User</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    ...shadows.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  snippetBox: {
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginVertical: spacing.xs,
    alignItems: 'center',
  },
  snippetLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  snippetText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  message: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: spacing.md,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryBtn: {
    width: '100%',
  },
  learnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  learnBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  reportBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.destructive,
  },
});
