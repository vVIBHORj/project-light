import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { MapPin, Users, Calendar, ArrowLeft, MessageCircle, LogOut, CheckCircle2, Flag } from 'lucide-react-native';
import {
  PillButton,
  VerifiedBadge,
  ReasonChip,
  Avatar,
  colors,
  radii,
  typography,
  spacing,
  shadows,
} from '../../../design-system';
import { Circle, UserProfile } from '../../../domain/types';
import { SharedChatView, ChatMessageItem } from './SharedChatView';
import { mockUsers } from '../../../data/mocks/seedData';

export interface CircleDetailViewProps {
  circle: Circle;
  currentUserId: string;
  currentUserName: string;
  isMember: boolean;
  onBack: () => void;
  onJoin: () => Promise<void>;
  onLeave: () => void;
  onReport: () => void;
}

export const CircleDetailView: React.FC<CircleDetailViewProps> = ({
  circle,
  currentUserId,
  currentUserName,
  isMember,
  onBack,
  onJoin,
  onLeave,
  onReport,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [isJoining, setIsJoining] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'm1',
      senderId: 'user_1',
      senderName: 'Aisha Rao',
      senderAvatar: mockUsers[0].photos[0],
      body: `Welcome everyone to ${circle.title}! Let’s coordinate our weekend meetup.`,
      timeStr: 'Yesterday',
      isSelf: currentUserId === 'user_1',
    },
    {
      id: 'm2',
      senderId: 'user_3',
      senderName: 'Pooja Iyer',
      senderAvatar: mockUsers[2].photos[0],
      body: 'Can’t wait! I will bring extra 35mm film rolls.',
      timeStr: '8:30 AM',
      isSelf: currentUserId === 'user_3',
    },
  ]);

  const spotsLeft = Math.max(0, circle.capacity - circle.currentMemberCount);
  const isFull = spotsLeft === 0;

  // Resolve members from seed users
  const memberProfiles: UserProfile[] = circle.members
    .map((mId) => mockUsers.find((u) => u.userId === mId))
    .filter((u): u is UserProfile => !!u);

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      body: text,
      timeStr: 'Just now',
      isSelf: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleJoinClick = async () => {
    setIsJoining(true);
    try {
      await onJoin();
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to circles"
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {circle.title}
        </Text>
        <Pressable
          onPress={onReport}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Report Circle"
        >
          <Flag size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Segment Switcher: Overview | Circle Chat */}
      <View style={styles.tabSwitcher}>
        <Pressable
          onPress={() => setActiveTab('overview')}
          style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview & Meets
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('chat')}
          style={[styles.tabBtn, activeTab === 'chat' && styles.tabBtnActive]}
        >
          <MessageCircle size={13} color={activeTab === 'chat' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            Circle Chat ({messages.length})
          </Text>
        </Pressable>
      </View>

      {/* MAIN VIEW CONTENT */}
      {activeTab === 'chat' ? (
        isMember ? (
          <View style={styles.chatWrapper}>
            <SharedChatView
              title={circle.title}
              subtitle="Coordinate meetups and share updates with your Circle."
              currentUserId={currentUserId}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </View>
        ) : (
          <View style={styles.nonMemberChatBox}>
            <Text style={styles.nonMemberChatTitle}>Circle Chat is Member-Only</Text>
            <Text style={styles.nonMemberChatSub}>
              Join this Circle to access group chats and weekly meetup coordination.
            </Text>
            <PillButton
              label={isFull ? 'Circle is Full' : 'Join Circle to Chat'}
              variant="primary"
              size="md"
              disabled={isFull || isJoining}
              onPress={handleJoinClick}
              style={styles.joinChatBtn}
            />
          </View>
        )
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={[styles.headerCard, shadows.card]}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{circle.category}</Text>
            </View>
            <Text style={styles.circleTitle}>{circle.title}</Text>
            <Text style={styles.activityText}>Activity: {circle.activityName}</Text>

            <View style={styles.hostRow}>
              <Text style={styles.hostLabel}>Hosted by {circle.hostName}</Text>
              <VerifiedBadge size={16} style={styles.verifiedBadge} />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={13} color={colors.primary} />
                <Text style={styles.metaText}>{circle.locationZone}</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={13} color={colors.primary} />
                <Text style={styles.metaText}>{circle.cadence}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={13} color={colors.primary} />
                <Text style={styles.metaText}>
                  {circle.currentMemberCount}/{circle.capacity} members
                </Text>
              </View>
            </View>
          </View>

          {/* Reason Chips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why this Circle aligns with you</Text>
            <View style={styles.chipsRow}>
              {circle.reasonChips.map((chip, idx) => (
                <ReasonChip key={idx} label={chip} highlight={idx === 0} />
              ))}
            </View>
          </View>

          {/* Members List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Members ({memberProfiles.length}/{circle.capacity})
            </Text>
            <View style={styles.membersGrid}>
              {memberProfiles.map((member) => (
                <View key={member.userId} style={styles.memberItem}>
                  <Avatar
                    name={member.displayName}
                    size={44}
                    uri={member.photos[0]}
                    variant="roundedSquare"
                  />
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.displayName.split(' ')[0]}
                  </Text>
                  <Text style={styles.memberZone} numberOfLines={1}>
                    {member.zone}
                  </Text>
                </View>
              ))}

              {/* Open spot slots */}
              {Array.from({ length: spotsLeft }).map((_, idx) => (
                <View key={`open_${idx}`} style={styles.openSpotItem}>
                  <View style={styles.openSpotCircle}>
                    <Users size={16} color="#94A3B8" />
                  </View>
                  <Text style={styles.openSpotText}>Open spot</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Next Meetup Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Meetup</Text>
            <View style={styles.meetupCard}>
              <View style={styles.meetupHeader}>
                <Calendar size={15} color="#0284C7" />
                <Text style={styles.meetupTitle}>Next Gathering: This Saturday</Text>
              </View>
              <Text style={styles.meetupTime}>7:30 AM - 9:30 AM</Text>
              <Text style={styles.meetupLocation}>
                Location: {circle.locationZone} (Coffee shop meetup point)
              </Text>
              <Text style={styles.meetupNote}>
                Coffee & casual photo walk around the neighborhood. Low pressure, relaxed pace.
              </Text>
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.footerCTA}>
            {isMember ? (
              <View style={styles.memberActionsRow}>
                <View style={styles.memberBadge}>
                  <CheckCircle2 size={15} color="#16A34A" />
                  <Text style={styles.memberBadgeText}>You are a Member</Text>
                </View>
                <Pressable
                  onPress={onLeave}
                  style={styles.leaveBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Leave Circle"
                >
                  <LogOut size={14} color="#DC2626" />
                  <Text style={styles.leaveBtnText}>Leave Circle</Text>
                </Pressable>
              </View>
            ) : (
              <PillButton
                label={isFull ? 'Circle is Full' : isJoining ? 'Joining...' : 'Join Circle'}
                variant="primary"
                size="lg"
                disabled={isFull || isJoining}
                onPress={handleJoinClick}
              />
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  actionBtn: {
    padding: 6,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 95,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  categoryPill: {
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: 6,
  },
  categoryPillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  circleTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  activityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  hostLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  verifiedBadge: {
    marginLeft: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberItem: {
    alignItems: 'center',
    width: 62,
  },
  memberName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  memberZone: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    color: colors.textMuted,
  },
  openSpotItem: {
    alignItems: 'center',
    width: 62,
  },
  openSpotCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  openSpotText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },
  meetupCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  meetupTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: '#0369A1',
  },
  meetupTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  meetupLocation: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meetupNote: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 15,
  },
  footerCTA: {
    marginTop: spacing.md,
  },
  memberActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  memberBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#16A34A',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#FEE2E2',
  },
  leaveBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
  chatWrapper: {
    flex: 1,
    padding: spacing.screenPadding,
    paddingBottom: 90,
  },
  nonMemberChatBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: 8,
  },
  nonMemberChatTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  nonMemberChatSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 16,
  },
  joinChatBtn: {
    marginTop: spacing.xs,
  },
});

export default CircleDetailView;
