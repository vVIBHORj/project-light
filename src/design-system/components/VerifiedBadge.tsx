import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../tokens';

export interface VerifiedBadgeProps {
  size?: number;
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 18,
  style,
}) => {
  const iconSize = Math.max(10, Math.round(size * 0.65));

  return (
    <View
      accessibilityLabel="Verified user"
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Check size={iconSize} color="#FFFFFF" strokeWidth={3} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.verified,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});

export default VerifiedBadge;
