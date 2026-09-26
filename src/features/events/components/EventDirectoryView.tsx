import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { Avatar } from '../../../design-system/components/Avatar';
import { VerifiedBadge } from '../../../design-system/components/VerifiedBadge';
import { PillButton } from '../../../design-system/components/PillButton';
import { Event } from '../../../domain/types';
import { useEventStore } from '../state/useEventStore';

interface EventDirectoryViewProps {
  onSelectEvent: (event: Event) => void;
  onCreateEventPress: () => void;
}

export const EventDirectoryView: React.FC<EventDirectoryViewProps> = ({
  onSelectEvent,
  onCreateEventPress,
}) => {
  const {
    events,
    isLoadingEvents,
    filters,
    loadEvents,
    setFilters,
  } = useEventStore();

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const categories = ['All', 'Street Photography', 'Badminton', 'Running', 'Board Games', 'Formula 1'];
  const priceBands = ['All', 'Free', 'Under ₹500', 'Split cost'];

  const handleSearchSubmit = () => {
    setFilters({ searchQuery });
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Create Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events & Activities</Text>
          <Text style={styles.headerSubtitle}>
            Real-world small group gatherings across Bengaluru
          </Text>
        </View>
        <PillButton
          label="+ Host Event"
          variant="primary"
          size="sm"
          onPress={onCreateEventPress}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by activity, title, or zone..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setFilters({ searchQuery: '' });
            }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Bar (Category & Price) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {/* Verified Host Toggle Chip */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.verifiedHostOnly && styles.filterChipActive,
          ]}
          onPress={() => setFilters({ verifiedHostOnly: !filters.verifiedHostOnly })}
        >
          <Ionicons
            name="shield-checkmark"
            size={14}
            color={filters.verifiedHostOnly ? '#FFFFFF' : colors.primary}
          />
          <Text
            style={[
              styles.filterChipText,
              filters.verifiedHostOnly && styles.filterChipTextActive,
            ]}
          >
            Verified Hosts
          </Text>
        </TouchableOpacity>

        {/* Category Chips */}
        {categories.map((cat) => {
          const isSelected = (filters.category || 'All') === cat;
          return (
            <TouchableOpacity
              key={`cat_${cat}`}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setFilters({ category: cat })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Price Band Chips */}
        {priceBands.map((pb) => {
          const isSelected = (filters.priceBand || 'All') === pb;
          return (
            <TouchableOpacity
              key={`pb_${pb}`}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setFilters({ priceBand: pb })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {pb}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Event Cards List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 && !isLoadingEvents ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No events matching filters</Text>
            <Text style={styles.emptySubtitle}>
              Try changing category, location zone, or host filters to discover upcoming sessions.
            </Text>
          </View>
        ) : (
          events.map((ev) => {
            const isFull = ev.rsvpsCount >= ev.capacity;
            const spotsLeft = Math.max(0, ev.capacity - ev.rsvpsCount);

            return (
              <GlassCard key={ev.id} style={styles.eventCard}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => onSelectEvent(ev)}
                >
                  {/* Cover Image & Chips Overlay */}
                  <View style={styles.coverWrapper}>
                    <Image
                      source={{
                        uri:
                          ev.coverImage ||
                          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
                      }}
                      style={styles.coverImage}
                    />
                    <View style={styles.overlayTopRow}>
                      <View style={styles.chipPill}>
                        <Text style={styles.chipPillText}>{ev.activityType}</Text>
                      </View>
                      <View
                        style={[
                          styles.chipPill,
                          isFull ? styles.chipPillFull : styles.chipPillSpots,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipPillText,
                            isFull ? styles.chipTextFull : styles.chipTextSpots,
                          ]}
                        >
                          {isFull
                            ? `Waitlist (${ev.waitlistCount || 0})`
                            : `${spotsLeft} spots left`}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Body Content */}
                  <View style={styles.cardBody}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {ev.title}
                    </Text>

                    {/* Time & Venue Row */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.primary} />
                        <Text style={styles.metaText}>
                          {ev.dateStr} • {ev.timeStr}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.metaText}>{ev.venueZone}</Text>
                      </View>
                      <View style={styles.priceTag}>
                        <Text style={styles.priceText}>{ev.priceBand}</Text>
                      </View>
                    </View>

                    {/* Host Info Footer */}
                    <View style={styles.hostFooter}>
                      <View style={styles.hostInfo}>
                        <Avatar
                          uri={ev.hostAvatar}
                          name={ev.hostName}
                          size={28}
                          verified={ev.isHostVerified}
                        />
                        <Text style={styles.hostName}>{ev.hostName}</Text>
                        {ev.isHostVerified && <VerifiedBadge size={14} />}
                      </View>

                      {ev.circleTitle && (
                        <View style={styles.circleTag}>
                          <Ionicons name="people" size={12} color={colors.primary} />
                          <Text style={styles.circleTagText} numberOfLines={1}>
                            {ev.circleTitle}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </GlassCard>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...shadows.card,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.chip,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  eventCard: {
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 0,
    ...shadows.card,
  },
  coverWrapper: {
    position: 'relative',
    height: 140,
    width: '100%',
    backgroundColor: '#E0E7FF',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayTopRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  chipPillSpots: {
    backgroundColor: 'rgba(47, 128, 237, 0.9)',
  },
  chipPillFull: {
    backgroundColor: 'rgba(235, 87, 87, 0.9)',
  },
  chipPillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  chipTextSpots: {
    color: '#FFFFFF',
  },
  chipTextFull: {
    color: '#FFFFFF',
  },
  cardBody: {
    padding: spacing.md,
  },
  eventTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  priceTag: {
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  priceText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  hostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hostName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  circleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 128, 237, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    maxWidth: '45%',
  },
  circleTagText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
