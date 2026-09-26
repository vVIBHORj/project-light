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
import { Event, UserProfile } from '../../../domain/types';
import { useEventStore } from '../state/useEventStore';

interface PreEventSafetyCheckinModalProps {
  visible: boolean;
  event: Event;
  currentUser: UserProfile;
  onClose: () => void;
  isCheckedIn: boolean;
}

export const PreEventSafetyCheckinModal: React.FC<PreEventSafetyCheckinModalProps> = ({
  visible,
  event,
  currentUser,
  onClose,
  isCheckedIn,
}) => {
  const { checkIn } = useEventStore();
  const [enteredCode, setEnteredCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklist, setChecklist] = useState({
    publicPlace: true,
    toldFriend: true,
    emergencyReady: true,
  });

  const handleToggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSharePlan = () => {
    Alert.alert(
      'Plan Shared with Trusted Contact 🛡️',
      `Sent: "I'm attending ${event.title} in ${event.venueZone} at ${event.timeStr}."`
    );
  };

  const handlePerformCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await checkIn(event.id, currentUser.userId, enteredCode);
      if (res.success) {
        Alert.alert('Checked In! ✅', 'Welcome to the session! Enjoy connecting with your Circle.');
        onClose();
      } else {
        Alert.alert('Check-In Note', res.error || 'Check-in failed. Please verify with host.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.sheetTitle}>Pre-Event Safety & Check-In</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Unlocked Exact Address Banner */}
            <View style={styles.venueCard}>
              <View style={styles.venueHeader}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <Text style={styles.venueHeaderTitle}>Unlocked Venue Address</Text>
              </View>
              <Text style={styles.exactAddressText}>
                {event.exactAddress || `${event.venueCategory} in ${event.venueZone}`}
              </Text>
              <Text style={styles.venueNote}>
                Only confirmed attendees can see this private meeting point.
              </Text>
            </View>

            {/* Safety Reminder Checklist */}
            <Text style={styles.sectionTitle}>Safety Checklist</Text>
            <View style={styles.checklistCard}>
              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => handleToggleCheck('publicPlace')}
              >
                <Ionicons
                  name={checklist.publicPlace ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={checklist.publicPlace ? colors.primary : colors.textMuted}
                />
                <Text style={styles.checkItemText}>
                  Meeting in a broad daylight, public area
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => handleToggleCheck('toldFriend')}
              >
                <Ionicons
                  name={checklist.toldFriend ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={checklist.toldFriend ? colors.primary : colors.textMuted}
                />
                <Text style={styles.checkItemText}>
                  Shared itinerary with a friend or family member
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => handleToggleCheck('emergencyReady')}
              >
                <Ionicons
                  name={checklist.emergencyReady ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={checklist.emergencyReady ? colors.primary : colors.textMuted}
                />
                <Text style={styles.checkItemText}>
                  Project LIGHT emergency helper active on standby
                </Text>
              </TouchableOpacity>
            </View>

            {/* Share Plan CTA */}
            <TouchableOpacity style={styles.sharePlanBtn} onPress={handleSharePlan}>
              <Ionicons name="paper-plane-outline" size={16} color={colors.primary} />
              <Text style={styles.sharePlanBtnText}>Share Plan with Trusted Contact</Text>
            </TouchableOpacity>

            {/* Check-In Section */}
            <Text style={styles.sectionTitle}>Check-In at Venue</Text>
            {isCheckedIn ? (
              <View style={styles.checkedInBox}>
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text style={styles.checkedInBoxText}>
                  You are already checked in for this event.
                </Text>
              </View>
            ) : (
              <View style={styles.checkInCard}>
                <Text style={styles.checkInLabel}>
                  Enter the 4-digit code provided by host {event.hostName}:
                </Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="e.g. 3582"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={enteredCode}
                  onChangeText={setEnteredCode}
                />

                <PillButton
                  label={isSubmitting ? 'Checking In...' : 'Confirm Check-In'}
                  variant="primary"
                  size="md"
                  onPress={handlePerformCheckIn}
                  disabled={isSubmitting}
                />
              </View>
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
    maxHeight: '85%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  venueCard: {
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.18)',
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  venueHeaderTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  exactAddressText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  venueNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checklistCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkItemText: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
  },
  sharePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    borderRadius: radii.pill,
  },
  sharePlanBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  checkInCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  checkInLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    letterSpacing: 8,
    color: colors.textPrimary,
  },
  checkedInBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    padding: spacing.md,
    borderRadius: radii.card,
  },
  checkedInBoxText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: '#27AE60',
  },
});
