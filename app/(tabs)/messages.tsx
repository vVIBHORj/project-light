import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  GradientBackground,
  GlassCard,
  Avatar,
  typography,
  colors,
  spacing,
  radii,
  shadows,
} from '../../src/design-system';
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

type MainSectionTab = 'connections' | 'messages';

export default function MessagesScreen() {
  const [mainSection, setMainSection] = useState<MainSectionTab>('connections');
  const currentUser = mockUsers[0]; // Aisha Rao

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
    loadConnections(currentUser.userId);
  }, [loadConnections, currentUser.userId]);

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

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Main Segmented Control: Connections | Direct Messages */}
        <View style={styles.segmentContainer}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, mainSection === 'connections' && styles.segmentBtnActive]}
              onPress={() => setMainSection('connections')}
            >
              <Text
                style={[
                  styles.segmentText,
                  mainSection === 'connections' && styles.segmentTextActive,
                ]}
              >
                Connections {pendingCount > 0 ? `(${pendingCount} new)` : `(${connectionsList.length})`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, mainSection === 'messages' && styles.segmentBtnActive]}
              onPress={() => setMainSection('messages')}
            >
              <Text
                style={[
                  styles.segmentText,
                  mainSection === 'messages' && styles.segmentTextActive,
                ]}
              >
                Direct Messages (2)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mainSection === 'connections' ? (
            <>
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
                    onMessage={() => setMainSection('messages')}
                    onMarkFriend={() => handleMarkFriend(conn.id)}
                    onInviteCircle={() => openInviteModal(conn)}
                    onDatingOptIn={() => openDatingOptIn(conn)}
                    onRemove={() => openRemoveModal(conn)}
                    onJoinActivity={handleJoinActivity}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {/* Direct Messages (Conversations with Context Banners) */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Active Chats</Text>
                <Text style={styles.headerSubtitle}>
                  1:1 conversations unlocked through mutual connection
                </Text>
              </View>

              <GlassCard style={styles.chatItem}>
                {/* Context banner (CONN-02) */}
                <View style={styles.contextBanner}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
                  <Text style={styles.contextBannerText}>
                    Connected via 🏸 Koramangala Badminton Club
                  </Text>
                </View>

                <View style={styles.chatRow}>
                  <Avatar
                    uri={mockUsers[1].photos[0]}
                    name={mockUsers[1].displayName}
                    size={48}
                    online
                    verified
                  />
                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.nameText}>Rohan Mehta</Text>
                      <Text style={styles.timeText}>10:24 AM</Text>
                    </View>
                    <Text style={styles.previewText} numberOfLines={1}>
                      See you at the Indiranagar photo walk tomorrow morning! 📸
                    </Text>
                  </View>
                </View>
              </GlassCard>

              <GlassCard style={styles.chatItem}>
                {/* Context banner */}
                <View style={styles.contextBanner}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
                  <Text style={styles.contextBannerText}>
                    Connected via 🏎️ F1 Screening Circle
                  </Text>
                </View>

                <View style={styles.chatRow}>
                  <Avatar
                    uri={mockUsers[2].photos[0]}
                    name={mockUsers[2].displayName}
                    size={48}
                    verified
                  />
                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.nameText}>Sneha Kapoor</Text>
                      <Text style={styles.timeText}>Yesterday</Text>
                    </View>
                    <Text style={styles.previewText} numberOfLines={1}>
                      Shared the Monza GP watch party details in the Circle.
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </>
          )}
        </ScrollView>

        {/* Bottom Sheets & Modals */}
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
          onOpenChat={() => setMainSection('messages')}
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
  segmentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
  header: {
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.screenTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chatItem: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.card,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  contextBannerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  timeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  previewText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
});
