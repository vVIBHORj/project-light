import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Home,
  Compass,
  MessageSquare,
  User,
  LucideIcon,
} from 'lucide-react-native';
import { colors, typography, shadows, radii } from '../tokens';
import { Orb } from './Orb';

export type TabKey = 'home' | 'discover' | 'circles' | 'messages' | 'me';

export interface TabItem {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

export interface TabBarProps {
  activeTab: TabKey;
  onTabPress: (key: TabKey) => void;
  unreadCount?: number;
  style?: ViewStyle;
}

export const tabItems: TabItem[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'discover', label: 'Explore', icon: Compass },
  { key: 'circles', label: 'Circles', icon: Compass }, // Center orb
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'me', label: 'Me', icon: User },
];

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabPress,
  unreadCount = 2,
  style,
}) => {
  const isWebOrAndroid = Platform.OS !== 'ios';

  return (
    <View style={[styles.container, shadows.card, style]}>
      {/* Frosted Glass Background */}
      <BlurView
        intensity={50}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      {isWebOrAndroid && <View style={styles.webFallback} />}

      {/* Top Border Highlight */}
      <View style={styles.topBorder} />

      {/* 5 Tab Items */}
      <View style={styles.itemsRow}>
        {tabItems.map((item) => {
          const isActive = activeTab === item.key;
          const isCenter = item.key === 'circles';

          if (isCenter) {
            return (
              <Pressable
                key={item.key}
                onPress={() => onTabPress(item.key)}
                accessibilityRole="button"
                accessibilityLabel="Circles"
                style={styles.centerOrbWrapper}
              >
                <View style={styles.orbContainer}>
                  <Orb size={54} pulse={isActive} />
                </View>
              </Pressable>
            );
          }

          const IconComponent = item.icon;
          const showBadge = item.key === 'messages' && unreadCount > 0;

          return (
            <Pressable
              key={item.key}
              onPress={() => onTabPress(item.key)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={24}
                  color={isActive ? colors.textPrimary : colors.textMuted}
                  strokeWidth={isActive ? 2.4 : 1.75}
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.85)',
    position: 'relative',
    justifyContent: 'center',
  },
  webFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    // @ts-expect-error web backdrop-filter
    backdropFilter: 'blur(20px)',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    height: 28,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.textOnDark,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.tabLabel,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  centerOrbWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22, // Raised center orb
    zIndex: 10,
  },
  orbContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabBar;
