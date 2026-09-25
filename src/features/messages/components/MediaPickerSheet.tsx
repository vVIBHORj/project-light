import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../../design-system/tokens';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { useChatStore } from '../state/useChatStore';

interface MediaPickerSheetProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}

const PRESET_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80', // Camera / Photo
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80', // Artisan Coffee
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&auto=format&fit=crop&q=80', // Badminton Court
  'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&auto=format&fit=crop&q=80', // Board Game
];

export const MediaPickerSheet: React.FC<MediaPickerSheetProps> = ({
  currentUserId,
  currentUserName,
  currentUserAvatar,
}) => {
  const {
    isMediaPickerOpen,
    setMediaPickerOpen,
    isVoiceTooltipOpen,
    setVoiceTooltipOpen,
    sendMessage,
  } = useChatStore();

  const handleSelectImage = (uri: string) => {
    setMediaPickerOpen(false);
    sendMessage(currentUserId, currentUserName, currentUserAvatar, {
      type: 'image',
      mediaUri: uri,
    });
  };

  return (
    <>
      {/* 1. Media Image Picker Sheet */}
      <Modal
        visible={isMediaPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMediaPickerOpen(false)}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setMediaPickerOpen(false)}
          />
          <GlassCard style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.title}>Share Image</Text>
            <Text style={styles.subtitle}>
              Images are automatically moderated for community safety (MSG-05)
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
            >
              {PRESET_SAMPLE_PHOTOS.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoItem}
                  onPress={() => handleSelectImage(uri)}
                >
                  <Image source={{ uri }} style={styles.photoImg} />
                  <View style={styles.selectBadge}>
                    <Ionicons name="arrow-up" size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setMediaPickerOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>

      {/* 2. Voice Note Coming Soon Tooltip / Modal (MSG-05) */}
      <Modal
        visible={isVoiceTooltipOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setVoiceTooltipOpen(false)}
      >
        <View style={styles.backdropCenter}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setVoiceTooltipOpen(false)}
          />
          <GlassCard style={styles.tooltipCard}>
            <View style={styles.micCircle}>
              <Ionicons name="mic" size={24} color={colors.primary} />
            </View>
            <Text style={styles.tooltipTitle}>Voice Notes</Text>
            <Text style={styles.tooltipText}>
              Voice notes with automated audio moderation are coming in LIGHT V2.
            </Text>
            <TouchableOpacity
              style={styles.gotItBtn}
              onPress={() => setVoiceTooltipOpen(false)}
            >
              <Text style={styles.gotItText}>Got it</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: radii.bottomSheet,
    borderTopRightRadius: radii.bottomSheet,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  photosRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  photoItem: {
    width: 120,
    height: 120,
    borderRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceSoft,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  selectBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  tooltipCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  micCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tooltipTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sectionTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  tooltipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  gotItBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  gotItText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
