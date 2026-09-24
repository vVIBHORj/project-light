import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Check, ShieldCheck, Lock, Clock, X } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';
import { Community } from '../../../domain/types';

export interface CommunityJoinSheetProps {
  visible: boolean;
  onClose: () => void;
  community: Community | null;
  membershipStatus: 'none' | 'pending' | 'approved' | 'muted' | 'banned';
  onJoinSuccess: () => void;
  onCancelRequest: () => void;
  onSubmitAnswers: (answers: string[]) => Promise<void>;
}

export const CommunityJoinSheet: React.FC<CommunityJoinSheetProps> = ({
  visible,
  onClose,
  community,
  membershipStatus,
  onJoinSuccess,
  onCancelRequest,
  onSubmitAnswers,
}) => {
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!community) return null;

  const isPrivate = community.visibility === 'private';
  const isPending = membershipStatus === 'pending';

  const handleJoinOrSubmit = async () => {
    if (!acceptedRules) return;
    setIsSubmitting(true);
    try {
      if (isPrivate) {
        await onSubmitAnswers([answer1, answer2]);
      } else {
        await onSubmitAnswers([]);
      }
      onJoinSuccess();
      onClose();
    } catch {
      // Error handled by caller / store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isPending ? 'Membership Pending' : `Join ${community.name}`}
      snapPoints={['75%']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {isPending ? (
          /* COMM-08 Pending State */
          <View style={styles.pendingStateContainer}>
            <View style={styles.pendingIconWrapper}>
              <Clock size={36} color="#D97706" />
            </View>
            <Text style={styles.pendingTitle}>Request Under Review</Text>
            <Text style={styles.pendingDesc}>
              Your request to join &quot;{community.name}&quot; has been submitted to host {community.hostName}. You will be notified as soon as they review your answers.
            </Text>

            <View style={styles.pendingNotice}>
              <Lock size={14} color="#0369A1" />
              <Text style={styles.pendingNoticeText}>
                Private community discussions and internal Circles remain hidden until your request is approved.
              </Text>
            </View>

            <Pressable
              onPress={() => {
                onCancelRequest();
                onClose();
              }}
              style={styles.cancelRequestBtn}
              accessibilityRole="button"
              accessibilityLabel="Cancel join request"
            >
              <X size={14} color="#EF4444" />
              <Text style={styles.cancelRequestText}>Cancel Join Request</Text>
            </Pressable>
          </View>
        ) : (
          /* COMM-04 Join / Rules / Answers Flow */
          <>
            <View style={styles.headerInfo}>
              <Text style={styles.descText}>{community.description}</Text>
            </View>

            {/* Community Rules Checklist */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Community Ground Rules</Text>
              </View>

              <View style={styles.rulesList}>
                {community.rules.map((rule, idx) => (
                  <View key={idx} style={styles.ruleRow}>
                    <Text style={styles.ruleBullet}>•</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => setAcceptedRules(!acceptedRules)}
                style={styles.agreeRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedRules }}
              >
                <View style={[styles.checkbox, acceptedRules && styles.checkboxActive]}>
                  {acceptedRules && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.agreeText}>
                  I agree to uphold these community rules and cultivate a respectful environment.
                </Text>
              </Pressable>
            </View>

            {/* Questions for Private Communities */}
            {isPrivate && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Lock size={15} color="#0284C7" />
                  <Text style={styles.sectionTitle}>Host Verification Questions</Text>
                </View>
                <Text style={styles.questionsSub}>
                  The host uses these questions to curate relevant micro-circles for members.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    1. What is your background / passion in {community.category}?
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Shooting 35mm film on weekends, scouting locations..."
                    placeholderTextColor="#94A3B8"
                    value={answer1}
                    onChangeText={setAnswer1}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    2. What days/times work best for you for local meetups?
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Saturday mornings or weekday evenings in Indiranagar"
                    placeholderTextColor="#94A3B8"
                    value={answer2}
                    onChangeText={setAnswer2}
                  />
                </View>
              </View>
            )}

            {/* Action CTA */}
            <View style={styles.footerCTA}>
              <PillButton
                label={
                  isPrivate
                    ? isSubmitting
                      ? 'Submitting Request...'
                      : 'Submit Request to Host'
                    : 'Accept & Join Community'
                }
                variant="primary"
                size="lg"
                disabled={!acceptedRules || isSubmitting}
                onPress={handleJoinOrSubmit}
              />
            </View>
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  headerInfo: {
    marginBottom: spacing.md,
  },
  descText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionBlock: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  rulesList: {
    gap: 6,
    marginBottom: spacing.md,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 6,
  },
  ruleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  questionsSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputGroup: {
    marginTop: spacing.xs,
  },
  inputLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  footerCTA: {
    marginTop: spacing.xs,
  },
  pendingStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 8,
  },
  pendingIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  pendingTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 17,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pendingDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: spacing.sm,
  },
  pendingNoticeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    lineHeight: 15,
  },
  cancelRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: '#FEE2E2',
    marginTop: spacing.md,
  },
  cancelRequestText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
});

export default CommunityJoinSheet;
