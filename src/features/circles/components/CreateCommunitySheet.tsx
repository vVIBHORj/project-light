import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Globe, Lock, ShieldCheck, Check, AlertCircle } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';
import { mockZones } from '../../../data/mocks/seedData';
import { CreateCommunityDto } from '../../../data/repositories';
import { Community } from '../../../domain/types';

export interface CreateCommunitySheetProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  onCreateSuccess: (created: Community) => void;
  onSubmit: (data: CreateCommunityDto) => Promise<Community>;
}

const taxonomyCategories = [
  'Photography',
  'Sports & Fitness',
  'Music & Audio',
  'Books & Literature',
  'Tech & Startups',
  'Food & Cafés',
  'Outdoors & Hiking',
  'Creative & Design',
  'Board Games',
  'Wellness & Yoga',
];

const bannedTerms = ['escort', 'crypto investment', 'guaranteed returns', 'telegram link', 'gambling'];

export const CreateCommunitySheet: React.FC<CreateCommunitySheetProps> = ({
  visible,
  onClose,
  currentUserId,
  currentUserName,
  onCreateSuccess,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(taxonomyCategories[0]);
  const [zone, setZone] = useState(mockZones[0]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [hostPledge, setHostPledge] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Please provide a community name.';
    if (name.trim().length < 3) return 'Community name must be at least 3 characters.';
    if (!description.trim()) return 'Please provide a community description.';

    const fullText = `${name} ${description}`.toLowerCase();
    for (const term of bannedTerms) {
      if (fullText.includes(term)) {
        return `Name or description contains prohibited solicitation content: "${term}".`;
      }
    }

    if (!hostPledge) return 'Please accept the host responsibilities pledge.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const created = await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        zone,
        visibility,
        rules: [
          'Be respectful, inclusive and welcoming',
          'No commercial spam, promotion, or solicitations',
          'Respect privacy and keep discussions safe',
        ],
        hostId: currentUserId,
        hostName: currentUserName,
      });

      onCreateSuccess(created);
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setHostPledge(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create community';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Create a New Community"
      snapPoints={['80%']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {errorMsg && (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Category Taxonomy Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {taxonomyCategories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Community Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Community Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Bengaluru Analog Photographers"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errorMsg) setErrorMsg(null);
            }}
            maxLength={60}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description & Purpose</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe what members will do, discuss, and how you will meet up..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={(txt) => {
              setDescription(txt);
              if (errorMsg) setErrorMsg(null);
            }}
            multiline
            maxLength={300}
          />
        </View>

        {/* Neighborhood Zone */}
        <View style={styles.section}>
          <Text style={styles.label}>Primary Neighborhood Zone</Text>
          <Text style={styles.subLabel}>Only zone or city level (never private home addresses)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {mockZones.slice(0, 8).map((z) => (
              <Pressable
                key={z}
                onPress={() => setZone(z)}
                style={[styles.categoryChip, zone === z && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, zone === z && styles.categoryTextActive]}>
                  {z}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Visibility: Public vs Private */}
        <View style={styles.section}>
          <Text style={styles.label}>Visibility & Membership Control</Text>
          <View style={styles.visibilityToggleRow}>
            <Pressable
              onPress={() => setVisibility('public')}
              style={[styles.visibilityOption, visibility === 'public' && styles.visibilityOptionActive]}
            >
              <Globe size={16} color={visibility === 'public' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.visibilityTitle, visibility === 'public' && styles.visibilityTitleActive]}>
                Open Community
              </Text>
              <Text style={styles.visibilitySub}>Anyone can join and view discussions</Text>
            </Pressable>

            <Pressable
              onPress={() => setVisibility('private')}
              style={[styles.visibilityOption, visibility === 'private' && styles.visibilityOptionActive]}
            >
              <Lock size={16} color={visibility === 'private' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.visibilityTitle, visibility === 'private' && styles.visibilityTitleActive]}>
                Private Space
              </Text>
              <Text style={styles.visibilitySub}>Host approves member requests before granting access</Text>
            </Pressable>
          </View>
        </View>

        {/* Host Responsibilities Pledge */}
        <View style={styles.pledgeCard}>
          <View style={styles.pledgeHeader}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={styles.pledgeTitle}>Host Responsibilities Pledge</Text>
          </View>
          <Pressable
            onPress={() => setHostPledge(!hostPledge)}
            style={styles.pledgeCheckboxRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hostPledge }}
          >
            <View style={[styles.checkbox, hostPledge && styles.checkboxActive]}>
              {hostPledge && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.pledgeText}>
              I agree to actively moderate my community, review join requests within 48 hours, and uphold Project LIGHT’s safety & anti-harassment standards.
            </Text>
          </Pressable>
        </View>

        {/* Submit Button */}
        <View style={styles.submitWrapper}>
          <PillButton
            label={isSubmitting ? 'Creating Community...' : 'Publish Community'}
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            onPress={handleSubmit}
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
  section: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  visibilityToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  visibilityOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  visibilityTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  visibilityTitleActive: {
    color: colors.primary,
  },
  visibilitySub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  pledgeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  pledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pledgeTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pledgeCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pledgeText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 15,
  },
  submitWrapper: {
    marginTop: spacing.xs,
  },
});

export default CreateCommunitySheet;
