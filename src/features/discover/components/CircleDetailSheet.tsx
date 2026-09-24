import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { MapPin, Users, Calendar, Heart, Sparkles, CheckCircle2 } from 'lucide-react-native';
import {
  BottomSheet,
  StatCard,
  PillButton,
  VerifiedBadge,
  ReasonChip,
  GlassIconButton,
  colors,
  radii,
  typography,
  spacing,
} from '../../../design-system';
import { Circle } from '../../../domain/types';

export interface CircleDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  circle: Circle | null;
  onJoinCircle?: (circle: Circle) => void;
  onSaveCircle?: (circle: Circle) => void;
  isSaved?: boolean;
}

export const CircleDetailSheet: React.FC<CircleDetailSheetProps> = ({
  visible,
  onClose,
  circle,
  onJoinCircle,
  onSaveCircle,
  isSaved = false,
}) => {
  if (!circle) return null;

  const spotsLeft = Math.max(0, circle.capacity - circle.currentMemberCount);
  const isFull = spotsLeft === 0;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Circle Overview"
      snapPoints={['70%']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header Row: 64px rounded-square thumbnail + Circle title + Host + Save Heart */}
        <View style={styles.headerRow}>
          <View style={styles.thumbnailWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {circle.title}
            </Text>
            <View style={styles.hostRow}>
              <Text style={styles.hostText}>Hosted by {circle.hostName}</Text>
              <VerifiedBadge size={16} style={styles.badge} />
            </View>
            <View style={styles.zoneRow}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text style={styles.zoneText}>{circle.locationZone}</Text>
            </View>
          </View>

          {onSaveCircle && (
            <GlassIconButton
              icon={
                <Heart
                  size={18}
                  color={isSaved ? '#EF4444' : colors.textPrimary}
                  fill={isSaved ? '#EF4444' : 'none'}
                />
              }
              onPress={() => onSaveCircle(circle)}
              size={36}
              accessibilityLabel="Save Circle"
              style={styles.saveBtn}
            />
          )}
        </View>

        {/* Three Stat Cards (Concept layout) */}
        <View style={styles.statsRow}>
          <StatCard
            icon={MapPin}
            value="2 to 5 km"
            caption="distance band"
          />
          <StatCard
            icon={Users}
            value={isFull ? 'Full' : `${spotsLeft} spots`}
            caption={isFull ? 'Waitlist' : 'available'}
          />
          <StatCard
            icon={Calendar}
            value="Sat, 7:30 AM"
            caption={circle.cadence}
          />
        </View>

        {/* Reason / Context Chips */}
        <View style={styles.chipsSection}>
          <View style={styles.chipsHeader}>
            <Sparkles size={14} color="#0284C7" />
            <Text style={styles.chipsTitle}>Why this circle fits you</Text>
          </View>
          <View style={styles.chipsRow}>
            {circle.reasonChips.map((chip, idx) => (
              <ReasonChip key={idx} label={chip} highlight={idx === 0} />
            ))}
            <ReasonChip label={circle.category} />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About the Circle</Text>
          <Text style={styles.aboutText}>
            A structured micro-community meeting for &quot;{circle.activityName}&quot;. Designed for consistent, low-pressure weekly bonding with verified local peers in {circle.locationZone}.
          </Text>
        </View>

        {/* Primary CTA */}
        <View style={styles.ctaWrapper}>
          <PillButton
            label={isFull ? 'Join Waitlist' : 'Join Circle'}
            variant="primary"
            size="lg"
            onPress={() => {
              onJoinCircle?.(circle);
              onClose();
            }}
            icon={!isFull ? <CheckCircle2 size={18} color="#FFFFFF" /> : undefined}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  hostText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.primary,
  },
  badge: {
    marginLeft: 4,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  zoneText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  saveBtn: {
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: spacing.xs,
  },
  chipsSection: {
    marginTop: spacing.md,
  },
  chipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  chipsTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: '#0284C7',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  aboutSection: {
    marginTop: spacing.md,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  aboutText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ctaWrapper: {
    marginTop: spacing.lg,
  },
});

export default CircleDetailSheet;
