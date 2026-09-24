import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ViewStyle, DimensionValue, Platform } from 'react-native';
import { radii } from '../tokens';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radii.sm,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.75,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: shimmer,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(11, 15, 26, 0.15)',
  },
});

export default Skeleton;
