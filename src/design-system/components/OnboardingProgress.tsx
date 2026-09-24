import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../tokens';

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 6,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              isActive && styles.segmentActive,
              isCompleted && styles.segmentCompleted,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(11, 15, 26, 0.12)',
    marginHorizontal: 3,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentCompleted: {
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
});

export default OnboardingProgress;
