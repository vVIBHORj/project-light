import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../tokens';

export type GradientPreset = 'sky' | 'homeHeader' | 'photoOverlay' | 'darkOverlay' | 'orb';

export interface GradientBackgroundProps {
  preset?: GradientPreset;
  colors?: readonly [string, string, ...string[]] | string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  preset = 'sky',
  colors: customColors,
  start,
  end,
  style,
  children,
}) => {
  const getGradientColors = (): readonly [string, string, ...string[]] => {
    if (customColors && customColors.length >= 2) {
      return customColors as readonly [string, string, ...string[]];
    }
    switch (preset) {
      case 'homeHeader':
        return colors.gradients.homeHeader;
      case 'photoOverlay':
        return colors.gradients.cardPhotoOverlay;
      case 'darkOverlay':
        return colors.gradients.cardDarkOverlay;
      case 'orb':
        return colors.gradients.orb;
      case 'sky':
      default:
        return colors.gradients.sky;
    }
  };

  const defaultStart = preset === 'photoOverlay' || preset === 'darkOverlay' ? { x: 0, y: 0 } : { x: 0.5, y: 0 };
  const defaultEnd = preset === 'photoOverlay' || preset === 'darkOverlay' ? { x: 0, y: 1 } : { x: 0.5, y: 1 };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={start || defaultStart}
      end={end || defaultEnd}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
