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

export interface AgeHoldModalProps {
  visible?: boolean;
  onClose?: () => void;
  reason?: 'underage' | 'safety_hold' | 'suspended';
}

export const AgeHoldModal: React.FC<AgeHoldModalProps> = ({
  visible: propVisible,
  onClose: propClose,
  reason = 'underage',
}) => {
  const storeVisible = useSafetyStore((s) => s.isAgeHoldModalOpen);
  const setAgeHoldModalOpen = useSafetyStore((s) => s.setAgeHoldModalOpen);

  const isVisible = propVisible !== undefined ? propVisible : storeVisible;
  const handleClose = propClose || (() => setAgeHoldModalOpen(false));

  const [supportMessage, setSupportMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const config = {
    underage: {
      icon: 'account-child-circle' as const,
      title: 'Age Requirement Notice',
      subtitle: 'Light is designed exclusively for adults 18 and older.',
      body: 'To protect minors and comply with community guidelines, account creation is limited to individuals aged 18 and above. If you entered your birthdate mistakenly, you may submit proof of age for manual verification.',
    },
    safety_hold: {
      icon: 'shield-lock-outline' as const,
      title: 'Account on Safety Hold',
      subtitle: 'Your account is temporarily paused while we conduct a routine review.',
      body: 'To ensure a safe environment for all members, our Trust & Safety team has temporarily placed your account on hold. You may request a review or contact support below.',
    },
    suspended: {
      icon: 'alert-octagon-outline' as const,
      title: 'Account Access Restricted',
      subtitle: 'This account has been suspended for guideline violations.',
      body: 'Our systems detected activity that conflicts with our Community Safety Standards. You have the right to appeal this decision for secondary human review.',
    },
  }[reason];

  const handleSupportSubmit = () => {
    if (!supportMessage.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      Alert.alert(
        'Request Received',
        'Your inquiry has been logged with Trust & Safety. You will receive an email update within 24 hours.'
      );
      handleClose();
      setSubmitted(false);
      setSupportMessage('');
    }, 500);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={config.icon} size={32} color={colors.safety} />
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.bodyText}>{config.body}</Text>

            <View style={styles.supportBox}>
              <Text style={styles.supportTitle}>Request Support or Appeal</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Explain the situation or request DOB correction..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={supportMessage}
                onChangeText={setSupportMessage}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!supportMessage.trim() || submitted) && styles.submitBtnDisabled]}
                onPress={handleSupportSubmit}
                disabled={!supportMessage.trim() || submitted}
              >
                <Text style={styles.submitBtnText}>
                  {submitted ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose}>
            <Text style={styles.secondaryBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 24,
    alignItems: 'center',
    ...shadows.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(14, 159, 142, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  scrollArea: {
    maxHeight: 280,
    width: '100%',
  },
  bodyText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  supportTitle: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.sm,
    padding: 10,
    fontSize: typography.fontSize.caption,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
    minHeight: 50,
  },
  submitBtn: {
    backgroundColor: colors.safety,
    borderRadius: radii.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: colors.surface,
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
  },
  secondaryBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  secondaryBtnText: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
