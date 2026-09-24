import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { TabBar, TabKey } from '../../src/design-system/components/TabBar';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = (): TabKey => {
    if (pathname.includes('/discover')) return 'discover';
    if (pathname.includes('/circles')) return 'circles';
    if (pathname.includes('/messages')) return 'messages';
    if (pathname.includes('/me')) return 'me';
    return 'home';
  };

  const handleTabPress = (key: TabKey) => {
    switch (key) {
      case 'home':
        router.push('/(tabs)');
        break;
      case 'discover':
        router.push('/(tabs)/discover');
        break;
      case 'circles':
        router.push('/(tabs)/circles');
        break;
      case 'messages':
        router.push('/(tabs)/messages');
        break;
      case 'me':
        router.push('/(tabs)/me');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Tabs
        tabBar={() => (
          <TabBar activeTab={getActiveTab()} onTabPress={handleTabPress} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="circles" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="me" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDEBFB',
  },
});
