import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  GradientBackground,
  typography,
  colors,
  spacing,
  radii,
  shadows,
} from '../../src/design-system';
import {
  InboxThreadList,
  ConversationThreadView,
  useChatStore,
} from '../../src/features/messages';
import {
  ConnectionCard,
  ConnectRequestSheet,
  ConnectionDecisionSheet,
  DatingOptInModal,
  RemoveConnectionModal,
  InviteToCircleModal,
  useConnectionsStore,
  ConnectionsTabFilter,
} from '../../src/features/connections';
import { mockUsers } from '../../src/data/mocks/seedData';

type ViewMode = 'inbox' | 'connections_manager';

export default function MessagesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const currentUser = mockUsers[0]; // Aisha Rao

  const {
    activeConversation,
    loadConversations,
    openConversation,
    closeConversation,
  } = useChatStore();

  const {
    activeTab,
    setActiveTab,
    connectionsList,
    targetProfileForConnect,
    isConnectRequestOpen,
    isDecisionSheetOpen,
    isDatingOptInOpen,
    isRemoveModalOpen,
    isInviteModalOpen,
    loadConnections,
    sendConnectRequest,
    openDecisionSheet,
    closeDecisionSheet,
    openDatingOptIn,
    closeDatingOptIn,
    openRemoveModal,
    closeRemoveModal,
    openInviteModal,
    closeInviteModal,
    closeConnectRequest,
    markFriend,
  } = useConnectionsStore();

  useEffect(() => {
    loadConversations(currentUser.userId);
    loadConnections(currentUser.userId);
  }, [loadConversations, loadConnections, currentUser.userId]);

  // If inside an active conversation, show full-screen conversation view
  if (activeConversation) {
    return (
      <ConversationThreadView
        currentUserId={currentUser.userId}
        currentUserName={currentUser.displayName}
        currentUserAvatar={currentUser.photos[0]}
        onBack={() => closeConversation()}
      />
    );
  }

  const pendingCount = connectionsList.filter((c) => c.state === 'pending').length;

  const filteredConnections = connectionsList.filter((conn) => {
    if (activeTab === 'pending') return conn.state === 'pending';
    if (activeTab === 'friends') return conn.stage === 'FRIEND' && conn.state === 'accepted';
    if (activeTab === 'activity_partners') return conn.stage === 'ACTIVITY_PARTNER' && conn.state === 'accepted';
    if (activeTab === 'dating') return conn.stage === 'DATING' && conn.state === 'accepted';
    return true;
  });

  const handleMarkFriend = async (connectionId: string) => {
    try {
      await markFriend(connectionId);
      Alert.alert('Marked as Friend 🤝', 'You have marked this connection as a trusted Friend.');
    } catch {
      Alert.alert('Error', 'Unable to mark as friend');
    }
  };

  const handleJoinActivity = (activityTitle: string) => {
    Alert.alert('Activity RSVP 🗓️', `You RSVP'd for: ${activityTitle}`);
  };

  const handleNavigateDiscover = () => {
    router.push('/(tabs)/circles');
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Mode Bar: Inbox | Network */}
        <View style={styles.topBar}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, viewMode === 'inbox' && styles.segmentBtnActive]}
              onPress={() => setViewMode('inbox')}
            >
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'inbox' && styles.segmentTextActive,
                ]}
              >
                Messages Inbox
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, viewMode === 'connections_manager' && styles.segmentBtnActive]}
              onPress={() => setViewMode('connections_manager')}
            >
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'connections_manager' && styles.segmentTextActive,
                ]}
              >
                Connections {pendingCount > 0 ? `(${pendingCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'inbox' ? (
          <InboxThreadList
            currentUserId={currentUser.userId}
            onSelectConversation={(conv) => openConversation(conv, currentUser.userId)}
            onDiscoverCirclesPress={handleNavigateDiscover}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Filter Chips Bar (CONN-03) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBar}
            >
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'friends', label: '🤝 Friends' },
                  { id: 'activity_partners', label: '⚡ Partners' },
                  { id: 'dating', label: '💫 Dating' },
                  {
                    id: 'pending',
                    label: `Pending ${pendingCount > 0 ? `(${pendingCount})` : ''}`,
                  },
                ] as { id: ConnectionsTabFilter; label: string }[]
              ).map((chip) => {
                const isSelected = activeTab === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setActiveTab(chip.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Connections List */}
            {filteredConnections.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No connections in this category</Text>
                <Text style={styles.emptySubtitle}>
                  Explore circles or discover people with shared passions to grow your network.
                </Text>
              </View>
            ) : (
              filteredConnections.map((conn) => (
                <ConnectionCard
                  key={conn.id}
                  connection={conn}
                  currentUserId={currentUser.userId}
                  onRespond={() => openDecisionSheet(conn)}
                  onMessage={() => {
                    setViewMode('inbox');
                  }}
                  onMarkFriend={() => handleMarkFriend(conn.id)}
                  onInviteCircle={() => openInviteModal(conn)}
                  onDatingOptIn={() => openDatingOptIn(conn)}
                  onRemove={() => openRemoveModal(conn)}
                  onJoinActivity={handleJoinActivity}
                />
              ))
            )}
          </ScrollView>
        )}

        {/* Bottom Sheets & Modals for Connections */}
        <ConnectRequestSheet
          visible={isConnectRequestOpen}
          currentUser={currentUser}
          targetProfile={targetProfileForConnect}
          onClose={closeConnectRequest}
          onSubmit={async (data) => {
            await sendConnectRequest({
              requesterId: currentUser.userId,
              ...data,
            });
          }}
        />

        <ConnectionDecisionSheet
          visible={isDecisionSheetOpen}
          onClose={closeDecisionSheet}
          onOpenChat={() => setViewMode('inbox')}
        />

        <DatingOptInModal
          visible={isDatingOptInOpen}
          currentUserId={currentUser.userId}
          onClose={closeDatingOptIn}
        />

        <RemoveConnectionModal
          visible={isRemoveModalOpen}
          onClose={closeRemoveModal}
          onBlock={(userId) => {
            Alert.alert('User Blocked', `User ${userId} has been blocked and removed.`);
          }}
          onReport={(_userId) => {
            Alert.alert('Report Submitted', 'Thank you for keeping Project LIGHT safe.');
          }}
        />

        <InviteToCircleModal
          visible={isInviteModalOpen}
          onClose={closeInviteModal}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...shadows.card,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  segmentText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 90,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
