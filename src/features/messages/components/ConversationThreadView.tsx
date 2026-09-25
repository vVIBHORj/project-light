import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { Avatar } from '../../../design-system/components/Avatar';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { IcebreakerChips } from './IcebreakerChips';
import { MessageRequestBanner } from './MessageRequestBanner';
import { ConversationSafetyPromptSheet } from './ConversationSafetyPromptSheet';
import { MessageActionSheet } from './MessageActionSheet';
import { MediaPickerSheet } from './MediaPickerSheet';
import { useChatStore } from '../state/useChatStore';

interface ConversationThreadViewProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onBack: () => void;
  onEventRsvp?: (eventId: string) => void;
}

export const ConversationThreadView: React.FC<ConversationThreadViewProps> = ({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onBack,
  onEventRsvp,
}) => {
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    retryFailedMessage,
    toggleMuteActiveConversation,
    blockActiveParticipant,
    setActionSheetMessage,
  } = useChatStore();

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto scroll to bottom on new messages
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages.length]);

  if (!activeConversation) return null;

  const isGroup = activeConversation.type === 'circle';
  const isRequest = activeConversation.type === 'request';
  const isBlocked = activeConversation.isBlocked;
  const isPendingRequest = isRequest && activeConversation.requestStatus === 'pending';

  const handleHeaderOptions = () => {
    Alert.alert(
      activeConversation.title || 'Conversation',
      'Safety and notification controls',
      [
        {
          text: activeConversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications',
          onPress: toggleMuteActiveConversation,
        },
        {
          text: 'Block Participant',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Block Participant',
              'Are you sure you want to block this user and end direct conversations?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => blockActiveParticipant(currentUserId),
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* 1. Header with Mute & Safety Menu */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Avatar
          uri={activeConversation.avatar}
          name={activeConversation.title || 'Chat'}
          size={38}
          variant={isGroup ? 'roundedSquare' : 'circle'}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeConversation.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {activeConversation.sharedContext}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={toggleMuteActiveConversation}>
          <Ionicons
            name={activeConversation.isMuted ? 'notifications-off' : 'notifications-outline'}
            size={20}
            color={activeConversation.isMuted ? colors.destructive : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={handleHeaderOptions}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. Pinned Prompt of the week for Circle chats (MSG-03) */}
      {isGroup && activeConversation.pinnedPrompt ? (
        <View style={styles.pinnedPromptBar}>
          <Ionicons name="pin" size={14} color={colors.primary} />
          <Text style={styles.pinnedPromptText} numberOfLines={2}>
            {activeConversation.pinnedPrompt}
          </Text>
        </View>
      ) : null}

      {/* 3. Top Context Banner for 1:1 Direct Chats (MSG-02) */}
      {!isGroup && !isRequest && activeConversation.sharedContext ? (
        <View style={styles.contextBanner}>
          <Ionicons name="sparkles" size={13} color={colors.primary} />
          <Text style={styles.contextBannerText}>{activeConversation.sharedContext}</Text>
        </View>
      ) : null}

      {/* 4. Message Request Decision Banner (MSG-04) */}
      <MessageRequestBanner conversation={activeConversation} />

      {/* 5. Messages Stream */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Grouping Tag */}
        <View style={styles.dateTag}>
          <Text style={styles.dateTagText}>Today</Text>
        </View>

        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === currentUserId}
            showSenderName={isGroup && msg.senderId !== currentUserId}
            onLongPress={setActionSheetMessage}
            onRetry={retryFailedMessage}
            onActionPress={(actionType, payload) => {
              if (actionType === 'rsvp_event' && payload?.eventId && onEventRsvp) {
                onEventRsvp(payload.eventId);
              }
            }}
          />
        ))}

        {isLoadingMessages && messages.length === 0 && (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        )}
      </ScrollView>

      {/* 6. Rule-Based Icebreaker Chips for 1:1 threads (MSG-02) */}
      {!isGroup && !isPendingRequest && !isBlocked && activeConversation.suggestedIcebreakers ? (
        <IcebreakerChips suggestions={activeConversation.suggestedIcebreakers} />
      ) : null}

      {/* 7. Glass Composer with Disabled State handling */}
      <ChatComposer
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        isDisabled={isBlocked || isPendingRequest}
        disabledReason={
          isBlocked
            ? 'You cannot reply because of safety settings.'
            : isPendingRequest
            ? 'Accept the message request above to reply.'
            : undefined
        }
      />

      {/* Modals & Safety Prompt Sheets (MSG-05, MSG-06) */}
      <ConversationSafetyPromptSheet />
      <MessageActionSheet currentUserId={currentUserId} />
      <MediaPickerSheet
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.card,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: 2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.primary,
  },
  iconBtn: {
    padding: spacing.xs,
    marginLeft: 2,
  },
  pinnedPromptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(47, 128, 237, 0.2)',
  },
  pinnedPromptText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    flex: 1,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.25)',
  },
  contextBannerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  messagesScroll: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  dateTag: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginVertical: spacing.xs,
  },
  dateTagText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
  },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
});
