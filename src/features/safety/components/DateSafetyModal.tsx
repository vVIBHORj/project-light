import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, shadows, typography } from '../../../design-system/tokens';
import { useSafetyStore } from '../state/useSafetyStore';
import { UserProfile } from '../../../domain/types';

const PRE_DATE_TIPS = [
  {
    icon: 'map-marker-radius-outline' as const,
    title: 'Choose a Public Venue',
    desc: 'Meet at busy cafes, parks, or galleries for the first few interactions.',
  },
  {
    icon: 'car-side' as const,
    title: 'Control Your Own Transportation',
    desc: 'Arrange your own ride to and from the venue so you are always in control of when you leave.',
  },
  {
    icon: 'shield-account-outline' as const,
    title: 'Keep Chats on Light Initially',
    desc: 'Stay on Light until mutual trust is built; off-platform behavior is harder to moderate.',
  },
  {
    icon: 'glass-cocktail-off' as const,
    title: 'Stay Aware & In Control',
    desc: 'Keep your drink and belongings in sight. Never feel guilty leaving at any moment.',
  },
];

export interface DateSafetyModalProps {
  visible?: boolean;
  currentUser?: UserProfile;
  onClose?: () => void;
}

export const DateSafetyModal: React.FC<DateSafetyModalProps> = ({
  visible: propVisible,
  onClose: propClose,
}) => {
  const isStoreOpen = useSafetyStore((s) => s.isDateSafetyModalOpen);
  const activePlan = useSafetyStore((s) => s.activeDatePlan);
  const trustedContacts = useSafetyStore((s) => s.trustedContacts);
  const setDateSafetyModalOpen = useSafetyStore((s) => s.setDateSafetyModalOpen);
  const startDateSafetyTimer = useSafetyStore((s) => s.startDateSafetyTimer);
  const triggerSos = useSafetyStore((s) => s.triggerSos);

  const isVisible = propVisible !== undefined ? propVisible : isStoreOpen;
  const handleClose = propClose || (() => setDateSafetyModalOpen(false));

  const [partnerName, setPartnerName] = useState('');
  const [venueCategory, setVenueCategory] = useState('');
  const [locationZone, setLocationZone] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [activeTab, setActiveTab] = useState<'tips' | 'plan'>('tips');

  const handleStartTimer = async () => {
    if (!partnerName.trim() || !venueCategory.trim() || !locationZone.trim()) {
      Alert.alert('Details Required', 'Please enter partner name, venue type, and neighborhood zone.');
      return;
    }

    await startDateSafetyTimer({
      connectionId: `conn_${Date.now()}`,
      partnerName: partnerName.trim(),
      venueCategory: venueCategory.trim(),
      locationZone: locationZone.trim(),
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timerDurationMinutes: durationHours * 60,
    });
  };

  const handleSosTrigger = () => {
    Alert.alert(
      'Trigger Quick Safety Alert?',
      'This will notify your trusted contacts with your recorded meetup venue and alert emergency response.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            await triggerSos();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.safetyIconBubble}>
                <MaterialCommunityIcons name="heart-flash" size={20} color={colors.safety} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Date & Meetup Safety</Text>
                <Text style={styles.sheetSubtitle}>Proactive safety tools for 1:1 interactions</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityLabel="Close modal"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Segment Selector */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'tips' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('tips')}
            >
              <Text style={[styles.segmentText, activeTab === 'tips' && styles.segmentTextActive]}>
                Safety Tips
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'plan' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('plan')}
            >
              <Text style={[styles.segmentText, activeTab === 'plan' && styles.segmentTextActive]}>
                Check-in Timer {activePlan && '🟢'}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'tips' ? (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionHeading}>4 Golden Rules for Meeting Offline</Text>

              <View style={styles.tipsList}>
                {PRE_DATE_TIPS.map((tip, idx) => (
                  <View key={idx} style={styles.tipCard}>
                    <View style={styles.tipIconBox}>
                      <MaterialCommunityIcons name={tip.icon} size={22} color={colors.safety} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipDesc}>{tip.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.primaryPill}
                onPress={() => setActiveTab('plan')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="timer-outline" size={20} color={colors.surface} />
                <Text style={styles.primaryPillText}>Set Up Check-In Timer</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {activePlan ? (
                /* Active Timer Status */
                <View style={styles.activePlanCard}>
                  <View style={styles.activePlanHeader}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.activePlanTitle}>Check-In Timer Active</Text>
                  </View>

                  <View style={styles.planInfoRow}>
                    <Text style={styles.planInfoLabel}>Meeting With:</Text>
                    <Text style={styles.planInfoVal}>{activePlan.partnerName}</Text>
                  </View>
                  <View style={styles.planInfoRow}>
                    <Text style={styles.planInfoLabel}>Venue & Zone:</Text>
                    <Text style={styles.planInfoVal}>
                      {activePlan.venueCategory} ({activePlan.locationZone})
                    </Text>
                  </View>
                  <View style={styles.planInfoRow}>
                    <Text style={styles.planInfoLabel}>Timer Duration:</Text>
                    <Text style={styles.planInfoVal}>{activePlan.timerDurationMinutes} mins</Text>
                  </View>
                  <View style={styles.planInfoRow}>
                    <Text style={styles.planInfoLabel}>Status:</Text>
                    <Text style={[styles.planInfoVal, { color: colors.safety }]}>
                      {activePlan.timerStatus.toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.sosButton}
                    onPress={handleSosTrigger}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="alert-octagon" size={20} color={colors.surface} />
                    <Text style={styles.sosButtonText}>Something&apos;s Wrong (Quick SOS)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Setup Timer Form */
                <View style={styles.formContainer}>
                  <Text style={styles.fieldLabel}>Who are you meeting?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Priya Sharma"
                    placeholderTextColor={colors.textMuted}
                    value={partnerName}
                    onChangeText={setPartnerName}
                  />

                  <Text style={styles.fieldLabel}>Public Venue Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cafe / Restaurant / Gallery"
                    placeholderTextColor={colors.textMuted}
                    value={venueCategory}
                    onChangeText={setVenueCategory}
                  />

                  <Text style={styles.fieldLabel}>Neighborhood / Zone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Indiranagar, Bangalore"
                    placeholderTextColor={colors.textMuted}
                    value={locationZone}
                    onChangeText={setLocationZone}
                  />

                  <Text style={styles.fieldLabel}>Check-In Time Interval</Text>
                  <View style={styles.durationRow}>
                    {[1, 2, 3, 4].map((hours) => (
                      <TouchableOpacity
                        key={hours}
                        style={[
                          styles.durationChip,
                          durationHours === hours && styles.durationChipSelected,
                        ]}
                        onPress={() => setDurationHours(hours)}
                      >
                        <Text
                          style={[
                            styles.durationChipText,
                            durationHours === hours && styles.durationChipTextSelected,
                          ]}
                        >
                          {hours} hr{hours > 1 ? 's' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {trustedContacts.length > 0 && (
                    <View style={styles.contactNotice}>
                      <MaterialCommunityIcons name="account-heart" size={18} color={colors.safety} />
                      <Text style={styles.contactNoticeText}>
                        {trustedContacts.length} trusted contact{trustedContacts.length > 1 ? 's' : ''} on standby.
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.primaryPill}
                    onPress={handleStartTimer}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="shield-check" size={20} color={colors.surface} />
                    <Text style={styles.primaryPillText}>Start Safety Check-In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.bottomSheet,
    borderTopRightRadius: radii.bottomSheet,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  safetyIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(14, 159, 142, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radii.pill,
    padding: 4,
    marginVertical: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  segmentText: {
    fontSize: typography.fontSize.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scrollBody: {
    paddingTop: 8,
  },
  sectionHeading: {
    fontSize: typography.fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.md,
    padding: 14,
    gap: 12,
  },
  tipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tipDesc: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  primaryPill: {
    backgroundColor: colors.safety,
    borderRadius: radii.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.card,
  },
  primaryPillText: {
    color: colors.surface,
    fontSize: typography.fontSize.body,
    fontWeight: '700',
  },
  formContainer: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  durationChipSelected: {
    borderColor: colors.safety,
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
  },
  durationChipText: {
    fontSize: typography.fontSize.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationChipTextSelected: {
    color: colors.safety,
    fontWeight: '700',
  },
  contactNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 159, 142, 0.08)',
    padding: 10,
    borderRadius: radii.sm,
    gap: 8,
    marginVertical: 4,
  },
  contactNoticeText: {
    fontSize: typography.fontSize.caption,
    color: colors.safety,
    fontWeight: '600',
  },
  activePlanCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(14, 159, 142, 0.3)',
    padding: 18,
    gap: 12,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.safety,
  },
  activePlanTitle: {
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: '700',
    color: colors.safety,
  },
  planInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planInfoLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  planInfoVal: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sosButton: {
    backgroundColor: colors.destructive,
    borderRadius: radii.pill,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...shadows.card,
  },
  sosButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.body,
    fontWeight: '700',
  },
});
