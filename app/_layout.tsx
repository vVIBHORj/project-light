import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Chewy_400Regular } from '@expo-google-fonts/chewy';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/state/queryClient';
import { useAppStore } from '../src/state/useAppStore';
import { Toast, OfflineBanner, WebDeviceFrame } from '../src/design-system';
import '../src/lib/i18n';

// Prevent auto hiding of splash screen until fonts & bootstrap complete
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Chewy: Chewy_400Regular,
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const { toast, hideToast, isOffline } = useAppStore();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WebDeviceFrame>
        <View style={styles.container}>
          <StatusBar style="dark" />
          {isOffline && <OfflineBanner />}
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="_gallery" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
          </Stack>
          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onDismiss={hideToast}
          />
        </View>
      </WebDeviceFrame>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDEBFB',
  },
});
