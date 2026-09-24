import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ViewStyle,
  Text,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import Svg, { Circle as SvgCircle, Line, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, radii, typography, shadows } from '../tokens';

export interface RadarBubbleItem {
  id: string;
  type: 'circle' | 'activity';
  name: string;
  hostName?: string;
  category: string;
  distanceBand: 'Within 2 km' | '2 to 5 km' | '5 to 10 km';
  bandIndex: 1 | 2 | 3; // 1 = inner (Within 2km), 2 = mid (2-5km), 3 = outer (5-10km)
  angleDegree: number; // angle in degrees around the ring
  spotsLeftOrMembersText: string; // e.g. "3 spots left" or "5 members"
  coverImage?: string;
  zone: string;
}

export interface RadarViewProps {
  items?: RadarBubbleItem[];
  size?: number;
  onBubblePress?: (item: RadarBubbleItem) => void;
  style?: ViewStyle;
}

export const RadarView: React.FC<RadarViewProps> = ({
  items = [],
  size = 350,
  onBubblePress,
  style,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
    };

    const anim1 = createPulse(pulse1, 0);
    const anim2 = createPulse(pulse2, 1000);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [pulse1, pulse2]);

  const center = size / 2;
  const rBand1 = size * 0.2;  // Inner: Within 2 km
  const rBand2 = size * 0.33; // Mid: 2 to 5 km
  const rBand3 = size * 0.45; // Outer: 5 to 10 km

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background SVG Grid, Faint Street Map Lines, Glow and Concentric Rings */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient id="radarRadialGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
            <Stop offset="60%" stopColor="#2F80ED" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#DDEBFB" stopOpacity="0.0" />
          </RadialGradient>
        </Defs>

        {/* Soft radial glow */}
        <SvgCircle cx={center} cy={center} r={rBand3 + 12} fill="url(#radarRadialGlow)" />

        {/* Faint street-map aesthetic lines */}
        <Line
          x1={size * 0.15}
          y1={size * 0.25}
          x2={size * 0.85}
          y2={size * 0.75}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <Line
          x1={size * 0.2}
          y1={size * 0.8}
          x2={size * 0.8}
          y2={size * 0.2}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <Path
          d={`M ${center - 80} ${center} Q ${center} ${center - 60} ${center + 80} ${center}`}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d={`M ${center - 100} ${center + 40} Q ${center - 20} ${center + 90} ${center + 90} ${center + 50}`}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Outer Ring: 5 to 10 km */}
        <SvgCircle
          cx={center}
          cy={center}
          r={rBand3}
          stroke="rgba(47, 128, 237, 0.25)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Middle Ring: 2 to 5 km */}
        <SvgCircle
          cx={center}
          cy={center}
          r={rBand2}
          stroke="rgba(47, 128, 237, 0.35)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Inner Ring: Within 2 km */}
        <SvgCircle
          cx={center}
          cy={center}
          r={rBand1}
          stroke="rgba(47, 128, 237, 0.45)"
          strokeWidth="1.5"
          fill="none"
        />
      </Svg>

      {/* Distance Band Labels (Privacy safe: strictly bands, never exact GPS) */}
      <View style={[styles.bandLabelContainer, { top: center - rBand3 + 4 }]}>
        <Text style={styles.bandLabelText}>5 to 10 km</Text>
      </View>
      <View style={[styles.bandLabelContainer, { top: center - rBand2 + 4 }]}>
        <Text style={styles.bandLabelText}>2 to 5 km</Text>
      </View>
      <View style={[styles.bandLabelContainer, { top: center - rBand1 + 4 }]}>
        <Text style={styles.bandLabelText}>Within 2 km</Text>
      </View>

      {/* Animated Radar Halo Pulses */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: (size * 0.85) / 2,
            transform: [
              {
                scale: pulse1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.15, 1.05],
                }),
              },
            ],
            opacity: pulse1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.7, 0.35, 0],
            }),
          },
        ]}
      />

      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: (size * 0.85) / 2,
            transform: [
              {
                scale: pulse2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.15, 1.05],
                }),
              },
            ],
            opacity: pulse2.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.7, 0.35, 0],
            }),
          },
        ]}
      />

      {/* Center "You" Dot with halo (2s loop pulse) */}
      <View style={styles.youCenterDot}>
        <View style={styles.youInnerDot} />
        <View style={styles.youLabelBadge}>
          <Text style={styles.youLabelText}>You</Text>
        </View>
      </View>

      {/* Circle & Activity Bubbles (Deterministic on distance ring; never people) */}
      {items.map((item) => {
        let radius = rBand2;
        if (item.bandIndex === 1) radius = rBand1;
        if (item.bandIndex === 3) radius = rBand3;

        const rad = (item.angleDegree * Math.PI) / 180;
        const posX = center + radius * Math.cos(rad) - 22;
        const posY = center + radius * Math.sin(rad) - 22;

        const fallbackBg = item.type === 'circle' ? '#2F80ED' : '#10B981';

        return (
          <Pressable
            key={item.id}
            onPress={() => onBubblePress?.(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.spotsLeftOrMembersText}, in ${item.distanceBand}`}
            style={[
              styles.bubbleContainer,
              shadows.card,
              {
                left: posX,
                top: posY,
              },
            ]}
          >
            <View style={styles.bubbleImageWrapper}>
              {item.coverImage ? (
                <Image
                  source={{ uri: item.coverImage }}
                  style={styles.bubbleImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.bubbleFallback, { backgroundColor: fallbackBg }]}>
                  <Text style={styles.bubbleFallbackText}>{item.name.charAt(0)}</Text>
                </View>
              )}
            </View>

            {/* Small Blue/Green Pill with member count / spots left */}
            <View style={styles.bubblePillBadge}>
              <Text style={styles.bubblePillText} numberOfLines={1}>
                {item.spotsLeftOrMembersText}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 8,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.7)',
    pointerEvents: 'none',
  },
  bandLabelContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.25)',
    zIndex: 4,
  },
  bandLabelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: '#0284C7',
  },
  youCenterDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(47, 128, 237, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  youInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  youLabelBadge: {
    position: 'absolute',
    bottom: -16,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.pill,
  },
  youLabelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  bubbleContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
  },
  bubbleImageWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  bubbleImage: {
    width: '100%',
    height: '100%',
  },
  bubbleFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleFallbackText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  bubblePillBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginTop: -7,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    maxWidth: 80,
  },
  bubblePillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default RadarView;
