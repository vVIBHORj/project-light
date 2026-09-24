import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle, Platform } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import { shadows } from '../tokens';

export interface OrbProps {
  size?: number;
  pulse?: boolean;
  style?: ViewStyle;
  badgeCount?: number;
}

export const Orb: React.FC<OrbProps> = ({
  size = 54,
  pulse = true,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1600,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, pulseAnim]);

  const radius = size / 2;
  const glowSize = size * 1.35;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Outer Pulse Glow */}
      {pulse && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Svg width={glowSize} height={glowSize} viewBox={`0 0 ${glowSize} ${glowSize}`}>
            <Defs>
              <RadialGradient id="pulseGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                <Stop offset="70%" stopColor="#2F80ED" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#2F80ED" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill="url(#pulseGlow)" />
          </Svg>
        </Animated.View>
      )}

      {/* Main 3D Glossy Sphere */}
      <View style={[styles.sphereWrapper, { width: size, height: size, borderRadius: radius }, shadows.orbGlow]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            {/* Outer Rim Light */}
            <LinearGradient id="rimStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.4" />
            </LinearGradient>

            {/* Deep 3D Sphere Radial Gradient */}
            <RadialGradient id="sphereGrad" cx="36%" cy="32%" rx="65%" ry="65%">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
              <Stop offset="25%" stopColor="#1D4ED8" stopOpacity="1" />
              <Stop offset="60%" stopColor="#0A1A4A" stopOpacity="1" />
              <Stop offset="100%" stopColor="#020817" stopOpacity="1" />
            </RadialGradient>

            {/* Glossy Specular Top Highlight */}
            <RadialGradient id="specularGrad" cx="35%" cy="25%" rx="35%" ry="35%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>

            {/* Bottom Inner Reflected Light */}
            <RadialGradient id="bottomRim" cx="50%" cy="85%" rx="45%" ry="30%">
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Outer White Rim Ring */}
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 1}
            stroke="url(#rimStroke)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Sphere Body */}
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="url(#sphereGrad)"
          />

          {/* Bottom Reflected Glow */}
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="url(#bottomRim)"
          />

          {/* Specular Glint */}
          <Circle
            cx={radius * 0.72}
            cy={radius * 0.65}
            r={radius * 0.42}
            fill="url(#specularGrad)"
          />

          {/* Tiny sharp hot-spot */}
          <Circle
            cx={radius * 0.7}
            cy={radius * 0.6}
            r={radius * 0.12}
            fill="#FFFFFF"
            opacity={0.9}
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  sphereWrapper: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Orb;
