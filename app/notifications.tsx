import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  typography,
  colors,
  spacing,
  radii,
} from '../src/design-system';

interface NotificationItem {
  id: string;
  type: 'circle' | 'event' | 'connection' | 'safety';
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'circle',
    title: 'Circle Spot Reserved',
    body: 'You are registered for "Indiranagar 35mm Film Walk" this Saturday at 8:00 AM.',
    timeAgo: '15m ago',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'event',
    title: 'New Event Nearby',
    body: 'Rohan Mehta created "Monza GP Live Watch Party" in Koramangala.',
    timeAgo: '2h ago',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'connection',
    title: 'Connection Accepted',
    body: 'Pooja Iyer accepted your friendship connection request. You can now message 1:1.',
    timeAgo: '1d ago',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'safety',
    title: 'Profile Privacy Shield',
    body: 'Your exact GPS coordinates are masked. Only distance bands are visible.',
    timeAgo: '2d ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'circle':
        return <Users size={18} color={colors.primary} />;
      case 'event':
        return <Calendar size={18} color={colors.intent.dating} />;
      case 'connection':
        return <Sparkles size={18} color={colors.intent.friendship} />;
      case 'safety':
        return <ShieldCheck size={18} color={colors.safety} />;
    }
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <Pressable onPress={markAllAsRead} style={styles.markReadBtn}>
            <Check size={16} color={colors.primary} />
            <Text style={styles.markReadText}>Read all</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <GlassCard
              key={item.id}
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
            >
              <View style={styles.notifRow}>
                <View style={styles.iconBox}>{getNotifIcon(item.type)}</View>
                <View style={styles.textCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{item.timeAgo}</Text>
                  </View>
                  <Text style={styles.notifBody}>{item.body}</Text>
                </View>
              </View>
            </GlassCard>
          ))}

          {notifications.length === 0 && (
            <View style={styles.emptyWrap}>
              <Bell size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No new notifications right now.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    gap: 4,
  },
  markReadText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
    color: colors.primary,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  notifCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  notifCardUnread: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#DDEBFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  timeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  notifBody: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
