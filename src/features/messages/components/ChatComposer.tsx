import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { useChatStore } from '../state/useChatStore';

interface ChatComposerProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  isDisabled?: boolean;
  disabledReason?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isDisabled = false,
  disabledReason,
}) => {
  const {
    composerText,
    isSending,
    mentionCandidates,
    setComposerText,
    sendMessage,
    setMediaPickerOpen,
    setVoiceTooltipOpen,
  } = useChatStore();

  const handleSend = () => {
    if (isDisabled || isSending || !composerText.trim()) return;
    sendMessage(currentUserId, currentUserName, currentUserAvatar);
  };

  const handleSelectMention = (name: string) => {
    // Replace the trailing @query with @Name
    const updated = composerText.replace(/@[a-zA-Z0-9_]*$/, `@${name} `);
    setComposerText(updated);
  };

  if (isDisabled) {
    return (
      <View style={styles.disabledContainer}>
        <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
        <Text style={styles.disabledText}>
          {disabledReason || 'Replies are disabled for this conversation.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Mention suggestions overlay (MSG-03) */}
      {mentionCandidates.length > 0 && (
        <View style={styles.mentionOverlay}>
          <Text style={styles.mentionTitle}>Mention in Circle:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mentionRow}
          >
            {mentionCandidates.map((candidate) => (
              <TouchableOpacity
                key={candidate.id}
                style={styles.mentionChip}
                onPress={() => handleSelectMention(candidate.name)}
              >
                <Text style={styles.mentionChipText}>@{candidate.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Glass Composer Bar */}
      <View style={styles.glassBar}>
        {/* Attach Media (+) Button (MSG-05) */}
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => setMediaPickerOpen(true)}
          accessibilityLabel="Attach photo"
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder="Message or type @ to mention..."
          placeholderTextColor={colors.textMuted}
          value={composerText}
          onChangeText={setComposerText}
          multiline
          maxLength={1000}
        />

        {/* Voice Note Button (MSG-05: visible but disabled with "Coming soon") */}
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => setVoiceTooltipOpen(true)}
          accessibilityLabel="Voice note (Coming soon)"
        >
          <Ionicons name="mic-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Circular Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!composerText.trim() || isSending}
          accessibilityLabel="Send message"
        >
          <LinearGradient
            colors={
              composerText.trim()
                ? ['#2F80ED', '#0284C7']
                : ['rgba(47, 128, 237, 0.3)', 'rgba(2, 132, 199, 0.3)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendCircle}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
  },
  disabledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disabledText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mentionOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 2,
    ...shadows.card,
  },
  mentionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    marginBottom: 4,
    marginLeft: 4,
  },
  mentionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mentionChip: {
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  mentionChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  glassBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    gap: spacing.xs,
    ...shadows.card,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: spacing.xs,
  },
  sendCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
