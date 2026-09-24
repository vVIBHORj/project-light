import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="recovery" />
      <Stack.Screen name="security-challenge" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="safe-hold" />
      <Stack.Screen name="maintenance" />
      <Stack.Screen name="force-update" />
    </Stack>
  );
}
