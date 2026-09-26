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
    id: 'inappropriate_content',
    label: 'Inappropriate Content',
    desc: 'Nudity, sexually explicit, or graphic violence',
    defaultSeverity: 'medium',
    icon: 'eye-off-outline',
  },
  {
    id: 'spam_scam',
    label: 'Spam, Scam, or Fraud',
    desc: 'Commercial spam, fake profiles, or financial extortion',
    defaultSeverity: 'medium',
    icon: 'shield-alert-outline',
  },
  {
    id: 'hate_speech',
    label: 'Hate Speech & Discrimination',
    desc: 'Attacking individuals based on identity, religion, or caste',
    defaultSeverity: 'critical',
    icon: 'bullhorn-outline',
  },
  {
    id: 'impersonation',
    label: 'Impersonation or Fake Account',
    desc: 'Pretending to be you or someone else without consent',
    defaultSeverity: 'medium',
    icon: 'card-account-details-outline',
  },
  {
    id: 'offline_safety_threat',
    label: 'Immediate Offline Threat',
    desc: 'Stalking, physical threats, or non-consensual tracking',
    defaultSeverity: 'critical',
    icon: 'alert-octagon-outline',
  },
  {
    id: 'underage_account',
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

export const ReportModal: React.FC = () => {
  const isVisible = useSafetyStore((s) => s.isReportModalOpen);
  const target = useSafetyStore((s) => s.activeReportTarget);
  const closeReportModal = useSafetyStore((s) => s.closeReportModal);
  const submitReport = useSafetyStore((s) => s.submitReport);
  const isSubmitting = useSafetyStore((s) => s.isSubmittingReport);

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [severity, setSeverity] = useState<ReportSeverity>('medium');
  const [description, setDescription] = useState('');
  const [limitContact, setLimitContact] = useState(true);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!target) return null;

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

    const result = await submitReport({
      targetType: target.targetType,
      targetId: target.targetId,
      targetName: target.targetName,
      category: selectedCategory,
      severity,
      description: description.trim() || undefined,
      contentSnippet: target.contentSnippet,
      immediateAction: limitContact ? 'block' : undefined,
    });

    if (result.success && result.caseId) {
      setSubmittedCaseId(result.caseId);
    } else {
      setErrorText(result.error || 'Unable to submit report. Please try again.');
    }
  };

  const handleDone = () => {
    setSelectedCategory(null);
    setDescription('');
    setSubmittedCaseId(null);
    setErrorText(null);
    closeReportModal();
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
              {target.contentSnippet && (
                <View style={styles.snippetCard}>
                  <Text style={styles.snippetLabel}>Reported Content:</Text>
                  <Text style={styles.snippetText} numberOfLines={2}>
                    &ldquo;{target.contentSnippet}&rdquo;
                  </Text>
                </View>
              )}

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
                          color={isSelected ? colors.white : colors.textPrimary}
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
                      severity === 'critical' && styles.severityPillCritical,
                      severity === 'high' && styles.severityPillHigh,
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityPillText,
                        (severity === 'critical' || severity === 'high') && { color: colors.white },
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
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
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
                  color={limitContact ? colors.safety : colors.textTertiary}
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
                  <ActivityIndicator color={colors.white} />
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
    backgroundColor: 'rgba(14, 159, 142, 0.12)',
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
  snippetCard: {
    backgroundColor: colors.glassBackground,
    borderLeftWidth: 3,
    borderLeftColor: colors.safety,
    padding: 12,
    borderRadius: radii.badge,
    marginBottom: 16,
  },
  snippetLabel: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  snippetText: {
    fontSize: typography.fontSize.subhead,
    color: colors.textPrimary,
    fontStyle: 'italic',
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
    borderRadius: radii.card,
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
    backgroundColor: colors.white,
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
    fontSize: typography.fontSize.footnote,
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
    fontSize: typography.fontSize.footnote,
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
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.card,
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
    borderRadius: radii.card,
    marginBottom: 20,
  },
  toggleTitle: {
    fontSize: typography.fontSize.subhead,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 87, 87, 0.1)',
    padding: 10,
    borderRadius: radii.badge,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.fontSize.footnote,
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
    color: colors.white,
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
    borderRadius: radii.card,
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
    borderRadius: radii.card,
    gap: 10,
  },
  protectionNoticeText: {
    fontSize: typography.fontSize.footnote,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
});
