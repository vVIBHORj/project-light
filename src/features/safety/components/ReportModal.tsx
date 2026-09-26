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
import { ReportCategory, ReportSeverity } from '../../../domain/safetyTypes';
import { UserProfile } from '../../../domain/types';

interface CategoryOption {
  id: ReportCategory;
  label: string;
  desc: string;
  defaultSeverity: ReportSeverity;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const REPORT_CATEGORIES: CategoryOption[] = [
  {
    id: 'harassment',
    label: 'Harassment or Bullying',
    desc: 'Unwanted contact, offensive language, or intimidation',
    defaultSeverity: 'high',
    icon: 'account-alert-outline',
  },
  {
    id: 'boundary_violation',
    label: 'Inappropriate Content & Boundaries',
    desc: 'Nudity, sexually explicit, or non-consensual boundary push',
    defaultSeverity: 'medium',
    icon: 'eye-off-outline',
  },
  {
    id: 'scam_financial',
    label: 'Spam, Scam, or Fraud',
    desc: 'Commercial spam, fake accounts, or financial extortion',
    defaultSeverity: 'medium',
    icon: 'shield-alert-outline',
  },
  {
    id: 'hate_speech',
    label: 'Hate Speech & Discrimination',
    desc: 'Attacking individuals based on identity, religion, or caste',
    defaultSeverity: 'urgent',
    icon: 'bullhorn-outline',
  },
  {
    id: 'impersonation_fake',
    label: 'Impersonation or Fake Account',
    desc: 'Pretending to be you or someone else without consent',
    defaultSeverity: 'medium',
    icon: 'card-account-details-outline',
  },
  {
    id: 'underage',
    label: 'Underage User (< 18)',
    desc: 'User appears to be under 18 years of age',
    defaultSeverity: 'high',
    icon: 'account-child-circle',
  },
  {
    id: 'other',
    label: 'Other Safety Concern',
    desc: 'Something else that violates community guidelines',
    defaultSeverity: 'low',
    icon: 'dots-horizontal-circle-outline',
  },
];

export interface ReportModalProps {
  visible?: boolean;
  currentUser?: UserProfile;
  onClose?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible: propVisible,
  currentUser,
  onClose: propClose,
}) => {
  const isStoreOpen = useSafetyStore((s) => s.isReportModalOpen);
  const storeTarget = useSafetyStore((s) => s.reportTarget);
  const closeStoreReport = useSafetyStore((s) => s.closeReportModal);
  const submitReport = useSafetyStore((s) => s.submitReport);

  const isVisible = propVisible !== undefined ? propVisible : isStoreOpen;
  const target = storeTarget || {
    targetType: 'user' as const,
    targetId: 'user_unknown',
    targetName: 'Community Member',
  };

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [severity, setSeverity] = useState<ReportSeverity>('medium');
  const [details, setDetails] = useState('');
  const [limitContact, setLimitContact] = useState(true);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleCategorySelect = (cat: CategoryOption) => {
    setSelectedCategory(cat.id);
    setSeverity(cat.defaultSeverity);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      setErrorText('Please choose a report category.');
      return;
    }
    setErrorText(null);
    setIsSubmitting(true);

    try {
      const reporterId = currentUser?.userId || 'current_user';
      const createdCase = await submitReport(reporterId, {
        category: selectedCategory,
        severity,
        details: details.trim() || undefined,
        applyImmediateProtection: limitContact ? 'block' : 'none',
      });

      if (createdCase && createdCase.caseId) {
        setSubmittedCaseId(createdCase.caseId);
      } else {
        setErrorText('Unable to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setSelectedCategory(null);
    setDetails('');
    setSubmittedCaseId(null);
    setErrorText(null);
    if (propClose) {
      propClose();
    } else {
      closeStoreReport();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDone}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.safetyIconBubble}>
                <MaterialCommunityIcons name="shield-check" size={20} color={colors.safety} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>
                  {submittedCaseId ? 'Report Received' : `Report ${target.targetType === 'user' ? 'Member' : 'Content'}`}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {submittedCaseId ? 'Thank you for keeping our community safe.' : target.targetName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleDone}
              style={styles.closeBtn}
              accessibilityLabel="Close report dialog"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Success State */}
          {submittedCaseId ? (
            <View style={styles.successContent}>
              <View style={styles.caseBadge}>
                <Text style={styles.caseBadgeLabel}>CONFIDENTIAL CASE ID</Text>
                <Text style={styles.caseBadgeId}>{submittedCaseId}</Text>
              </View>

              <Text style={styles.successText}>
                Your report has been routed to our Trust & Safety team. You will be notified in the Safety Center as soon as review progresses.
              </Text>

              {limitContact && (
                <View style={styles.protectionNotice}>
                  <MaterialCommunityIcons name="lock-outline" size={18} color={colors.safety} />
                  <Text style={styles.protectionNoticeText}>
                    Immediate protection applied: <Text style={{ fontWeight: '700' }}>{target.targetName}</Text> has been blocked. They cannot see your profile, circles, or message you.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.primaryPill}
                onPress={handleDone}
                accessibilityLabel="Done"
              >
                <Text style={styles.primaryPillText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionHeader}>Select Category</Text>
              <View style={styles.categoryList}>
                {REPORT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        isSelected && styles.categoryItemSelected,
                      ]}
                      onPress={() => handleCategorySelect(cat)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.catIconBox, isSelected && styles.catIconBoxSelected]}>
                        <MaterialCommunityIcons
                          name={cat.icon}
                          size={20}
                          color={isSelected ? colors.surface : colors.textPrimary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                          {cat.label}
                        </Text>
                        <Text style={styles.catDesc}>{cat.desc}</Text>
                      </View>
                      {isSelected && (
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.safety} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Severity Hint */}
              {selectedCategory && (
                <View style={styles.severityRow}>
                  <Text style={styles.severityLabel}>Priority Hint:</Text>
                  <View
                    style={[
                      styles.severityPill,
                      severity === 'urgent' && styles.severityPillCritical,
                      severity === 'high' && styles.severityPillHigh,
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityPillText,
                        (severity === 'urgent' || severity === 'high') && { color: colors.surface },
                      ]}
                    >
                      {severity.toUpperCase()} PRIORITY
                    </Text>
                  </View>
                </View>
              )}

              {/* Additional Context Note */}
              <Text style={styles.sectionHeader}>Additional Context (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add any helpful details or timestamps..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={details}
                onChangeText={setDetails}
                maxLength={500}
              />

              {/* Limit Contact Option */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setLimitContact(!limitContact)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={limitContact ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={limitContact ? colors.safety : colors.textMuted}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.toggleTitle}>Limit contact with this account</Text>
                  <Text style={styles.toggleSubtitle}>
                    Instantly block this member so they cannot interact with you while we investigate.
                  </Text>
                </View>
              </TouchableOpacity>

              {errorText && (
                <View style={styles.errorBanner}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color={colors.destructive} />
                  <Text style={styles.errorBannerText}>{errorText}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryPill, !selectedCategory && styles.primaryPillDisabled]}
                onPress={handleSubmit}
                disabled={!selectedCategory || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.primaryPillText}>Submit Confidential Report</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.bottomSheet,
    borderTopRightRadius: radii.bottomSheet,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    backgroundColor: 'rgba(14, 159, 142, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  categoryList: {
    gap: 8,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  categoryItemSelected: {
    borderColor: colors.safety,
    backgroundColor: 'rgba(14, 159, 142, 0.05)',
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catIconBoxSelected: {
    backgroundColor: colors.safety,
    borderColor: colors.safety,
  },
  catLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catLabelSelected: {
    color: colors.safety,
  },
  catDesc: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  severityLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: '#E2E8F0',
  },
  severityPillHigh: {
    backgroundColor: '#F59E0B',
  },
  severityPillCritical: {
    backgroundColor: colors.destructive,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.sm,
    padding: 12,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(14, 159, 142, 0.06)',
    padding: 12,
    borderRadius: radii.md,
    marginBottom: 20,
  },
  toggleTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    padding: 10,
    borderRadius: radii.xs,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.fontSize.caption,
    color: colors.destructive,
    flex: 1,
  },
  primaryPill: {
    backgroundColor: colors.safety,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  primaryPillDisabled: {
    opacity: 0.5,
  },
  primaryPillText: {
    color: colors.surface,
    fontSize: typography.fontSize.body,
    fontWeight: '700',
  },
  successContent: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
  },
  caseBadge: {
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    borderWidth: 1,
    borderColor: colors.safety,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  caseBadgeLabel: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.safety,
    letterSpacing: 1,
  },
  caseBadgeId: {
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  successText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  protectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: radii.md,
    gap: 10,
  },
  protectionNoticeText: {
    fontSize: typography.fontSize.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
});
