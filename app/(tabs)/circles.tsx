import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Globe,
  Plus,
  Search,
  X,
  Compass,
  Sparkles,
} from 'lucide-react-native';
import {
  GradientBackground,
  CircleCard,
  CommunityCard,
  Orb,
  Toast,
  typography,
  colors,
  spacing,
  radii,
  shadows,
} from '../../src/design-system';
import {
  useCirclesStore,
  CommunityHomeView,
  CircleDetailView,
  CommunityJoinSheet,
  CreateCommunitySheet,
  CreateCircleSheet,
  ModeratorConsoleSheet,
  ReportOrLeaveSheet,
} from '../../src/features/circles';
import { mockUsers } from '../../src/data/mocks/seedData';
import { mockSafetyRepo } from '../../src/data/mocks';
import { Circle } from '../../src/domain/types';

const communityCategories = [
  'All',
  'Photography',
  'Sports & Fitness',
  'Running',
  'Motorsport',
  'Tech & Startups',
  'Books & Literature',
];

export default function CirclesScreen() {
  const {
    activeTab,
    searchQuery,
    selectedCategory,
    selectedCommunity,
    selectedCircle,
    isJoinSheetOpen,
    isCreateCommunityOpen,
    isCreateCircleOpen,
    isModConsoleOpen,
    isReportOrLeaveOpen,
    reportOrLeaveTarget,
    communitiesList,
    circlesList,
    myCirclesList,
    communityPosts,
    pendingRequests,
    auditLogs,
    membershipStatusMap,
    setActiveTab,
    setSearchQuery,
    setSelectedCategory,
    setSelectedCommunity,
    setSelectedCircle,
    setJoinSheetOpen,
    setCreateCommunityOpen,
    setCreateCircleOpen,
    setModConsoleOpen,
    openReportOrLeave,
    closeReportOrLeave,
    loadInitialData,
    joinCircle,
    leaveCircle,
    joinCommunity,
    cancelJoinRequest,
    leaveCommunity,
    createCommunity,
    createCircle,
    createPost,
    resolveJoinRequest,
    moderateMember,
    moderatePost,
  } = useCirclesStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active current user: Aisha Rao
  const currentUser = mockUsers[0];

  useEffect(() => {
    loadInitialData(currentUser.userId);
  }, [currentUser.userId, loadInitialData]);

  // Filtered communities
  const filteredCommunities = useMemo(() => {
    return communitiesList.filter((comm) => {
      if (selectedCategory !== 'All' && comm.category !== selectedCategory) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = comm.name.toLowerCase().includes(q);
        const matchesDesc = comm.description.toLowerCase().includes(q);
        const matchesZone = comm.zone.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesZone) return false;
      }
      return true;
    });
  }, [communitiesList, selectedCategory, searchQuery]);

  // Handle Circle Join
  const handleJoinCircle = async (circle: Circle) => {
    try {
      await joinCircle(circle.id, currentUser.userId);
      setToastMessage(`Joined "${circle.title}"!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not join Circle';
      setToastMessage(msg);
    }
  };

  // Handle Circle Leave
  const handleLeaveCircle = async () => {
    if (selectedCircle) {
      await leaveCircle(selectedCircle.id, currentUser.userId);
      setToastMessage(`Left "${selectedCircle.title}".`);
    }
  };

  // Handle Community Leave
  const handleLeaveCommunity = async () => {
    if (selectedCommunity) {
      await leaveCommunity(selectedCommunity.id, currentUser.userId);
      setToastMessage(`Left "${selectedCommunity.name}".`);
    }
  };

  // Handle Submit Report
  const handleSubmitReport = async (reason: string, evidence: string) => {
    if (reportOrLeaveTarget) {
      await mockSafetyRepo.report({
        reporterId: currentUser.userId,
        targetType: reportOrLeaveTarget.type,
        targetId: reportOrLeaveTarget.id,
        category: 'other',
        evidence: `${reason} - ${evidence}`,
      });
      setToastMessage('Report submitted. Our safety team will review promptly.');
    }
  };

  // If a Circle is selected for detail view
  if (selectedCircle) {
    const isMember = selectedCircle.members.includes(currentUser.userId);
    return (
      <SafeAreaView style={styles.fullscreenSafe}>
        <CircleDetailView
          circle={selectedCircle}
          currentUserId={currentUser.userId}
          currentUserName={currentUser.displayName}
          isMember={isMember}
          onBack={() => setSelectedCircle(null)}
          onJoin={() => handleJoinCircle(selectedCircle)}
          onLeave={() =>
            openReportOrLeave({
              type: 'circle',
              id: selectedCircle.id,
              name: selectedCircle.title,
            })
          }
          onReport={() =>
            openReportOrLeave({
              type: 'circle',
              id: selectedCircle.id,
              name: selectedCircle.title,
            })
          }
        />
        <ReportOrLeaveSheet
          visible={isReportOrLeaveOpen}
          onClose={closeReportOrLeave}
          mode={reportOrLeaveTarget?.type === 'circle' ? 'leave' : 'report'}
          targetType={reportOrLeaveTarget?.type || 'circle'}
          targetId={reportOrLeaveTarget?.id || ''}
          targetName={reportOrLeaveTarget?.name || ''}
          onConfirmLeave={handleLeaveCircle}
          onSubmitReport={handleSubmitReport}
        />
      </SafeAreaView>
    );
  }

  // If a Community is selected for home view
  if (selectedCommunity) {
    const membershipStatus = membershipStatusMap[selectedCommunity.id] || 'none';
    const posts = communityPosts[selectedCommunity.id] || [];

    return (
      <SafeAreaView style={styles.fullscreenSafe}>
        <CommunityHomeView
          community={selectedCommunity}
          currentUserId={currentUser.userId}
          currentUserName={currentUser.displayName}
          currentUserAvatar={currentUser.photos[0]}
          membershipStatus={membershipStatus}
          circles={circlesList}
          posts={posts}
          onBack={() => setSelectedCommunity(null)}
          onJoinClick={() => setJoinSheetOpen(true)}
          onLeaveClick={() =>
            openReportOrLeave({
              type: 'community',
              id: selectedCommunity.id,
              name: selectedCommunity.name,
            })
          }
          onReportClick={() =>
            openReportOrLeave({
              type: 'community',
              id: selectedCommunity.id,
              name: selectedCommunity.name,
            })
          }
          onCreateCircleClick={() => setCreateCircleOpen(true)}
          onOpenModConsole={() => setModConsoleOpen(true)}
          onSelectCircle={(circle) => setSelectedCircle(circle)}
          onCreatePost={async (content) => {
            await createPost(selectedCommunity.id, currentUser.userId, currentUser.displayName, content);
          }}
          onReportPost={(post) =>
            openReportOrLeave({
              type: 'community',
              id: post.id,
              name: `Post by ${post.authorName}`,
            })
          }
        />

        {/* Community Join Sheet */}
        <CommunityJoinSheet
          visible={isJoinSheetOpen}
          onClose={() => setJoinSheetOpen(false)}
          community={selectedCommunity}
          membershipStatus={membershipStatus}
          onJoinSuccess={() => {
            setToastMessage(`Welcome to ${selectedCommunity.name}!`);
          }}
          onCancelRequest={async () => {
            await cancelJoinRequest(selectedCommunity.id, currentUser.userId);
            setToastMessage('Join request cancelled.');
          }}
          onSubmitAnswers={async (answers) => {
            await joinCommunity(
              selectedCommunity.id,
              currentUser.userId,
              currentUser.displayName,
              answers
            );
          }}
        />

        {/* Create Circle Sheet (inside community) */}
        <CreateCircleSheet
          visible={isCreateCircleOpen}
          onClose={() => setCreateCircleOpen(false)}
          communityId={selectedCommunity.id}
          communityCategory={selectedCommunity.category}
          currentUserId={currentUser.userId}
          currentUserName={currentUser.displayName}
          onCreateSuccess={(circle) => {
            setToastMessage(`Launched Circle "${circle.title}"!`);
          }}
          onSubmit={createCircle}
        />

        {/* Moderator Console Sheet */}
        <ModeratorConsoleSheet
          visible={isModConsoleOpen}
          onClose={() => setModConsoleOpen(false)}
          community={selectedCommunity}
          pendingRequests={pendingRequests[selectedCommunity.id] || []}
          auditLogs={auditLogs[selectedCommunity.id] || []}
          posts={posts}
          onApproveRequest={async (reqId) => {
            await resolveJoinRequest(reqId, currentUser.userId, 'approved');
            setToastMessage('Approved join request!');
          }}
          onRejectRequest={async (reqId) => {
            await resolveJoinRequest(reqId, currentUser.userId, 'rejected');
            setToastMessage('Declined join request.');
          }}
          onModeratePost={async (postId, action) => {
            await moderatePost(selectedCommunity.id, currentUser.userId, currentUser.displayName, postId, action);
            setToastMessage(`Post ${action === 'remove' ? 'removed' : 'hidden'}.`);
          }}
          onModerateMember={async (targetId, action) => {
            await moderateMember(selectedCommunity.id, currentUser.userId, currentUser.displayName, targetId, action);
            setToastMessage(`Member ${action}d successfully.`);
          }}
        />

        {/* Report or Leave Sheet */}
        <ReportOrLeaveSheet
          visible={isReportOrLeaveOpen}
          onClose={closeReportOrLeave}
          mode={reportOrLeaveTarget?.type === 'community' ? 'leave' : 'report'}
          targetType={reportOrLeaveTarget?.type || 'community'}
          targetId={reportOrLeaveTarget?.id || ''}
          targetName={reportOrLeaveTarget?.name || ''}
          onConfirmLeave={handleLeaveCommunity}
          onSubmitReport={handleSubmitReport}
        />
      </SafeAreaView>
    );
  }

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.titleRow}>
            <Orb size={32} pulse={false} />
            <Text style={styles.headerTitle}>Circles & Communities</Text>
          </View>

          {/* Quick Create Action */}
          <Pressable
            onPress={() =>
              activeTab === 'communities'
                ? setCreateCommunityOpen(true)
                : setCreateCircleOpen(true)
            }
            style={styles.createFab}
            accessibilityRole="button"
            accessibilityLabel={
              activeTab === 'communities' ? 'Create new Community' : 'Create new Circle'
            }
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.createFabText}>
              {activeTab === 'communities' ? 'New Space' : 'New Circle'}
            </Text>
          </Pressable>
        </View>

        {/* Glass Segmented Control: My Circles | Communities */}
        <View style={styles.segmentWrapper}>
          <View style={styles.segmentContainer}>
            <Pressable
              onPress={() => setActiveTab('my_circles')}
              style={[
                styles.segmentBtn,
                activeTab === 'my_circles' && styles.segmentBtnActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'my_circles' }}
            >
              <Users size={14} color={activeTab === 'my_circles' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'my_circles' && styles.segmentTextActive,
                ]}
              >
                My Circles ({myCirclesList.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('communities')}
              style={[
                styles.segmentBtn,
                activeTab === 'communities' && styles.segmentBtnActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'communities' }}
            >
              <Globe size={14} color={activeTab === 'communities' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'communities' && styles.segmentTextActive,
                ]}
              >
                Communities
              </Text>
            </Pressable>
          </View>
        </View>

        {/* TAB 1: MY CIRCLES */}
        {activeTab === 'my_circles' ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tabIntroBanner}>
              <Sparkles size={14} color="#0284C7" />
              <Text style={styles.tabIntroText}>
                Primary social unit: 4 to 8 people gathering weekly around a shared activity.
              </Text>
            </View>

            {myCirclesList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Users size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>You haven’t joined any Circles yet</Text>
                <Text style={styles.emptySub}>
                  Explore communities or create your own 4-8 person activity circle to start bonding weekly.
                </Text>
                <Pressable
                  onPress={() => setCreateCircleOpen(true)}
                  style={styles.emptyActionBtn}
                >
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Start a Circle</Text>
                </Pressable>
              </View>
            ) : (
              myCirclesList.map((circle) => (
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
                  onPress={() => setSelectedCircle(circle)}
                />
              ))
            )}
          </ScrollView>
        ) : (
          /* TAB 2: COMMUNITIES DIRECTORY (COMM-01) */
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Input Bar */}
            <View style={styles.searchBar}>
              <Search size={16} color="#0284C7" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search communities by name, zone, or passion..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={14} color="#64748B" />
                </Pressable>
              )}
            </View>

            {/* Category Chips Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {communityCategories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.catChip,
                    selectedCategory === cat && styles.catChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      selectedCategory === cat && styles.catChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Active filter clear indicator */}
            {(searchQuery.length > 0 || selectedCategory !== 'All') && (
              <View style={styles.filterBanner}>
                <Compass size={13} color="#0369A1" />
                <Text style={styles.filterBannerText}>
                  Filtering by: {searchQuery || selectedCategory}
                </Text>
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.filterClearLink}>Clear</Text>
                </Pressable>
              </View>
            )}

            {/* Communities Cards List */}
            {filteredCommunities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Globe size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No matching communities</Text>
                <Text style={styles.emptySub}>
                  Try clearing your search query or create a brand new community space.
                </Text>
              </View>
            ) : (
              filteredCommunities.map((comm) => (
                <CommunityCard
                  key={comm.id}
                  id={comm.id}
                  name={comm.name}
                  description={comm.description}
                  category={comm.category}
                  zone={comm.zone}
                  visibility={comm.visibility}
                  memberCount={comm.memberCount}
                  hostName={comm.hostName}
                  onPress={() => setSelectedCommunity(comm)}
                />
              ))
            )}
          </ScrollView>
        )}

        {/* Global Create Community Sheet */}
        <CreateCommunitySheet
          visible={isCreateCommunityOpen}
          onClose={() => setCreateCommunityOpen(false)}
          currentUserId={currentUser.userId}
          currentUserName={currentUser.displayName}
          onCreateSuccess={(comm) => {
            setToastMessage(`Community "${comm.name}" created!`);
            setSelectedCommunity(comm);
          }}
          onSubmit={createCommunity}
        />

        {/* Global Create Circle Sheet */}
        <CreateCircleSheet
          visible={isCreateCircleOpen}
          onClose={() => setCreateCircleOpen(false)}
          currentUserId={currentUser.userId}
          currentUserName={currentUser.displayName}
          onCreateSuccess={(circle) => {
            setToastMessage(`Circle "${circle.title}" launched!`);
            setSelectedCircle(circle);
          }}
          onSubmit={createCircle}
        />

        {/* Interactive Toast Notifications */}
        <Toast
          visible={!!toastMessage}
          message={toastMessage || ''}
          type="info"
          onDismiss={() => setToastMessage(null)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fullscreenSafe: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  createFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    gap: 4,
    ...shadows.chip,
  },
  createFabText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  segmentWrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.chip,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.chip,
  },
  segmentText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 95,
  },
  tabIntroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tabIntroText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginVertical: spacing.xs,
    ...shadows.chip,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  categoriesScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  catChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  catChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  filterBannerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: '#0369A1',
  },
  filterClearLink: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptySub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginTop: 4,
  },
  emptyActionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
