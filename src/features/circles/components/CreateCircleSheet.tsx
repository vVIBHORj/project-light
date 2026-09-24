import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Users, Calendar, AlertCircle } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';
import { mockZones } from '../../../data/mocks/seedData';
import { Circle } from '../../../domain/types';
import { CreateCircleDto } from '../../../data/repositories';

export interface CreateCircleSheetProps {
  visible: boolean;
  onClose: () => void;
  communityId?: string;
  communityCategory?: string;
  currentUserId: string;
  currentUserName: string;
  onCreateSuccess: (created: Circle) => void;
  onSubmit: (data: CreateCircleDto) => Promise<Circle>;
}

const cadenceOptions = [
  'Every Saturday morning',
  'Every Sunday morning',
  'Alternate weekends',
  'Bi-weekly Wednesday evening',
  'Monthly expedition',
  'One-off gathering',
];

export const CreateCircleSheet: React.FC<CreateCircleSheetProps> = ({
  visible,
  onClose,
  communityId,
  communityCategory,
  currentUserId,
  currentUserName,
  onCreateSuccess,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [activityName, setActivityName] = useState('');
  const [capacity, setCapacity] = useState<number>(6);
  const [cadence, setCadence] = useState(cadenceOptions[0]);
  const [zone, setZone] = useState(mockZones[0]);
  const [firstPrompt, setFirstPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a Circle title.');
      return;
    }
    if (!activityName.trim()) {
      setErrorMsg('Please specify the core activity.');
      return;
    }
    if (capacity < 4 || capacity > 8) {
      setErrorMsg('Circles must be strictly between 4 and 8 members.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const created = await onSubmit({
        communityId,
        title: title.trim(),
        activityName: activityName.trim(),
        category: communityCategory || 'Social Activity',
        capacity,
        cadence,
        locationZone: zone,
        hostId: currentUserId,
        hostName: currentUserName,
        firstPrompt: firstPrompt.trim() || undefined,
      });

      onCreateSuccess(created);
      onClose();
      // Reset
      setTitle('');
      setActivityName('');
      setFirstPrompt('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create Circle.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Create an Activity Circle"
      snapPoints={['80%']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {errorMsg && (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.introBox}>
          <Text style={styles.introText}>
            A Circle is an intimate micro-group (4 to 8 people) gathering consistently for a specific weekly activity.
          </Text>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Circle Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Indiranagar 35mm Street Shoot"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={(txt) => {
              setTitle(txt);
              if (errorMsg) setErrorMsg(null);
            }}
            maxLength={60}
          />
        </View>

        {/* Activity Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Core Activity</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 2hr Morning Shoot & Filter Coffee"
            placeholderTextColor="#94A3B8"
            value={activityName}
            onChangeText={(txt) => {
              setActivityName(txt);
              if (errorMsg) setErrorMsg(null);
            }}
            maxLength={60}
          />
        </View>

        {/* Capacity Picker (Strictly 4 to 8) */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Member Capacity</Text>
            <Text style={styles.subLabelText}>(4 to 8 for intimate bonding)</Text>
          </View>
          <View style={styles.capacityRow}>
            {[4, 5, 6, 7, 8].map((num) => (
              <Pressable
                key={num}
                onPress={() => setCapacity(num)}
                style={[
                  styles.capacityBtn,
                  capacity === num && styles.capacityBtnActive,
                ]}
              >
                <Users size={12} color={capacity === num ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.capacityText,
                    capacity === num && styles.capacityTextActive,
                  ]}
                >
                  {num}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Cadence Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Meeting Cadence</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {cadenceOptions.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setCadence(opt)}
                style={[styles.cadenceChip, cadence === opt && styles.cadenceChipActive]}
              >
                <Calendar size={12} color={cadence === opt ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.cadenceText, cadence === opt && styles.cadenceTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Location Zone */}
        <View style={styles.section}>
          <Text style={styles.label}>Zone / Meeting Area</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {mockZones.slice(0, 8).map((z) => (
              <Pressable
                key={z}
                onPress={() => setZone(z)}
                style={[styles.cadenceChip, zone === z && styles.cadenceChipActive]}
              >
                <Text style={[styles.cadenceText, zone === z && styles.cadenceTextActive]}>
                  {z}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* First Icebreaker Prompt */}
        <View style={styles.section}>
          <Text style={styles.label}>First Icebreaker Question / Prompt (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="e.g. Introduce yourself and mention your dream photography project!"
            placeholderTextColor="#94A3B8"
            value={firstPrompt}
            onChangeText={setFirstPrompt}
            multiline
            maxLength={180}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitWrapper}>
          <PillButton
            label={isSubmitting ? 'Creating Circle...' : 'Launch Circle'}
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  introBox: {
    backgroundColor: '#F0FDF4',
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: spacing.md,
  },
  introText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subLabelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  capacityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  capacityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  capacityBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  capacityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  capacityTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  cadenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  cadenceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cadenceText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  cadenceTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  submitWrapper: {
    marginTop: spacing.xs,
  },
});

export default CreateCircleSheet;
