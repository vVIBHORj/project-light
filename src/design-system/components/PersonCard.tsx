import React from 'react';
import { StyleSheet, View, Text, ViewStyle, Image, Pressable } from 'react-native';
import { MessageCircle, Heart, X, MapPin, Sparkles, HelpCircle } from 'lucide-react-native';
import { colors, radii, typography, spacing, shadows } from '../tokens';
import { ReasonChip } from './ReasonChip';
import { VerifiedBadge } from './VerifiedBadge';
import { GlassIconButton } from './GlassIconButton';
import { IntentPill } from './IntentPill';
import { RelationshipIntent } from '../../domain/types';

export interface PersonCardProps {
  id: string;
  name: string;
  age?: number | string;
  ageBand?: string;
  occupation?: string;
  locationZone: string;
  distanceBand?: string;
  photoUri?: string;
  verified?: boolean;
  isNew?: boolean;
  intent?: RelationshipIntent;
  reasonChips: string[];
  interests?: string[];
  sharedContext?: string; // e.g. "Both in Sunday Photography Circle"
  hasSharedContext?: boolean;
  onConnect?: () => void;
  onDismiss?: () => void;
  onSave?: () => void;
  onLike?: () => void;
  onExplain?: () => void;
  onPress?: () => void;
  isSaved?: boolean;
  style?: ViewStyle;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  name,
  ageBand,
  age,
  occupation,
  locationZone,
  distanceBand = '2 to 5 km',
  photoUri,
  verified = true,
  isNew = false,
  intent,
  reasonChips,
  interests,
  sharedContext,
  hasSharedContext = true,
  onConnect,
  onDismiss,
  onSave,
  onLike,
  onExplain,
  onPress,
  isSaved = false,
  style,
}) => {
  const displayAge = ageBand ? ageBand : age ? `${age}` : '';
  const effectiveSave = onSave || onLike;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Person profile: ${name}, ${locationZone}`}
      style={[styles.container, shadows.card, style]}
    >
      {/* Top Header Row: 72px rounded-square photo + Name & Meta + Side Action Icons */}
      <View style={styles.headerRow}>
        {/* Compact 72px rounded-square photo */}
        <View style={styles.photoWrapper}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.fallbackPhoto}>
              <Text style={styles.fallbackText}>{name.charAt(0)}</Text>
            </View>
          )}
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
        </View>

        {/* Identity Details */}
        <View style={styles.detailsCol}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {name} {displayAge ? `• ${displayAge}` : ''}
            </Text>
            {verified && <VerifiedBadge size={16} style={styles.badge} />}
          </View>

          {occupation ? (
            <Text style={styles.occupationText} numberOfLines={1}>
              {occupation}
            </Text>
          ) : null}

          <View style={styles.zoneRow}>
            <MapPin size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.zoneText}>
              {locationZone} ({distanceBand})
            </Text>
          </View>

          {intent && (
            <View style={styles.intentWrapper}>
              <IntentPill intent={intent} size="sm" />
            </View>
          )}
        </View>

        {/* Top-Right Quick Action: Save & Dismiss */}
        <View style={styles.topActionsCol}>
          {effectiveSave && (
            <GlassIconButton
              icon={
                <Heart
                  size={16}
                  color={isSaved ? '#EF4444' : colors.textPrimary}
                  fill={isSaved ? '#EF4444' : 'none'}
                  strokeWidth={2}
                />
              }
              onPress={effectiveSave}
              size={32}
              accessibilityLabel="Save profile"
              style={styles.headerIconBtn}
            />
          )}
          {onDismiss && (
            <GlassIconButton
              icon={<X size={16} color={colors.textSecondary} strokeWidth={2} />}
              onPress={onDismiss}
              size={32}
              accessibilityLabel="Not relevant"
              style={styles.headerIconBtn}
            />
          )}
        </View>
      </View>

      {/* One-line Shared Context Banner */}
      {sharedContext ? (
        <View style={styles.contextBanner}>
          <Sparkles size={13} color="#0284C7" strokeWidth={2.2} />
          <Text style={styles.contextText} numberOfLines={1}>
            {sharedContext}
          </Text>
        </View>
      ) : null}

      {/* 3 to 4 Reason Chips */}
      <View style={styles.chipsContainer}>
        {reasonChips.slice(0, 4).map((chip, index) => (
          <ReasonChip
            key={index}
            label={chip}
            highlight={index === 0}
            style={styles.chipItem}
          />
        ))}
        {interests?.slice(0, 2).map((interest, idx) => (
          <ReasonChip key={`int-${idx}`} label={interest} style={styles.chipItem} />
        ))}
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.bottomFooter}>
        {onExplain && (
          <Pressable
            onPress={onExplain}
            style={styles.explainBtn}
            accessibilityRole="button"
            accessibilityLabel="Why was this recommended?"
          >
            <HelpCircle size={13} color="#0284C7" />
            <Text style={styles.explainText}>Why this match?</Text>
          </Pressable>
        )}

        <View style={styles.footerActionRight}>
          {hasSharedContext ? (
            <Pressable
              onPress={onConnect}
              style={styles.connectPrimaryBtn}
              accessibilityRole="button"
              accessibilityLabel={`Connect with ${name}`}
            >
              <MessageCircle size={14} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.connectBtnText}>Connect</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onConnect}
              style={styles.sayHiSecondaryBtn}
              accessibilityRole="button"
              accessibilityLabel={`Say hi in a Circle to ${name}`}
            >
              <Text style={styles.sayHiBtnText}>Say hi in a Circle</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.card,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  photoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  fallbackPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#74ABE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  newBadgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  detailsCol: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: 4,
  },
  occupationText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.primary,
    marginTop: 1,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  zoneText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  intentWrapper: {
    marginTop: 4,
  },
  topActionsCol: {
    flexDirection: 'column',
    gap: 6,
    marginLeft: 6,
  },
  headerIconBtn: {
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  contextText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: '#0369A1',
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: 6,
  },
  chipItem: {
    marginRight: 0,
    marginBottom: 0,
  },
  bottomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  explainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  explainText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: '#0284C7',
  },
  footerActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 6,
  },
  connectBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  sayHiSecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sayHiBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: '#475569',
  },
});

export default PersonCard;
