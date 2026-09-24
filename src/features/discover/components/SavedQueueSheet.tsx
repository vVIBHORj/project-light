import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Heart, RotateCcw, Trash2, Bookmark } from 'lucide-react-native';
import { BottomSheet, colors, radii, typography, spacing } from '../../../design-system';
import { useDiscoverStore } from '../state/useDiscoverStore';

export interface SavedQueueSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const SavedQueueSheet: React.FC<SavedQueueSheetProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'dismissed'>('saved');
  const { savedItems, dismissedItems, unsaveItem, undoDismiss } = useDiscoverStore();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Saved & Tuning Queue"
      snapPoints={['70%']}
    >
      <View style={styles.container}>
        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <Pressable
            onPress={() => setActiveTab('saved')}
            style={[styles.tabBtn, activeTab === 'saved' && styles.tabBtnActive]}
          >
            <Bookmark size={14} color={activeTab === 'saved' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved ({savedItems.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('dismissed')}
            style={[styles.tabBtn, activeTab === 'dismissed' && styles.tabBtnActive]}
          >
            <RotateCcw size={14} color={activeTab === 'dismissed' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'dismissed' && styles.tabTextActive]}>
              Not Relevant ({dismissedItems.length})
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: Saved Items */}
        {activeTab === 'saved' && (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {savedItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No saved items yet</Text>
                <Text style={styles.emptySub}>
                  Tap the heart icon on any Circle, person, or event to save it for later.
                </Text>
              </View>
            ) : (
              savedItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub}>{item.subtitle} • {item.type.toUpperCase()}</Text>
                  </View>
                  <Pressable
                    onPress={() => unsaveItem(item.id)}
                    style={styles.actionIconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Remove from saved"
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Tab 2: Dismissed / Not Relevant Items with Undo */}
        {activeTab === 'dismissed' && (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {dismissedItems.length === 0 ? (
              <View style={styles.emptyState}>
                <RotateCcw size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No dismissed recommendations</Text>
                <Text style={styles.emptySub}>
                  Items you dismiss as not relevant will appear here so you can undo if needed.
                </Text>
              </View>
            ) : (
              dismissedItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub}>
                      Reason: {item.reason.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => undoDismiss(item.targetId)}
                    style={styles.undoBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Undo dismissal"
                  >
                    <RotateCcw size={13} color={colors.primary} />
                    <Text style={styles.undoText}>Undo</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    flex: 1,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radii.pill,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptySub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  itemSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  actionIconBtn: {
    padding: 8,
    borderRadius: radii.pill,
    backgroundColor: '#FEE2E2',
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: '#E0F2FE',
  },
  undoText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});

export default SavedQueueSheet;
