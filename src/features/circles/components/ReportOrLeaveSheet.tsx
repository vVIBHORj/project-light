import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { LogOut, Flag, Check } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';

export interface ReportOrLeaveSheetProps {
  visible: boolean;
  onClose: () => void;
  mode: 'report' | 'leave';
  targetType: 'community' | 'circle';
  targetId: string;
  targetName: string;
  onConfirmLeave: () => Promise<void>;
  onSubmitReport: (reason: string, evidence: string) => Promise<void>;
}

const reportCategories = [
  'Harassment or Hate Speech',
  'Commercial Spam or Solicitation',
  'Safety & Inappropriate Content',
  'Fake Host or Impersonation',
  'Other Policy Violation',
];

export const ReportOrLeaveSheet: React.FC<ReportOrLeaveSheetProps> = ({
  visible,
  onClose,
  mode,
  targetType,
  targetName,
  onConfirmLeave,
  onSubmitReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(reportCategories[0]);
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLeave = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmLeave();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitReport(selectedCategory, evidence);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'leave' ? `Leave ${targetType === 'community' ? 'Community' : 'Circle'}` : `Report ${targetName}`}
      snapPoints={['65%']}
    >
      <View style={styles.container}>
        {mode === 'leave' ? (
          /* LEAVE CONFIRMATION */
          <View style={styles.leaveBox}>
            <View style={styles.warningIconWrapper}>
              <LogOut size={32} color="#DC2626" />
            </View>
            <Text style={styles.leaveTitle}>Are you sure you want to leave?</Text>
            <Text style={styles.leaveDesc}>
              You will lose access to &quot;{targetName}&quot; member chats, internal Circle meetups, and discussion threads.
            </Text>

            <View style={styles.leaveActions}>
              <Pressable
                onPress={onClose}
                style={styles.cancelBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel leave"
              >
                <Text style={styles.cancelBtnText}>Stay in {targetType}</Text>
              </Pressable>

              <PillButton
                label={isSubmitting ? 'Leaving...' : `Leave ${targetType === 'community' ? 'Community' : 'Circle'}`}
                variant="destructive"
                size="md"
                disabled={isSubmitting}
                onPress={handleLeave}
              />
            </View>
          </View>
        ) : (
          /* REPORT FLOW */
          <View style={styles.reportBox}>
            <View style={styles.reportHeader}>
              <Flag size={16} color="#DC2626" />
              <Text style={styles.reportHeaderText}>
                Select the safety issue regarding &quot;{targetName}&quot;:
              </Text>
            </View>

            <View style={styles.categoriesList}>
              {reportCategories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryRow,
                    selectedCategory === cat && styles.categoryRowActive,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedCategory === cat }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  {selectedCategory === cat && <Check size={14} color={colors.primary} strokeWidth={3} />}
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.evidenceInput}
              placeholder="Additional context or message evidence (optional)..."
              placeholderTextColor="#94A3B8"
              value={evidence}
              onChangeText={setEvidence}
              multiline
              maxLength={200}
            />

            <View style={styles.reportActions}>
              <PillButton
                label={isSubmitting ? 'Submitting Report...' : 'Submit Confidential Report'}
                variant="destructive"
                size="md"
                disabled={isSubmitting}
                onPress={handleReport}
              />
            </View>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
  leaveBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 8,
  },
  warningIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  leaveTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  leaveDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 16,
  },
  leaveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: spacing.md,
    width: '100%',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  reportBox: {
    gap: 10,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportHeaderText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  categoriesList: {
    gap: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  categoryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  categoryTextActive: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  evidenceInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    minHeight: 55,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  reportActions: {
    marginTop: spacing.xs,
  },
});

export default ReportOrLeaveSheet;
