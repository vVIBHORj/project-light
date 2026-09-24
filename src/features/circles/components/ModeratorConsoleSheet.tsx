import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Shield, Users, Flag, FileText, Check, X, Ban, VolumeX } from 'lucide-react-native';
import { BottomSheet, PillButton, colors, radii, typography, spacing } from '../../../design-system';
import { Community, CommunityJoinRequest, CommunityAuditLog, CommunityPost } from '../../../domain/types';

export interface ModeratorConsoleSheetProps {
  visible: boolean;
  onClose: () => void;
  community: Community | null;
  pendingRequests: CommunityJoinRequest[];
  auditLogs: CommunityAuditLog[];
  posts: CommunityPost[];
  onApproveRequest: (requestId: string) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
  onModeratePost: (postId: string, action: 'remove' | 'hide') => Promise<void>;
  onModerateMember: (targetUserId: string, action: 'mute' | 'ban' | 'unban') => Promise<void>;
}

export const ModeratorConsoleSheet: React.FC<ModeratorConsoleSheetProps> = ({
  visible,
  onClose,
  community,
  pendingRequests,
  auditLogs,
  posts,
  onApproveRequest,
  onRejectRequest,
  onModeratePost,
  onModerateMember,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'posts' | 'members' | 'audit'>('requests');

  if (!community) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Moderator Console • ${community.name}`}
      snapPoints={['80%']}
    >
      <View style={styles.container}>
        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setActiveTab('requests')}
            style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
          >
            <Users size={12} color={activeTab === 'requests' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              Requests ({pendingRequests.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('posts')}
            style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
          >
            <Flag size={12} color={activeTab === 'posts' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('members')}
            style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
          >
            <Shield size={12} color={activeTab === 'members' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Members
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('audit')}
            style={[styles.tabBtn, activeTab === 'audit' && styles.tabBtnActive]}
          >
            <FileText size={12} color={activeTab === 'audit' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'audit' && styles.tabTextActive]}>
              Audit Logs
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: PENDING JOIN REQUESTS */}
        {activeTab === 'requests' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Check size={28} color="#16A34A" />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySub}>No pending join requests for this community.</Text>
              </View>
            ) : (
              pendingRequests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestName}>{req.userName}</Text>
                    <Text style={styles.requestTime}>{new Date(req.requestedAt).toLocaleDateString()}</Text>
                  </View>

                  {req.answers && req.answers.length > 0 && (
                    <View style={styles.answersBox}>
                      <Text style={styles.answersTitle}>Answers to Host Questions:</Text>
                      {req.answers.map((ans, idx) => (
                        <Text key={idx} style={styles.answerText}>
                          Q{idx + 1}: &quot;{ans}&quot;
                        </Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.requestActions}>
                    <Pressable
                      onPress={() => onRejectRequest(req.id)}
                      style={styles.rejectBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Reject join request"
                    >
                      <X size={13} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </Pressable>

                    <PillButton
                      label="Approve & Welcome"
                      variant="primary"
                      size="sm"
                      icon={<Check size={13} color="#FFFFFF" />}
                      onPress={() => onApproveRequest(req.id)}
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* TAB 2: POSTS MODERATION */}
        {activeTab === 'posts' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {posts.map((post) => (
              <View key={post.id} style={styles.postModCard}>
                <View style={styles.postModHeader}>
                  <Text style={styles.postAuthor}>{post.authorName}</Text>
                  <Text style={styles.postStatusBadge}>Status: {post.moderationState}</Text>
                </View>
                <Text style={styles.postText}>{post.content}</Text>

                <View style={styles.postModActions}>
                  <Pressable
                    onPress={() => onModeratePost(post.id, 'hide')}
                    style={styles.modActionBtn}
                  >
                    <Text style={styles.modActionText}>Hide Temporarily</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onModeratePost(post.id, 'remove')}
                    style={[styles.modActionBtn, styles.modActionDanger]}
                  >
                    <Text style={styles.modActionDangerText}>Remove Post</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* TAB 3: MEMBER ACTIONS */}
        {activeTab === 'members' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.memberActionBox}>
              <Text style={styles.memberActionTitle}>Member Safety Actions</Text>
              <Text style={styles.memberActionDesc}>
                Enforce community guidelines against harassment or spam. Muted members cannot post. Banned members lose all community access.
              </Text>

              <View style={styles.sampleMemberRow}>
                <Text style={styles.sampleMemberName}>Vikram Nair (Member)</Text>
                <View style={styles.memberBtnGroup}>
                  <Pressable
                    onPress={() => onModerateMember('user_4', 'mute')}
                    style={styles.muteBtn}
                  >
                    <VolumeX size={12} color="#D97706" />
                    <Text style={styles.muteBtnText}>Mute</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onModerateMember('user_4', 'ban')}
                    style={styles.banBtn}
                  >
                    <Ban size={12} color="#DC2626" />
                    <Text style={styles.banBtnText}>Ban</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {auditLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={28} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No moderation actions</Text>
                <Text style={styles.emptySub}>All mod approvals, removals, and mutes are logged here.</Text>
              </View>
            ) : (
              auditLogs.map((log) => (
                <View key={log.id} style={styles.auditRow}>
                  <View style={styles.auditInfo}>
                    <Text style={styles.auditAction}>{log.action.replace(/_/g, ' ').toUpperCase()}</Text>
                    <Text style={styles.auditReason}>{log.reason || 'No reason specified'}</Text>
                    <Text style={styles.auditMeta}>By: {log.actorName} • Target: {log.targetId}</Text>
                  </View>
                  <Text style={styles.auditTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radii.pill,
    padding: 3,
    marginBottom: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: radii.pill,
    gap: 4,
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
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptySub: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  requestName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  requestTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  answersBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: radii.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  answersTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: '#0369A1',
    marginBottom: 2,
  },
  answerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#FEE2E2',
  },
  rejectBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
  postModCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postModHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  postAuthor: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  postStatusBadge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
  },
  postText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  postModActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
  },
  modActionText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  modActionDanger: {
    backgroundColor: '#FEE2E2',
  },
  modActionDangerText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
  memberActionBox: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberActionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  memberActionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
    lineHeight: 15,
  },
  sampleMemberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleMemberName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  memberBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  muteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: '#FEF3C7',
  },
  muteBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#D97706',
  },
  banBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: '#FEE2E2',
  },
  banBtnText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  auditInfo: {
    flex: 1,
  },
  auditAction: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  auditReason: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  auditMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  auditTime: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 6,
  },
});

export default ModeratorConsoleSheet;
