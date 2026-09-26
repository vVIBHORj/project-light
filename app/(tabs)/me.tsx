import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, Sparkles, Smartphone, LogOut } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  Avatar,
  PillButton,
  ReasonChip,
  IntentPill,
  SafetySheet,
  typography,
  colors,
  spacing,
} from '../../src/design-system';
import { mockUsers } from '../../src/data/mocks/seedData';
import { useSessionStore } from '../../src/state/useSessionStore';

export default function MeScreen() {
  const router = useRouter();
  const [safetyVisible, setSafetyVisible] = useState(false);
  const clearSession = useSessionStore((state) => state.clearSession);
  const currentUser = mockUsers[0];

  const handleLogout = async () => {
    await clearSession();
    router.replace('/(auth)/welcome');
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar
                uri={currentUser.photos[0]}
                name={currentUser.displayName}
                size={80}
                verified
              />
              <Text style={styles.name}>{currentUser.displayName}, {currentUser.age}</Text>
              <Text style={styles.occupation}>{currentUser.occupation}</Text>
              <Text style={styles.location}>{currentUser.zone}, {currentUser.city}</Text>

              <View style={styles.intentRow}>
                <IntentPill intent={currentUser.primaryIntent} size="sm" selected />
              </View>
            </View>

            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{currentUser.bio}</Text>
            </View>

            <View style={styles.interestsContainer}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.chipsRow}>
                {currentUser.interests.map((int, idx) => (
                  <ReasonChip key={idx} label={int} />
                ))}
              </View>
            </View>
          </GlassCard>

          {/* Action Links */}
          <GlassCard style={styles.menuCard}>
            <PillButton
              label="Safety Center & Controls"
              variant="secondary"
              size="md"
              icon={<Shield size={18} color={colors.safety} />}
              onPress={() => router.push('/safety')}
              style={styles.menuBtn}
            />

            <PillButton
              label="Devices & Sessions"
              variant="secondary"
              size="md"
              icon={<Smartphone size={18} color={colors.primary} />}
              onPress={() => router.push('/(auth)/sessions')}
              style={styles.menuBtn}
            />

            <PillButton
              label="Component Visual Gallery"
              variant="secondary"
              size="md"
              icon={<Sparkles size={18} color={colors.primary} />}
              onPress={() => router.push('/_gallery')}
              style={styles.menuBtn}
            />

            <PillButton
              label="Log Out"
              variant="destructive"
              size="md"
              icon={<LogOut size={18} color="#FFFFFF" />}
              onPress={handleLogout}
              style={styles.menuBtn}
            />
          </GlassCard>
        </ScrollView>

        <SafetySheet
          visible={safetyVisible}
          onClose={() => setSafetyVisible(false)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 90,
  },
  profileCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  profileHeader: {
    alignItems: 'center',
  },
  name: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  occupation: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  location: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  intentRow: {
    marginTop: spacing.xs,
  },
  bioContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  bioText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  interestsContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  menuBtn: {
    marginVertical: 4,
  },
});
