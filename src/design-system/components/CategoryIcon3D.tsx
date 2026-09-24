import React from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii, typography } from '../tokens';

export type CategoryColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'red';

export interface CategoryIcon3DProps {
  icon: LucideIcon;
  label?: string;
  colorScheme?: CategoryColorScheme;
  size?: number;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const colorPresets: Record<
  CategoryColorScheme,
  { start: string; end: string; glow: string; stroke: string }
> = {
  blue: {
    start: '#56CCF2',
    end: '#2F80ED',
    glow: 'rgba(47, 128, 237, 0.35)',
    stroke: '#A0E2FA',
  },
  purple: {
    start: '#D946EF',
    end: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.35)',
    stroke: '#F0ABFC',
  },
  green: {
    start: '#4ADE80',
    end: '#10B981',
    glow: 'rgba(16, 185, 129, 0.35)',
    stroke: '#A7F3D0',
  },
  orange: {
    start: '#FBBF24',
    end: '#F97316',
    glow: 'rgba(249, 115, 22, 0.35)',
    stroke: '#FDE68A',
  },
  red: {
    start: '#FB7185',
    end: '#E11D48',
    glow: 'rgba(225, 29, 72, 0.35)',
    stroke: '#FECDD3',
  },
};

export const CategoryIcon3D: React.FC<CategoryIcon3DProps> = ({
  icon: IconComponent,
  label,
  colorScheme = 'blue',
  size = 56,
  selected = false,
  onPress,
  style,
  labelStyle,
}) => {
  const preset = colorPresets[colorScheme];
  const borderRadius = radii.categoryIcon;
  const iconSize = Math.round(size * 0.46);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label || colorScheme}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
        style,
      ]}
    >
      <View
        style={[
          styles.squircleWrapper,
          {
            width: size,
            height: size,
            borderRadius,
            shadowColor: preset.end,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.32,
            shadowRadius: 10,
            elevation: 6,
          },
          selected && styles.selectedBorder,
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            {/* Main Gradient */}
            <SvgLinearGradient id={`grad-${colorScheme}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={preset.start} />
              <Stop offset="100%" stopColor={preset.end} />
            </SvgLinearGradient>

            {/* Glossy Top Bevel Highlight */}
            <SvgLinearGradient id={`topGlint-${colorScheme}`} x1="0%" y1="0%" x2="0%" y2="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Inner Radial Glow */}
            <RadialGradient id={`innerGlow-${colorScheme}`} cx="50%" cy="20%" rx="60%" ry="40%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Squircle Base */}
          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            rx={borderRadius}
            ry={borderRadius}
            fill={`url(#grad-${colorScheme})`}
          />

          {/* Inner Light Glow */}
          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            rx={borderRadius}
            ry={borderRadius}
            fill={`url(#innerGlow-${colorScheme})`}
          />

          {/* Top Glint Curve */}
          <Rect
            x="1"
            y="1"
            width={size - 2}
            height={(size / 2) - 1}
            rx={borderRadius - 1}
            ry={borderRadius - 1}
            fill={`url(#topGlint-${colorScheme})`}
          />

          {/* Crisp Top Highlight Stroke */}
          <Rect
            x="1"
            y="1"
            width={size - 2}
            height={size - 2}
            rx={borderRadius - 1}
            ry={borderRadius - 1}
            stroke={preset.stroke}
            strokeWidth="1"
            fill="none"
            opacity={0.5}
          />
        </Svg>

        {/* Center Glyph */}
        <View style={styles.iconCenter}>
          <IconComponent size={iconSize} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            selected && styles.labelSelected,
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  squircleWrapper: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  iconCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  labelSelected: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
});

export default CategoryIcon3D;
