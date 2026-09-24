import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, spacing, typography, shadows } from '../tokens';

export type PillButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type PillButtonSize = 'sm' | 'md' | 'lg';

export interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: PillButtonVariant;
  size?: PillButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isWebOrAndroid = Platform.OS !== 'ios';

  const sizeStyles = {
    sm: { height: 38, paddingHorizontal: 16, fontSize: 13 },
    md: { height: 48, paddingHorizontal: 24, fontSize: 15 },
    lg: { height: 56, paddingHorizontal: 28, fontSize: 16 },
  }[size];

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
      case 'ghost':
      case 'outline':
        return colors.textPrimary;
      case 'destructive':
      case 'primary':
      default:
        return colors.textOnDark;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: radii.pill,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'secondary' && isWebOrAndroid && styles.secondaryFallback,
        variant === 'ghost' && styles.ghost,
        variant === 'destructive' && styles.destructive,
        variant === 'outline' && styles.outline,
        variant === 'primary' && shadows.card,
        style,
      ]}
    >
      {variant === 'secondary' && (
        <BlurView
          intensity={40}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
        />
      )}
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={styles.spinner}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <View style={styles.leftIcon}>{icon}</View>
            )}
            <Text
              style={[
                styles.label,
                {
                  fontSize: sizeStyles.fontSize,
                  color: getTextColor(),
                },
                textStyle,
              ]}
            >
              {label}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={styles.rightIcon}>{icon}</View>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: spacing.minTouchTarget,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  primary: {
    backgroundColor: colors.textPrimary, // Near-black #0B0F1A
  },
  secondary: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  secondaryFallback: {
    backgroundColor: colors.glass.backgroundFallback,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.destructive,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  spinner: {
    paddingVertical: 2,
  },
});

export default PillButton;
