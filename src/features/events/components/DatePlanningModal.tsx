import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { PillButton } from '../../../design-system/components/PillButton';
import {
  DatePlanProposal,
  DatePlanPostOutcome,
  UserProfile,
} from '../../../domain/types';
import { EventStateMachine } from '../../../domain/eventStateMachine';
import { useEventStore } from '../state/useEventStore';

interface DatePlanningModalProps {
  visible: boolean;
  currentUser: UserProfile;
  targetUser: { userId: string; displayName: string; photo?: string };
  connectionId: string;
  isMutualDating: boolean;
  existingPlan?: DatePlanProposal | null;
  onClose: () => void;
  onPlanConfirmed?: (plan: DatePlanProposal) => void;
}

export const DatePlanningModal: React.FC<DatePlanningModalProps> = ({
  visible,
  currentUser,
  targetUser,
  connectionId,
  isMutualDating,
  existingPlan,
  onClose,
  onPlanConfirmed,
}) => {
  const {
    proposeDatePlan,
    respondToDatePlan,
    completeDatePlan,
  } = useEventStore();

  const [venueCategory, setVenueCategory] = useState(
    existingPlan?.venueCategory || 'Third-wave Cafe'
  );
  const [locationZone, setLocationZone] = useState(
    existingPlan?.locationZone || currentUser.zone || 'Indiranagar'
  );
  const [suggestedDate, setSuggestedDate] = useState(
    existingPlan?.suggestedDate || 'This Saturday'
  );
  const [suggestedTime, setSuggestedTime] = useState(
    existingPlan?.suggestedTime || '4:30 PM'
  );
  const [note, setNote] = useState(existingPlan?.note || '');
  const [counterNotes, setCounterNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountering, setIsCountering] = useState(false);

  // Safety gate check (EVENT-07)
  const gateCheck = EventStateMachine.canInitiateDatePlan(isMutualDating, 'DATING');
  if (!gateCheck.allowed) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.gateAlertContainer}>
            <Ionicons name="lock-closed" size={36} color={colors.primary} />
            <Text style={styles.gateTitle}>Dating Mode Restricted</Text>
            <Text style={styles.gateSubtitle}>{gateCheck.reason}</Text>
            <PillButton label="Close" variant="secondary" size="md" onPress={onClose} />
          </View>
        </View>
      </Modal>
    );
  }

  const venueCategories = [
    'Third-wave Cafe',
    'Art Gallery / Exhibition',
    'Public Botanical Gardens',
    'Board Game Parlour',
    'Specialty Dessert Bar',
    'Bookstore Cafe',
  ];

  const zones = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Cubbon Park', 'Jayanagar'];

  const handlePropose = async () => {
    setIsSubmitting(true);
    try {
      const plan = await proposeDatePlan(
        currentUser,
        targetUser,
        connectionId,
        {
          venueCategory,
          locationZone,
          suggestedDate,
          suggestedTime,
          note,
        }
      );
      Alert.alert('Date Plan Sent! 💌', 'Proposed public meetup sent for mutual confirmation.');
      if (onPlanConfirmed) onPlanConfirmed(plan);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmExisting = async () => {
    if (!existingPlan) return;
    setIsSubmitting(true);
    try {
      await respondToDatePlan(existingPlan.id, 'confirm');
      Alert.alert('Date Confirmed! 🥂', 'Mutual plan locked with public safety helper enabled.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCounter = async () => {
    if (!existingPlan) return;
    setIsSubmitting(true);
    try {
      await respondToDatePlan(existingPlan.id, 'counter', counterNotes);
      Alert.alert('Counter-Proposal Sent', 'Your updated suggestion has been sent.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostDateReview = async (outcome: DatePlanPostOutcome) => {
    if (!existingPlan) return;
    setIsSubmitting(true);
    try {
      await completeDatePlan(existingPlan.id, outcome);
      Alert.alert('Thank You', 'Your post-date preference has been recorded securely.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmed = existingPlan?.status === 'confirmed';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {isConfirmed ? 'Confirmed Date Plan 🥂' : 'Plan a Date'}
              </Text>
              <Text style={styles.sheetSubtitle}>
                With {targetUser.displayName} • Public Venues Only
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Safety Plan Banner */}
            <View style={styles.safetyBox}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
              <View style={styles.safetyTextWrapper}>
                <Text style={styles.safetyTitle}>Safety Plan Active</Text>
                <Text style={styles.safetyDesc}>
                  Meets strictly in verified daylight/evening public establishments. Option to share live check-in with your trusted contact.
                </Text>
              </View>
            </View>

            {isConfirmed ? (
              // Confirmed Plan & Post-Date Followup View
              <View style={styles.confirmedView}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>{existingPlan?.venueCategory}</Text>
                  <Text style={styles.detailSubtitle}>
                    {existingPlan?.locationZone} • {existingPlan?.suggestedDate} at {existingPlan?.suggestedTime}
                  </Text>
                  {existingPlan?.note && (
                    <Text style={styles.detailNote}>&ldquo;{existingPlan.note}&rdquo;</Text>
                  )}
                </View>

                <Text style={styles.sectionLabel}>Post-Date Follow-Up</Text>
                <Text style={styles.helperText}>
                  How would you like to continue after your meetup?
                </Text>

                <View style={styles.outcomeRow}>
                  <TouchableOpacity
                    style={styles.outcomeBtn}
                    onPress={() => handlePostDateReview('continue_dating')}
                  >
                    <Ionicons name="heart" size={18} color={colors.primary} />
                    <Text style={styles.outcomeBtnText}>Continue Dating</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.outcomeBtn}
                    onPress={() => handlePostDateReview('friends')}
                  >
                    <Ionicons name="people" size={18} color="#27AE60" />
                    <Text style={styles.outcomeBtnText}>Become Friends</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.outcomeRow}>
                  <TouchableOpacity
                    style={styles.outcomeBtn}
                    onPress={() => handlePostDateReview('stay_connected')}
                  >
                    <Ionicons name="chatbubbles" size={18} color={colors.textSecondary} />
                    <Text style={styles.outcomeBtnText}>Stay Connected</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outcomeBtn, styles.outcomeBtnMuted]}
                    onPress={() => handlePostDateReview('stop')}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.destructive} />
                    <Text style={[styles.outcomeBtnText, styles.outcomeTextError]}>
                      Stop / Disconnect
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : existingPlan && existingPlan.proposerId !== currentUser.userId ? (
              // Received proposal review view
              <View style={styles.receivedProposalView}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>{existingPlan.venueCategory}</Text>
                  <Text style={styles.detailSubtitle}>
                    {existingPlan.locationZone} • {existingPlan.suggestedDate} at {existingPlan.suggestedTime}
                  </Text>
                  {existingPlan.note && (
                    <Text style={styles.detailNote}>&ldquo;{existingPlan.note}&rdquo;</Text>
                  )}
                </View>

                {isCountering ? (
                  <View style={styles.counterBox}>
                    <Text style={styles.sectionLabel}>Counter-Proposal / Alternative Time</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Can we do Maverick Cafe at 5 PM instead?"
                      placeholderTextColor={colors.textMuted}
                      value={counterNotes}
                      onChangeText={setCounterNotes}
                    />
                    <PillButton
                      label="Send Counter-Proposal"
                      variant="primary"
                      size="md"
                      onPress={handleSendCounter}
                      disabled={isSubmitting}
                    />
                  </View>
                ) : (
                  <View style={styles.actionRow}>
                    <PillButton
                      label="Confirm Date Plan 🥂"
                      variant="primary"
                      size="lg"
                      onPress={handleConfirmExisting}
                      disabled={isSubmitting}
                      style={styles.flexBtn}
                    />
                    <TouchableOpacity
                      style={styles.counterToggleBtn}
                      onPress={() => setIsCountering(true)}
                    >
                      <Text style={styles.counterToggleText}>Counter Propose</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              // Propose New Plan Form
              <>
                <Text style={styles.sectionLabel}>Public Venue Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                  {venueCategories.map((vc) => (
                    <TouchableOpacity
                      key={vc}
                      style={[styles.chip, venueCategory === vc && styles.chipActive]}
                      onPress={() => setVenueCategory(vc)}
                    >
                      <Text style={[styles.chipText, venueCategory === vc && styles.chipTextActive]}>
                        {vc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Neighborhood Zone *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                  {zones.map((z) => (
                    <TouchableOpacity
                      key={z}
                      style={[styles.chip, locationZone === z && styles.chipActive]}
                      onPress={() => setLocationZone(z)}
                    >
                      <Text style={[styles.chipText, locationZone === z && styles.chipTextActive]}>
                        {z}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.row}>
                  <View style={styles.flexHalf}>
                    <Text style={styles.sectionLabel}>Date *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Saturday, Oct 19"
                      placeholderTextColor={colors.textMuted}
                      value={suggestedDate}
                      onChangeText={setSuggestedDate}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <Text style={styles.sectionLabel}>Time *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 4:30 PM"
                      placeholderTextColor={colors.textMuted}
                      value={suggestedTime}
                      onChangeText={setSuggestedTime}
                    />
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Special Spot / Note (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maverick & Farmer cafe overlooking the lake"
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                />

                <View style={styles.ctaWrapper}>
                  <PillButton
                    label={isSubmitting ? 'Sending Proposal...' : 'Propose Date Plan 💌'}
                    variant="primary"
                    size="lg"
                    onPress={handlePropose}
                    disabled={isSubmitting}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.bottomSheet,
    borderTopRightRadius: radii.bottomSheet,
    maxHeight: '90%',
    paddingTop: spacing.md,
    ...shadows.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  gateAlertContainer: {
    backgroundColor: '#FFFFFF',
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.card,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  gateTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  gateSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    borderRadius: radii.card,
    padding: spacing.md,
  },
  safetyTextWrapper: {
    flex: 1,
  },
  safetyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  safetyDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  helperText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexHalf: {
    flex: 1,
  },
  ctaWrapper: {
    marginTop: spacing.md,
  },
  detailCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: spacing.md,
    borderRadius: radii.card,
    marginVertical: spacing.sm,
  },
  detailTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  detailSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  confirmedView: {
    gap: spacing.sm,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  outcomeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radii.card,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  outcomeBtnMuted: {
    backgroundColor: 'rgba(235, 87, 87, 0.05)',
  },
  outcomeBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  outcomeTextError: {
    color: colors.destructive,
  },
  receivedProposalView: {
    gap: spacing.sm,
  },
  counterBox: {
    gap: spacing.xs,
  },
  actionRow: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flexBtn: {
    width: '100%',
  },
  counterToggleBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  counterToggleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
});
