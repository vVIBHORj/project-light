import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { colors, typography, spacing } from '../tokens';
import { PillButton } from './PillButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not complete this action. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <AlertCircle size={28} color={colors.destructive} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <PillButton
          label="Try Again"
          variant="primary"
          size="sm"
          onPress={onRetry}
          icon={<RefreshCw size={14} color="#FFFFFF" />}
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
    backgroundColor: 'rgba(229, 72, 77, 0.12)',
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
  message: {
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

export default ErrorState;
