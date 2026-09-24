import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, shadows } from '../tokens';

export interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  elevated?: boolean;
  withHighlight?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  borderRadius = radii.card,
  elevated = true,
  withHighlight = true,
}) => {
  const isWebOrAndroid = Platform.OS !== 'ios';

  return (
    <View
      style={[
        styles.wrapper,
        { borderRadius },
        elevated && shadows.card,
        isWebOrAndroid && styles.webFallback,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="light"
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {withHighlight && <View style={[styles.topHighlight, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]} />}
      <View style={[styles.content, { borderRadius }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.glass.background,
  },
  webFallback: {
    backgroundColor: colors.glass.backgroundFallback,
    // @ts-expect-error web backdrop-filter
    backdropFilter: 'blur(20px)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: colors.glass.topHighlight,
    opacity: 0.85,
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
});

export default GlassCard;
