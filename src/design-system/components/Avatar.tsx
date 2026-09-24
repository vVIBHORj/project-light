import React from 'react';
import { StyleSheet, View, Text, Image, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, typography } from '../tokens';
import { VerifiedBadge } from './VerifiedBadge';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'roundedSquare';
  online?: boolean;
  verified?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const gradientPairs = [
  ['#4FACFE', '#00F2FE'],
  ['#C471ED', '#F64F59'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#667EEA', '#764BA2'],
] as const;

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 'md',
  variant = 'circle',
  online = false,
  verified = false,
  style,
}) => {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];
  const borderRadius = variant === 'roundedSquare' ? radii.md : pixelSize / 2;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const gradientIndex = Math.abs(
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientPairs.length
  );
  const selectedGradient = gradientPairs[gradientIndex];

  return (
    <View style={[styles.container, { width: pixelSize, height: pixelSize }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: pixelSize,
              height: pixelSize,
              borderRadius,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={selectedGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.fallback,
            {
              width: pixelSize,
              height: pixelSize,
              borderRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: Math.round(pixelSize * 0.38),
              },
            ]}
          >
            {initials}
          </Text>
        </LinearGradient>
      )}

      {/* Online indicator */}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(10, Math.round(pixelSize * 0.22)),
              height: Math.max(10, Math.round(pixelSize * 0.22)),
              borderRadius: pixelSize * 0.11,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}

      {/* Verified badge */}
      {verified && (
        <View
          style={[
            styles.verifiedContainer,
            {
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <VerifiedBadge size={Math.max(14, Math.round(pixelSize * 0.3))} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#E2E8F0',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedContainer: {
    position: 'absolute',
  },
});

export default Avatar;
