import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../tokens';

export interface OfflineBannerProps {
  message?: string;
  style?: ViewStyle;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = 'You are currently offline. Showing cached content.',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <WifiOff size={15} color={colors.textPrimary} strokeWidth={2.2} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  text: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginLeft: 6,
  },
});

export default OfflineBanner;
