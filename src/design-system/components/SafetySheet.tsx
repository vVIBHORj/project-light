import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Shield, Ban, EyeOff, Flag, HelpCircle } from 'lucide-react-native';
import { colors, typography, spacing } from '../tokens';
import { BottomSheet } from './BottomSheet';

export interface SafetySheetProps {
  visible: boolean;
  onClose: () => void;
  targetName?: string;
  onReport?: () => void;
  onBlock?: () => void;
  onRestrict?: () => void;
  onHelp?: () => void;
}

export const SafetySheet: React.FC<SafetySheetProps> = ({
  visible,
  onClose,
  targetName = 'this member',
  onReport,
  onBlock,
  onRestrict,
  onHelp,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} height={380}>
      <View style={styles.header}>
        <View style={styles.safetyIcon}>
          <Shield size={22} color={colors.safety} />
        </View>
        <Text style={styles.title}>Safety & Controls</Text>
        <Text style={styles.subtitle}>
          Manage your interactions with {targetName}. Your choices are completely private.
        </Text>
      </View>

      <View style={styles.optionsList}>
        <Pressable
          style={styles.optionItem}
          onPress={() => {
            onRestrict?.();
            onClose();
          }}
        >
          <EyeOff size={20} color={colors.textPrimary} style={styles.optionIcon} />
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Restrict</Text>
            <Text style={styles.optionDesc}>Limit interactions without letting them know</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.optionItem}
          onPress={() => {
            onBlock?.();
            onClose();
          }}
        >
          <Ban size={20} color={colors.destructive} style={styles.optionIcon} />
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.destructive }]}>Block</Text>
            <Text style={styles.optionDesc}>They will not be able to see you or contact you</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.optionItem}
          onPress={() => {
            onReport?.();
            onClose();
          }}
        >
          <Flag size={20} color={colors.destructive} style={styles.optionIcon} />
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.destructive }]}>Report</Text>
            <Text style={styles.optionDesc}>Flag behavior that violates community standards</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.optionItem, styles.lastOption]}
          onPress={() => {
            onHelp?.();
            onClose();
          }}
        >
          <HelpCircle size={20} color={colors.primary} style={styles.optionIcon} />
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.primary }]}>Safety Center</Text>
            <Text style={styles.optionDesc}>Read guidance on safe local meetups</Text>
          </View>
        </Pressable>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  safetyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 159, 142, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: spacing.md,
  },
  optionsList: {
    marginTop: spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: spacing.sm,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  optionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default SafetySheet;
