import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Sparkles, Layers } from 'lucide-react-native';
import { colors, radii, typography, spacing } from '../../../design-system';
import { mockInterests } from '../../../data/mocks/seedData';

export interface InterestExploreSectionProps {
  selectedInterest?: string;
  onSelectInterest: (interestName: string) => void;
}

const mainCategories = [
  'All',
  'Sports',
  'Creative',
  'Music',
  'Food & Cafés',
  'Tech',
  'Games',
  'Outdoors',
  'Books',
];

export const InterestExploreSection: React.FC<InterestExploreSectionProps> = ({
  selectedInterest,
  onSelectInterest,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredInterests = mockInterests.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Layers size={16} color={colors.primary} />
          <Text style={styles.title}>Explore by Interest Taxonomy</Text>
        </View>
        <Text style={styles.subTitle}>Browse Circles and communities matching your passion</Text>
      </View>

      {/* Categories Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {mainCategories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryChip,
              activeCategory === cat && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Interest Tags Sub-Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsScroll}
      >
        {filteredInterests.slice(0, 10).map((interest) => {
          const isSelected = selectedInterest === interest.name;
          return (
            <Pressable
              key={interest.id}
              onPress={() => onSelectInterest(isSelected ? '' : interest.name)}
              style={[
                styles.tagChip,
                isSelected && styles.tagChipSelected,
              ]}
            >
              {isSelected && <Sparkles size={11} color="#FFFFFF" />}
              <Text
                style={[
                  styles.tagText,
                  isSelected && styles.tagTextSelected,
                ]}
              >
                {interest.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  header: {
    marginBottom: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  tagsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
    paddingBottom: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  tagText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textPrimary,
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
});

export default InterestExploreSection;
