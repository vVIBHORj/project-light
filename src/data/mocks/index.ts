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
  SafetyReport,
  Interest,
} from '../../domain/types';
import {
  mockUsers,
  mockCircles,
  mockCommunities,
  mockEvents,
  mockInterests,
} from './seedData';
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
  private conversations: Conversation[] = [
    {
      id: 'conv_1',
      type: 'circle',
      objectId: 'circle_1',
      participantIds: ['user_1', 'user_3'],
      lastMessage: 'Looking forward to the photo walk tomorrow!',
      lastMessageAt: 'Yesterday',
      unreadCount: 1,
    },
  ];

  private messages: Record<string, Message[]> = {
    conv_1: [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: 'user_3',
        senderName: 'Pooja Iyer',
        body: 'Looking forward to the photo walk tomorrow!',
        createdAt: '2026-09-23T18:30:00Z',
        moderationState: 'clean',
      },
    ],
  };

  async getConversations(_userId: string): Promise<Conversation[]> {
    await simulateDelay();
    return this.conversations;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await simulateDelay();
    return this.messages[conversationId] || [];
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    body: string
  ): Promise<Message> {
    await simulateDelay();
    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      body,
      createdAt: new Date().toISOString(),
      moderationState: 'clean',
    };
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(msg);
    return msg;
  }
}

export class MockEventRepository implements EventRepository {
  private events: Event[] = [...mockEvents];

  async getEvents(): Promise<Event[]> {
    await simulateDelay();
    return this.events;
  }

  async getEventById(id: string): Promise<Event | null> {
    await simulateDelay();
    return this.events.find((e) => e.id === id) || null;
  }

  async rsvpEvent(eventId: string, _userId: string): Promise<Event> {
    await simulateDelay();
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) throw new Error('Event not found');
    ev.rsvpsCount++;
    return ev;
  }
}

export class MockSafetyRepository implements SafetyRepository {
  private blockedUsers: string[] = [];
  private restrictedUsers: string[] = [];
  private reports: SafetyReport[] = [];

  async report(reportData: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>): Promise<SafetyReport> {
    await simulateDelay();
    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      ...reportData,
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    this.reports.push(newReport);
    return newReport;
  }

  async blockUser(targetUserId: string): Promise<void> {
    await simulateDelay();
    if (!this.blockedUsers.includes(targetUserId)) {
      this.blockedUsers.push(targetUserId);
    }
  }

  async restrictUser(targetUserId: string): Promise<void> {
    await simulateDelay();
    if (!this.restrictedUsers.includes(targetUserId)) {
      this.restrictedUsers.push(targetUserId);
    }
  }

  async getBlockedUsers(): Promise<string[]> {
    await simulateDelay(50);
    return this.blockedUsers;
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

