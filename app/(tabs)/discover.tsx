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
  Search,
  X,
  SlidersHorizontal,
  Bookmark,
  Radio,
  List,
  Sparkles,
  Users,
  Compass,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';
import {
  GradientBackground,
  RadarView,
  PersonCard,
  CircleCard,
  EventCard,
  PillButton,
  GlassCard,
  Toast,
  typography,
  colors,
  spacing,
  radii,
  shadows,
} from '../../src/design-system';
import {
  useDiscoverStore,
  rankingService,
  CandidateUser,
  CandidateCircle,
  CandidateEvent,
  RecommendationExplanationSheet,
  DiscoveryFilterSheet,
  FeedbackReasonSheet,
  SavedQueueSheet,
  CircleDetailSheet,
  InterestExploreSection,
  FeedbackReason,
} from '../../src/features/discover';
import { mockUsers, mockCircles, mockEvents } from '../../src/data/mocks/seedData';
import { mockSafetyRepo } from '../../src/data/mocks';
import { Circle } from '../../src/domain/types';
import {
  ConnectRequestSheet,
  useConnectionsStore,
} from '../../src/features/connections';

export default function DiscoverScreen() {
  const {
    viewMode,
    activeFilterTab,
    searchQuery,
    filters,
    savedItems,
    dismissedItems,
    selectedExplanationUser,
    selectedExplanationCircle,
    selectedCircleDetail,
    selectedCandidateForFeedback,
    isFilterSheetOpen,
    isExplanationSheetOpen,
    isCircleDetailSheetOpen,
    isFeedbackSheetOpen,
    isQueueSheetOpen,
    setViewMode,
    setActiveFilterTab,
    setSearchQuery,
    setFilters,
    clearFilters,
    saveItem,
    unsaveItem,
    dismissWithFeedback,
    openExplanation,
    closeExplanation,
    openCircleDetail,
    closeCircleDetail,
    openFeedbackSheet,
    closeFeedbackSheet,
    setFilterSheetOpen,
    setQueueSheetOpen,
    logAnalytics,
  } = useDiscoverStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedInterestTag, setSelectedInterestTag] = useState<string>('');
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Current active user (e.g. Aisha Rao)
  const currentUser = mockUsers[0];

  useEffect(() => {
    logAnalytics('discover_viewed', { initialMode: viewMode });
    mockSafetyRepo.getBlockedUsers().then((blocked) => setBlockedUsers(blocked));
  }, [logAnalytics, viewMode]);

  // Combined search query with selected interest tag
  const effectiveSearchQuery = selectedInterestTag || searchQuery;

  // Filter & Rank Candidates
  const dismissedSet = useMemo(
    () => new Set(dismissedItems.map((d) => d.targetId)),
    [dismissedItems]
  );

  const rankedProfiles: CandidateUser[] = useMemo(() => {
    const raw = rankingService.rankProfiles(
      currentUser,
      mockUsers,
      blockedUsers,
      { ...filters, searchQuery: effectiveSearchQuery }
    );
    return raw.filter((c) => !dismissedSet.has(c.profile.userId));
  }, [currentUser, blockedUsers, filters, effectiveSearchQuery, dismissedSet]);

  const rankedCircles: CandidateCircle[] = useMemo(() => {
    const raw = rankingService.rankCircles(
      currentUser,
      mockCircles,
      { ...filters, searchQuery: effectiveSearchQuery }
    );
    return raw.filter((c) => !dismissedSet.has(c.circle.id));
  }, [currentUser, filters, effectiveSearchQuery, dismissedSet]);

  const rankedEvents: CandidateEvent[] = useMemo(() => {
    const raw = rankingService.rankEvents(
      currentUser,
      mockEvents,
      { ...filters, searchQuery: effectiveSearchQuery }
    );
    return raw.filter((e) => !dismissedSet.has(e.event.id));
  }, [currentUser, filters, effectiveSearchQuery, dismissedSet]);

  // Transform circles into Radar bubble pins (NEVER plot people, privacy safe)
  const radarBubbles = useMemo(() => {
    const bubbles = [];

    // Circle 1: Indiranagar 35mm (band 1: within 2km)
    if (mockCircles[0] && !dismissedSet.has(mockCircles[0].id)) {
      bubbles.push({
        id: mockCircles[0].id,
        type: 'circle' as const,
        name: mockCircles[0].title,
        hostName: mockCircles[0].hostName,
        category: mockCircles[0].category,
        distanceBand: 'Within 2 km' as const,
        bandIndex: 1 as const,
        angleDegree: 45,
        spotsLeftOrMembersText: `${mockCircles[0].capacity - mockCircles[0].currentMemberCount} spots left`,
        coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&auto=format&fit=crop&q=80',
        zone: mockCircles[0].locationZone,
      });
    }

    // Circle 2: Weekend Badminton (band 2: 2 to 5km)
    if (mockCircles[1] && !dismissedSet.has(mockCircles[1].id)) {
      bubbles.push({
        id: mockCircles[1].id,
        type: 'circle' as const,
        name: mockCircles[1].title,
        hostName: mockCircles[1].hostName,
        category: mockCircles[1].category,
        distanceBand: '2 to 5 km' as const,
        bandIndex: 2 as const,
        angleDegree: 160,
        spotsLeftOrMembersText: 'Full',
        coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&auto=format&fit=crop&q=80',
        zone: mockCircles[1].locationZone,
      });
    }

    // Circle 3: F1 Race Weekend (band 2: 2 to 5km)
    if (mockCircles[2] && !dismissedSet.has(mockCircles[2].id)) {
      bubbles.push({
        id: mockCircles[2].id,
        type: 'circle' as const,
        name: mockCircles[2].title,
        hostName: mockCircles[2].hostName,
        category: mockCircles[2].category,
        distanceBand: '2 to 5 km' as const,
        bandIndex: 2 as const,
        angleDegree: 280,
        spotsLeftOrMembersText: '1 spot left',
        coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&auto=format&fit=crop&q=80',
        zone: mockCircles[2].locationZone,
      });
    }

    // Circle 4: Bengaluru Sci-Fi (band 3: 5 to 10km)
    if (mockCircles[3] && !dismissedSet.has(mockCircles[3].id)) {
      bubbles.push({
        id: mockCircles[3].id,
        type: 'circle' as const,
        name: mockCircles[3].title,
        hostName: mockCircles[3].hostName,
        category: mockCircles[3].category,
        distanceBand: '5 to 10 km' as const,
        bandIndex: 3 as const,
        angleDegree: 210,
        spotsLeftOrMembersText: 'Full',
        coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&auto=format&fit=crop&q=80',
        zone: mockCircles[3].locationZone,
      });
    }

    return bubbles;
  }, [dismissedSet]);

  const {
    isConnectRequestOpen,
    targetProfileForConnect,
    openConnectRequest,
    closeConnectRequest,
    sendConnectRequest,
  } = useConnectionsStore();

  const handleConnect = (candidate: CandidateUser) => {
    logAnalytics('profile_viewed', { targetUserId: candidate.profile.userId });
    openConnectRequest(candidate.profile);
  };

  const handleSaveProfile = (candidate: CandidateUser) => {
    const isSaved = savedItems.some((s) => s.id === candidate.profile.userId);
    if (isSaved) {
      unsaveItem(candidate.profile.userId);
      setToastMessage(`Removed ${candidate.profile.displayName} from saved.`);
    } else {
      saveItem({
        id: candidate.profile.userId,
        type: 'user',
        title: candidate.profile.displayName,
        subtitle: `${candidate.profile.zone} • ${candidate.profile.primaryIntent}`,
        photoUri: candidate.profile.photos[0],
      });
      setToastMessage(`Saved ${candidate.profile.displayName} to queue.`);
    }
  };

  const handleSaveCircle = (circle: Circle) => {
    const isSaved = savedItems.some((s) => s.id === circle.id);
    if (isSaved) {
      unsaveItem(circle.id);
      setToastMessage(`Removed "${circle.title}" from saved.`);
    } else {
      saveItem({
        id: circle.id,
        type: 'circle',
        title: circle.title,
        subtitle: `${circle.locationZone} • ${circle.category}`,
      });
      setToastMessage(`Saved "${circle.title}" to queue.`);
    }
  };

  const handleDismissProfile = (candidate: CandidateUser) => {
    openFeedbackSheet({
      id: candidate.profile.userId,
      name: candidate.profile.displayName,
      type: 'user',
    });
  };

  const handleFeedbackSubmit = (reason: FeedbackReason) => {
    if (selectedCandidateForFeedback) {
      dismissWithFeedback({
        targetId: selectedCandidateForFeedback.id,
        targetType: selectedCandidateForFeedback.type,
        title: selectedCandidateForFeedback.name,
        reason,
      });
      setToastMessage('Feedback recorded. Similar recommendations reduced.');
    }
  };

  const hasAnyResults =
    (activeFilterTab === 'all' && (rankedCircles.length > 0 || rankedProfiles.length > 0 || rankedEvents.length > 0)) ||
    (activeFilterTab === 'circles' && rankedCircles.length > 0) ||
    (activeFilterTab === 'people' && rankedProfiles.length > 0) ||
    (activeFilterTab === 'activities' && rankedEvents.length > 0);

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Top Floating App Bar: Search, Filter Trigger, Saved Queue */}
        <View style={styles.topBar}>
          <View style={styles.searchBarWrapper}>
            <Search size={18} color="#0284C7" strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Circles, People, Passions..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={14} color="#64748B" />
              </Pressable>
            )}
          </View>

          {/* Filter Config Button */}
          <Pressable
            onPress={() => setFilterSheetOpen(true)}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel="Open discovery filters"
          >
            <SlidersHorizontal size={18} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>

          {/* Saved Queue Button */}
          <Pressable
            onPress={() => setQueueSheetOpen(true)}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel={`Saved items (${savedItems.length})`}
          >
            <Bookmark size={18} color={colors.textPrimary} strokeWidth={2} />
            {savedItems.length > 0 && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>{savedItems.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* View Mode Switcher (List | Around you) + Filter Chips Row */}
        <View style={styles.controlsRow}>
          {/* List | Radar Segment Toggle */}
          <View style={styles.segmentContainer}>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[
                styles.segmentBtn,
                viewMode === 'list' && styles.segmentBtnActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: viewMode === 'list' }}
            >
              <List size={14} color={viewMode === 'list' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'list' && styles.segmentTextActive,
                ]}
              >
                List
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setViewMode('radar')}
              style={[
                styles.segmentBtn,
                viewMode === 'radar' && styles.segmentBtnActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: viewMode === 'radar' }}
            >
              <Radio size={14} color={viewMode === 'radar' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'radar' && styles.segmentTextActive,
                ]}
              >
                Around you
              </Text>
            </Pressable>
          </View>

          {/* Horizontal Scrolling Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsScroll}
          >
            {(['all', 'circles', 'people', 'activities'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveFilterTab(tab)}
                style={[
                  styles.filterChip,
                  activeFilterTab === tab && styles.filterChipActive,
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeFilterTab === tab }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilterTab === tab && styles.filterChipTextActive,
                  ]}
                >
                  {tab === 'all' ? '✨ All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* MAIN BODY CONTENT */}
        {viewMode === 'radar' ? (
          /* RADAR VIEW (Concept 3rd Phone: Privacy-Safe Distance Bands) */
          <ScrollView
            contentContainerStyle={styles.radarScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Privacy Radar Info Banner */}
            <View style={styles.radarHeaderBanner}>
              <View style={styles.radarHeaderTitleRow}>
                <Radio size={15} color="#0284C7" />
                <Text style={styles.radarHeaderTitle}>Radar: Indiranagar & Around</Text>
              </View>
              <Text style={styles.radarHeaderSub}>
                Circles & local meetups plotted on privacy-safe distance rings. People are never plotted.
              </Text>
            </View>

            {/* Circular Radar with distance rings and circle bubbles */}
            <View style={styles.radarWrapper}>
              <RadarView
                size={340}
                items={radarBubbles}
                onBubblePress={(bubble) => {
                  const circle = mockCircles.find((c) => c.id === bubble.id);
                  if (circle) openCircleDetail(circle);
                }}
              />
            </View>

            {/* Tap Hint */}
            <Text style={styles.radarHint}>
              Tap any Circle bubble to inspect details & reserve your spot
            </Text>

            {/* Nearby Local Circles Carousel / Cards */}
            <View style={styles.radarCardsSection}>
              <Text style={styles.sectionHeaderTitle}>Circles in your Radar</Text>
              {rankedCircles.slice(0, 3).map((item) => (
                <CircleCard
                  key={item.circle.id}
                  id={item.circle.id}
                  title={item.circle.title}
                  category={item.circle.category}
                  locationZone={item.circle.locationZone}
                  memberCount={item.circle.currentMemberCount}
                  maxCapacity={item.circle.capacity}
                  activityName={item.circle.activityName}
                  cadence={item.circle.cadence}
                  hostName={item.circle.hostName}
                  reasonChips={item.circle.reasonChips}
                  onPress={() => openCircleDetail(item.circle)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          /* LIST VIEW (Search, Taxonomy Explore, Circles, People, Activities) */
          <ScrollView
            contentContainerStyle={styles.listScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Interest Taxonomy Explorer */}
            <InterestExploreSection
              selectedInterest={selectedInterestTag}
              onSelectInterest={(tag) => setSelectedInterestTag(tag)}
            />

            {/* Active search / filter indicator banner */}
            {(effectiveSearchQuery.length > 0 || filters.zone !== 'All' || filters.intent !== 'all') && (
              <View style={styles.activeFilterBanner}>
                <View style={styles.filterBannerTextRow}>
                  <Compass size={14} color="#0284C7" />
                  <Text style={styles.filterBannerText}>
                    Showing matches for: {effectiveSearchQuery || filters.intent || filters.zone}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setSelectedInterestTag('');
                    clearFilters();
                  }}
                  style={styles.clearFilterLink}
                >
                  <Text style={styles.clearFilterLinkText}>Clear all</Text>
                </Pressable>
              </View>
            )}

            {!hasAnyResults ? (
              /* Empty State preserving query and offering clear filters */
              <GlassCard style={styles.emptyContainer}>
                <AlertCircle size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No matches found</Text>
                <Text style={styles.emptySub}>
                  No active Circles or people match &quot;{effectiveSearchQuery || 'the selected filters'}&quot;.
                </Text>
                <PillButton
                  label="Clear Filters"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setSelectedInterestTag('');
                    clearFilters();
                  }}
                  style={styles.emptyClearBtn}
                />
              </GlassCard>
            ) : null}

            {/* SECTION 1: CIRCLE RECOMMENDATIONS (DISC-02) */}
            {(activeFilterTab === 'all' || activeFilterTab === 'circles') &&
              rankedCircles.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleWithIcon}>
                      <Users size={16} color={colors.primary} />
                      <Text style={styles.sectionTitle}>Circles for You</Text>
                    </View>
                    <Text style={styles.sectionCount}>{rankedCircles.length} active</Text>
                  </View>

                  {rankedCircles.map((item) => (
                    <CircleCard
                      key={item.circle.id}
                      id={item.circle.id}
                      title={item.circle.title}
                      category={item.circle.category}
                      locationZone={item.circle.locationZone}
                      memberCount={item.circle.currentMemberCount}
                      maxCapacity={item.circle.capacity}
                      activityName={item.circle.activityName}
                      cadence={item.circle.cadence}
                      hostName={item.circle.hostName}
                      reasonChips={item.circle.reasonChips}
                      onPress={() => openCircleDetail(item.circle)}
                    />
                  ))}
                </View>
              )}

            {/* SECTION 2: PEOPLE RECOMMENDATIONS (DISC-03) */}
            {(activeFilterTab === 'all' || activeFilterTab === 'people') &&
              rankedProfiles.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleWithIcon}>
                      <Sparkles size={16} color="#0284C7" />
                      <Text style={styles.sectionTitle}>People with Shared Passions</Text>
                    </View>
                    <Text style={styles.sectionCount}>{rankedProfiles.length} suggestions</Text>
                  </View>

                  {rankedProfiles.map((candidate) => (
                    <PersonCard
                      key={candidate.profile.userId}
                      id={candidate.profile.userId}
                      name={candidate.profile.displayName}
                      ageBand={candidate.profile.ageBand}
                      occupation={candidate.profile.occupation}
                      locationZone={candidate.profile.zone}
                      distanceBand={candidate.distanceBand}
                      photoUri={candidate.profile.photos[0]}
                      verified={candidate.profile.isVerified}
                      intent={candidate.profile.primaryIntent}
                      reasonChips={candidate.profile.interests.slice(0, 3)}
                      sharedContext={candidate.sharedContextDescription}
                      hasSharedContext={candidate.hasSharedContext}
                      onConnect={() => handleConnect(candidate)}
                      onDismiss={() => handleDismissProfile(candidate)}
                      onSave={() => handleSaveProfile(candidate)}
                      onExplain={() => openExplanation(candidate, undefined)}
                      isSaved={savedItems.some((s) => s.id === candidate.profile.userId)}
                    />
                  ))}
                </View>
              )}

            {/* SECTION 3: ACTIVITY / EVENT DISCOVERY (DISC-04) */}
            {(activeFilterTab === 'all' || activeFilterTab === 'activities') &&
              rankedEvents.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleWithIcon}>
                      <Calendar size={16} color="#16A34A" />
                      <Text style={styles.sectionTitle}>Upcoming Activities & Events</Text>
                    </View>
                    <Text style={styles.sectionCount}>{rankedEvents.length} events</Text>
                  </View>

                  {rankedEvents.map((item) => (
                    <EventCard
                      key={item.event.id}
                      id={item.event.id}
                      title={item.event.title}
                      activityType={item.event.activityType}
                      dateStr={item.event.dateStr}
                      timeStr={item.event.timeStr}
                      venueZone={item.event.venueZone}
                      capacityState={`${item.spotsLeft} spots left`}
                      priceBand={item.event.priceBand}
                      hostName={item.event.hostName}
                      onPress={() => setToastMessage(`RSVP info for "${item.event.title}"`)}
                    />
                  ))}
                </View>
              )}
          </ScrollView>
        )}

        {/* ALL BOTTOM SHEETS */}
        {/* 1. Recommendation Explanation Sheet (DISC-06) */}
        <RecommendationExplanationSheet
          visible={isExplanationSheetOpen}
          onClose={closeExplanation}
          candidateUser={selectedExplanationUser}
          candidateCircle={selectedExplanationCircle}
          onShowFewerLikeThis={() => {
            if (selectedExplanationUser) {
              handleDismissProfile(selectedExplanationUser);
            }
          }}
        />

        {/* 2. Discovery Filters Sheet (DISC-07) */}
        <DiscoveryFilterSheet
          visible={isFilterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          currentFilters={filters}
          onApplyFilters={setFilters}
          onResetFilters={clearFilters}
        />

        {/* 3. Feedback / Non-Relevant Reason Sheet (DISC-08) */}
        <FeedbackReasonSheet
          visible={isFeedbackSheetOpen}
          onClose={closeFeedbackSheet}
          targetName={selectedCandidateForFeedback?.name || ''}
          targetType={selectedCandidateForFeedback?.type || 'user'}
          onSubmitFeedback={handleFeedbackSubmit}
        />

        {/* 4. Saved & Not Relevant Queue Sheet (DISC-08) */}
        <SavedQueueSheet
          visible={isQueueSheetOpen}
          onClose={() => setQueueSheetOpen(false)}
        />

        {/* 5. Circle Overview Map Sheet */}
        <CircleDetailSheet
          visible={isCircleDetailSheetOpen}
          onClose={closeCircleDetail}
          circle={selectedCircleDetail}
          onJoinCircle={(circle) => {
            setToastMessage(`Joined "${circle.title}"! Welcome to the Circle.`);
          }}
          onSaveCircle={handleSaveCircle}
          isSaved={
            selectedCircleDetail
              ? savedItems.some((s) => s.id === selectedCircleDetail.id)
              : false
          }
        />

        {/* 6. Connect Request Bottom Sheet (CONN-01) */}
        <ConnectRequestSheet
          visible={isConnectRequestOpen}
          currentUser={currentUser}
          targetProfile={targetProfileForConnect}
          blockedUserIds={blockedUsers}
          onClose={closeConnectRequest}
          onSubmit={async (data) => {
            await sendConnectRequest({
              requesterId: currentUser.userId,
              ...data,
            });
            setToastMessage(`Connection request sent!`);
          }}
        />

        {/* Interactive Action Toast */}
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
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: 8,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    gap: 8,
    ...shadows.chip,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
    ...shadows.chip,
  },
  savedBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xs,
    gap: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: radii.pill,
    padding: 2.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.chip,
  },
  segmentText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  filterChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  filterChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  filterChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  radarScrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 95,
  },
  radarHeaderBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  radarHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarHeaderTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: '#0369A1',
  },
  radarHeaderSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radarWrapper: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  radarHint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  radarCardsSection: {
    marginTop: spacing.xs,
  },
  sectionHeaderTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  listScrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 95,
  },
  activeFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  filterBannerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  filterBannerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: '#0369A1',
  },
  clearFilterLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  clearFilterLinkText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  sectionBlock: {
    marginTop: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionCount: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginVertical: spacing.md,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
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
  emptyClearBtn: {
    marginTop: spacing.xs,
  },
});
