import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';
import { DiscoveryFilterOptions } from '../services/RankingService';
import { mockZones } from '../../../data/mocks/seedData';
import { RelationshipIntent } from '../../../domain/types';

export interface DiscoveryFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: DiscoveryFilterOptions;
  onApplyFilters: (filters: Partial<DiscoveryFilterOptions>) => void;
  onResetFilters: () => void;
}

export const DiscoveryFilterSheet: React.FC<DiscoveryFilterSheetProps> = ({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [intent, setIntent] = useState<RelationshipIntent | 'all'>(currentFilters.intent || 'all');
  const [radiusBand, setRadiusBand] = useState(currentFilters.radiusBand || 'All');
  const [zone, setZone] = useState(currentFilters.zone || 'All');
  const [ageBand, setAgeBand] = useState(currentFilters.ageBand || 'All');
  const [priceBand, setPriceBand] = useState(currentFilters.priceBand || 'All');
  const [verifiedOnly, setVerifiedOnly] = useState(!!currentFilters.verifiedOnly);

  const handleApply = () => {
    onApplyFilters({
      intent,
      radiusBand: radiusBand as DiscoveryFilterOptions['radiusBand'],
      zone,
      ageBand,
      priceBand: priceBand as DiscoveryFilterOptions['priceBand'],
      verifiedOnly,
    });
    onClose();
  };

  const handleReset = () => {
    setIntent('all');
    setRadiusBand('All');
    setZone('All');
    setAgeBand('All');
    setPriceBand('All');
    setVerifiedOnly(false);
    onResetFilters();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Discovery Filters"
      snapPoints={['75%']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section: Intent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intent</Text>
          <View style={styles.chipsRow}>
            {(['all', 'friendship', 'community', 'dating', 'explore'] as const).map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setIntent(opt)}
                style={[styles.chip, intent === opt && styles.chipActive]}
              >
                <Text style={[styles.chipText, intent === opt && styles.chipTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section: Distance Band (Privacy safe) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance Band</Text>
          <View style={styles.chipsRow}>
            {(['All', 'Within 2 km', '2 to 5 km', '5 to 10 km'] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setRadiusBand(r)}
                style={[styles.chip, radiusBand === r && styles.chipActive]}
              >
                <Text style={[styles.chipText, radiusBand === r && styles.chipTextActive]}>
                  {r}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section: Area / Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Neighborhood Zone</Text>
          <View style={styles.chipsRow}>
            {['All', ...mockZones.slice(0, 7)].map((z) => (
              <Pressable
                key={z}
                onPress={() => setZone(z)}
                style={[styles.chip, zone === z && styles.chipActive]}
              >
                <Text style={[styles.chipText, zone === z && styles.chipTextActive]}>
                  {z}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section: Age Band */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Band</Text>
          <View style={styles.chipsRow}>
            {(['All', '18-24', '25-29', '30-34', '35+'] as const).map((a) => (
              <Pressable
                key={a}
                onPress={() => setAgeBand(a)}
                style={[styles.chip, ageBand === a && styles.chipActive]}
              >
                <Text style={[styles.chipText, ageBand === a && styles.chipTextActive]}>
                  {a}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section: Activity Cost */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Price</Text>
          <View style={styles.chipsRow}>
            {(['All', 'Free', 'Under ₹500'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPriceBand(p)}
                style={[styles.chip, priceBand === p && styles.chipActive]}
              >
                <Text style={[styles.chipText, priceBand === p && styles.chipTextActive]}>
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section: Verified Profiles Only */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Verified Profiles Only</Text>
            <Text style={styles.switchSub}>Show profiles with verified photo badges</Text>
          </View>
          <Switch
            value={verifiedOnly}
            onValueChange={setVerifiedOnly}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset All</Text>
          </Pressable>
          <PillButton
            label="Apply Filters"
            variant="primary"
            size="md"
            onPress={handleApply}
            style={styles.applyBtn}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.sm,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  switchTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  switchSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
  },
  resetText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 1,
  },
});

export default DiscoveryFilterSheet;
