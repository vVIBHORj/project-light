import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Navigation, ShieldCheck, Check } from 'lucide-react-native';
import {
  GradientBackground,
  GlassCard,
  PillButton,
  OnboardingProgress,
  typography,
  colors,
  spacing,
  radii,
} from '../../src/design-system';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { analytics } from '../../src/lib/analytics';
import { mockZones } from '../../src/data/mocks/seedData';

const RADIUS_BANDS: { key: '2km' | '5km' | '10km' | 'anywhere'; label: string; sub: string }[] = [
  { key: '2km', label: 'Within 2 km', sub: 'Walking distance' },
  { key: '5km', label: 'Within 5 km', sub: 'Short cab / metro ride' },
  { key: '10km', label: 'Within 10 km', sub: 'Across nearby neighborhoods' },
  { key: 'anywhere', label: 'Anywhere in city', sub: 'All Bengaluru Circles' },
];

export default function LocationScreen() {
  const router = useRouter();
  const { draft, updateDraft, setStep, totalSteps } = useOnboardingStore();

  const [selectedCity] = useState<string>(draft.city || 'Bengaluru');
  const [selectedZone, setSelectedZone] = useState<string>(draft.zone || 'Indiranagar');
  const [radiusBand, setRadiusBand] = useState<'2km' | '5km' | '10km' | 'anywhere'>(
    draft.discoveryRadiusBand || '5km'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setStep(8);
  }, [setStep]);

  const handleApproximateLocation = () => {
    setIsLocating(true);
    setLocationSuccessMsg(null);

    // Simulate privacy-safe reverse geocoding to a zone without saving coordinates
    setTimeout(() => {
      setSelectedZone('Indiranagar');
      setIsLocating(false);
      setLocationSuccessMsg('Approximate zone identified: Indiranagar');
    }, 600);
  };

  const handleContinue = () => {
    updateDraft({
      city: selectedCity,
      zone: selectedZone,
      discoveryRadiusBand: radiusBand,
      stepIndex: 9,
    });

    analytics.track('onboarding_step_completed', {
      step: 'location_radius',
      city: selectedCity,
      zone: selectedZone,
      radius_band: radiusBand,
    });

    router.push('/(onboarding)/privacy');
  };

  return (
    <GradientBackground preset="sky">
      <SafeAreaView style={styles.safeArea}>
        {/* Header Progress */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={8} totalSteps={totalSteps} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Text style={styles.stepIndicator}>STEP 8 OF {totalSteps}</Text>
            <Text style={styles.headline}>Where are you based?</Text>
            <Text style={styles.subhead}>
              We connect you with local people and Circles around your neighborhood. Exact GPS is never stored.
            </Text>
          </View>

          {/* City & Zone Selector */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>City & Zone</Text>
            </View>

            <View style={styles.cityPill}>
              <Text style={styles.cityLabel}>City:</Text>
              <Text style={styles.cityName}>{selectedCity}</Text>
            </View>

            {/* Approximate Location Trigger */}
            <Pressable
              onPress={handleApproximateLocation}
              disabled={isLocating}
              style={styles.approxLocationBtn}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Navigation size={16} color={colors.primary} />
              )}
              <Text style={styles.approxLocationText}>
                {isLocating ? 'Detecting approximate zone...' : 'Use Approximate Location'}
              </Text>
            </Pressable>

            {locationSuccessMsg && (
              <Text style={styles.locationSuccessText}>{locationSuccessMsg}</Text>
            )}

            <Text style={styles.zoneSelectorLabel}>SELECT NEIGHBORHOOD ZONE</Text>
            <View style={styles.zonesGrid}>
              {mockZones.map((zone) => {
                const isSelected = selectedZone === zone;
                return (
                  <Pressable
                    key={zone}
                    onPress={() => setSelectedZone(zone)}
                    style={[styles.zoneChip, isSelected && styles.zoneChipSelected]}
                  >
                    <Text style={[styles.zoneChipText, isSelected && styles.zoneChipTextSelected]}>
                      {zone}
                    </Text>
                    {isSelected && <Check size={12} color={colors.textOnDark} style={{ marginLeft: 4 }} />}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Discovery Radius Bands */}
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Discovery Radius</Text>
            <Text style={styles.cardSubhead}>
              How far are you willing to travel for small circle meetups?
            </Text>

            <View style={styles.radiusList}>
              {RADIUS_BANDS.map((item) => {
                const isSelected = radiusBand === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setRadiusBand(item.key)}
                    style={[styles.radiusItem, isSelected && styles.radiusItemSelected]}
                  >
                    <View style={styles.radiusTextCol}>
                      <Text style={[styles.radiusLabel, isSelected && styles.radiusLabelSelected]}>
                        {item.label}
                      </Text>
                      <Text style={styles.radiusSub}>{item.sub}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Privacy Guarantee Note */}
          <View style={styles.privacyGuarantee}>
            <ShieldCheck size={18} color={colors.intent.friendship} />
            <Text style={styles.privacyGuaranteeText}>
              Privacy Safe: We only display distance bands (e.g. &quot;Within 2 km&quot;) and never broadcast exact GPS coordinates.
            </Text>
          </View>

          {/* Continue CTA */}
          <View style={styles.footerWrap}>
            <PillButton
              label="Continue"
              variant="primary"
              size="lg"
              onPress={handleContinue}
              style={styles.continueBtn}
            />
          </View>
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
  progressWrap: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  questionSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  stepIndicator: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  headline: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.hero,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.hero,
  },
  subhead: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardSubhead: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.sm,
    gap: 6,
  },
  cityLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cityName: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  approxLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDEBFB',
    paddingVertical: 9,
    borderRadius: radii.md,
    gap: 6,
  },
  approxLocationText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.primary,
  },
  locationSuccessText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.intent.friendship,
    textAlign: 'center',
  },
  zoneSelectorLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  zoneChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  zoneChipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  zoneChipTextSelected: {
    color: colors.textOnDark,
    fontWeight: typography.fontWeight.bold,
  },
  radiusList: {
    gap: spacing.xs,
  },
  radiusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.md,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 15, 26, 0.08)',
  },
  radiusItemSelected: {
    backgroundColor: '#DDEBFB',
    borderColor: colors.primary,
  },
  radiusTextCol: {
    flex: 1,
  },
  radiusLabel: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  radiusLabelSelected: {
    color: colors.primary,
  },
  radiusSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  privacyGuarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: spacing.md,
    borderRadius: radii.card,
  },
  privacyGuaranteeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  footerWrap: {
    marginTop: spacing.sm,
  },
  continueBtn: {
    width: '100%',
  },
});
