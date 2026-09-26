import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, shadows, typography } from '../../../design-system/tokens';
import { useSafetyStore } from '../state/useSafetyStore';

export const SafetyCaseTimelineModal: React.FC = () => {
  const isVisible = useSafetyStore((s) => s.isCaseTimelineModalOpen);
  const activeCase = useSafetyStore((s) => s.activeSafetyCase);
  const closeCaseTimelineModal = useSafetyStore((s) => s.closeCaseTimelineModal);
  const submitAppeal = useSafetyStore((s) => s.submitAppeal);

  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);

  if (!activeCase) return null;

  const handleAppealSubmit = async () => {
    if (!appealReason.trim()) return;
    setIsSubmittingAppeal(true);
    try {
      const res = await submitAppeal(activeCase.id, appealReason.trim());
      if (res.success) {
        setAppealSuccess(true);
        setShowAppealForm(false);
      }
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const handleClose = () => {
    setShowAppealForm(false);
    setAppealReason('');
    setAppealSuccess(false);
    closeCaseTimelineModal();
  };

  const statusLabel = {
    received: 'Report Received',
    in_review: 'Under Investigation',
    action_taken: 'Resolved - Action Taken',
    no_action: 'Resolved - Closed',
    appealed: 'Appeal Under Review',
  }[activeCase.status];

  const statusColor = {
    received: '#F59E0B',
    in_review: colors.primary,
    action_taken: colors.safety,
    no_action: colors.textSecondary,
    appealed: '#8B5CF6',
  }[activeCase.status];

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.safetyIconBubble, { backgroundColor: `${statusColor}20` }]}>
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={20} color={statusColor} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Case {activeCase.id}</Text>
                <Text style={styles.sheetSubtitle}>Reported: {activeCase.targetName}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityLabel="Close timeline dialog"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusHeading}>Current Case State</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailVal}>{activeCase.category.replace('_', ' ')}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Logged On:</Text>
                <Text style={styles.detailVal}>
                  {new Date(activeCase.createdAt).toLocaleString()}
                </Text>
              </View>
              {activeCase.resolutionNotes && (
                <View style={styles.resolutionBox}>
                  <Text style={styles.resolutionTitle}>Resolution Notes:</Text>
                  <Text style={styles.resolutionText}>{activeCase.resolutionNotes}</Text>
                </View>
              )}
            </View>

            {appealSuccess && (
              <View style={styles.appealSuccessNotice}>
                <MaterialCommunityIcons name="check-circle" size={18} color={colors.safety} />
                <Text style={styles.appealSuccessText}>
                  Your appeal has been submitted to a senior safety officer for secondary review.
                </Text>
              </View>
            )}

            {/* Timeline Progress */}
            <Text style={styles.timelineSectionTitle}>Investigation Timeline</Text>
            <View style={styles.timelineContainer}>
              {activeCase.timeline.map((event, index) => {
                const isLast = index === activeCase.timeline.length - 1;
                return (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={styles.timelineDot} />
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineStatusTitle}>
                          {event.status.replace('_', ' ').toUpperCase()}
                        </Text>
                        <Text style={styles.timelineTime}>
                          {new Date(event.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.timelineNote}>{event.note}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Appeal Section */}
            {activeCase.appealAllowed && activeCase.status !== 'appealed' && !appealSuccess && (
              <View style={styles.appealSection}>
                {!showAppealForm ? (
                  <TouchableOpacity
                    style={styles.appealLaunchBtn}
                    onPress={() => setShowAppealForm(true)}
                  >
                    <MaterialCommunityIcons name="scale-balance" size={18} color={colors.primary} />
                    <Text style={styles.appealLaunchText}>Request Case Reconsideration (Appeal)</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.appealFormCard}>
                    <Text style={styles.appealFormTitle}>Appeal Safety Decision</Text>
                    <Text style={styles.appealFormDesc}>
                      Provide additional context or evidence if you believe this resolution requires further scrutiny.
                    </Text>
                    <TextInput
                      style={styles.appealInput}
                      placeholder="Explain your grounds for appeal..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                      value={appealReason}
                      onChangeText={setAppealReason}
                    />

                    <View style={styles.appealActionRow}>
                      <TouchableOpacity
                        style={styles.appealCancelBtn}
                        onPress={() => setShowAppealForm(false)}
                      >
                        <Text style={styles.appealCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.appealSubmitBtn, !appealReason.trim() && { opacity: 0.5 }]}
                        onPress={handleAppealSubmit}
                        disabled={!appealReason.trim() || isSubmittingAppeal}
                      >
                        {isSubmittingAppeal ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Text style={styles.appealSubmitText}>Submit Appeal</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    ...shadows.elevated,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  safetyIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: typography.fontSize.cardTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingTop: 16,
  },
  statusCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusHeading: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
  },
  detailVal: {
    fontSize: typography.fontSize.footnote,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  resolutionBox: {
    backgroundColor: colors.white,
    borderRadius: radii.badge,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resolutionTitle: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  resolutionText: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  appealSuccessNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    borderRadius: radii.card,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  appealSuccessText: {
    fontSize: typography.fontSize.footnote,
    color: colors.safety,
    fontWeight: '600',
    flex: 1,
  },
  timelineSectionTitle: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  timelineContainer: {
    paddingLeft: 4,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.safety,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineStatusTitle: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timelineTime: {
    fontSize: typography.fontSize.caption,
    color: colors.textTertiary,
  },
  timelineNote: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  appealSection: {
    marginTop: 6,
  },
  appealLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(47, 128, 237, 0.05)',
  },
  appealLaunchText: {
    fontSize: typography.fontSize.footnote,
    fontWeight: '700',
    color: colors.primary,
  },
  appealFormCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  appealFormTitle: {
    fontSize: typography.fontSize.subhead,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appealFormDesc: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  appealInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.card,
    padding: 10,
    fontSize: typography.fontSize.footnote,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  appealActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  appealCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  appealCancelText: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
  },
  appealSubmitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  appealSubmitText: {
    color: colors.white,
    fontSize: typography.fontSize.footnote,
    fontWeight: '700',
  },
});
