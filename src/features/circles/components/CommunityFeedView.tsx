import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { MessageSquare, Heart, Send, Flag, Sparkles } from 'lucide-react-native';
import { ModerationBanner, Avatar, colors, radii, typography, spacing } from '../../../design-system';
import { CommunityPost } from '../../../domain/types';

export interface CommunityFeedViewProps {
  communityId: string;
  isMember: boolean;
  posts: CommunityPost[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onCreatePost: (content: string) => Promise<void>;
  onReportPost: (post: CommunityPost) => void;
}

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  isMember,
  posts,
  onCreatePost,
  onReportPost,
}) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreatePost(newPostContent);
      setNewPostContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <View style={styles.container}>
      {/* Post Composer (Rate limited, members only) */}
      {isMember ? (
        <View style={styles.composerCard}>
          <Text style={styles.composerTitle}>Share an update or question</Text>
          <TextInput
            style={styles.composerInput}
            placeholder="What's inspiring you or happening this week? (max 280 chars)"
            placeholderTextColor="#94A3B8"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            maxLength={280}
          />
          <View style={styles.composerFooter}>
            <Text style={styles.charCount}>{280 - newPostContent.length} chars left</Text>
            <Pressable
              onPress={handlePostSubmit}
              disabled={!newPostContent.trim() || isSubmitting}
              style={[
                styles.postSubmitBtn,
                (!newPostContent.trim() || isSubmitting) && styles.postSubmitBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Publish post to community"
            >
              <Send size={13} color="#FFFFFF" />
              <Text style={styles.postSubmitText}>{isSubmitting ? 'Posting...' : 'Post'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.nonMemberNotice}>
          <Text style={styles.nonMemberText}>
            Join this community to share updates and participate in threads.
          </Text>
        </View>
      )}

      {/* Feed Stream */}
      <View style={styles.postsList}>
        {posts.length === 0 ? (
          <View style={styles.emptyFeed}>
            <MessageSquare size={28} color="#94A3B8" />
            <Text style={styles.emptyFeedTitle}>No discussions yet</Text>
            <Text style={styles.emptyFeedSub}>
              Be the first to post a question or share a local tip!
            </Text>
          </View>
        ) : (
          posts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            const reactionCount = post.reactionsCount + (isLiked ? 1 : 0);

            // Moderation states
            if (post.moderationState === 'removed_by_mod') {
              return (
                <ModerationBanner
                  key={post.id}
                  type="restricted"
                  title="Content Removed by Moderator"
                  message="This post was removed for violating community guidelines."
                />
              );
            }

            if (post.moderationState === 'hidden') {
              return (
                <ModerationBanner
                  key={post.id}
                  type="warning"
                  title="Post Under Review"
                  message="This post has been reported and temporarily hidden pending review."
                />
              );
            }

            return (
              <View
                key={post.id}
                style={[
                  styles.postCard,
                  post.isHostPrompt && styles.hostPromptCard,
                ]}
              >
                {/* Host Prompt Header Flag */}
                {post.isHostPrompt && (
                  <View style={styles.hostPromptTag}>
                    <Sparkles size={12} color="#0284C7" />
                    <Text style={styles.hostPromptTagText}>Official Host Prompt</Text>
                  </View>
                )}

                {/* Post Author Row */}
                <View style={styles.authorRow}>
                  <Avatar
                    name={post.authorName}
                    size={36}
                    uri={post.authorAvatar}
                  />
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.postTime}>{post.createdAt}</Text>
                  </View>

                  <Pressable
                    onPress={() => onReportPost(post)}
                    style={styles.reportBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Report post"
                  >
                    <Flag size={13} color="#94A3B8" />
                  </Pressable>
                </View>

                {/* Post Body Content */}
                <Text style={styles.postContent}>{post.content}</Text>

                {/* Post Actions Footer */}
                <View style={styles.postFooter}>
                  <Pressable
                    onPress={() => toggleLike(post.id)}
                    style={styles.actionPill}
                    accessibilityRole="button"
                    accessibilityLabel="React to post"
                  >
                    <Heart
                      size={14}
                      color={isLiked ? '#EF4444' : colors.textSecondary}
                      fill={isLiked ? '#EF4444' : 'none'}
                    />
                    <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
                      {reactionCount > 0 ? reactionCount : 'Appreciate'}
                    </Text>
                  </Pressable>

                  <View style={styles.actionPill}>
                    <MessageSquare size={14} color={colors.textSecondary} />
                    <Text style={styles.actionText}>
                      {post.commentsCount > 0 ? `${post.commentsCount} replies` : 'Reply'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  composerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  composerInput: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  postSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  postSubmitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  postSubmitText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  nonMemberNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  nonMemberText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  postsList: {
    gap: 12,
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 6,
  },
  emptyFeedTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyFeedSub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hostPromptCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  hostPromptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginBottom: 8,
  },
  hostPromptTagText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#0369A1',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 8,
  },
  authorName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  postTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  reportBtn: {
    padding: 6,
  },
  postContent: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionTextLiked: {
    color: '#EF4444',
    fontWeight: typography.fontWeight.bold,
  },
});

export default CommunityFeedView;
