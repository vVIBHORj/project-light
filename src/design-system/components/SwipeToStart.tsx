import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { ArrowRight, Check } from 'lucide-react-native';
import { colors, radii, typography, shadows } from '../tokens';

export interface SwipeToStartProps {
  label?: string;
  onComplete?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const KNOB_SIZE = 44;
const TRACK_HEIGHT = 52;
const KNOB_MARGIN = 4;

export const SwipeToStart: React.FC<SwipeToStartProps> = ({
  label = 'Get Started',
  onComplete,
  style,
  textStyle,
  disabled = false,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [completed, setCompleted] = useState(false);
  const pan = useRef(new Animated.Value(0)).current;

  const maxDrag = Math.max(0, trackWidth - KNOB_SIZE - KNOB_MARGIN * 2);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !completed,
      onMoveShouldSetPanResponder: () => !disabled && !completed,
      onPanResponderMove: (_, gestureState) => {
        if (maxDrag <= 0) return;
        const newX = Math.max(0, Math.min(gestureState.dx, maxDrag));
        pan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (maxDrag <= 0) return;
        const currentX = Math.max(0, Math.min(gestureState.dx, maxDrag));
        const progress = currentX / maxDrag;

        if (progress >= 0.85) {
          // Snap to end and trigger complete
          Animated.spring(pan, {
            toValue: maxDrag,
            useNativeDriver: false,
            bounciness: 0,
          }).start(() => {
            setCompleted(true);
            onComplete?.();
          });
        } else {
          // Spring back to start
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            friction: 6,
            tension: 40,
          }).start();
        }
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  // Accessible double tap fallback
  const handleDoubleTap = () => {
    if (disabled || completed) return;
    Animated.spring(pan, {
      toValue: maxDrag,
      useNativeDriver: false,
    }).start(() => {
      setCompleted(true);
      onComplete?.();
    });
  };

  // Interpolate track fill width
  const fillWidth = pan.interpolate({
    inputRange: [0, Math.max(1, maxDrag)],
    outputRange: [KNOB_SIZE + KNOB_MARGIN * 2, trackWidth || 300],
    extrapolate: 'clamp',
  });

  return (
    <Pressable
      onLongPress={handleDoubleTap}
      accessibilityRole="button"
      accessibilityLabel={`Swipe to ${label}`}
      accessibilityHint="Drag slider right to complete, or double tap"
      style={[styles.container, style]}
    >
      <View style={styles.track} onLayout={onLayout}>
        {/* Track Progress Fill (Near Black #0B0F1A) */}
        <Animated.View
          style={[
            styles.fill,
            {
              width: fillWidth,
            },
          ]}
        />

        {/* Centered Label */}
        <View style={styles.labelContainer} pointerEvents="none">
          <Text
            style={[
              styles.label,
              completed && styles.labelCompleted,
              textStyle,
            ]}
          >
            {completed ? 'Completed!' : label}
          </Text>
        </View>

        {/* Draggable Knob */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.knob,
            shadows.chip,
            {
              transform: [{ translateX: pan }],
            },
          ]}
        >
          {completed ? (
            <Check size={20} color={colors.primary} strokeWidth={2.5} />
          ) : (
            <ArrowRight size={20} color={colors.textPrimary} strokeWidth={2.5} />
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.textPrimary, // Near black
    borderRadius: radii.pill,
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  labelCompleted: {
    color: colors.textOnDark,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: KNOB_MARGIN,
    top: (TRACK_HEIGHT - KNOB_SIZE) / 2 - 1,
    zIndex: 3,
  },
});

export default SwipeToStart;
