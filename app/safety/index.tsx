import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  SafetyCenterView,
  ReportModal,
  BlockRestrictModal,
  DateSafetyModal,
  TrustedContactsModal,
  SafetyCaseTimelineModal,
  AgeHoldModal,
} from '../../src/features/safety';

export default function SafetyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafetyCenterView onBack={() => router.back()} />
      <ReportModal />
      <BlockRestrictModal />
      <DateSafetyModal />
      <TrustedContactsModal />
      <SafetyCaseTimelineModal />
      <AgeHoldModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
