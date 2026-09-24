import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Pressable,
  ViewStyle,
  Platform,
  Text,
} from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: string[];
  height?: number;
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  height = 480,
  style,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        stiffness: 180,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 24,
            stiffness: 180,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            maxHeight: '90%',
            height,
            transform: [{ translateY }],
          },
          shadows.phone,
          style,
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}

        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 26, 0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.bottomSheet, // 32 top radius
    borderTopRightRadius: radii.bottomSheet,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  handleContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  titleContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});

export default BottomSheet;
