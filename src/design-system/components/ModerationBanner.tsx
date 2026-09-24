import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../tokens';

export type ModerationBannerType = 'info' | 'warning' | 'restricted' | 'success';

export interface ModerationBannerProps {
  type?: ModerationBannerType;
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const ModerationBanner: React.FC<ModerationBannerProps> = ({
  type = 'info',
  title,
  message,
  actionText,
  onAction,
  style,
}) => {
  const config = {
    info: {
      bg: 'rgba(47, 128, 237, 0.08)',
      border: colors.primary,
      icon: Info,
      iconColor: colors.primary,
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: '#F59E0B',
      icon: AlertTriangle,
      iconColor: '#D97706',
    },
    restricted: {
      bg: 'rgba(229, 72, 77, 0.08)',
      border: colors.destructive,
      icon: XCircle,
      iconColor: colors.destructive,
    },
    success: {
      bg: 'rgba(52, 199, 89, 0.08)',
      border: colors.intent.friendship,
      icon: CheckCircle2,
      iconColor: colors.intent.friendship,
    },
  }[type];

  const IconComponent = config.icon;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <IconComponent
        size={18}
        color={config.iconColor}
        strokeWidth={2.2}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        {actionText && (
          <Text style={[styles.action, { color: config.iconColor }]} onPress={onAction}>
            {actionText}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  message: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  action: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
});

export default ModerationBanner;
