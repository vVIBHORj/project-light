import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Circle as CircleIcon,
  ShieldCheck,
  Settings,
} from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  Avatar,
  VerifiedBadge,
  ReasonChip,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { mockCircles, mockUsers } from '../../src/data/mocks/seedData';
import { analytics } from '../../src/lib/analytics';

export default function ActiveCircleHubScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const circle = mockCircles.find((c) => c.id === id) || mockCircles[0];
  const [isRsvped, setIsRsvped] = useState(true);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Confirm arrival time for morning briefing', done: true },
    { id: 2, text: 'Bring spare 35mm film roll or digital SD card', done: false },
    { id: 3, text: 'Review Indiranagar cafe route map', done: false },
  ]);

  React.useEffect(() => {
    analytics.track('circle_viewed', { circle_id: circle.id, source: 'home_hub' });
  }, [circle.id]);

  const toggleChecklistItem = (itemId: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  };

  const handleRsvpToggle = () => {
    setIsRsvped(!isRsvped);
    if (!isRsvped) {
      analytics.track('circle_joined', { circle_id: circle.id, source: 'circle_hub' });
    }
  };

  const circleMembers = mockUsers.slice(0, circle.currentMemberCount);

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSub}>HOME-02 • ACTIVE CIRCLE HUB</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{circle.title}</Text>
          </View>
          <Pressable
            style={styles.settingsBtn}
            accessibilityLabel="Circle settings"
          >
            <Settings size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Main Hero Card */}
          <GlassCard style={styles.heroCard}>
            <View style={styles.tagRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{circle.category}</Text>
              </View>
              <View style={styles.capacityBadge}>
                <Users size={13} color={colors.primary} />
                <Text style={styles.capacityText}>
                  {circle.currentMemberCount}/{circle.capacity} members
                </Text>
              </View>
            </View>

            <Text style={styles.circleTitle}>{circle.title}</Text>
            <Text style={styles.activityDesc}>Activity: {circle.activityName}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{circle.locationZone}</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{circle.cadence}</Text>
              </View>
            </View>

            {/* Host info */}
            <View style={styles.hostRow}>
              <Text style={styles.hostLabel}>Hosted by</Text>
              <Text style={styles.hostName}>{circle.hostName}</Text>
              <VerifiedBadge size={16} />
            </View>

            <View style={styles.reasonsRow}>
              {circle.reasonChips.map((chip, idx) => (
                <ReasonChip key={idx} label={chip} highlight={idx === 0} />
              ))}
            </View>
          </GlassCard>

          {/* Next Meet RSVP Card */}
          <GlassCard style={styles.meetCard}>
            <View style={styles.meetHeaderRow}>
              <View style={styles.meetIconBox}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <View style={styles.meetInfo}>
                <Text style={styles.meetTitle}>Next Circle Meetup</Text>
                <Text style={styles.meetTime}>This Saturday • 8:00 AM – 10:00 AM</Text>
                <Text style={styles.meetVenue}>Indiranagar 12th Main Metro Station (Exit A)</Text>
              </View>
            </View>

            <PillButton
              label={isRsvped ? '✓ RSVP Confirmed (Attending)' : 'RSVP for Meetup'}
              variant={isRsvped ? 'secondary' : 'primary'}
              onPress={handleRsvpToggle}
              style={{ marginTop: spacing.xs }}
            />
          </GlassCard>

          {/* Prompt of the Week (Icebreaker) */}
          <GlassCard style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Sparkles size={16} color={colors.intent.dating} />
              <Text style={styles.promptHeaderTitle}>PROMPT OF THE WEEK</Text>
            </View>
            <Text style={styles.promptQuestion}>
              &quot;What is one piece of equipment or hobby tool you couldn&apos;t live without?&quot;
            </Text>
            <View style={styles.promptAnswerPreview}>
              <Avatar uri={mockUsers[0].photos[0]} size={28} />
              <Text style={styles.promptAnswerText} numberOfLines={2}>
                <Text style={styles.boldText}>Aisha:</Text> &quot;My grandfather&apos;s 1978 Canon AE-1 with a 50mm f/1.8 prime lens!&quot;
              </Text>
            </View>
          </GlassCard>

          {/* Members in this Circle */}
          <GlassCard style={styles.membersCard}>
            <View style={styles.membersHeader}>
              <Text style={styles.sectionHeading}>Circle Members ({circleMembers.length})</Text>
              <Text style={styles.verifiedCountText}>
                <ShieldCheck size={12} color={colors.intent.friendship} /> All 18+ verified
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
              {circleMembers.map((member) => (
                <View key={member.userId} style={styles.memberAvatarWrap}>
                  <Avatar uri={member.photos[0]} name={member.displayName} size={50} verified={member.isVerified} />
                  <Text style={styles.memberName} numberOfLines={1}>{member.displayName.split(' ')[0]}</Text>
                  <Text style={styles.memberZone}>{member.zone}</Text>
                </View>
              ))}
            </ScrollView>
          </GlassCard>

          {/* Circle Chat Quick Entry */}
          <GlassCard style={styles.chatCard}>
            <View style={styles.chatHeader}>
              <MessageCircle size={18} color={colors.primary} />
              <Text style={styles.sectionHeading}>Latest Circle Chat</Text>
            </View>
            <Text style={styles.chatPreviewText}>
              <Text style={styles.boldText}>Rohan:</Text> &quot;See you all near the cafe steps on Saturday morning!&quot;
            </Text>
            <PillButton
              label="Open Circle Chat"
              variant="primary"
              size="sm"
              icon={<MessageCircle size={16} color={colors.textOnDark} />}
              onPress={() => router.push('/(tabs)/messages')}
              style={{ marginTop: spacing.xs }}
            />
          </GlassCard>

          {/* Activity Preparation Checklist */}
          <GlassCard style={styles.checklistCard}>
            <Text style={styles.sectionHeading}>Activity Checklist</Text>
            <View style={styles.checklistItems}>
              {checklist.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => toggleChecklistItem(item.id)}
                  style={styles.checkItemRow}
                >
                  {item.done ? (
                    <CheckCircle2 size={18} color={colors.intent.friendship} />
                  ) : (
                    <CircleIcon size={18} color={colors.textMuted} />
                  )}
                  <Text style={[styles.checkItemText, item.done && styles.checkItemTextDone]}>
                    {item.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
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
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  heroCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#DDEBFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  categoryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  capacityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  circleTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
  },
  activityDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11, 15, 26, 0.06)',
  },
  hostLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  hostName: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  meetCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    gap: spacing.sm,
  },
  meetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meetIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: '#DDEBFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetInfo: {
    flex: 1,
  },
  meetTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  meetTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 1,
  },
  meetVenue: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  promptCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 240, 243, 0.85)',
    gap: 6,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptHeaderTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.intent.dating,
    letterSpacing: 0.8,
  },
  promptQuestion: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  promptAnswerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: radii.md,
    padding: spacing.xs,
    gap: spacing.xs,
    marginTop: 4,
  },
  promptAnswerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  membersCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.sm,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  verifiedCountText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.intent.friendship,
  },
  membersScroll: {
    gap: spacing.md,
    paddingVertical: 4,
  },
  memberAvatarWrap: {
    alignItems: 'center',
    width: 60,
  },
  memberName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  memberZone: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textSecondary,
  },
  chatCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.xs,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatPreviewText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: 4,
  },
  checklistCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.sm,
  },
  checklistItems: {
    gap: spacing.xs,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkItemText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  checkItemTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
});
