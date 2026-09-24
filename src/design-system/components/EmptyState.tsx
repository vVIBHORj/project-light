import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { LucideIcon, Sparkles } from 'lucide-react-native';
import { colors, typography, spacing } from '../tokens';
import { PillButton } from './PillButton';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon size={28} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && (
        <PillButton
          label={actionLabel}
          variant="primary"
          size="sm"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.xs,
  },
});

export default EmptyState;
