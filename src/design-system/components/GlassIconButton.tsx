import React from 'react';
import { StyleSheet, Pressable, ViewStyle, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, shadows } from '../tokens';

export interface GlassIconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel: string;
  variant?: 'glass' | 'filledDark' | 'filledLight';
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  style,
  disabled = false,
  accessibilityLabel,
  variant = 'glass',
}) => {
  const borderRadius = size / 2;
  const isWebOrAndroid = Platform.OS !== 'ios';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        variant === 'glass' && styles.glassVariant,
        variant === 'glass' && isWebOrAndroid && styles.glassWebFallback,
        variant === 'filledDark' && styles.filledDarkVariant,
        variant === 'filledLight' && styles.filledLightVariant,
        shadows.chip,
        style,
      ]}
    >
      {variant === 'glass' && (
        <BlurView
          intensity={40}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
      )}
      <View style={styles.iconContainer}>{icon}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassVariant: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  glassWebFallback: {
    backgroundColor: colors.glass.backgroundFallback,
  },
  filledDarkVariant: {
    backgroundColor: colors.textPrimary,
  },
  filledLightVariant: {
    backgroundColor: colors.surface,
  },
  iconContainer: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GlassIconButton;
