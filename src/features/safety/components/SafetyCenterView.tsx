import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { PillButton } from '../../../design-system/components/PillButton';
import {
  INDIA_EMERGENCY_HELPLINES,
  GRIEVANCE_OFFICER,
  UserProfile,
} from '../../../domain/types';
import { useSafetyStore } from '../state/useSafetyStore';
import { ReportModal } from './ReportModal';
import { BlockRestrictModal } from './BlockRestrictModal';
import { DateSafetyModal } from './DateSafetyModal';
import { TrustedContactsModal } from './TrustedContactsModal';
import { SafetyCaseTimelineModal } from './SafetyCaseTimelineModal';
import { AgeHoldModal } from './AgeHoldModal';

interface SafetyCenterViewProps {
  currentUser: UserProfile;
  onBack?: () => void;
}

export const SafetyCenterView: React.FC<SafetyCenterViewProps> = ({
  currentUser,
  onBack,
}) => {
  const {
    safetyCases,
    restrictions,
    trustedContacts,
    isReportModalOpen,
    isBlockRestrictModalOpen,
    blockRestrictTarget,
    isDateSafetyModalOpen,
    isTrustedContactsModalOpen,
    isCaseTimelineModalOpen,
    activeCase,
    isAgeHoldModalOpen,
    loadSafetyCases,
    loadRestrictions,
    loadTrustedContacts,
    openReportModal,
    openBlockRestrictModal,
    closeBlockRestrictModal,
    unblockUser,
    unrestrictUser,
    openCaseTimeline,
    closeCaseTimeline,
    closeReportModal,
    setDateSafetyModalOpen,
    setTrustedContactsModalOpen,
    setAgeHoldModalOpen,
    triggerSos,
  } = useSafetyStore();

  useEffect(() => {
    loadSafetyCases(currentUser.userId);
    loadRestrictions(currentUser.userId);
    loadTrustedContacts(currentUser.userId);
  }, [loadSafetyCases, loadRestrictions, loadTrustedContacts, currentUser.userId]);

  const handleDialHelpline = (number: string, name: string) => {
    Alert.alert(
      `Call ${name}?`,
      `Dial ${number} (Emergency Service for India). This will open your phone dialer.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${number}`,
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Unable to open phone dialer', `Please dial ${number} directly.`);
            });
          },
        },
      ]
    );
  };

  const handleQuickSos = async () => {
    Alert.alert(
      'Trigger Emergency Helper? 🚨',
      'This will immediately send an alert with your location details to your trusted contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Emergency Alert',
          style: 'destructive',
          onPress: async () => {
            const res = await triggerSos();
            Alert.alert('Alert Dispatched 🛡️', res.message);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleRow}>
          <View style={styles.tealBadge}>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Trust & Safety Center</Text>
            <Text style={styles.headerSubtitle}>
              Protection, privacy boundaries, and statutory support
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Quick Action Banner */}
        <View style={styles.sosCard}>
          <View style={styles.sosHeader}>
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.sosTitle}>Need Immediate Help?</Text>
          </View>
          <Text style={styles.sosDesc}>
            If you feel unsafe during a meetup or date, trigger an immediate alert to your trusted contacts or dial India Emergency Services (112).
          </Text>
          <View style={styles.sosBtnRow}>
            <TouchableOpacity style={styles.sosPrimaryBtn} onPress={handleQuickSos}>
              <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
              <Text style={styles.sosPrimaryBtnText}>Something’s Wrong (SOS)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sosDialBtn}
              onPress={() => handleDialHelpline('112', 'National Emergency')}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.sosDialBtnText}>Dial 112</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tools Grid */}
        <Text style={styles.sectionTitle}>Safety Tools & Features</Text>

        <View style={styles.toolsGrid}>
          {/* Date Safety Planner */}
          <GlassCard style={styles.toolCard}>
            <TouchableOpacity
              style={styles.toolTouchable}
              onPress={() => setDateSafetyModalOpen(true)}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(14, 159, 142, 0.12)' }]}>
                <Ionicons name="heart-circle" size={24} color={colors.safety} />
              </View>
              <Text style={styles.toolTitle}>Date Safety Plan</Text>
              <Text style={styles.toolDesc}>
                Pre-date checklist, public spot tips, and live check-in timer
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Trusted Contacts */}
          <GlassCard style={styles.toolCard}>
            <TouchableOpacity
              style={styles.toolTouchable}
              onPress={() => setTrustedContactsModalOpen(true)}
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(47, 128, 237, 0.12)' }]}>
                <Ionicons name="people-circle" size={24} color={colors.primary} />
              </View>
              <Text style={styles.toolTitle}>
                Trusted Contacts ({trustedContacts.length})
              </Text>
              <Text style={styles.toolDesc}>
                Add verified contacts who receive your check-in notifications
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Blocked & Restricted */}
          <GlassCard style={styles.toolCard}>
            <TouchableOpacity
              style={styles.toolTouchable}
              onPress={() =>
                openBlockRestrictModal({ userId: 'manage', name: 'your account list' })
              }
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(229, 72, 77, 0.12)' }]}>
                <Ionicons name="ban" size={24} color={colors.destructive} />
              </View>
              <Text style={styles.toolTitle}>
                Block & Restrict ({restrictions.length})
              </Text>
              <Text style={styles.toolDesc}>
                Manage mutual invisibility and quiet interaction boundaries
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Report an Issue */}
          <GlassCard style={styles.toolCard}>
            <TouchableOpacity
              style={styles.toolTouchable}
              onPress={() =>
                openReportModal({
                  targetType: 'user',
                  targetId: 'general_inquiry',
                  targetName: 'Community Incident',
                })
              }
            >
              <View style={[styles.toolIconBox, { backgroundColor: 'rgba(242, 201, 76, 0.15)' }]}>
                <Ionicons name="flag" size={24} color="#D97706" />
              </View>
              <Text style={styles.toolTitle}>Report a Concern</Text>
              <Text style={styles.toolDesc}>
                Confidential reporting with tracked Case ID and review
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Safety Case Tracker (SAFE-07) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your Safety Reports ({safetyCases.length})</Text>
        </View>

        {safetyCases.length === 0 ? (
          <View style={styles.emptyCaseCard}>
            <Ionicons name="checkmark-done-circle" size={32} color={colors.safety} />
            <Text style={styles.emptyCaseTitle}>No Active Reports</Text>
            <Text style={styles.emptyCaseSubtitle}>
              When you submit a report, you will receive a trackable Case ID and timeline here.
            </Text>
          </View>
        ) : (
          safetyCases.map((sc) => (
            <GlassCard key={sc.caseId} style={styles.caseCard}>
              <TouchableOpacity onPress={() => openCaseTimeline(sc)}>
                <View style={styles.caseHeader}>
                  <Text style={styles.caseIdText}>{sc.caseId}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      sc.status === 'action_taken' && styles.statusPillSuccess,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{sc.status.replace('_', ' ')}</Text>
                  </View>
                </View>

                <Text style={styles.caseTargetText}>
                  Regarding: {sc.targetName} ({sc.category.replace('_', ' ')})
                </Text>
                <Text style={styles.caseDateText}>Filed on {new Date(sc.createdAt).toLocaleDateString()}</Text>

                <View style={styles.viewTimelineRow}>
                  <Text style={styles.viewTimelineText}>View Case Timeline</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.safety} />
                </View>
              </TouchableOpacity>
            </GlassCard>
          ))
        )}

        {/* Emergency Numbers for India (SAFE-01) */}
        <Text style={styles.sectionTitle}>Official Indian Emergency Helplines</Text>
        <Text style={styles.helplineNotice}>
          Informational directory for safety assistance across India. Tapping dials directly.
        </Text>

        <View style={styles.helplineList}>
          {INDIA_EMERGENCY_HELPLINES.map((hl) => (
            <TouchableOpacity
              key={hl.number}
              style={styles.helplineItem}
              onPress={() => handleDialHelpline(hl.number, hl.name)}
            >
              <View style={styles.helplineInfo}>
                <Text style={styles.helplineName}>{hl.name}</Text>
                <Text style={styles.helplineDesc}>{hl.description}</Text>
              </View>
              <View style={styles.helplineDialBox}>
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={styles.helplineDialText}>{hl.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grievance Officer & Statutory Compliance (SAFE-01, IT Rules 2021) */}
        <Text style={styles.sectionTitle}>Statutory Grievance Redressal</Text>
        <GlassCard style={styles.grievanceCard}>
          <View style={styles.grievanceHeader}>
            <Ionicons name="business" size={18} color={colors.safety} />
            <Text style={styles.grievanceTitle}>Resident Grievance Officer</Text>
          </View>

          <Text style={styles.grievanceOfficerName}>{GRIEVANCE_OFFICER.name}</Text>
          <Text style={styles.grievanceOfficerRole}>{GRIEVANCE_OFFICER.designation}</Text>
          <Text style={styles.grievanceEmail}>Email: {GRIEVANCE_OFFICER.email}</Text>
          <Text style={styles.grievanceAddress}>{GRIEVANCE_OFFICER.address}</Text>

          <Text style={styles.grievanceStatutory}>
            {GRIEVANCE_OFFICER.statutoryNotice}
          </Text>
        </GlassCard>

        {/* Youth Policy & Age Hold Link (SAFE-08) */}
        <TouchableOpacity
          style={styles.ageHoldLink}
          onPress={() => setAgeHoldModalOpen(true)}
        >
          <Ionicons name="shield-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.ageHoldLinkText}>View Under-18 Youth Safety & Hold Policy</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <ReportModal
        visible={isReportModalOpen}
        currentUser={currentUser}
        onClose={closeReportModal}
      />

      <BlockRestrictModal
        visible={isBlockRestrictModalOpen}
        currentUser={currentUser}
        targetUser={blockRestrictTarget || { userId: '', name: 'Selected Account' }}
        onClose={closeBlockRestrictModal}
      />

      <DateSafetyModal
        visible={isDateSafetyModalOpen}
        currentUser={currentUser}
        onClose={() => setDateSafetyModalOpen(false)}
      />

      <TrustedContactsModal
        visible={isTrustedContactsModalOpen}
        currentUser={currentUser}
        onClose={() => setTrustedContactsModalOpen(false)}
      />

      {activeCase && (
        <SafetyCaseTimelineModal
          visible={isCaseTimelineModalOpen}
          safetyCase={activeCase}
          onClose={closeCaseTimeline}
        />
      )}

      <AgeHoldModal
        visible={isAgeHoldModalOpen}
        onClose={() => setAgeHoldModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAF9',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backBtn: {
    marginBottom: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tealBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.safety,
    alignItems: 'center',
    justifyContent: 'center',
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sosCard: {
    backgroundColor: '#B91C1C',
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sosTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  sosDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginVertical: 4,
  },
  sosBtnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  sosPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7F1D1D',
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  sosPrimaryBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  sosDialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  sosDialBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolsGrid: {
    gap: spacing.sm,
  },
  toolCard: {
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 0,
    ...shadows.card,
  },
  toolTouchable: {
    padding: spacing.md,
  },
  toolIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  toolTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  toolDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyCaseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.card,
  },
  emptyCaseTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  emptyCaseSubtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  caseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.card,
    padding: spacing.md,
    ...shadows.card,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  caseIdText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.safety,
  },
  statusPill: {
    backgroundColor: 'rgba(242, 201, 76, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  statusPillSuccess: {
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
  },
  statusPillText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  caseTargetText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  caseDateText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  viewTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: spacing.xs,
  },
  viewTimelineText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.safety,
  },
  helplineNotice: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  helplineList: {
    gap: spacing.xs,
  },
  helplineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: spacing.md,
    borderRadius: radii.card,
    ...shadows.card,
  },
  helplineInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  helplineName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  helplineDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  helplineDialBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.safety,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  helplineDialText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  grievanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.card,
    padding: spacing.md,
    gap: 3,
    ...shadows.card,
  },
  grievanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  grievanceTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.safety,
  },
  grievanceOfficerName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  grievanceOfficerRole: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  grievanceEmail: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: 4,
  },
  grievanceAddress: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  grievanceStatutory: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 14,
    marginTop: spacing.xs,
  },
  ageHoldLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  ageHoldLinkText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
