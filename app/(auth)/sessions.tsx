import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react-native';
import { colors, typography, radii, spacing, shadows } from '../../src/design-system/tokens';
import { GradientBackground } from '../../src/design-system/components/GradientBackground';
import { GlassCard } from '../../src/design-system/components/GlassCard';
import { PillButton } from '../../src/design-system/components/PillButton';
import { Toast } from '../../src/design-system/components/Toast';
import { mockAuthRepo } from '../../src/data/mocks';
import { UserSession } from '../../src/domain/types';

export default function SessionsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockAuthRepo.getSessions();
      setSessions(data);
    } catch {
      setToastType('error');
      setToastMessage('Failed to load active sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSingle = async (session: UserSession) => {
    if (session.isCurrent) {
      Alert.alert(
        'Current Session',
        'This is your active session on this device. To sign out, use the Sign Out button in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setActionLoading(session.id);
      await mockAuthRepo.revokeSession(session.id);
      setToastType('success');
      setToastMessage(`Revoked access for ${session.deviceName}`);
      await fetchSessions();
    } catch {
      setToastType('error');
      setToastMessage('Failed to revoke session.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    const otherCount = sessions.filter((s) => !s.isCurrent).length;
    if (otherCount === 0) {
      setToastType('info');
      setToastMessage('No other active sessions to revoke.');
      return;
    }

    Alert.alert(
      'Log out of all other devices?',
      `This will immediately log you out of ${otherCount} other active ${otherCount === 1 ? 'session' : 'sessions'}. You will remain logged in on this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out Others',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('all');
              await mockAuthRepo.revokeAllOtherSessions();
              setToastType('success');
              setToastMessage('All other sessions revoked.');
              await fetchSessions();
            } catch {
              setToastType('error');
              setToastMessage('Failed to revoke other sessions.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const getDeviceIcon = (deviceType: string) => {
    const lower = deviceType.toLowerCase();
    if (lower.includes('mac') || lower.includes('windows') || lower.includes('laptop') || lower.includes('desktop')) {
      return <Laptop size={22} color={colors.textPrimary} />;
    }
    if (lower.includes('web') || lower.includes('browser')) {
      return <Globe size={22} color={colors.textPrimary} />;
    }
    return <Smartphone size={22} color={colors.textPrimary} />;
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
      if (diffMinutes < 2) return 'Active just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <GradientBackground preset="sky" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Device & Sessions</Text>
            <Text style={styles.headerSubtitle}>AUTH-08 • Security & Login Activity</Text>
          </View>
          <TouchableOpacity
            onPress={fetchSessions}
            style={styles.refreshButton}
            accessibilityRole="button"
            accessibilityLabel="Refresh sessions"
            disabled={loading}
          >
            <RefreshCw size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Summary Banner */}
          <GlassCard style={styles.securityBanner}>
            <View style={styles.bannerRow}>
              <View style={styles.shieldIconWrapper}>
                <ShieldCheck size={24} color={colors.safety} />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Account Protected</Text>
                <Text style={styles.bannerDesc}>
                  You are logged into {sessions.length} {sessions.length === 1 ? 'device' : 'devices'}. If you don’t recognize a device, revoke it immediately.
                </Text>
              </View>
            </View>
          </GlassCard>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Fetching active sessions...</Text>
            </View>
          )}

          {!loading && currentSession && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CURRENT DEVICE</Text>
              <GlassCard style={styles.currentSessionCard}>
                <View style={styles.sessionHeaderRow}>
                  <View style={styles.deviceIconBox}>{getDeviceIcon(currentSession.deviceType)}</View>
                  <View style={styles.sessionInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.deviceName}>{currentSession.deviceName}</Text>
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>This Device</Text>
                      </View>
                    </View>
                    <Text style={styles.deviceOs}>{currentSession.deviceType.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.sessionMetaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{currentSession.cityLocation}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{formatRelativeTime(currentSession.lastActiveAt)}</Text>
                  </View>
                </View>
              </GlassCard>
            </View>
          )}

          {!loading && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>OTHER ACTIVE SESSIONS ({otherSessions.length})</Text>
                {otherSessions.length > 0 && (
                  <TouchableOpacity
                    onPress={handleRevokeAllOthers}
                    disabled={actionLoading === 'all'}
                    style={styles.revokeAllLink}
                  >
                    <Text style={styles.revokeAllText}>
                      {actionLoading === 'all' ? 'Revoking...' : 'Log Out All Others'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {otherSessions.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <ShieldCheck size={32} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No other devices active</Text>
                  <Text style={styles.emptyDesc}>
                    You’re only signed in on this current device.
                  </Text>
                </GlassCard>
              ) : (
                otherSessions.map((session) => (
                  <GlassCard key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionHeaderRow}>
                      <View style={styles.deviceIconBox}>{getDeviceIcon(session.deviceType)}</View>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.deviceName}>{session.deviceName}</Text>
                        <Text style={styles.deviceOs}>{session.deviceType.toUpperCase()}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRevokeSingle(session)}
                        disabled={actionLoading === session.id}
                        style={styles.revokeButton}
                        accessibilityLabel={`Revoke session for ${session.deviceName}`}
                      >
                        {actionLoading === session.id ? (
                          <ActivityIndicator size="small" color={colors.destructive} />
                        ) : (
                          <Trash2 size={18} color={colors.destructive} />
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.sessionMetaRow}>
                      <View style={styles.metaItem}>
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{session.cityLocation}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{formatRelativeTime(session.lastActiveAt)}</Text>
                      </View>
                    </View>
                  </GlassCard>
                ))
              )}
            </View>
          )}

          {/* Revoke All Others Pill Button at bottom if other sessions exist */}
          {!loading && otherSessions.length > 0 && (
            <View style={styles.footerActions}>
              <PillButton
                label="Log Out of All Other Devices"
                variant="destructive"
                icon={<AlertTriangle size={18} color={colors.textOnDark} />}
                onPress={handleRevokeAllOthers}
                loading={actionLoading === 'all'}
              />
            </View>
          )}
        </ScrollView>

        {/* Toast notifications */}
        <Toast
          visible={Boolean(toastMessage)}
          message={toastMessage || ''}
          type={toastType}
          onDismiss={() => setToastMessage(null)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  securityBanner: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  shieldIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(14, 159, 142, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bannerDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  revokeAllLink: {
    paddingVertical: 2,
  },
  revokeAllText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.destructive,
  },
  sessionCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    gap: spacing.sm,
  },
  currentSessionCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderColor: 'rgba(47, 128, 237, 0.4)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    gap: spacing.sm,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.chip,
  },
  sessionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deviceName: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  deviceOs: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#DDEBFB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  currentBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 11,
    color: colors.primary,
  },
  revokeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11, 15, 26, 0.06)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  emptyDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerActions: {
    marginTop: spacing.sm,
  },
});
