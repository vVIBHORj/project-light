import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, ViewStyle, Platform } from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { colors, radii, typography, spacing, shadows } from '../tokens';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start(() => {
          onDismiss?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, opacity, translateY, onDismiss]);

  if (!visible) return null;

  const config = {
    success: { icon: CheckCircle2, color: colors.intent.friendship },
    error: { icon: AlertCircle, color: colors.destructive },
    info: { icon: Info, color: colors.primary },
  }[type];

  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.toast,
        shadows.card,
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <IconComponent size={18} color={config.color} strokeWidth={2.4} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  message: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    flex: 1,
  },
});

export default Toast;
