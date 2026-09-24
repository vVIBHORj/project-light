import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../tokens';

export interface StatCardProps {
  icon: LucideIcon;
  value: string;
  caption: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  caption,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconContainer}>
        <Icon size={18} color={colors.primary} strokeWidth={2.2} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.caption} numberOfLines={1}>
          {caption}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(47, 128, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default StatCard;
