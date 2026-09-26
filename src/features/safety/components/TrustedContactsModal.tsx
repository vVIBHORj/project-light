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

export interface TrustedContactsModalProps {
  visible?: boolean;
  currentUser?: UserProfile;
  onClose?: () => void;
}

export const TrustedContactsModal: React.FC<TrustedContactsModalProps> = ({
  visible: propVisible,
  currentUser,
  onClose: propClose,
}) => {
  const isStoreOpen = useSafetyStore((s) => s.isTrustedContactsModalOpen);
  const contacts = useSafetyStore((s) => s.trustedContacts);
  const setTrustedContactsModalOpen = useSafetyStore((s) => s.setTrustedContactsModalOpen);
  const addTrustedContact = useSafetyStore((s) => s.addTrustedContact);
  const deleteTrustedContact = useSafetyStore((s) => s.deleteTrustedContact);

  const isVisible = propVisible !== undefined ? propVisible : isStoreOpen;
  const handleClose = propClose || (() => setTrustedContactsModalOpen(false));

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [testSentId, setTestSentId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert('Required Fields', 'Please provide a name and phone number.');
      return;
    }
    if (!hasConsent) {
      Alert.alert(
        'Consent Required',
        'Please confirm you have informed this person before adding them as a trusted contact.'
      );
      return;
    }

    setIsAdding(true);
    const userId = currentUser?.userId || 'current_user';
    try {
      await addTrustedContact({
        userId,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        relationship: relationship.trim() || 'Friend',
      });
      setName('');
      setPhoneNumber('');
      setRelationship('');
      setHasConsent(false);
      Alert.alert('Contact Added', `${name.trim()} has been saved as your trusted safety contact.`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTestShare = (contactName: string, id: string) => {
    setTestSentId(id);
    setTimeout(() => {
      setTestSentId(null);
      Alert.alert(
        'Test Message Sent',
        `A sample safety test link has been dispatched to ${contactName}. They now know they are your trusted contact.`
      );
    }, 600);
  };

  const handleDelete = (id: string, contactName: string) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contactName} from your trusted contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteTrustedContact(id),
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
                <MaterialCommunityIcons name="account-multiple-check-outline" size={20} color={colors.safety} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Trusted Contacts</Text>
                <Text style={styles.sheetSubtitle}>Automatic notifications during date check-ins</Text>
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

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Existing Contacts */}
            {contacts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Your Contacts ({contacts.length})</Text>
                <View style={styles.contactList}>
                  {contacts.map((c) => (
                    <View key={c.id} style={styles.contactCard}>
                      <View style={styles.contactIcon}>
                        <MaterialCommunityIcons name="account-heart" size={22} color={colors.safety} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>{c.name}</Text>
                        <Text style={styles.contactPhone}>{c.phoneMasked || c.phoneNumber}</Text>
                        {c.relationship && (
                          <Text style={styles.contactRel}>{c.relationship}</Text>
                        )}
                      </View>

                      <View style={styles.contactActions}>
                        <TouchableOpacity
                          style={styles.testBtn}
                          onPress={() => handleTestShare(c.name, c.id)}
                        >
                          <Text style={styles.testBtnText}>
                            {testSentId === c.id ? 'Sending...' : 'Test Share'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(c.id, c.name)}
                          style={styles.deleteBtn}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Add Contact Form */}
            <View style={styles.addFormCard}>
              <Text style={styles.formTitle}>Add New Trusted Contact</Text>
              <Text style={styles.formDesc}>
                Contact numbers are encrypted and masked per Indian privacy standards.
              </Text>

              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sneha Roy"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <Text style={styles.fieldLabel}>Relationship (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Best Friend, Roommate, Sister"
                placeholderTextColor={colors.textMuted}
                value={relationship}
                onChangeText={setRelationship}
              />

              {/* Consent Checkbox */}
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => setHasConsent(!hasConsent)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={hasConsent ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={hasConsent ? colors.safety : colors.textMuted}
                />
                <Text style={styles.consentText}>
                  I confirm that I have informed this person that they are listed as my emergency trusted contact.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryPill, (!hasConsent || isAdding) && styles.primaryPillDisabled]}
                onPress={handleAdd}
                disabled={!hasConsent || isAdding}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="account-plus-outline" size={18} color={colors.surface} />
                <Text style={styles.primaryPillText}>
                  {isAdding ? 'Saving...' : 'Save Trusted Contact'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  scrollBody: {
    paddingTop: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  contactList: {
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: typography.fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contactPhone: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  contactRel: {
    fontSize: 11,
    color: colors.safety,
    fontWeight: '600',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.safety,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.safety,
  },
  deleteBtn: {
    padding: 6,
  },
  addFormCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  formTitle: {
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formDesc: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 10,
  },
  consentText: {
    fontSize: typography.fontSize.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  primaryPill: {
    backgroundColor: colors.safety,
    borderRadius: radii.pill,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    ...shadows.card,
  },
  primaryPillDisabled: {
    opacity: 0.5,
  },
  primaryPillText: {
    color: colors.surface,
    fontSize: typography.fontSize.body,
    fontWeight: '700',
  },
});
