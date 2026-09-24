import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="age" />
      <Stack.Screen name="identity" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="taste" />
      <Stack.Screen name="social-style" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="location" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="bio-preview" />
      <Stack.Screen name="activation" />
    </Stack>
  );
}
