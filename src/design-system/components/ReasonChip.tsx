import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import { Sparkles, LucideIcon } from 'lucide-react-native';
import { colors, radii, typography, shadows } from '../tokens';

export interface ReasonChipProps {
  label: string;
  icon?: LucideIcon;
  style?: ViewStyle;
  textStyle?: TextStyle;
  highlight?: boolean;
}

/**
 * ReasonChip: Renders a concrete stored signal reason (e.g. "3 shared interests", "Both free Sunday evening").
 * As per Blueprint P12 & Rule 2: NEVER show a fake compatibility percentage, show 2 to 4 concrete reason chips.
 */
export const ReasonChip: React.FC<ReasonChipProps> = ({
  label,
  icon: Icon = Sparkles,
  style,
  textStyle,
  highlight = false,
}) => {
  return (
    <View
      style={[
        styles.chip,
        shadows.chip,
        highlight && styles.highlightChip,
        style,
      ]}
    >
      <Icon size={12} color={highlight ? colors.primary : colors.textPrimary} strokeWidth={2.4} style={styles.icon} />
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  highlightChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: colors.primary,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});

export default ReasonChip;
