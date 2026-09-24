import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  Sparkles,
  UserPlus,
  X,
  ShieldAlert,
  Star,
  CheckCircle2,
} from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  Avatar,
  VerifiedBadge,
  Toast,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { mockUsers } from '../../src/data/mocks/seedData';
import { analytics } from '../../src/lib/analytics';

interface FollowUpCandidate {
  userId: string;
  name: string;
  photo: string;
  zone: string;
  sharedInterests: string[];
  status: 'pending' | 'connected' | 'dismissed' | 'reported';
}

export default function PostEventFollowupScreen() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<FollowUpCandidate[]>([
    {
      userId: 'user_3',
      name: 'Pooja Iyer',
      photo: mockUsers[2].photos[0],
      zone: 'Jayanagar',
      sharedInterests: ['Indie Music', 'Film & Cinema'],
      status: 'pending',
    },
    {
      userId: 'user_4',
      name: 'Vikram Nair',
      photo: mockUsers[3].photos[0],
      zone: 'HSR Layout',
      sharedInterests: ['Board Games (Strategy)', 'Trail Running'],
      status: 'pending',
    },
  ]);

  const [rating, setRating] = useState<number>(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAction = (userId: string, action: 'connected' | 'dismissed' | 'reported') => {
    setCandidates((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, status: action } : c))
    );

    if (action === 'connected') {
      analytics.track('connection_sent', { recipient_id: userId, intent: 'friendship', context: 'post_event_followup' });
      setToastMsg('Connection request sent! Mutual consent unlocks 1:1 chat.');
    } else if (action === 'dismissed') {
      analytics.track('connection_removed', { connection_id: userId, reason_optional: 'not_now' });
      setToastMsg('Dismissed without penalty. You won’t be asked again.');
    } else {
      analytics.track('report_submitted', { target_type: 'user', category: 'boundary_concern' });
      setToastMsg('Report submitted to safety moderation team.');
    }
  };

  const submitEventFeedback = () => {
    setFeedbackSubmitted(true);
    analytics.track('event_followup_completed', { event_id: 'event_1', outcome: `rating_${rating}` });
    setToastMsg('Thank you! Private feedback helps maintain safe, high-quality Circles.');
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSub}>HOME-03 • POST-EVENT FOLLOW-UP</Text>
            <Text style={styles.headerTitle}>Indiranagar Photo Walk</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Event Recap Header */}
          <GlassCard style={styles.recapCard}>
            <View style={styles.recapTop}>
              <Calendar size={18} color={colors.primary} />
              <Text style={styles.recapDate}>Met on Saturday morning • Indiranagar</Text>
            </View>
            <Text style={styles.recapTitle}>Did you meet people you’d like to stay in touch with?</Text>
            <Text style={styles.recapSub}>
              Connect with fellow attendees to unlock 1:1 direct messages and future Circle invites.
            </Text>
          </GlassCard>

          {/* Attendees to Stay in Touch With */}
          <Text style={styles.sectionTitle}>ATTENDEES FROM THIS MEETUP</Text>

          {candidates.map((candidate) => (
            <GlassCard key={candidate.userId} style={styles.candidateCard}>
              <View style={styles.candidateRow}>
                <Avatar uri={candidate.photo} size={50} name={candidate.name} verified />
                <View style={styles.candidateInfo}>
                  <View style={styles.candidateNameRow}>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <VerifiedBadge size={14} />
                  </View>
                  <Text style={styles.candidateZone}>{candidate.zone}</Text>
                  <Text style={styles.sharedText}>
                    Shared: {candidate.sharedInterests.join(' • ')}
                  </Text>
                </View>
              </View>

              {candidate.status === 'pending' ? (
                <View style={styles.actionsRow}>
                  <PillButton
                    label="Connect"
                    variant="primary"
                    size="sm"
                    icon={<UserPlus size={14} color={colors.textOnDark} />}
                    onPress={() => handleAction(candidate.userId, 'connected')}
                    style={{ flex: 1.2 }}
                  />
                  <PillButton
                    label="Not now"
                    variant="secondary"
                    size="sm"
                    icon={<X size={14} color={colors.textSecondary} />}
                    onPress={() => handleAction(candidate.userId, 'dismissed')}
                    style={{ flex: 1 }}
                  />
                  <Pressable
                    onPress={() => handleAction(candidate.userId, 'reported')}
                    style={styles.reportBtn}
                    accessibilityLabel="Report issue"
                  >
                    <ShieldAlert size={16} color={colors.destructive} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.statusConfirmed}>
                  <CheckCircle2 size={16} color={colors.intent.friendship} />
                  <Text style={styles.statusConfirmedText}>
                    {candidate.status === 'connected' ? 'Connection Request Sent' : candidate.status === 'dismissed' ? 'Dismissed' : 'Reported'}
                  </Text>
                </View>
              )}
            </GlassCard>
          ))}

          {/* Event Feedback Prompt */}
          <GlassCard style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Sparkles size={16} color={colors.intent.dating} />
              <Text style={styles.feedbackTitle}>Private Host & Venue Feedback</Text>
            </View>
            <Text style={styles.feedbackSub}>
              How was the group dynamic and location? Your rating is confidential.
            </Text>

            {!feedbackSubmitted ? (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                    <Star
                      size={28}
                      color={star <= rating ? '#F59E0B' : colors.textMuted}
                      fill={star <= rating ? '#F59E0B' : 'transparent'}
                    />
                  </Pressable>
                ))}
                <PillButton
                  label="Submit Rating"
                  size="sm"
                  variant="primary"
                  onPress={submitEventFeedback}
                  style={{ marginLeft: spacing.sm }}
                />
              </View>
            ) : (
              <View style={styles.feedbackSubmittedRow}>
                <CheckCircle2 size={18} color={colors.intent.friendship} />
                <Text style={styles.feedbackSubmittedText}>Feedback recorded. Thank you!</Text>
              </View>
            )}
          </GlassCard>
        </ScrollView>

        <Toast
          visible={Boolean(toastMsg)}
          message={toastMsg || ''}
          type="success"
          onDismiss={() => setToastMsg(null)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  recapCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: 4,
  },
  recapTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recapDate: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  recapTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 2,
  },
  recapSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  candidateCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.sm,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  candidateName: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  candidateZone: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  sharedText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  reportBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 8,
    borderRadius: radii.sm,
  },
  statusConfirmedText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    fontSize: 12,
    color: colors.intent.friendship,
  },
  feedbackCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  feedbackSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  starBtn: {
    padding: 4,
  },
  feedbackSubmittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  feedbackSubmittedText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    fontSize: 13,
    color: colors.intent.friendship,
  },
});
