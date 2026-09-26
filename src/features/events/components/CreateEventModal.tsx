import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { PillButton } from '../../../design-system/components/PillButton';
import { UserProfile, PriceBand } from '../../../domain/types';
import { useEventStore } from '../state/useEventStore';

interface CreateEventModalProps {
  visible: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onEventCreated?: (eventId: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  currentUser,
  onClose,
  onEventCreated,
}) => {
  const {
    createDraft,
    isSubmittingEvent,
    saveCreateDraft,
    submitCreateEvent,
  } = useEventStore();

  const [title, setTitle] = useState(createDraft.title || '');
  const [description, setDescription] = useState(createDraft.description || '');
  const [activityType, setActivityType] = useState(createDraft.activityType || 'Street Photography');
  const [dateStr, setDateStr] = useState(createDraft.dateStr || 'This Saturday');
  const [timeStr, setTimeStr] = useState(createDraft.timeStr || '8:00 AM - 10:00 AM');
  const [locationZone, setLocationZone] = useState(createDraft.locationZone || currentUser.zone || 'Indiranagar');
  const [venueCategory, setVenueCategory] = useState(createDraft.venueCategory || 'Public Street Walk');
  const [exactAddress, setExactAddress] = useState(createDraft.exactAddress || '');
  const [capacity, setCapacity] = useState(createDraft.capacity || 6);
  const [priceBand, setPriceBand] = useState<PriceBand | string>(createDraft.priceBand || 'Free');

  const activityOptions = [
    'Street Photography',
    'Badminton',
    'Running',
    'Board Games',
    'Formula 1',
    'Artisan Coffee Tasting',
    'Book Reading',
  ];

  const venueCategories = [
    'Public Street Walk',
    'Public Botanical Park',
    'Specialty Cafe',
    'Indoor Sports Arena',
    'Board Game Cafe',
    'Art Gallery',
  ];

  const zones = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Cubbon Park', 'Jayanagar', 'Whitefield'];
  const priceOptions: PriceBand[] = ['Free', 'Split cost', 'Under ₹500'];

  const handleFieldChange = (field: string, val: unknown) => {
    saveCreateDraft({ [field]: val });
  };

  const handleCapacityChange = (delta: number) => {
    const next = Math.min(12, Math.max(4, capacity + delta));
    setCapacity(next);
    handleFieldChange('capacity', next);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a descriptive title for your event.');
      return;
    }
    if (!exactAddress.trim()) {
      Alert.alert(
        'Missing Venue Address',
        'Please provide the venue address. It is kept private and revealed only to confirmed attendees.'
      );
      return;
    }

    const created = await submitCreateEvent(currentUser);
    if (created) {
      Alert.alert('Event Created! 🎉', 'Your session has been published to the Circle directory.');
      if (onEventCreated) {
        onEventCreated(created.id);
      }
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Host an Event</Text>
              <Text style={styles.sheetSubtitle}>
                Small group gathering (4 to 12 members)
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
            {/* Safety Banner */}
            <View style={styles.safetyCallout}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.safetyCalloutText}>
                Public venues are strongly recommended. Exact address is shared only with confirmed attendees.
              </Text>
            </View>

            {/* Title & Description */}
            <Text style={styles.sectionLabel}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Indiranagar Golden Hour 35mm Walk"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                handleFieldChange('title', t);
              }}
            />

            <Text style={styles.sectionLabel}>What to expect (Description)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the plan, what to bring, and expectations..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={(d) => {
                setDescription(d);
                handleFieldChange('description', d);
              }}
            />

            {/* Activity Type */}
            <Text style={styles.sectionLabel}>Activity Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {activityOptions.map((act) => (
                <TouchableOpacity
                  key={act}
                  style={[styles.chip, activityType === act && styles.chipActive]}
                  onPress={() => {
                    setActivityType(act);
                    handleFieldChange('activityType', act);
                  }}
                >
                  <Text style={[styles.chipText, activityType === act && styles.chipTextActive]}>
                    {act}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date & Time */}
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Text style={styles.sectionLabel}>Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Saturday, Oct 12"
                  placeholderTextColor={colors.textMuted}
                  value={dateStr}
                  onChangeText={(d) => {
                    setDateStr(d);
                    handleFieldChange('dateStr', d);
                  }}
                />
              </View>
              <View style={styles.flexHalf}>
                <Text style={styles.sectionLabel}>Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 8:00 AM - 10:00 AM"
                  placeholderTextColor={colors.textMuted}
                  value={timeStr}
                  onChangeText={(t) => {
                    setTimeStr(t);
                    handleFieldChange('timeStr', t);
                  }}
                />
              </View>
            </View>

            {/* Zone & Venue Category */}
            <Text style={styles.sectionLabel}>Neighborhood Zone *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {zones.map((z) => (
                <TouchableOpacity
                  key={z}
                  style={[styles.chip, locationZone === z && styles.chipActive]}
                  onPress={() => {
                    setLocationZone(z);
                    handleFieldChange('locationZone', z);
                  }}
                >
                  <Text style={[styles.chipText, locationZone === z && styles.chipTextActive]}>
                    {z}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Public Venue Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {venueCategories.map((vc) => (
                <TouchableOpacity
                  key={vc}
                  style={[styles.chip, venueCategory === vc && styles.chipActive]}
                  onPress={() => {
                    setVenueCategory(vc);
                    handleFieldChange('venueCategory', vc);
                  }}
                >
                  <Text style={[styles.chipText, venueCategory === vc && styles.chipTextActive]}>
                    {vc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Exact Address / Meeting Spot * (Private)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Exit A, Indiranagar Metro Station (Outside Blue Tokai)"
              placeholderTextColor={colors.textMuted}
              value={exactAddress}
              onChangeText={(ea) => {
                setExactAddress(ea);
                handleFieldChange('exactAddress', ea);
              }}
            />

            {/* Capacity & Price Band */}
            <View style={styles.capacitySection}>
              <View>
                <Text style={styles.sectionLabel}>Capacity (4 to 12 Members)</Text>
                <Text style={styles.helperText}>Small gatherings foster genuine connections</Text>
              </View>
              <View style={styles.stepperWrapper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, capacity <= 4 && styles.stepperBtnDisabled]}
                  onPress={() => handleCapacityChange(-1)}
                  disabled={capacity <= 4}
                >
                  <Ionicons name="remove" size={16} color={capacity <= 4 ? colors.textMuted : colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{capacity}</Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, capacity >= 12 && styles.stepperBtnDisabled]}
                  onPress={() => handleCapacityChange(1)}
                  disabled={capacity >= 12}
                >
                  <Ionicons name="add" size={16} color={capacity >= 12 ? colors.textMuted : colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Cost / Expense Model *</Text>
            <View style={styles.priceRow}>
              {priceOptions.map((po) => (
                <TouchableOpacity
                  key={po}
                  style={[styles.priceBtn, priceBand === po && styles.priceBtnActive]}
                  onPress={() => {
                    setPriceBand(po);
                    handleFieldChange('priceBand', po);
                  }}
                >
                  <Text style={[styles.priceBtnText, priceBand === po && styles.priceBtnTextActive]}>
                    {po}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <View style={styles.ctaWrapper}>
              <PillButton
                label={isSubmittingEvent ? 'Publishing Event...' : 'Publish Event'}
                variant="primary"
                size="lg"
                onPress={handleSubmit}
                disabled={isSubmittingEvent}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  safetyCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    padding: spacing.sm,
    borderRadius: radii.card,
    marginBottom: spacing.sm,
  },
  safetyCalloutText: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
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
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
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
  capacitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: spacing.md,
    borderRadius: radii.card,
    marginVertical: spacing.xs,
  },
  helperText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  stepperWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperVal: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  priceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.card,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
  },
  priceBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  priceBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  ctaWrapper: {
    marginTop: spacing.md,
  },
});
