import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Sparkles, Heart, Users, Compass, AlertCircle, Shield } from 'lucide-react-native';
import { BottomSheet, PillButton, Avatar, VerifiedBadge, colors, radii, typography, spacing } from '../../../design-system';
import { UserProfile, RelationshipIntent } from '../../../domain/types';
import { RelationshipStateMachine } from '../../../domain/relationshipStateMachine';

export interface ConnectRequestSheetProps {
  visible: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetProfile: UserProfile | null;
  blockedUserIds?: string[];
  onSubmit: (data: {
    recipientId: string;
    intent: RelationshipIntent;
    sharedContext: string;
    note?: string;
  }) => Promise<void>;
}

export const ConnectRequestSheet: React.FC<ConnectRequestSheetProps> = ({
  visible,
  onClose,
  currentUser,
  targetProfile,
  blockedUserIds = [],
  onSubmit,
}) => {
  const [selectedIntent, setSelectedIntent] = useState<RelationshipIntent>('friendship');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetProfile) return null;

  // Shared context detection
  const sharedInterests = (targetProfile.interests || []).filter((i) =>
    (currentUser.interests || []).includes(i)
  );

  const sharedContext =
    sharedInterests.length > 0
      ? `Shares ${sharedInterests.slice(0, 2).join(' & ')} in ${targetProfile.zone}`
      : `Located in ${targetProfile.zone} • Matching activity preferences`;

  // Check eligibility for dating intent
  const eligibility = RelationshipStateMachine.canSendConnectRequest(
    currentUser,
    targetProfile,
    selectedIntent,
    blockedUserIds
  );

  const isDatingAllowed = eligibility.allowedIntents.includes('dating');

  const handleSend = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        recipientId: targetProfile.userId,
        intent: selectedIntent,
        sharedContext,
        note: note.trim() || undefined,
      });
      onClose();
      setNote('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send connection request';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Connect with ${targetProfile.displayName}`}
      snapPoints={['75%']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {errorMsg && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Target Profile Header Preview */}
        <View style={styles.profileRow}>
          <Avatar
            name={targetProfile.displayName}
            size={52}
            uri={targetProfile.photos[0]}
            variant="roundedSquare"
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{targetProfile.displayName}, {targetProfile.ageBand || targetProfile.age}</Text>
              {targetProfile.isVerified && <VerifiedBadge size={16} style={styles.badge} />}
            </View>
            <Text style={styles.jobText}>{targetProfile.occupation || 'Member'}</Text>
            <Text style={styles.zoneText}>{targetProfile.zone} ({targetProfile.distanceBand || '2 to 5 km'})</Text>
          </View>
        </View>

        {/* Required Shared Context Banner (CONN-01) */}
        <View style={styles.contextCard}>
          <View style={styles.contextHeader}>
            <Sparkles size={14} color="#0284C7" />
            <Text style={styles.contextTitle}>Shared Context Required</Text>
          </View>
          <Text style={styles.contextText}>{sharedContext}</Text>
        </View>

        {/* Intent Selector (Friend / Activity Partner / Dating) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What kind of connection are you looking for?</Text>
          <View style={styles.intentGrid}>
            <Pressable
              onPress={() => setSelectedIntent('friendship')}
              style={[styles.intentCard, selectedIntent === 'friendship' && styles.intentCardActive]}
            >
              <Users size={16} color={selectedIntent === 'friendship' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.intentTitle, selectedIntent === 'friendship' && styles.intentTitleActive]}>
                Friendship
              </Text>
              <Text style={styles.intentSub}>Bond over weekly shared passions</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedIntent('explore')}
              style={[styles.intentCard, selectedIntent === 'explore' && styles.intentCardActive]}
            >
              <Compass size={16} color={selectedIntent === 'explore' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.intentTitle, selectedIntent === 'explore' && styles.intentTitleActive]}>
                Activity Partner
              </Text>
              <Text style={styles.intentSub}>Pair up for specific local sports/events</Text>
            </Pressable>

            <Pressable
              onPress={() => isDatingAllowed && setSelectedIntent('dating')}
              style={[
                styles.intentCard,
                selectedIntent === 'dating' && styles.intentCardActive,
                !isDatingAllowed && styles.intentCardDisabled,
              ]}
            >
              <Heart size={16} color={selectedIntent === 'dating' ? '#EC4899' : '#94A3B8'} />
              <Text style={[styles.intentTitle, selectedIntent === 'dating' && styles.intentTitleDatingActive]}>
                Dating
              </Text>
              <Text style={styles.intentSub}>
                {isDatingAllowed
                  ? 'Mutual opt-in dating connection'
                  : 'Unavailable (Dating not enabled by profile)'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Optional Short Note */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>Add a personal note (Optional)</Text>
            <Text style={styles.charCount}>{140 - note.length} left</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Hey Aisha! Loved your photo walk circle. Would love to connect!"
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            maxLength={140}
            multiline
          />
        </View>

        {/* Safety Note */}
        <View style={styles.safetyRow}>
          <Shield size={12} color="#64748B" />
          <Text style={styles.safetyText}>
            Direct chat unlocks only if {targetProfile.displayName} accepts your request.
          </Text>
        </View>

        {/* Primary CTA */}
        <View style={styles.ctaWrapper}>
          <PillButton
            label={isSubmitting ? 'Sending Request...' : 'Send Request'}
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            onPress={handleSend}
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: 4,
  },
  jobText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.primary,
    marginTop: 1,
  },
  zoneText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  contextCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: spacing.md,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  contextTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#0369A1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: '#0284C7',
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  charCount: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  intentGrid: {
    gap: 8,
  },
  intentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  intentCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  intentCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  intentTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  intentTitleActive: {
    color: colors.primary,
  },
  intentTitleDatingActive: {
    color: '#EC4899',
  },
  intentSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    minHeight: 55,
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  safetyText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  ctaWrapper: {
    marginTop: spacing.xs,
  },
});

export default ConnectRequestSheet;
