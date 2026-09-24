import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii, typography, shadows } from '../tokens';

export interface InterestChipProps {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const InterestChip: React.FC<InterestChipProps> = ({
  label,
  icon: Icon,
  selected = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        disabled && styles.disabledChip,
        shadows.chip,
        { opacity: pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {Icon && (
        <Icon
          size={14}
          color={selected ? colors.textOnDark : colors.textPrimary}
          strokeWidth={2.2}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          selected ? styles.selectedLabel : styles.unselectedLabel,
          disabled && styles.disabledLabel,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  unselectedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  selectedChip: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  disabledChip: {
    backgroundColor: 'rgba(230, 235, 245, 0.5)',
    borderColor: 'rgba(200, 210, 225, 0.5)',
    opacity: 0.6,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.medium,
  },
  unselectedLabel: {
    color: colors.textPrimary,
  },
  selectedLabel: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.semibold,
  },
  disabledLabel: {
    color: colors.textMuted,
  },
});

export default InterestChip;
