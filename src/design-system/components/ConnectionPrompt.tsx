import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { colors, typography, spacing } from '../tokens';
import { GlassCard } from './GlassCard';
import { PillButton } from './PillButton';

export interface ConnectionPromptProps {
  sharedContext: string;
  proposedAction: string;
  onAccept?: () => void;
  onDecline?: () => void;
  style?: ViewStyle;
}

export const ConnectionPrompt: React.FC<ConnectionPromptProps> = ({
  sharedContext,
  proposedAction,
  onAccept,
  onDecline,
  style,
}) => {
  return (
    <GlassCard style={[styles.card, style]}>
      <View style={styles.header}>
        <Sparkles size={16} color={colors.primary} />
        <Text style={styles.headerText}>Shared Reason to Connect</Text>
      </View>

      <Text style={styles.contextText}>{sharedContext}</Text>
      <Text style={styles.actionPrompt}>Suggested: {proposedAction}</Text>

      <View style={styles.buttonRow}>
        {onDecline && (
          <PillButton
            label="Not now"
            variant="ghost"
            size="sm"
            onPress={onDecline}
            style={styles.declineBtn}
          />
        )}
        <PillButton
          label="Start Conversation"
          variant="primary"
          size="sm"
          onPress={onAccept}
          icon={<ArrowRight size={14} color="#FFFFFF" />}
          iconPosition="right"
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  actionPrompt: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  declineBtn: {
    marginRight: spacing.xs,
  },
});

export default ConnectionPrompt;
