import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { Avatar } from '../../../design-system/components/Avatar';
import { PillButton } from '../../../design-system/components/PillButton';
import { Conversation } from '../../../domain/types';
import { useChatStore, InboxSegment } from '../state/useChatStore';

interface InboxThreadListProps {
  currentUserId: string;
  onSelectConversation: (conv: Conversation) => void;
  onDiscoverCirclesPress?: () => void;
}

export const InboxThreadList: React.FC<InboxThreadListProps> = ({
  currentUserId,
  onSelectConversation,
  onDiscoverCirclesPress,
}) => {
  const {
    activeSegment,
    conversations,
    setActiveSegment,
    loadConversations,
  } = useChatStore();

  const handleTabChange = (segment: InboxSegment) => {
    setActiveSegment(segment);
    loadConversations(currentUserId);
  };

  const segments: { id: InboxSegment; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
    { id: 'circles', label: 'Circles', icon: 'people-outline' },
    { id: 'connections', label: 'Connections', icon: 'heart-outline' },
    { id: 'requests', label: 'Requests', icon: 'mail-unread-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 3-Way Segmented Control: Circles | Connections | Requests (MSG-01) */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentedControl}>
          {segments.map((tab) => {
            const isActive = activeSegment === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => handleTabChange(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Your conversations start after a mutual connection. Join circles or discover people with shared passions.
            </Text>
            {onDiscoverCirclesPress && (
              <PillButton
                label="Discover Circles"
                onPress={onDiscoverCirclesPress}
                variant="primary"
                size="md"
                style={styles.emptyCta}
              />
            )}
          </View>
        ) : (
          conversations.map((conv) => (
            <GlassCard
              key={conv.id}
              style={styles.threadCard}
            >
              <TouchableOpacity
                style={styles.threadRow}
                activeOpacity={0.85}
                onPress={() => onSelectConversation(conv)}
              >
                <Avatar
                  uri={conv.avatar}
                  name={conv.title || 'Chat'}
                  size={48}
                  variant={conv.type === 'circle' ? 'roundedSquare' : 'circle'}
                />

                <View style={styles.threadInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleText} numberOfLines={1}>
                      {conv.title}
                    </Text>
                    {conv.lastMessageAt && (
                      <Text style={styles.timeText}>{conv.lastMessageAt}</Text>
                    )}
                  </View>

                  {/* Context Tag (e.g. "🏸 Koramangala Badminton Club") */}
                  {conv.sharedContext ? (
                    <View style={styles.contextTag}>
                      <Text style={styles.contextTagText} numberOfLines={1}>
                        {conv.sharedContext}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.previewRow}>
                    <Text style={styles.previewText} numberOfLines={1}>
                      {conv.lastMessage || 'No messages yet'}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  segmentText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
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
  threadCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: radii.card,
    ...shadows.card,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  timeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  contextTag: {
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  contextTagText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: spacing.xs,
  },
  unreadBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(47, 128, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  emptyCta: {
    paddingHorizontal: spacing.xl,
  },
});
