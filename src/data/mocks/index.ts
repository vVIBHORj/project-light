import {
  AuthRepository,
  ProfileRepository,
  CircleRepository,
  CommunityRepository,
  ConnectionRepository,
  MessageRepository,
  EventRepository,
  SafetyRepository,
  CreateCircleDto,
  CreateCommunityDto,
  ConnectionItem,
  SendConnectionRequestDto,
} from '../repositories';
import {
  User,
  UserProfile,
  UserSession,
  BootstrapConfig,
  AuthChallenge,
  Circle,
  Community,
  Conversation,
  Message,
  Event,
  Interest,
} from '../../domain/types';
import {
  mockUsers,
  mockCircles,
  mockCommunities,
  mockEvents,
  mockInterests,
  mockAttendees,
  mockDatePlans,
  mockEventFeedbacks,
} from './seedData';
import { EventStateMachine } from '../../domain/eventStateMachine';
import { SafetyStateMachine } from '../../domain/safetyStateMachine';
import { storage } from '../../lib/storage';

const simulateDelay = async (ms = 150) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export class MockAuthRepository implements AuthRepository {
  private challenges: Map<string, AuthChallenge> = new Map();
  private failedAttempts: Map<string, number> = new Map();
  private lockouts: Map<string, number> = new Map();

  // Known registered identifiers for duplicate detection
  private existingAccounts = new Set([
    '+91 98765 43210',
    '+919876543210',
    '9876543210',
    'aisha@light.app',
    'rohan@light.app',
  ]);

  private sessions: UserSession[] = [
    {
      id: 'sess_current',
      userId: 'user_1',
      deviceName: 'iPhone 15 Pro (This Device)',
      deviceType: 'ios',
      cityLocation: 'Bengaluru, Indiranagar',
      lastActiveAt: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess_mac',
      userId: 'user_1',
      deviceName: 'MacBook Pro 16" — Chrome',
      deviceType: 'web',
      cityLocation: 'Bengaluru, Koramangala',
      lastActiveAt: '2 hours ago',
      isCurrent: false,
    },
    {
      id: 'sess_old',
      userId: 'user_1',
      deviceName: 'iPad Air — Safari',
      deviceType: 'ios',
      cityLocation: 'Bengaluru, HSR Layout',
      lastActiveAt: '3 days ago',
      isCurrent: false,
    },
  ];

  async getBootstrapConfig(): Promise<BootstrapConfig> {
    await simulateDelay(60);
    return {
      maintenance: false,
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.0',
      forceUpdate: false,
      legalVersion: '2026.1',
    };
  }

  async getSession() {
    await simulateDelay(80);
    const token = await storage.getItem('light_auth_token');
    const storedUserId = await storage.getItem('light_user_id');

    if (token && storedUserId) {
      const user: User = {
        id: storedUserId,
        phone: '+91 98765 43210',
        status: 'active',
        riskTier: 'standard',
        createdAt: '2026-09-01',
        lastActiveAt: new Date().toISOString(),
      };
      return { user, token };
    }

    return { user: null, token: null };
  }

  async signUp(
    identifier: string,
    method: 'phone' | 'email',
    _referralCode?: string
  ): Promise<AuthChallenge> {
    await simulateDelay(200);

    const isDuplicate = this.existingAccounts.has(identifier.trim());
    const challengeId = `chal_${Date.now()}`;

    const challenge: AuthChallenge = {
      challengeId,
      identifier: identifier.trim(),
      method,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      attemptsLeft: 5,
      isExistingAccount: isDuplicate,
    };

    this.challenges.set(challengeId, challenge);
    this.failedAttempts.set(challengeId, 0);

    return challenge;
  }

  async login(identifier: string): Promise<AuthChallenge> {
    await simulateDelay(200);

    const challengeId = `chal_${Date.now()}`;
    const method = identifier.includes('@') ? 'email' : 'phone';

    // Special test case: trigger security challenge for identifier ending in 0000
    const riskFlag = identifier.endsWith('0000');

    const challenge: AuthChallenge = {
      challengeId,
      identifier: identifier.trim(),
      method,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attemptsLeft: 5,
      riskFlag,
    };

    this.challenges.set(challengeId, challenge);
    this.failedAttempts.set(challengeId, 0);

    return challenge;
  }

  async verifyOtp(challengeId: string, code: string): Promise<{ user: User; token: string }> {
    await simulateDelay(250);

    const challenge = this.challenges.get(challengeId);

    // Check lockout
    const lockoutUntil = this.lockouts.get(challengeId);
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      throw new Error(`Too many incorrect attempts. Please try again in ${remainingSecs}s.`);
    }

    // Special test code for expired OTP
    if (code === '999999') {
      throw new Error('This verification code has expired. Please request a new code.');
    }

    // Special test code for security risk challenge
    if (code === '000000' || challenge?.riskFlag) {
      throw new Error('SECURITY_CHALLENGE_REQUIRED');
    }

    // Happy path mock code is 123456
    if (code === '123456') {
      const user: User = {
        id: 'user_1',
        phone: challenge?.method === 'phone' ? challenge.identifier : '+91 98765 43210',
        email: challenge?.method === 'email' ? challenge.identifier : undefined,
        status: 'active',
        riskTier: 'standard',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      const token = `jwt_mock_${Date.now()}`;
      await storage.setItem('light_auth_token', token);
      await storage.setItem('light_user_id', user.id);

      // Add to existing accounts
      if (challenge?.identifier) {
        this.existingAccounts.add(challenge.identifier);
      }

      return { user, token };
    }

    // Invalid code handling
    const attempts = (this.failedAttempts.get(challengeId) || 0) + 1;
    this.failedAttempts.set(challengeId, attempts);
    const attemptsLeft = Math.max(0, 5 - attempts);

    if (attempts >= 5) {
      const lockDuration = 60 * 1000; // 1 minute lockout
      this.lockouts.set(challengeId, Date.now() + lockDuration);
      throw new Error('Too many invalid attempts. Your account is locked for 60 seconds.');
    }

    throw new Error(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
  }

  async resendOtp(challengeId: string): Promise<AuthChallenge> {
    await simulateDelay(150);
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const updated: AuthChallenge = {
      ...challenge,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attemptsLeft: 5,
    };

    this.challenges.set(challengeId, updated);
    this.failedAttempts.set(challengeId, 0);
    return updated;
  }

  async requestRecovery(_identifier: string): Promise<{ success: boolean; message: string }> {
    await simulateDelay(200);
    // Generic privacy-preserving message
    return {
      success: true,
      message: 'If an account exists with this identifier, we have sent recovery instructions.',
    };
  }

  async resolveSecurityChallenge(
    _challengeId: string,
    action: 'confirm_me' | 'not_me'
  ): Promise<{ success: boolean; token?: string }> {
    await simulateDelay(200);
    if (action === 'confirm_me') {
      const token = `jwt_mock_sec_${Date.now()}`;
      await storage.setItem('light_auth_token', token);
      await storage.setItem('light_user_id', 'user_1');
      return { success: true, token };
    }
    // "Not me" triggers account freeze/secure
    return { success: true };
  }

  async getSessions(): Promise<UserSession[]> {
    await simulateDelay(100);
    return this.sessions;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await simulateDelay(100);
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
  }

  async revokeAllOtherSessions(): Promise<void> {
    await simulateDelay(150);
    this.sessions = this.sessions.filter((s) => s.isCurrent);
  }

  async signOut(): Promise<void> {
    await simulateDelay(80);
    await storage.removeItem('light_auth_token');
    await storage.removeItem('light_user_id');
  }
}

export class MockProfileRepository implements ProfileRepository {
  private profiles: Map<string, UserProfile> = new Map(
    mockUsers.map((u) => [u.userId, u])
  );

  async getProfile(userId: string): Promise<UserProfile | null> {
    await simulateDelay();
    return this.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await simulateDelay();
    const current = this.profiles.get(userId) || mockUsers[0];
    const updated = { ...current, ...updates };
    this.profiles.set(userId, updated);
    return updated;
  }

  async getInterests(): Promise<Interest[]> {
    await simulateDelay(50);
    return mockInterests;
  }

  async getRecommendedProfiles(filters?: { intent?: string; zone?: string }): Promise<UserProfile[]> {
    await simulateDelay();
    return Array.from(this.profiles.values()).filter((p) => {
      if (filters?.zone && p.zone !== filters.zone) return false;
      return true;
    });
  }
}

export class MockCircleRepository implements CircleRepository {
  private circles: Circle[] = mockCircles.map((c) => ({ ...c, members: [...c.members] }));

  async getCircles(filters?: { category?: string; zone?: string; communityId?: string }): Promise<Circle[]> {
    await simulateDelay();
    return this.circles.filter((c) => {
      if (filters?.category && filters.category !== 'All' && c.category !== filters.category) return false;
      if (filters?.zone && filters.zone !== 'All' && !c.locationZone.includes(filters.zone)) return false;
      if (filters?.communityId && c.communityId !== filters.communityId) return false;
      return true;
    });
  }

  async getCircleById(id: string): Promise<Circle | null> {
    await simulateDelay();
    return this.circles.find((c) => c.id === id) || null;
  }

  async createCircle(data: CreateCircleDto): Promise<Circle> {
    await simulateDelay();
    if (data.capacity < 4 || data.capacity > 8) {
      throw new Error('Circle capacity must be between 4 and 8 members.');
    }

    const newCircle: Circle = {
      id: `circle_${Date.now()}`,
      communityId: data.communityId,
      title: data.title.trim(),
      category: data.category,
      hostId: data.hostId,
      hostName: data.hostName,
      capacity: data.capacity,
      currentMemberCount: 1,
      state: 'open',
      cadence: data.cadence,
      activityName: data.activityName,
      locationZone: data.locationZone,
      reasonChips: [data.activityName, data.category, data.locationZone],
      members: [data.hostId],
      createdAt: new Date().toISOString(),
    };

    this.circles.unshift(newCircle);
    return newCircle;
  }

  async joinCircle(circleId: string, userId: string): Promise<Circle> {
    await simulateDelay();
    const circle = this.circles.find((c) => c.id === circleId);
    if (!circle) throw new Error('Circle not found');

    if (circle.members.includes(userId)) {
      return circle;
    }

    // Strict server-authoritative capacity check (no overbooking)
    if (circle.currentMemberCount >= circle.capacity) {
      throw new Error('This Circle is full. No spots available.');
    }

    circle.members.push(userId);
    circle.currentMemberCount++;
    if (circle.currentMemberCount >= circle.capacity) {
      circle.state = 'full';
    }
    return circle;
  }

  async leaveCircle(circleId: string, userId: string): Promise<void> {
    await simulateDelay();
    const circle = this.circles.find((c) => c.id === circleId);
    if (!circle) return;
    circle.members = circle.members.filter((m) => m !== userId);
    circle.currentMemberCount = Math.max(0, circle.currentMemberCount - 1);
    if (circle.currentMemberCount < circle.capacity) {
      circle.state = 'open';
    }
  }
}

export class MockCommunityRepository implements CommunityRepository {
  private communities: Community[] = mockCommunities.map((c) => ({ ...c, rules: [...c.rules] }));

  private members: Map<string, import('../../domain/types').CommunityMember[]> = new Map([
    [
      'comm_1',
      [
        {
          userId: 'user_1',
          communityId: 'comm_1',
          userName: 'Aisha Rao',
          role: 'host',
          status: 'approved',
          joinedAt: '2026-08-15',
        },
        {
          userId: 'user_3',
          communityId: 'comm_1',
          userName: 'Pooja Iyer',
          role: 'member',
          status: 'approved',
          joinedAt: '2026-08-20',
        },
      ],
    ],
    [
      'comm_2',
      [
        {
          userId: 'user_2',
          communityId: 'comm_2',
          userName: 'Rohan Mehta',
          role: 'host',
          status: 'approved',
          joinedAt: '2026-08-20',
        },
      ],
    ],
  ]);

  private joinRequests: import('../../domain/types').CommunityJoinRequest[] = [
    {
      id: 'req_1',
      communityId: 'comm_1',
      userId: 'user_4',
      userName: 'Vikram Nair',
      answers: ['I shoot 35mm film on Olympus OM-1', 'Available alternate Saturdays'],
      status: 'pending',
      requestedAt: '2026-09-24T10:00:00Z',
    },
  ];

  private posts: Map<string, import('../../domain/types').CommunityPost[]> = new Map([
    [
      'comm_1',
      [
        {
          id: 'post_1',
          communityId: 'comm_1',
          authorId: 'user_1',
          authorName: 'Aisha Rao',
          isHostPrompt: true,
          content: 'Weekly Prompt 📸: What’s your go-to film stock for golden hour in Bengaluru?',
          createdAt: '2 hours ago',
          commentsCount: 6,
          reactionsCount: 14,
          moderationState: 'visible',
        },
        {
          id: 'post_2',
          communityId: 'comm_1',
          authorId: 'user_3',
          authorName: 'Pooja Iyer',
          isHostPrompt: false,
          content: 'Found an amazing vintage camera repair shop near Commercial Street! DM for location.',
          createdAt: 'Yesterday',
          commentsCount: 4,
          reactionsCount: 9,
          moderationState: 'visible',
        },
      ],
    ],
  ]);

  private auditLogs: Map<string, import('../../domain/types').CommunityAuditLog[]> = new Map([
    [
      'comm_1',
      [
        {
          id: 'audit_1',
          communityId: 'comm_1',
          actorId: 'user_1',
          actorName: 'Aisha Rao (Host)',
          action: 'approve_join',
          targetId: 'user_3',
          reason: 'Verified photographer profile',
          timestamp: '2026-08-20T12:00:00Z',
        },
      ],
    ],
  ]);

  // Prohibited solicitation / banned terms for safety check
  private bannedTerms = ['escort', 'crypto investment', 'guaranteed returns', 'telegram link', 'gambling'];

  async getCommunities(filters?: { category?: string; zone?: string; searchQuery?: string }): Promise<Community[]> {
    await simulateDelay();
    return this.communities.filter((comm) => {
      if (filters?.category && filters.category !== 'All' && comm.category !== filters.category) return false;
      if (filters?.zone && filters.zone !== 'All' && !comm.zone.includes(filters.zone)) return false;
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = comm.name.toLowerCase().includes(q);
        const matchesDesc = comm.description.toLowerCase().includes(q);
        const matchesCat = comm.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }

  async getCommunityById(id: string): Promise<Community | null> {
    await simulateDelay();
    return this.communities.find((c) => c.id === id) || null;
  }

  async createCommunity(data: CreateCommunityDto): Promise<Community> {
    await simulateDelay();

    // Safety and solicitation checks
    const fullText = `${data.name} ${data.description}`.toLowerCase();
    for (const term of this.bannedTerms) {
      if (fullText.includes(term)) {
        throw new Error(`Community name or description contains prohibited solicitation term: "${term}".`);
      }
    }

    if (!data.name.trim() || !data.description.trim()) {
      throw new Error('Community name and description are required.');
    }

    const newComm: Community = {
      id: `comm_${Date.now()}`,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      zone: data.zone,
      visibility: data.visibility,
      memberCount: 1,
      hostId: data.hostId,
      hostName: data.hostName,
      rules: data.rules.length > 0 ? data.rules : ['Be respectful and welcoming', 'No commercial spam', 'Maintain privacy'],
      createdAt: new Date().toISOString(),
    };

    this.communities.unshift(newComm);

    // Add host as approved member
    this.members.set(newComm.id, [
      {
        userId: data.hostId,
        communityId: newComm.id,
        userName: data.hostName,
        role: 'host',
        status: 'approved',
        joinedAt: new Date().toISOString(),
      },
    ]);

    return newComm;
  }

  async getMembershipStatus(communityId: string, userId: string): Promise<'none' | 'pending' | 'approved' | 'muted' | 'banned'> {
    await simulateDelay(60);
    const commMembers = this.members.get(communityId) || [];
    const member = commMembers.find((m) => m.userId === userId);
    if (member) return member.status;

    // Check pending join requests
    const hasPending = this.joinRequests.some(
      (r) => r.communityId === communityId && r.userId === userId && r.status === 'pending'
    );
    if (hasPending) return 'pending';

    return 'none';
  }

  async joinCommunity(
    communityId: string,
    userId: string,
    userName: string = 'Community Member',
    answers: string[] = []
  ): Promise<{ status: 'approved' | 'pending' }> {
    await simulateDelay();
    const comm = this.communities.find((c) => c.id === communityId);
    if (!comm) throw new Error('Community not found');

    const commMembers = this.members.get(communityId) || [];
    const existing = commMembers.find((m) => m.userId === userId);

    if (existing?.status === 'banned') {
      throw new Error('You have been restricted from accessing this community.');
    }

    if (comm.visibility === 'private') {
      const existingReq = this.joinRequests.find(
        (r) => r.communityId === communityId && r.userId === userId && r.status === 'pending'
      );
      if (!existingReq) {
        this.joinRequests.push({
          id: `req_${Date.now()}`,
          communityId,
          userId,
          userName,
          answers,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        });
      }
      return { status: 'pending' };
    }

    // Public community: auto approved
    if (!existing) {
      commMembers.push({
        userId,
        communityId,
        userName,
        role: 'member',
        status: 'approved',
        joinedAt: new Date().toISOString(),
      });
      this.members.set(communityId, commMembers);
      comm.memberCount++;
    }

    return { status: 'approved' };
  }

  async cancelJoinRequest(communityId: string, userId: string): Promise<void> {
    await simulateDelay();
    this.joinRequests = this.joinRequests.filter(
      (r) => !(r.communityId === communityId && r.userId === userId && r.status === 'pending')
    );
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    await simulateDelay();
    const comm = this.communities.find((c) => c.id === communityId);
    const commMembers = this.members.get(communityId) || [];
    this.members.set(
      communityId,
      commMembers.filter((m) => m.userId !== userId)
    );
    if (comm) {
      comm.memberCount = Math.max(0, comm.memberCount - 1);
    }
  }

  async getPosts(communityId: string): Promise<import('../../domain/types').CommunityPost[]> {
    await simulateDelay(60);
    const commPosts = this.posts.get(communityId) || [];
    return commPosts.filter((p) => p.moderationState !== 'removed_by_mod');
  }

  async createPost(
    communityId: string,
    authorId: string,
    authorName: string,
    content: string,
    isHostPrompt = false
  ): Promise<import('../../domain/types').CommunityPost> {
    await simulateDelay();
    if (!content.trim()) throw new Error('Post content cannot be empty.');

    const newPost: import('../../domain/types').CommunityPost = {
      id: `post_${Date.now()}`,
      communityId,
      authorId,
      authorName,
      isHostPrompt,
      content: content.trim(),
      createdAt: 'Just now',
      commentsCount: 0,
      reactionsCount: 0,
      moderationState: 'visible',
    };

    const commPosts = this.posts.get(communityId) || [];
    this.posts.set(communityId, [newPost, ...commPosts]);
    return newPost;
  }

  async getPendingRequests(communityId: string): Promise<import('../../domain/types').CommunityJoinRequest[]> {
    await simulateDelay(60);
    return this.joinRequests.filter((r) => r.communityId === communityId && r.status === 'pending');
  }

  async resolveJoinRequest(requestId: string, actorId: string, action: 'approved' | 'rejected'): Promise<void> {
    await simulateDelay();
    const req = this.joinRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Join request not found');
    req.status = action;

    const comm = this.communities.find((c) => c.id === req.communityId);
    if (action === 'approved' && comm) {
      const commMembers = this.members.get(req.communityId) || [];
      if (!commMembers.some((m) => m.userId === req.userId)) {
        commMembers.push({
          userId: req.userId,
          communityId: req.communityId,
          userName: req.userName,
          role: 'member',
          status: 'approved',
          joinedAt: new Date().toISOString(),
        });
        this.members.set(req.communityId, commMembers);
        comm.memberCount++;
      }
    }

    // Write audit log
    const logs = this.auditLogs.get(req.communityId) || [];
    logs.unshift({
      id: `audit_${Date.now()}`,
      communityId: req.communityId,
      actorId,
      actorName: 'Moderator',
      action: action === 'approved' ? 'approve_join' : 'reject_join',
      targetId: req.userId,
      reason: action === 'approved' ? 'Approved join request' : 'Rejected join request',
      timestamp: new Date().toISOString(),
    });
    this.auditLogs.set(req.communityId, logs);
  }

  async moderateMember(
    communityId: string,
    actorId: string,
    actorName: string,
    targetUserId: string,
    action: 'mute' | 'ban' | 'unban'
  ): Promise<void> {
    await simulateDelay();
    const commMembers = this.members.get(communityId) || [];
    const member = commMembers.find((m) => m.userId === targetUserId);

    if (member) {
      if (action === 'ban') member.status = 'banned';
      if (action === 'mute') member.status = 'muted';
      if (action === 'unban') member.status = 'approved';
    }

    // Write audit log
    const logs = this.auditLogs.get(communityId) || [];
    logs.unshift({
      id: `audit_${Date.now()}`,
      communityId,
      actorId,
      actorName,
      action: action === 'ban' ? 'ban_member' : action === 'mute' ? 'mute_member' : 'unban_member',
      targetId: targetUserId,
      reason: `Moderator action: ${action}`,
      timestamp: new Date().toISOString(),
    });
    this.auditLogs.set(communityId, logs);
  }

  async moderatePost(
    communityId: string,
    actorId: string,
    actorName: string,
    postId: string,
    action: 'remove' | 'hide'
  ): Promise<void> {
    await simulateDelay();
    const commPosts = this.posts.get(communityId) || [];
    const post = commPosts.find((p) => p.id === postId);
    if (post) {
      post.moderationState = action === 'remove' ? 'removed_by_mod' : 'hidden';
    }

    // Write audit log
    const logs = this.auditLogs.get(communityId) || [];
    logs.unshift({
      id: `audit_${Date.now()}`,
      communityId,
      actorId,
      actorName,
      action: action === 'remove' ? 'remove_post' : 'hide_post',
      targetId: postId,
      reason: `Post moderation: ${action}`,
      timestamp: new Date().toISOString(),
    });
    this.auditLogs.set(communityId, logs);
  }

  async getAuditLogs(communityId: string): Promise<import('../../domain/types').CommunityAuditLog[]> {
    await simulateDelay(60);
    return this.auditLogs.get(communityId) || [];
  }
}

import { RelationshipStateMachine } from '../../domain/relationshipStateMachine';

export class MockConnectionRepository implements ConnectionRepository {
  private connections: ConnectionItem[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.connections = [
      {
        id: 'conn_1',
        requesterId: 'user_1',
        recipientId: 'user_3',
        otherUser: mockUsers[2], // Pooja Iyer
        state: 'accepted',
        requesterIntent: 'friendship',
        recipientIntent: 'dating',
        stage: 'FRIEND',
        sharedContextDescription: 'Both in Sunday Photography Circle & Indiranagar zone',
        note: 'Looking forward to the photo walk!',
        suggestedActivity: 'Join Indiranagar 35mm Film Walk this Saturday',
        datingOptIn: {
          requester: false,
          recipient: false,
        },
        createdAt: '2026-09-10T10:00:00Z',
        updatedAt: '2026-09-10T10:30:00Z',
      },
      {
        id: 'conn_2',
        requesterId: 'user_2',
        recipientId: 'user_1',
        otherUser: mockUsers[1], // Rohan Mehta
        state: 'accepted',
        requesterIntent: 'community',
        recipientIntent: 'friendship',
        stage: 'ACTIVITY_PARTNER',
        sharedContextDescription: 'Both play Badminton in Domlur & love Artisan Coffee',
        note: 'Hey Aisha! Want to play doubles badminton this weekend?',
        suggestedActivity: 'Play doubles badminton on Sunday 8 AM',
        datingOptIn: {
          requester: false,
          recipient: false,
        },
        createdAt: '2026-09-12T14:00:00Z',
        updatedAt: '2026-09-12T15:00:00Z',
      },
      {
        id: 'conn_3',
        requesterId: 'user_4',
        recipientId: 'user_1',
        otherUser: mockUsers[3], // Vikram Nair
        state: 'pending',
        requesterIntent: 'explore',
        stage: 'STRANGER',
        sharedContextDescription: 'Shares Board Games (Strategy) & HSR Layout zone',
        note: 'Loved your design work! Would love to play Catan / Terraforming Mars sometime.',
        datingOptIn: {
          requester: false,
          recipient: false,
        },
        createdAt: '2026-09-24T09:00:00Z',
        updatedAt: '2026-09-24T09:00:00Z',
      },
    ];
  }

  get mockConnections(): ConnectionItem[] {
    return this.connections;
  }

  async getConnections(userId: string): Promise<ConnectionItem[]> {
    await simulateDelay();
    return this.connections
      .filter((c) => c.requesterId === userId || c.recipientId === userId)
      .map((c) => {
        const otherUserId = c.requesterId === userId ? c.recipientId : c.requesterId;
        const otherUser = mockUsers.find((u) => u.userId === otherUserId) || c.otherUser;
        return {
          ...c,
          otherUser,
        };
      });
  }

  async getConnectionById(connectionId: string): Promise<ConnectionItem | null> {
    await simulateDelay();
    return this.connections.find((c) => c.id === connectionId) || null;
  }

  async sendConnectionRequest(data: SendConnectionRequestDto): Promise<ConnectionItem> {
    await simulateDelay();

    const requester = mockUsers.find((u) => u.userId === data.requesterId) || mockUsers[0];
    const recipient = mockUsers.find((u) => u.userId === data.recipientId);
    if (!recipient) throw new Error('Recipient user not found');

    // Domain validation
    const blockedUsers = await mockSafetyRepo.getBlockedUsers();
    const eligibility = RelationshipStateMachine.canSendConnectRequest(
      requester,
      recipient,
      data.intent,
      blockedUsers
    );

    if (!eligibility.allowed) {
      throw new Error(eligibility.reason || 'Cannot send connection request');
    }

    const newConn: ConnectionItem = {
      id: `conn_${Date.now()}`,
      requesterId: data.requesterId,
      recipientId: data.recipientId,
      otherUser: recipient,
      state: 'pending',
      requesterIntent: data.intent,
      stage: 'STRANGER',
      sharedContextDescription: data.sharedContext,
      note: data.note,
      datingOptIn: {
        requester: data.intent === 'dating',
        recipient: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.connections.unshift(newConn);
    return newConn;
  }

  async respondToConnection(
    connectionId: string,
    decision: 'accepted' | 'declined' | 'restricted'
  ): Promise<ConnectionItem> {
    await simulateDelay();
    const conn = this.connections.find((c) => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    conn.state = decision;
    if (decision === 'accepted') {
      conn.stage = 'MUTUAL_CONNECTION';
    }
    conn.updatedAt = new Date().toISOString();
    return conn;
  }

  async markAsFriend(connectionId: string): Promise<ConnectionItem> {
    await simulateDelay();
    const conn = this.connections.find((c) => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    conn.stage = 'FRIEND';
    conn.updatedAt = new Date().toISOString();
    return conn;
  }

  async markAsActivityPartner(connectionId: string): Promise<ConnectionItem> {
    await simulateDelay();
    const conn = this.connections.find((c) => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    conn.stage = 'ACTIVITY_PARTNER';
    conn.updatedAt = new Date().toISOString();
    return conn;
  }

  async setDatingOptIn(connectionId: string, userId: string, optIn: boolean): Promise<ConnectionItem> {
    await simulateDelay();
    const conn = this.connections.find((c) => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    if (conn.requesterId === userId) {
      conn.datingOptIn.requester = optIn;
    } else {
      conn.datingOptIn.recipient = optIn;
    }

    const { isMutualDating, stage } = RelationshipStateMachine.evaluateDatingProgression(
      conn.datingOptIn.requester,
      conn.datingOptIn.recipient
    );

    if (isMutualDating) {
      conn.stage = stage;
    }

    conn.updatedAt = new Date().toISOString();
    return conn;
  }

  async removeConnection(connectionId: string, _reason?: string): Promise<void> {
    await simulateDelay();
    this.connections = this.connections.filter((c) => c.id !== connectionId);
  }
}

export class MockMessageRepository implements MessageRepository {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};

  constructor() {
    this.reset();
  }

  reset() {
    this.conversations = [
      // 1. Circle / Group Chat (MSG-03)
      {
        id: 'conv_circle_1',
        type: 'circle',
        title: 'Sunday Photography Circle',
        objectId: 'circle_1',
        participantIds: ['user_1', 'user_2', 'user_3', 'user_4'],
        lastMessage: 'See everyone at 8 AM near Indiranagar Metro! 📸',
        lastMessageAt: '10:45 AM',
        unreadCount: 2,
        sharedContext: 'Indiranagar • Weekly Photowalk Group',
        pinnedPrompt: 'Weekly Photo Prompt: Golden hour reflections in your neighborhood 🌅',
      },
      {
        id: 'conv_circle_2',
        type: 'circle',
        title: 'Domlur Badminton Doubles',
        objectId: 'circle_2',
        participantIds: ['user_1', 'user_2'],
        lastMessage: 'Court booked for Sunday 8 AM at Domlur Club.',
        lastMessageAt: 'Yesterday',
        unreadCount: 0,
        sharedContext: 'Domlur • 4-Player Badminton Circle',
        pinnedPrompt: 'Bring non-marking shoes and your favorite feather shuttles! 🏸',
      },
      // 2. Direct 1:1 Connections (MSG-02)
      {
        id: 'conv_direct_1',
        type: 'direct',
        title: 'Rohan Mehta',
        avatar: mockUsers[1].photos[0],
        participantIds: ['user_1', 'user_2'],
        lastMessage: 'Let me know if you want to test my 50mm f/1.4 lens tomorrow!',
        lastMessageAt: '10:30 AM',
        unreadCount: 1,
        sharedContext: 'You met in Sunday Photography Circle & Indiranagar zone',
        suggestedIcebreakers: [
          'What camera / film stock do you shoot with? 📷',
          'Know any great photo spots around Indiranagar?',
          'Excited for the upcoming Indiranagar 35mm Film Walk!',
        ],
      },
      {
        id: 'conv_direct_2',
        type: 'direct',
        title: 'Sneha Kapoor',
        avatar: mockUsers[2].photos[0],
        participantIds: ['user_1', 'user_3'],
        lastMessage: 'Shared the artisan roastery recommendations in HSR.',
        lastMessageAt: 'Yesterday',
        unreadCount: 0,
        sharedContext: 'Connected via Koramangala Coffee Collective',
        suggestedIcebreakers: [
          "What's your go-to artisan coffee spot in Koramangala? ☕",
          'Up for an espresso tasting session this weekend?',
        ],
      },
      // 3. Message Requests (MSG-04)
      {
        id: 'conv_req_1',
        type: 'request',
        title: 'Vikram Nair',
        avatar: mockUsers[3].photos[0],
        participantIds: ['user_1', 'user_4'],
        lastMessage: 'Would love to invite you for Terraforming Mars with our HSR board game group!',
        lastMessageAt: '2 days ago',
        unreadCount: 1,
        sharedContext: 'Shares Board Games (Strategy) & HSR Layout zone',
        requestStatus: 'pending',
        requestOpeningMessage:
          'Hey Aisha! Loved your design portfolio and saw you love strategy board games. Would love to have you join our game night in HSR!',
      },
    ];

    this.messages = {
      conv_circle_1: [
        {
          id: 'msg_c1_1',
          conversationId: 'conv_circle_1',
          senderId: 'user_3',
          senderName: 'Pooja Iyer',
          senderAvatar: mockUsers[2].photos[0],
          body: 'Hey everyone! Excited for our Saturday morning photowalk.',
          createdAt: '2026-09-24T08:00:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
        {
          id: 'msg_c1_2',
          conversationId: 'conv_circle_1',
          senderId: 'user_2',
          senderName: 'Rohan Mehta',
          senderAvatar: mockUsers[1].photos[0],
          body: 'Bringing some fresh Kodak Gold 200 rolls for anyone who needs one.',
          createdAt: '2026-09-24T08:15:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
        {
          id: 'msg_c1_3',
          conversationId: 'conv_circle_1',
          senderId: 'system',
          senderName: 'LIGHT Event Bot',
          body: '📅 New Circle Event Announcement',
          type: 'system_card',
          systemCardPayload: {
            title: 'Indiranagar 35mm Film Walk',
            subtitle: 'Saturday 8:00 AM • Indiranagar 100ft Road • 6 spots left',
            actionLabel: 'RSVP for Event',
            actionType: 'rsvp_event',
            eventId: 'event_1',
            dateStr: 'Saturday, 8:00 AM',
            venue: 'Indiranagar 100ft Road',
          },
          createdAt: '2026-09-24T09:00:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
        {
          id: 'msg_c1_4',
          conversationId: 'conv_circle_1',
          senderId: 'user_1',
          senderName: 'Aisha Rao',
          body: 'See everyone at 8 AM near Indiranagar Metro! 📸',
          createdAt: '2026-09-25T10:45:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
      ],
      conv_direct_1: [
        {
          id: 'msg_d1_1',
          conversationId: 'conv_direct_1',
          senderId: 'user_2',
          senderName: 'Rohan Mehta',
          senderAvatar: mockUsers[1].photos[0],
          body: 'Hey Aisha! Loved your architecture shots from the last walk.',
          createdAt: '2026-09-24T14:20:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
        {
          id: 'msg_d1_2',
          conversationId: 'conv_direct_1',
          senderId: 'user_1',
          senderName: 'Aisha Rao',
          body: 'Thanks Rohan! Really appreciate it. Are you bringing your prime lens tomorrow?',
          createdAt: '2026-09-24T14:35:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
        {
          id: 'msg_d1_3',
          conversationId: 'conv_direct_1',
          senderId: 'user_2',
          senderName: 'Rohan Mehta',
          senderAvatar: mockUsers[1].photos[0],
          body: 'Let me know if you want to test my 50mm f/1.4 lens tomorrow!',
          createdAt: '2026-09-25T10:30:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
      ],
      conv_direct_2: [
        {
          id: 'msg_d2_1',
          conversationId: 'conv_direct_2',
          senderId: 'user_3',
          senderName: 'Sneha Kapoor',
          senderAvatar: mockUsers[2].photos[0],
          body: 'Shared the artisan roastery recommendations in HSR.',
          createdAt: '2026-09-24T16:00:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
      ],
      conv_req_1: [
        {
          id: 'msg_r1_1',
          conversationId: 'conv_req_1',
          senderId: 'user_4',
          senderName: 'Vikram Nair',
          senderAvatar: mockUsers[3].photos[0],
          body:
            'Hey Aisha! Loved your design portfolio and saw you love strategy board games. Would love to have you join our game night in HSR!',
          createdAt: '2026-09-23T12:00:00Z',
          status: 'sent',
          moderationState: 'clean',
        },
      ],
    };
  }

  get mockConversations(): Conversation[] {
    return this.conversations;
  }

  async getConversations(
    userId: string,
    segment: 'all' | 'circles' | 'connections' | 'requests' = 'all'
  ): Promise<Conversation[]> {
    await simulateDelay(60);
    return this.conversations.filter((c) => {
      const isParticipant = c.participantIds.includes(userId);
      if (!isParticipant) return false;
      if (segment === 'circles') return c.type === 'circle';
      if (segment === 'connections') return c.type === 'direct';
      if (segment === 'requests') return c.type === 'request';
      return true;
    });
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    await simulateDelay(40);
    return this.conversations.find((c) => c.id === conversationId) || null;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await simulateDelay(40);
    return this.messages[conversationId] || [];
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    body: string,
    options?: import('../repositories').SendMessageOptions
  ): Promise<Message> {
    await simulateDelay(80);

    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv?.isBlocked) {
      throw new Error('You cannot message this participant because of safety settings.');
    }

    if (conv?.type === 'request' && conv.requestStatus === 'pending') {
      throw new Error('Cannot send messages to a pending request before accepting.');
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      senderId,
      senderName,
      senderAvatar: options?.senderAvatar,
      body,
      type: options?.type || 'text',
      mediaUri: options?.mediaUri,
      mediaModerationState: options?.mediaUri ? 'clean' : undefined,
      systemCardPayload: options?.systemCardPayload,
      createdAt: new Date().toISOString(),
      status: 'sent',
      moderationState: 'clean',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMsg);

    if (conv) {
      conv.lastMessage = options?.type === 'image' ? '📷 Image' : body;
      conv.lastMessageAt = 'Just now';
    }

    return newMsg;
  }

  async respondToMessageRequest(
    conversationId: string,
    action: 'accepted' | 'declined' | 'blocked'
  ): Promise<Conversation> {
    await simulateDelay(80);
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    if (action === 'accepted') {
      conv.requestStatus = 'accepted';
      conv.type = 'direct';
    } else if (action === 'declined') {
      conv.requestStatus = 'declined';
      this.conversations = this.conversations.filter((c) => c.id !== conversationId);
    } else if (action === 'blocked') {
      conv.isBlocked = true;
      this.conversations = this.conversations.filter((c) => c.id !== conversationId);
    }

    return conv;
  }

  async toggleConversationMute(conversationId: string): Promise<boolean> {
    await simulateDelay(40);
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');
    conv.isMuted = !conv.isMuted;
    return !!conv.isMuted;
  }

  async deleteMessageForMe(messageId: string, _userId: string): Promise<void> {
    await simulateDelay(40);
    for (const convId in this.messages) {
      this.messages[convId] = this.messages[convId].filter((m) => m.id !== messageId);
    }
  }

  async blockParticipant(conversationId: string, _actorUserId: string): Promise<void> {
    await simulateDelay(60);
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.isBlocked = true;
    }
  }
}

export class MockEventRepository implements EventRepository {
  private events: Event[] = [...mockEvents];
  private attendees: Record<string, import('../../domain/types').EventAttendee[]> = {
    ...mockAttendees,
  };
  private datePlans: import('../../domain/types').DatePlanProposal[] = [...mockDatePlans];
  private feedbacks: Record<string, import('../../domain/types').EventFeedback[]> = {
    event_1: [...mockEventFeedbacks],
  };

  async getEvents(filters?: import('../repositories').EventFilters): Promise<Event[]> {
    await simulateDelay();
    return this.events.filter((ev) => {
      if (filters?.zone && filters.zone !== 'All' && !ev.venueZone.toLowerCase().includes(filters.zone.toLowerCase())) {
        return false;
      }
      if (filters?.category && filters.category !== 'All' && ev.activityType !== filters.category) {
        return false;
      }
      if (filters?.priceBand && filters.priceBand !== 'All' && ev.priceBand !== filters.priceBand) {
        return false;
      }
      if (filters?.verifiedHostOnly && !ev.isHostVerified) {
        return false;
      }
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description?.toLowerCase().includes(q);
        const matchesZone = ev.venueZone.toLowerCase().includes(q);
        const matchesAct = ev.activityType.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesZone && !matchesAct) return false;
      }
      return true;
    });
  }

  async getEventById(id: string): Promise<Event | null> {
    await simulateDelay();
    return this.events.find((e) => e.id === id) || null;
  }

  async getAttendees(eventId: string): Promise<import('../../domain/types').EventAttendee[]> {
    await simulateDelay(60);
    return this.attendees[eventId] || [];
  }

  async createEvent(data: import('../repositories').CreateEventDto): Promise<Event> {
    await simulateDelay();
    if (data.capacity < 4 || data.capacity > 12) {
      throw new Error('Event capacity must be between 4 and 12 members.');
    }
    if (!data.title.trim() || !data.activityType.trim() || !data.locationZone.trim()) {
      throw new Error('Title, activity type, and location zone are required.');
    }

    const checkInCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newEvent: Event = {
      id: `event_${Date.now()}`,
      title: data.title.trim(),
      description: data.description?.trim(),
      activityType: data.activityType,
      circleId: data.circleId,
      circleTitle: data.circleTitle,
      communityId: data.communityId,
      communityTitle: data.communityTitle,
      hostId: data.hostId,
      hostName: data.hostName,
      hostAvatar: data.hostAvatar,
      isHostVerified: data.isHostVerified ?? true,
      dateStr: data.dateStr,
      timeStr: data.timeStr,
      venueZone: data.locationZone,
      venueCategory: data.venueCategory,
      exactAddress: data.exactAddress,
      capacity: data.capacity,
      rsvpsCount: 1, // Host is first attendee
      waitlistCount: 0,
      state: 'upcoming',
      priceBand: data.priceBand,
      coverImage:
        data.coverImage ||
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      houseRules: data.houseRules && data.houseRules.length > 0
        ? data.houseRules
        : ['Be welcoming and respectful', 'Arrive on time', 'Leave no litter'],
      safetyNotes: data.safetyNotes && data.safetyNotes.length > 0
        ? data.safetyNotes
        : ['Meet in daylight public spaces', 'Tell a trusted contact your plan'],
      checkInCode,
      createdAt: new Date().toISOString(),
    };

    this.events.unshift(newEvent);

    // Add host as first confirmed attendee
    this.attendees[newEvent.id] = [
      {
        userId: data.hostId,
        userName: data.hostName,
        userAvatar: data.hostAvatar,
        isVerified: data.isHostVerified,
        status: 'going',
        rsvpdAt: new Date().toISOString(),
      },
    ];

    return newEvent;
  }

  async cancelEventByHost(eventId: string, hostId: string, _reason?: string): Promise<Event> {
    await simulateDelay();
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) throw new Error('Event not found');
    if (ev.hostId !== hostId) throw new Error('Only the host can cancel this event.');

    ev.state = 'cancelled';
    return ev;
  }

  async rsvpEvent(
    eventId: string,
    user: { userId: string; userName: string; userAvatar?: string; isVerified?: boolean }
  ): Promise<{ attendee: import('../../domain/types').EventAttendee; event: Event }> {
    await simulateDelay();
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) throw new Error('Event not found');
    if (ev.state === 'cancelled') throw new Error('Cannot RSVP to a cancelled event.');

    const currentList = this.attendees[eventId] || [];
    const { attendee, result } = EventStateMachine.evaluateRsvp(ev, currentList, user);

    // Update attendee list atomically
    const existingIndex = currentList.findIndex((a) => a.userId === user.userId);
    if (existingIndex !== -1) {
      currentList[existingIndex] = attendee;
    } else {
      currentList.push(attendee);
    }
    this.attendees[eventId] = currentList;

    // Update event counter fields
    ev.rsvpsCount = result.rsvpsCount;
    ev.waitlistCount = result.waitlistCount;

    return { attendee, event: ev };
  }

  async cancelRsvp(
    eventId: string,
    userId: string
  ): Promise<{ event: Event; promotedAttendee?: import('../../domain/types').EventAttendee }> {
    await simulateDelay();
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) throw new Error('Event not found');

    const currentList = this.attendees[eventId] || [];
    const cancelRes = EventStateMachine.handleCancellation(ev, currentList, userId);

    this.attendees[eventId] = cancelRes.updatedAttendees;
    ev.rsvpsCount = cancelRes.newRsvpsCount;
    ev.waitlistCount = cancelRes.newWaitlistCount;

    return { event: ev, promotedAttendee: cancelRes.promotedAttendee };
  }

  async checkIn(
    eventId: string,
    userId: string,
    code?: string
  ): Promise<{ success: boolean; error?: string }> {
    await simulateDelay();
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) return { success: false, error: 'Event not found' };

    const currentList = this.attendees[eventId] || [];
    const attendee = currentList.find((a) => a.userId === userId);

    const validation = EventStateMachine.validateCheckIn(ev, attendee, code);
    if (!validation.success) {
      return validation;
    }

    if (attendee) {
      attendee.status = 'checked_in';
      attendee.checkedInAt = new Date().toISOString();
    }

    return { success: true };
  }

  async submitFeedback(feedback: import('../../domain/types').EventFeedback): Promise<void> {
    await simulateDelay();
    if (!this.feedbacks[feedback.eventId]) {
      this.feedbacks[feedback.eventId] = [];
    }
    this.feedbacks[feedback.eventId].push(feedback);
  }

  async getEventFeedback(eventId: string): Promise<import('../../domain/types').EventFeedback[]> {
    await simulateDelay(60);
    return this.feedbacks[eventId] || [];
  }

  async createDatePlan(
    data: import('../repositories').CreateDatePlanDto
  ): Promise<import('../../domain/types').DatePlanProposal> {
    await simulateDelay();
    const newPlan: import('../../domain/types').DatePlanProposal = {
      id: `date_plan_${Date.now()}`,
      connectionId: data.connectionId,
      proposerId: data.proposerId,
      proposerName: data.proposerName,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      venueCategory: data.venueCategory,
      locationZone: data.locationZone,
      suggestedDate: data.suggestedDate,
      suggestedTime: data.suggestedTime,
      note: data.note,
      status: 'proposed',
      safetyPlanEnabled: data.safetyPlanEnabled ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.datePlans.unshift(newPlan);
    return newPlan;
  }

  async getDatePlans(userId: string): Promise<import('../../domain/types').DatePlanProposal[]> {
    await simulateDelay(60);
    return this.datePlans.filter(
      (p) => p.proposerId === userId || p.recipientId === userId
    );
  }

  async respondToDatePlan(
    planId: string,
    action: 'confirm' | 'cancel' | 'counter',
    counterNotes?: string
  ): Promise<import('../../domain/types').DatePlanProposal> {
    await simulateDelay();
    const plan = this.datePlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Date plan not found');

    plan.status = EventStateMachine.evaluateDatePlanTransition(plan.status, action);
    if (counterNotes) {
      plan.counterNotes = counterNotes;
    }
    plan.updatedAt = new Date().toISOString();
    return plan;
  }

  async completeDatePlan(
    planId: string,
    outcome: import('../../domain/types').DatePlanPostOutcome
  ): Promise<import('../../domain/types').DatePlanProposal> {
    await simulateDelay();
    const plan = this.datePlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Date plan not found');

    plan.status = 'completed';
    plan.postDateOutcome = outcome;
    plan.updatedAt = new Date().toISOString();
    return plan;
  }
}

export class MockSafetyRepository implements SafetyRepository {
  private cases: import('../../domain/safetyTypes').SafetyCase[] = [
    {
      caseId: 'CASE-8492-2026',
      targetType: 'user',
      targetId: 'user_99',
      targetName: 'Suspicious Account',
      reporterId: 'user_1',
      category: 'scam_financial',
      severity: 'high',
      details: 'Sent unsolicited crypto investment links in DM.',
      status: 'in_review',
      timeline: [
        {
          status: 'received',
          title: 'Report Received',
          description: 'Your report was received by Project LIGHT Trust & Safety.',
          timestamp: '2026-09-24T10:00:00Z',
        },
        {
          status: 'in_review',
          title: 'Under Moderator Review',
          description: 'A safety team member is reviewing the report against Community Guidelines.',
          timestamp: '2026-09-24T12:30:00Z',
        },
      ],
      appealEligible: true,
      createdAt: '2026-09-24T10:00:00Z',
      updatedAt: '2026-09-24T12:30:00Z',
    },
  ];

  private restrictions: import('../../domain/safetyTypes').RestrictionItem[] = [];
  private trustedContacts: import('../../domain/safetyTypes').TrustedContact[] = [
    {
      id: 'tc_1',
      userId: 'user_1',
      name: 'Pooja (Best Friend)',
      relationship: 'Friend',
      phoneNumber: '+91 98765 43210',
      phoneMasked: '+91 98****3210',
      email: 'pooja@example.com',
      isVerifiedConsent: true,
      addedAt: '2026-09-15T08:00:00Z',
    },
  ];
  private dateSafetyPlans: import('../../domain/safetyTypes').DateSafetyPlan[] = [];

  async submitReport(
    data: import('../repositories').SubmitReportDto
  ): Promise<import('../../domain/safetyTypes').SafetyCase> {
    await simulateDelay();
    const caseId = SafetyStateMachine.generateCaseId();
    const now = new Date().toISOString();

    const newCase: import('../../domain/safetyTypes').SafetyCase = {
      caseId,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      reporterId: data.reporterId,
      category: data.category,
      severity: data.severity,
      details: data.details,
      evidenceSnippets: data.evidenceSnippets,
      status: 'received',
      timeline: [
        {
          status: 'received',
          title: 'Report Received',
          description: 'Your report has been received and queued for review.',
          timestamp: now,
        },
      ],
      appealEligible: true,
      createdAt: now,
      updatedAt: now,
    };

    this.cases.unshift(newCase);

    // Apply immediate protection if requested (SAFE-02)
    if (data.applyImmediateProtection === 'block') {
      await this.blockUser(data.reporterId, data.targetId, data.targetName, `Report: ${data.category}`);
    } else if (data.applyImmediateProtection === 'restrict') {
      await this.restrictUser(data.reporterId, data.targetId, data.targetName, `Report: ${data.category}`);
    }

    return newCase;
  }

  async getSafetyCases(userId: string): Promise<import('../../domain/safetyTypes').SafetyCase[]> {
    await simulateDelay(60);
    return this.cases.filter((c) => c.reporterId === userId);
  }

  async getSafetyCaseById(
    caseId: string
  ): Promise<import('../../domain/safetyTypes').SafetyCase | null> {
    await simulateDelay(60);
    return this.cases.find((c) => c.caseId === caseId) || null;
  }

  async appealSafetyCase(
    caseId: string,
    reason: string
  ): Promise<import('../../domain/safetyTypes').SafetyCase> {
    await simulateDelay();
    const found = this.cases.find((c) => c.caseId === caseId);
    if (!found) throw new Error('Safety case not found');

    const transition = SafetyStateMachine.evaluateCaseTransition(found.status, 'submit_appeal');
    found.status = transition.nextStatus;
    found.timeline.push(transition.timelineItem);
    found.details = `${found.details || ''}\n\n[Appeal Reason]: ${reason}`;
    found.updatedAt = new Date().toISOString();
    return found;
  }

  async blockUser(
    actorUserId: string,
    targetUserId: string,
    targetName: string,
    reason?: string
  ): Promise<void> {
    await simulateDelay();
    // Remove if previously restricted
    this.restrictions = this.restrictions.filter(
      (r) => !(r.targetUserId === targetUserId && r.type === 'restrict')
    );

    const exists = this.restrictions.some(
      (r) => r.targetUserId === targetUserId && r.type === 'block'
    );
    if (!exists) {
      this.restrictions.push({
        id: `rest_${Date.now()}`,
        targetUserId,
        targetName,
        type: 'block',
        reason,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async unblockUser(_actorUserId: string, targetUserId: string): Promise<void> {
    await simulateDelay();
    this.restrictions = this.restrictions.filter(
      (r) => !(r.targetUserId === targetUserId && r.type === 'block')
    );
  }

  async restrictUser(
    actorUserId: string,
    targetUserId: string,
    targetName: string,
    reason?: string
  ): Promise<void> {
    await simulateDelay();
    const exists = this.restrictions.some(
      (r) => r.targetUserId === targetUserId && r.type === 'restrict'
    );
    if (!exists) {
      this.restrictions.push({
        id: `rest_${Date.now()}`,
        targetUserId,
        targetName,
        type: 'restrict',
        reason,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async unrestrictUser(_actorUserId: string, targetUserId: string): Promise<void> {
    await simulateDelay();
    this.restrictions = this.restrictions.filter(
      (r) => !(r.targetUserId === targetUserId && r.type === 'restrict')
    );
  }

  async getBlockedAndRestrictedUsers(
    _actorUserId: string
  ): Promise<import('../../domain/safetyTypes').RestrictionItem[]> {
    await simulateDelay(60);
    return this.restrictions;
  }

  async getBlockedUsers(_actorUserId?: string): Promise<string[]> {
    await simulateDelay(20);
    return this.restrictions
      .filter((r) => r.type === 'block')
      .map((r) => r.targetUserId);
  }

  async getTrustedContacts(
    userId: string
  ): Promise<import('../../domain/safetyTypes').TrustedContact[]> {
    await simulateDelay(60);
    return this.trustedContacts.filter((c) => c.userId === userId);
  }

  async addTrustedContact(
    data: import('../repositories').AddTrustedContactDto
  ): Promise<import('../../domain/safetyTypes').TrustedContact> {
    await simulateDelay();
    const newContact: import('../../domain/safetyTypes').TrustedContact = {
      id: `tc_${Date.now()}`,
      userId: data.userId,
      name: data.name.trim(),
      relationship: data.relationship,
      phoneNumber: data.phoneNumber.trim(),
      phoneMasked: SafetyStateMachine.maskPhoneNumber(data.phoneNumber),
      email: data.email?.trim(),
      isVerifiedConsent: true,
      addedAt: new Date().toISOString(),
    };

    this.trustedContacts.push(newContact);
    return newContact;
  }

  async deleteTrustedContact(contactId: string): Promise<void> {
    await simulateDelay();
    this.trustedContacts = this.trustedContacts.filter((c) => c.id !== contactId);
  }

  async startDateSafetyTimer(
    data: import('../repositories').StartDateSafetyDto
  ): Promise<import('../../domain/safetyTypes').DateSafetyPlan> {
    await simulateDelay();
    const newPlan: import('../../domain/safetyTypes').DateSafetyPlan = {
      id: `dsp_${Date.now()}`,
      connectionId: data.connectionId,
      partnerName: data.partnerName,
      venueCategory: data.venueCategory,
      locationZone: data.locationZone,
      startTime: data.startTime,
      timerDurationMinutes: data.timerDurationMinutes,
      timerStatus: 'active',
      startedAt: new Date().toISOString(),
    };

    this.dateSafetyPlans.unshift(newPlan);
    return newPlan;
  }

  async triggerSosAlert(planId: string): Promise<{ success: boolean; message: string }> {
    await simulateDelay();
    const plan = this.dateSafetyPlans.find((p) => p.id === planId);
    if (plan) {
      plan.timerStatus = 'sos_triggered';
    }
    return {
      success: true,
      message:
        'Emergency alert dispatched to your trusted contacts with location and check-in details.',
    };
  }
}

export const mockRepositories = {
  auth: new MockAuthRepository(),
  profile: new MockProfileRepository(),
  circle: new MockCircleRepository(),
  community: new MockCommunityRepository(),
  connection: new MockConnectionRepository(),
  message: new MockMessageRepository(),
  event: new MockEventRepository(),
  safety: new MockSafetyRepository(),
};

export const mockAuthRepo = mockRepositories.auth;
export const mockProfileRepo = mockRepositories.profile;
export const mockCircleRepo = mockRepositories.circle;
export const mockCommunityRepo = mockRepositories.community;
export const mockConnectionRepo = mockRepositories.connection;
export const mockMessageRepo = mockRepositories.message;
export const mockEventRepo = mockRepositories.event;
export const mockSafetyRepo = mockRepositories.safety;

