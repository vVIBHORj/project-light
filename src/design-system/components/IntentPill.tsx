import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle, Pressable } from 'react-native';
import { Users, Heart, Sparkles, Compass } from 'lucide-react-native';
import { colors, radii, typography, shadows } from '../tokens';

export type RelationshipIntent = 'friendship' | 'dating' | 'community' | 'explore';

export interface IntentPillProps {
  intent: RelationshipIntent;
  size?: 'sm' | 'md';
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const intentConfig = {
  friendship: {
    label: 'Friendship',
    color: colors.intent.friendship,
    icon: Users,
  },
  dating: {
    label: 'Dating',
    color: colors.intent.dating,
    icon: Heart,
  },
  community: {
    label: 'Community',
    color: colors.intent.community,
    icon: Sparkles,
  },
  explore: {
    label: 'Explore',
    color: colors.intent.explore,
    icon: Compass,
  },
};

export const IntentPill: React.FC<IntentPillProps> = ({
  intent,
  size = 'md',
  selected = false,
  onPress,
  style,
  textStyle,
}) => {
  const config = intentConfig[intent];
  const IconComponent = config.icon;

  const isSmall = size === 'sm';

  const content = (
    <>
      <IconComponent
        size={isSmall ? 12 : 15}
        color={selected ? '#FFFFFF' : config.color}
        strokeWidth={2.4}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          isSmall ? styles.smallLabel : styles.mediumLabel,
          {
            color: selected ? '#FFFFFF' : colors.textPrimary,
          },
          textStyle,
        ]}
      >
        {config.label}
      </Text>
    </>
  );

  const containerStyle = [
    styles.pill,
    isSmall ? styles.smallPill : styles.mediumPill,
    {
      borderColor: config.color,
      backgroundColor: selected ? config.color : 'rgba(255, 255, 255, 0.75)',
    },
    shadows.chip,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Intent: ${config.label}`}
        style={containerStyle}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1.5,
    marginRight: 6,
    marginBottom: 6,
  },
  mediumPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
  },
  mediumLabel: {
    fontSize: 13,
  },
  smallLabel: {
    fontSize: 11,
  },
});

export default IntentPill;
