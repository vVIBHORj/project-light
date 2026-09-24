import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { ThumbsDown, Check } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';

export type FeedbackReason = 'not_my_interest' | 'wrong_time' | 'too_far' | 'not_comfortable' | 'other';

export interface FeedbackReasonSheetProps {
  visible: boolean;
  onClose: () => void;
  targetName: string;
  targetType: 'user' | 'circle' | 'event';
  onSubmitFeedback: (reason: FeedbackReason) => void;
}

const reasonsList: { id: FeedbackReason; label: string; sub: string }[] = [
  { id: 'not_my_interest', label: 'Not my interest', sub: 'I don’t share these hobbies or activity goals' },
  { id: 'wrong_time', label: 'Wrong schedule / cadence', sub: 'The time slot doesn’t match my weekly availability' },
  { id: 'too_far', label: 'Too far away', sub: 'Prefer recommendations closer to my immediate neighborhood' },
  { id: 'not_comfortable', label: 'Not comfortable', sub: 'Prefer different group dynamics or social styles' },
  { id: 'other', label: 'Other reason', sub: 'Show fewer similar recommendations' },
];

export const FeedbackReasonSheet: React.FC<FeedbackReasonSheetProps> = ({
  visible,
  onClose,
  targetName,
  onSubmitFeedback,
}) => {
  const [selectedReason, setSelectedReason] = useState<FeedbackReason>('not_my_interest');

  const handleSubmit = () => {
    onSubmitFeedback(selectedReason);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Tune Your Recommendations"
      snapPoints={['60%']}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThumbsDown size={18} color={colors.textSecondary} />
          <Text style={styles.headerText}>
            Why is &quot;{targetName}&quot; not relevant?
          </Text>
        </View>

        <View style={styles.list}>
          {reasonsList.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setSelectedReason(item.id)}
              style={[
                styles.reasonRow,
                selectedReason === item.id && styles.reasonRowSelected,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedReason === item.id }}
            >
              <View style={styles.textCol}>
                <Text
                  style={[
                    styles.reasonLabel,
                    selectedReason === item.id && styles.reasonLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.reasonSub}>{item.sub}</Text>
              </View>

              {selectedReason === item.id && (
                <View style={styles.checkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <PillButton
            label="Submit Feedback"
            variant="primary"
            size="md"
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  headerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  list: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  reasonRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  textCol: {
    flex: 1,
  },
  reasonLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  reasonLabelSelected: {
    color: colors.primary,
  },
  reasonSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  footer: {
    marginTop: spacing.md,
  },
  submitBtn: {
    width: '100%',
  },
});

export default FeedbackReasonSheet;
