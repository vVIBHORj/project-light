import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, shadows, typography } from '../../../design-system/tokens';
import { useSafetyStore } from '../state/useSafetyStore';
import { RestrictionType } from '../../../domain/safetyTypes';

export const BlockRestrictModal: React.FC = () => {
  const isVisible = useSafetyStore((s) => s.isBlockModalOpen);
  const target = useSafetyStore((s) => s.activeBlockTarget);
  const restrictions = useSafetyStore((s) => s.restrictions);
  const closeBlockModal = useSafetyStore((s) => s.closeBlockModal);
  const blockUser = useSafetyStore((s) => s.blockUser);
  const restrictUser = useSafetyStore((s) => s.restrictUser);
  const removeRestriction = useSafetyStore((s) => s.removeRestriction);

  const [activeTab, setActiveTab] = useState<'action' | 'manage'>(target ? 'action' : 'manage');
  const [selectedType, setSelectedType] = useState<RestrictionType>('restrict');
  const [isProcessing, setIsProcessing] = useState(false);

  // If opened directly from Safety Center without a target, default to manage view
  const isDirectManage = !target;

  const handleApply = async () => {
    if (!target) return;
    setIsProcessing(true);
    try {
      if (selectedType === 'block') {
        await blockUser(target.userId, target.userName);
      } else {
        await restrictUser(target.userId, target.userName);
      }
      closeBlockModal();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (userId: string) => {
    await removeRestriction(userId);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeBlockModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Sheet Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.safetyIconBubble}>
                <MaterialCommunityIcons name="account-cancel-outline" size={20} color={colors.safety} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>
                  {isDirectManage ? 'Blocked & Restricted Accounts' : `Safety Controls: ${target?.userName}`}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {isDirectManage ? `${restrictions.length} active restrictions` : 'Choose the level of privacy you need'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={closeBlockModal}
              style={styles.closeBtn}
              accessibilityLabel="Close dialog"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Segments if target is present */}
          {target && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'action' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('action')}
              >
                <Text style={[styles.segmentText, activeTab === 'action' && styles.segmentTextActive]}>
                  Set Restriction
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'manage' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('manage')}
              >
                <Text style={[styles.segmentText, activeTab === 'manage' && styles.segmentTextActive]}>
                  Manage List ({restrictions.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'action' && target ? (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.explainerText}>
                We will never notify <Text style={{ fontWeight: '700' }}>{target.userName}</Text> about your choice.
              </Text>

              {/* Restrict Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedType === 'restrict' && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedType('restrict')}
                activeOpacity={0.8}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <MaterialCommunityIcons
                      name="volume-variant-off"
                      size={22}
                      color={selectedType === 'restrict' ? colors.safety : colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.optionTitle}>Restrict (Quiet & Reversible)</Text>
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    </View>
                    <Text style={styles.optionDesc}>
                      They won&apos;t know they&apos;re restricted. Their messages are silently held in requests, and you won&apos;t receive activity notifications from them.
                    </Text>
                  </View>
                </View>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <MaterialCommunityIcons name="check" size={14} color={colors.safety} />
                    <Text style={styles.bulletText}>Keeps mutual Circle history intact without drama</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <MaterialCommunityIcons name="check" size={14} color={colors.safety} />
                    <Text style={styles.bulletText}>Easily reversible at any time</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Block Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedType === 'block' && styles.optionCardSelectedBlock,
                ]}
                onPress={() => setSelectedType('block')}
                activeOpacity={0.8}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.optionIconContainer, { backgroundColor: 'rgba(235, 87, 87, 0.1)' }]}>
                    <MaterialCommunityIcons
                      name="block-helper"
                      size={20}
                      color={colors.destructive}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Block (Complete Invisibility)</Text>
                    <Text style={styles.optionDesc}>
                      You both become mutually invisible. They cannot view your profile, find your circles, or message you anywhere on Light.
                    </Text>
                  </View>
                </View>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={14} color={colors.destructive} />
                    <Text style={styles.bulletText}>Direct messages and connection severed immediately</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <MaterialCommunityIcons name="eye-off-outline" size={14} color={colors.destructive} />
                    <Text style={styles.bulletText}>Mutual profile invisibility across search & radar</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  selectedType === 'block' ? styles.actionButtonBlock : styles.actionButtonRestrict,
                ]}
                onPress={handleApply}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {selectedType === 'block' ? `Block ${target.userName}` : `Restrict ${target.userName}`}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {restrictions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="shield-check-outline" size={48} color={colors.safety} />
                  <Text style={styles.emptyTitle}>No Blocked or Restricted Users</Text>
                  <Text style={styles.emptyDesc}>
                    When you restrict or block someone, they will appear here so you can easily manage or undo restrictions anytime.
                  </Text>
                </View>
              ) : (
                <View style={styles.manageList}>
                  {restrictions.map((item) => (
                    <View key={item.targetUserId} style={styles.manageCard}>
                      <View style={styles.manageCardInfo}>
                        <Text style={styles.manageCardName}>{item.targetUserName}</Text>
                        <View style={styles.manageBadgeRow}>
                          <View
                            style={[
                              styles.typeBadge,
                              item.type === 'block' ? styles.typeBadgeBlock : styles.typeBadgeRestrict,
                            ]}
                          >
                            <Text
                              style={[
                                styles.typeBadgeText,
                                item.type === 'block' ? styles.typeBadgeTextBlock : styles.typeBadgeTextRestrict,
                              ]}
                            >
                              {item.type === 'block' ? 'Blocked' : 'Restricted'}
                            </Text>
                          </View>
                          <Text style={styles.manageDate}>
                            {new Date(item.restrictedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.unrestrictBtn}
                        onPress={() => handleRemove(item.targetUserId)}
                      >
                        <Text style={styles.unrestrictBtnText}>
                          {item.type === 'block' ? 'Unblock' : 'Unrestrict'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
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
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    ...shadows.elevated,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
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
    fontSize: typography.fontSize.cardTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.footnote,
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
    backgroundColor: colors.white,
    ...shadows.card,
  },
  segmentText: {
    fontSize: typography.fontSize.footnote,
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
  explainerText: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionCard: {
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 16,
    marginBottom: 14,
  },
  optionCardSelected: {
    borderColor: colors.safety,
    backgroundColor: 'rgba(14, 159, 142, 0.04)',
  },
  optionCardSelectedBlock: {
    borderColor: colors.destructive,
    backgroundColor: 'rgba(235, 87, 87, 0.04)',
  },
  optionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 159, 142, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(14, 159, 142, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.safety,
  },
  optionDesc: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  bulletList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    fontSize: typography.fontSize.caption,
    color: colors.textPrimary,
  },
  actionButton: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...shadows.card,
  },
  actionButtonRestrict: {
    backgroundColor: colors.safety,
  },
  actionButtonBlock: {
    backgroundColor: colors.destructive,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.body,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyTitle: {
    fontSize: typography.fontSize.cardTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyDesc: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  manageList: {
    gap: 10,
    paddingTop: 8,
  },
  manageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manageCardInfo: {
    gap: 4,
  },
  manageCardName: {
    fontSize: typography.fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  manageBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  typeBadgeRestrict: {
    backgroundColor: 'rgba(14, 159, 142, 0.12)',
  },
  typeBadgeBlock: {
    backgroundColor: 'rgba(235, 87, 87, 0.12)',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  typeBadgeTextRestrict: {
    color: colors.safety,
  },
  typeBadgeTextBlock: {
    color: colors.destructive,
  },
  manageDate: {
    fontSize: typography.fontSize.caption,
    color: colors.textTertiary,
  },
  unrestrictBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  unrestrictBtnText: {
    fontSize: typography.fontSize.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
