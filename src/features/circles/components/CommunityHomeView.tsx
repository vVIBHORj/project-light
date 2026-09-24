import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image } from 'react-native';
import {
  MapPin,
  Users,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Globe,
  PlusCircle,
  Sliders,
  Flag,
  MessageSquare,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import {
  CircleCard,
  PillButton,
  VerifiedBadge,
  colors,
  radii,
  typography,
  spacing,
  shadows,
} from '../../../design-system';
import { Community, Circle, CommunityPost } from '../../../domain/types';
import { CommunityFeedView } from './CommunityFeedView';

export interface CommunityHomeViewProps {
  community: Community;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  membershipStatus: 'none' | 'pending' | 'approved' | 'muted' | 'banned';
  circles: Circle[];
  posts: CommunityPost[];
  onBack: () => void;
  onJoinClick: () => void;
  onLeaveClick: () => void;
  onReportClick: () => void;
  onCreateCircleClick: () => void;
  onOpenModConsole: () => void;
  onSelectCircle: (circle: Circle) => void;
  onCreatePost: (content: string) => Promise<void>;
  onReportPost: (post: CommunityPost) => void;
}

export const CommunityHomeView: React.FC<CommunityHomeViewProps> = ({
  community,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  membershipStatus,
  circles,
  posts,
  onBack,
  onJoinClick,
  onLeaveClick,
  onReportClick,
  onCreateCircleClick,
  onOpenModConsole,
  onSelectCircle,
  onCreatePost,
  onReportPost,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'circles' | 'discussions'>('home');

  const isHost = community.hostId === currentUserId;
  const isMember = membershipStatus === 'approved' || isHost;
  const isPending = membershipStatus === 'pending';
  const isPrivate = community.visibility === 'private';

  // Circles inside this community
  const communityCircles = circles.filter(
    (c) => c.communityId === community.id || c.category === community.category
  );

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to directory"
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          {community.name}
        </Text>

        <View style={styles.topActionsRow}>
          {isHost && (
            <Pressable
              onPress={onOpenModConsole}
              style={styles.modBtn}
              accessibilityRole="button"
              accessibilityLabel="Moderator console"
            >
              <Sliders size={16} color={colors.primary} />
            </Pressable>
          )}

          <Pressable
            onPress={onReportClick}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="Report Community"
          >
            <Flag size={15} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Hero Cover Banner */}
      <View style={styles.coverWrapper}>
        <Image
          source={{
            uri:
              'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />

        <View style={styles.coverContent}>
          <View style={styles.badgeRow}>
            <View style={styles.visibilityPill}>
              {isPrivate ? (
                <>
                  <Lock size={10} color="#FFFFFF" />
                  <Text style={styles.visibilityText}>Private Space</Text>
                </>
              ) : (
                <>
                  <Globe size={10} color="#FFFFFF" />
                  <Text style={styles.visibilityText}>Open Community</Text>
                </>
              )}
            </View>
            <View style={styles.membersPill}>
              <Users size={11} color="#FFFFFF" />
              <Text style={styles.membersText}>{community.memberCount} members</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{community.name}</Text>
          <View style={styles.heroMetaRow}>
            <MapPin size={12} color="#BAE6FD" />
            <Text style={styles.heroMetaText}>{community.zone}</Text>
            <Text style={styles.heroDot}>•</Text>
            <Text style={styles.heroMetaText}>Host: {community.hostName}</Text>
            <VerifiedBadge size={14} style={styles.verifiedBadge} />
          </View>
        </View>
      </View>

      {/* Tabs Row: Home | Circles | Discussions */}
      <View style={styles.tabSwitcher}>
        <Pressable
          onPress={() => setActiveTab('home')}
          style={[styles.tabBtn, activeTab === 'home' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>
            Home & About
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('circles')}
          style={[styles.tabBtn, activeTab === 'circles' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'circles' && styles.tabTextActive]}>
            Circles ({communityCircles.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('discussions')}
          style={[styles.tabBtn, activeTab === 'discussions' && styles.tabBtnActive]}
        >
          <MessageSquare size={13} color={activeTab === 'discussions' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'discussions' && styles.tabTextActive]}>
            Feed
          </Text>
        </Pressable>
      </View>

      {/* TAB CONTENT */}
      {activeTab === 'discussions' ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <CommunityFeedView
            communityId={community.id}
            isMember={isMember}
            posts={posts}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            onCreatePost={onCreatePost}
            onReportPost={onReportPost}
          />
        </ScrollView>
      ) : activeTab === 'circles' ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.circlesHeaderRow}>
            <Text style={styles.sectionTitle}>Activity Circles in {community.name}</Text>
            {isMember && (
              <Pressable
                onPress={onCreateCircleClick}
                style={styles.createCircleBtn}
                accessibilityRole="button"
                accessibilityLabel="Create Circle in community"
              >
                <PlusCircle size={14} color={colors.primary} />
                <Text style={styles.createCircleBtnText}>Create Circle</Text>
              </Pressable>
            )}
          </View>

          {communityCircles.length === 0 ? (
            <View style={styles.emptyCirclesBox}>
              <Users size={28} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Circles launched yet</Text>
              <Text style={styles.emptySub}>
                Be the first member to start a small activity circle!
              </Text>
            </View>
          ) : (
            communityCircles.map((circle) => (
              <CircleCard
                key={circle.id}
                id={circle.id}
                title={circle.title}
                category={circle.category}
                locationZone={circle.locationZone}
                memberCount={circle.currentMemberCount}
                maxCapacity={circle.capacity}
                activityName={circle.activityName}
                cadence={circle.cadence}
                hostName={circle.hostName}
                reasonChips={circle.reasonChips}
                onPress={() => onSelectCircle(circle)}
              />
            ))
          )}
        </ScrollView>
      ) : (
        /* HOME TAB (About, Rules, Host Prompt, Upcoming Circles) */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Join CTA if not a member */}
          {!isMember && (
            <View style={[styles.joinPromptCard, shadows.card]}>
              <View style={styles.joinPromptHeader}>
                <Sparkles size={16} color={colors.primary} />
                <Text style={styles.joinPromptTitle}>
                  {isPrivate ? 'Private Space • Request Access' : 'Join this Community'}
                </Text>
              </View>
              <Text style={styles.joinPromptSub}>
                Connect with verified local peers, join micro-activity circles, and share experiences.
              </Text>
              <PillButton
                label={
                  isPending
                    ? 'Membership Pending Review'
                    : isPrivate
                    ? 'Request to Join Space'
                    : 'Join Community'
                }
                variant={isPending ? 'secondary' : 'primary'}
                size="md"
                onPress={onJoinClick}
                style={styles.joinBtn}
              />
            </View>
          )}

          {/* About Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>About {community.name}</Text>
            <Text style={styles.aboutText}>{community.description}</Text>
          </View>

          {/* Community Ground Rules */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <ShieldCheck size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Community Ground Rules</Text>
            </View>
            <View style={styles.rulesList}>
              {community.rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleItem}>
                  <Text style={styles.ruleNum}>{idx + 1}.</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Prompt Highlight */}
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Sparkles size={14} color="#0284C7" />
              <Text style={styles.promptTitle}>Host Weekly Prompt</Text>
            </View>
            <Text style={styles.promptText}>
              &quot;What is your favorite local spot in {community.zone} for {community.category}?&quot;
            </Text>
            <Pressable
              onPress={() => setActiveTab('discussions')}
              style={styles.replyPromptBtn}
            >
              <Text style={styles.replyPromptText}>Join Discussion</Text>
            </Pressable>
          </View>

          {/* Upcoming Circles Preview */}
          <View style={styles.sectionBlock}>
            <View style={styles.circlesHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming Activity Circles</Text>
              <Pressable onPress={() => setActiveTab('circles')}>
                <Text style={styles.seeAllText}>See all ({communityCircles.length})</Text>
              </Pressable>
            </View>

            {communityCircles.slice(0, 2).map((circle) => (
              <CircleCard
                key={circle.id}
                id={circle.id}
                title={circle.title}
                category={circle.category}
                locationZone={circle.locationZone}
                memberCount={circle.currentMemberCount}
                maxCapacity={circle.capacity}
                activityName={circle.activityName}
                cadence={circle.cadence}
                hostName={circle.hostName}
                reasonChips={circle.reasonChips}
                onPress={() => onSelectCircle(circle)}
              />
            ))}
          </View>

          {/* Member Controls (Leave option) */}
          {isMember && !isHost && (
            <View style={styles.leaveWrapper}>
              <Pressable
                onPress={onLeaveClick}
                style={styles.leaveCommunityBtn}
                accessibilityRole="button"
                accessibilityLabel="Leave community"
              >
                <LogOut size={14} color="#DC2626" />
                <Text style={styles.leaveCommunityText}>Leave Community</Text>
              </Pressable>
            </View>
          )}
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
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modBtn: {
    padding: 6,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    borderRadius: radii.pill,
  },
  actionBtn: {
    padding: 6,
  },
  coverWrapper: {
    height: 150,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  coverContent: {
    position: 'absolute',
    bottom: 12,
    left: spacing.screenPadding,
    right: spacing.screenPadding,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  visibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    gap: 4,
  },
  visibilityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  membersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    gap: 4,
  },
  membersText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.medium,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  heroMetaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: '#BAE6FD',
  },
  heroDot: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
  joinPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  joinPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  joinPromptTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  joinPromptSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  joinBtn: {
    width: '100%',
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  aboutText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  rulesList: {
    gap: 6,
    marginTop: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleNum: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    width: 18,
  },
  ruleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  promptCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: spacing.md,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  promptTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#0284C7',
  },
  promptText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 8,
  },
  replyPromptBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  replyPromptText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#0369A1',
  },
  circlesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  createCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  createCircleBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  seeAllText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyCirclesBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptySub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  leaveWrapper: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  leaveCommunityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: '#FEE2E2',
  },
  leaveCommunityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
});

export default CommunityHomeView;
