import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Send, Shield } from 'lucide-react-native';
import { Avatar, colors, radii, typography, spacing } from '../../../design-system';

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  timeStr: string;
  isSelf: boolean;
}

export interface SharedChatViewProps {
  title: string;
  subtitle?: string;
  currentUserId: string;
  messages: ChatMessageItem[];
  onSendMessage: (text: string) => void;
}

export const SharedChatView: React.FC<SharedChatViewProps> = ({
  title,
  subtitle,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* Safety Notice Header */}
      <View style={styles.safetyHeader}>
        <Shield size={13} color="#0284C7" />
        <Text style={styles.safetyText}>
          Group messages in {title} are moderated for community safety.
        </Text>
      </View>

      {/* Messages Scroll List */}
      <ScrollView
        contentContainerStyle={styles.messagesScroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>
              {subtitle || 'Say hello and coordinate your next meetup!'}
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.isSelf ? styles.messageRowSelf : styles.messageRowOther,
              ]}
            >
              {!msg.isSelf && (
                <Avatar
                  name={msg.senderName}
                  size={28}
                  uri={msg.senderAvatar}
                  style={styles.avatar}
                />
              )}

              <View
                style={[
                  styles.messageBubble,
                  msg.isSelf ? styles.bubbleSelf : styles.bubbleOther,
                ]}
              >
                {!msg.isSelf && (
                  <Text style={styles.senderName}>{msg.senderName}</Text>
                )}
                <Text
                  style={[
                    styles.bodyText,
                    msg.isSelf ? styles.bodyTextSelf : styles.bodyTextOther,
                  ]}
                >
                  {msg.body}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    msg.isSelf ? styles.timeTextSelf : styles.timeTextOther,
                  ]}
                >
                  {msg.timeStr}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Message Input Box */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Message group..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim()}
          style={[
            styles.sendBtn,
            !inputText.trim() && styles.sendBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Send size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  safetyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
  },
  messagesScroll: {
    padding: spacing.sm,
    gap: 10,
    minHeight: 180,
  },
  emptyMessages: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptySub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  messageRowSelf: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 6,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleSelf: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senderName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  bodyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    lineHeight: 17,
  },
  bodyTextSelf: {
    color: '#FFFFFF',
  },
  bodyTextOther: {
    color: colors.textPrimary,
  },
  timeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  timeTextSelf: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeTextOther: {
    color: colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});

export default SharedChatView;
