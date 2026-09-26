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
import { Avatar } from '../../../design-system/components/Avatar';
import { Event, EventAttendee, UserProfile } from '../../../domain/types';
import { useEventStore } from '../state/useEventStore';

interface PostEventRecapModalProps {
  visible: boolean;
  event: Event;
  attendees: EventAttendee[];
  currentUser: UserProfile;
  onClose: () => void;
  onConnectWithAttendee?: (attendee: EventAttendee) => void;
}

export const PostEventRecapModal: React.FC<PostEventRecapModalProps> = ({
  visible,
  event,
  attendees,
  currentUser,
  onClose,
  onConnectWithAttendee,
}) => {
  const { submitFeedback } = useEventStore();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Welcoming Vibe',
    'Safe & Comfortable',
  ]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    'Welcoming Vibe',
    'Safe & Comfortable',
    'Great Host',
    'Punctual & Organized',
    'Great Location',
    'Inspiring Discussions',
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    try {
      await submitFeedback(event.id, currentUser.userId, rating, selectedTags, comment);
      Alert.alert(
        'Feedback Submitted! ⭐',
        'Thank you for keeping Project LIGHT circles authentic, welcoming, and safe.'
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const otherAttendees = attendees.filter((a) => a.userId !== currentUser.userId);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Post-Event Recap & Feedback</Text>
              <Text style={styles.sheetSubtitle}>{event.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Who you met section */}
            <Text style={styles.sectionTitle}>People You Met Today</Text>
            <View style={styles.attendeesRow}>
              {otherAttendees.length === 0 ? (
                <Text style={styles.emptyAttendeesText}>
                  No other attendees logged in this session.
                </Text>
              ) : (
                otherAttendees.map((att) => (
                  <View key={att.userId} style={styles.attendeeChip}>
                    <Avatar
                      uri={att.userAvatar}
                      name={att.userName}
                      size={36}
                      verified={att.isVerified}
                    />
                    <View style={styles.attendeeInfo}>
                      <Text style={styles.attendeeName} numberOfLines={1}>
                        {att.userName}
                      </Text>
                    </View>
                    {onConnectWithAttendee && (
                      <TouchableOpacity
                        style={styles.connectBtn}
                        onPress={() => onConnectWithAttendee(att)}
                      >
                        <Ionicons name="person-add" size={14} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Star Rating */}
            <Text style={styles.sectionTitle}>Session Experience Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F2C94C"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Tag Badges */}
            <Text style={styles.sectionTitle}>What went well?</Text>
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, isSelected && styles.tagChipActive]}
                    onPress={() => handleToggleTag(tag)}
                  >
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Private Feedback Note */}
            <Text style={styles.sectionTitle}>Private Feedback (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share constructive feedback with the host and safety team..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            {/* Submit CTA */}
            <PillButton
              label={isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              variant="primary"
              size="lg"
              onPress={handleSubmitFeedback}
              disabled={isSubmitting}
            />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attendeesRow: {
    gap: spacing.xs,
  },
  emptyAttendeesText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
  attendeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: radii.card,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  attendeeInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  attendeeName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  connectBtn: {
    padding: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(47, 128, 237, 0.1)',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  starBtn: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  tagChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  tagChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  commentInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
