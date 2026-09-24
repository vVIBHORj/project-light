import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, ViewStyle } from 'react-native';
import { MapPin, Users, Lock, Globe, Sparkles } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { VerifiedBadge } from './VerifiedBadge';
import { colors, radii, typography, spacing, shadows } from '../tokens';

export interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  zone: string;
  visibility: 'public' | 'private';
  memberCount: number;
  hostName: string;
  coverImage?: string;
  isHostVerified?: boolean;
  activeThisMonth?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  name,
  description,
  category,
  zone,
  visibility,
  memberCount,
  hostName,
  coverImage,
  isHostVerified = true,
  activeThisMonth = true,
  onPress,
  style,
}) => {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Community: ${name}, ${zone}`}>
      <GlassCard style={[styles.card, shadows.card, style]}>
        {/* Top Cover Image or Colored Aesthetic Banner */}
        <View style={styles.coverWrapper}>
          <Image
            source={{
              uri:
                coverImage ||
                'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=80',
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          {/* Visibility Pill Badge (Public / Private) */}
          <View style={styles.visibilityBadge}>
            {visibility === 'private' ? (
              <>
                <Lock size={11} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.visibilityText}>Private</Text>
              </>
            ) : (
              <>
                <Globe size={11} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.visibilityText}>Open Community</Text>
              </>
            )}
          </View>

          {/* Active This Month Badge */}
          {activeThisMonth && (
            <View style={styles.activeBadge}>
              <Sparkles size={11} color="#0284C7" strokeWidth={2.5} />
              <Text style={styles.activeText}>Active this month</Text>
            </View>
          )}
        </View>

        {/* Community Info Body */}
        <View style={styles.content}>
          {/* Category Chip */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <View style={styles.membersPill}>
              <Users size={12} color={colors.textSecondary} />
              <Text style={styles.membersCountText}>{memberCount} members</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Footer: Zone and Host with VerifiedBadge */}
          <View style={styles.footerRow}>
            <View style={styles.zoneRow}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text style={styles.zoneText}>{zone}</Text>
            </View>

            <View style={styles.hostRow}>
              <Text style={styles.hostLabel}>Host: </Text>
              <Text style={styles.hostName}>{hostName}</Text>
              {isHostVerified && <VerifiedBadge size={14} style={styles.verifiedBadge} />}
            </View>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    overflow: 'hidden',
    padding: 0,
    marginBottom: spacing.md,
  },
  coverWrapper: {
    height: 110,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  visibilityBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    gap: 4,
  },
  visibilityText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    gap: 4,
  },
  activeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#0284C7',
  },
  content: {
    padding: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryPill: {
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.sm,
  },
  categoryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  membersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersCountText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 17,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 3,
    marginBottom: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  zoneText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  hostName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  verifiedBadge: {
    marginLeft: 3,
  },
});

export default CommunityCard;
