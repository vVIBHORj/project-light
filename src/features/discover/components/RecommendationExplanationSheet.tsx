import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Sparkles, Calendar, Users, MapPin, EyeOff } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';
import { CandidateUser, CandidateCircle } from '../services/RankingService';

export interface RecommendationExplanationSheetProps {
  visible: boolean;
  onClose: () => void;
  candidateUser?: CandidateUser | null;
  candidateCircle?: CandidateCircle | null;
  onShowFewerLikeThis?: () => void;
}

export const RecommendationExplanationSheet: React.FC<RecommendationExplanationSheetProps> = ({
  visible,
  onClose,
  candidateUser,
  candidateCircle,
  onShowFewerLikeThis,
}) => {

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Why are you seeing this?"
      snapPoints={['65%']}
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Recommendations on Light are powered strictly by your declared preferences and explicit profile signals — never behavioral tracking or psychological profiling.
        </Text>

        <View style={styles.signalsList}>
          {/* Signal 1: Shared Interests */}
          <View style={styles.signalCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Sparkles size={18} color="#0284C7" />
            </View>
            <View style={styles.signalContent}>
              <Text style={styles.signalTitle}>Shared Interests</Text>
              <Text style={styles.signalDescription}>
                {candidateUser && candidateUser.sharedInterests.length > 0
                  ? `You both declared interest in: ${candidateUser.sharedInterests.join(', ')}.`
                  : candidateCircle
                  ? `Matches your declared interests in ${candidateCircle.circle.category}.`
                  : 'Matches your active interest catalog.'}
              </Text>
            </View>
          </View>

          {/* Signal 2: Zone & Location Band */}
          <View style={styles.signalCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <MapPin size={18} color="#16A34A" />
            </View>
            <View style={styles.signalContent}>
              <Text style={styles.signalTitle}>Zone & Distance Band</Text>
              <Text style={styles.signalDescription}>
                Located in {candidateUser?.profile.zone || candidateCircle?.circle.locationZone || 'your city'} ({candidateUser?.distanceBand || candidateCircle?.distanceBand || '2 to 5 km'}), within your discovery radius.
              </Text>
            </View>
          </View>

          {/* Signal 3: Availability & Activity Cadence */}
          <View style={styles.signalCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Calendar size={18} color="#D97706" />
            </View>
            <View style={styles.signalContent}>
              <Text style={styles.signalTitle}>Availability Fit</Text>
              <Text style={styles.signalDescription}>
                {candidateCircle
                  ? `Meets at "${candidateCircle.circle.cadence}", matching your open slots.`
                  : 'Active time window matches your weekly social style preferences.'}
              </Text>
            </View>
          </View>

          {/* Signal 4: Group Size Fit */}
          <View style={styles.signalCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Users size={18} color="#9333EA" />
            </View>
            <View style={styles.signalContent}>
              <Text style={styles.signalTitle}>Group Size & Intent Alignment</Text>
              <Text style={styles.signalDescription}>
                {candidateCircle
                  ? `Small-group Circle capped at ${candidateCircle.circle.capacity} people for comfortable interactions.`
                  : `Compatible relationship intent (${candidateUser?.profile.primaryIntent || 'friendship'}).`}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button: Show fewer like this */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              onShowFewerLikeThis?.();
              onClose();
            }}
            style={styles.fewerBtn}
            accessibilityRole="button"
            accessibilityLabel="Show fewer recommendations like this"
          >
            <EyeOff size={16} color="#64748B" />
            <Text style={styles.fewerBtnText}>Show fewer like this</Text>
          </Pressable>

          <PillButton
            label="Got it"
            variant="primary"
            size="md"
            onPress={onClose}
            style={styles.gotItBtn}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  signalsList: {
    gap: 12,
  },
  signalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  signalContent: {
    flex: 1,
  },
  signalTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  signalDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  fewerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
  },
  fewerBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: '#64748B',
  },
  gotItBtn: {
    flex: 1,
  },
});

export default RecommendationExplanationSheet;
