import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafetyCenterView } from '../../src/features/safety';
import { mockUsers } from '../../src/data/mocks/seedData';

export default function SafetyScreen() {
  const router = useRouter();
  const currentUser = mockUsers[0];

  return (
    <View style={styles.container}>
      <SafetyCenterView currentUser={currentUser} onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
