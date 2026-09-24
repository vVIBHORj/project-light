import { create } from 'zustand';
import { Community, Circle, CommunityPost, CommunityJoinRequest, CommunityAuditLog } from '../../../domain/types';
import { mockCommunityRepo, mockCircleRepo } from '../../../data/mocks';

interface CirclesState {
  // Navigation
  activeTab: 'my_circles' | 'communities';
  setActiveTab: (tab: 'my_circles' | 'communities') => void;

  // Filters & Search
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;

  // Selected Entities
  selectedCommunity: Community | null;
  selectedCircle: Circle | null;
  setSelectedCommunity: (community: Community | null) => void;
  setSelectedCircle: (circle: Circle | null) => void;

  // Active Sheets / Modals
  isJoinSheetOpen: boolean;
  isCreateCommunityOpen: boolean;
  isCreateCircleOpen: boolean;
  isModConsoleOpen: boolean;
  isReportOrLeaveOpen: boolean;
  reportOrLeaveTarget: { type: 'community' | 'circle'; id: string; name: string } | null;

  setJoinSheetOpen: (open: boolean) => void;
  setCreateCommunityOpen: (open: boolean) => void;
  setCreateCircleOpen: (open: boolean) => void;
  setModConsoleOpen: (open: boolean) => void;
  openReportOrLeave: (target: { type: 'community' | 'circle'; id: string; name: string }) => void;
  closeReportOrLeave: () => void;

  // Dynamic Data Cache
  communitiesList: Community[];
  circlesList: Circle[];
  myCirclesList: Circle[];
  communityPosts: Record<string, CommunityPost[]>;
  pendingRequests: Record<string, CommunityJoinRequest[]>;
  auditLogs: Record<string, CommunityAuditLog[]>;
  membershipStatusMap: Record<string, 'none' | 'pending' | 'approved' | 'muted' | 'banned'>;

  // Actions
  loadInitialData: (userId: string) => Promise<void>;
  joinCircle: (circleId: string, userId: string) => Promise<Circle>;
  leaveCircle: (circleId: string, userId: string) => Promise<void>;
  joinCommunity: (communityId: string, userId: string, userName?: string, answers?: string[]) => Promise<{ status: 'approved' | 'pending' }>;
  cancelJoinRequest: (communityId: string, userId: string) => Promise<void>;
  leaveCommunity: (communityId: string, userId: string) => Promise<void>;
  createCommunity: (data: Parameters<typeof mockCommunityRepo.createCommunity>[0]) => Promise<Community>;
  createCircle: (data: Parameters<typeof mockCircleRepo.createCircle>[0]) => Promise<Circle>;
  createPost: (communityId: string, authorId: string, authorName: string, content: string, isHostPrompt?: boolean) => Promise<CommunityPost>;
  resolveJoinRequest: (requestId: string, actorId: string, action: 'approved' | 'rejected') => Promise<void>;
  moderateMember: (communityId: string, actorId: string, actorName: string, targetUserId: string, action: 'mute' | 'ban' | 'unban') => Promise<void>;
  moderatePost: (communityId: string, actorId: string, actorName: string, postId: string, action: 'remove' | 'hide') => Promise<void>;

  // Analytics
  analyticsEvents: { event: string; payload: Record<string, unknown>; timestamp: string }[];
  logAnalytics: (event: string, payload?: Record<string, unknown>) => void;
}

export const useCirclesStore = create<CirclesState>((set, get) => ({
  activeTab: 'my_circles',
  setActiveTab: (tab) => set({ activeTab: tab }),

  searchQuery: '',
  selectedCategory: 'All',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  selectedCommunity: null,
  selectedCircle: null,
  setSelectedCommunity: (community) => set({ selectedCommunity: community }),
  setSelectedCircle: (circle) => set({ selectedCircle: circle }),

  isJoinSheetOpen: false,
  isCreateCommunityOpen: false,
  isCreateCircleOpen: false,
  isModConsoleOpen: false,
  isReportOrLeaveOpen: false,
  reportOrLeaveTarget: null,

  setJoinSheetOpen: (open) => set({ isJoinSheetOpen: open }),
  setCreateCommunityOpen: (open) => set({ isCreateCommunityOpen: open }),
  setCreateCircleOpen: (open) => set({ isCreateCircleOpen: open }),
  setModConsoleOpen: (open) => set({ isModConsoleOpen: open }),
  openReportOrLeave: (target) => set({ isReportOrLeaveOpen: true, reportOrLeaveTarget: target }),
  closeReportOrLeave: () => set({ isReportOrLeaveOpen: false, reportOrLeaveTarget: null }),

  communitiesList: [],
  circlesList: [],
  myCirclesList: [],
  communityPosts: {},
  pendingRequests: {},
  auditLogs: {},
  membershipStatusMap: {},

  loadInitialData: async (userId: string) => {
    const [comms, circles] = await Promise.all([
      mockCommunityRepo.getCommunities(),
      mockCircleRepo.getCircles(),
    ]);

    const myCircles = circles.filter((c) => c.members.includes(userId));

    // Load membership status for all communities
    const statusMap: Record<string, 'none' | 'pending' | 'approved' | 'muted' | 'banned'> = {};
    for (const comm of comms) {
      statusMap[comm.id] = await mockCommunityRepo.getMembershipStatus(comm.id, userId);
    }

    set({
      communitiesList: comms,
      circlesList: circles,
      myCirclesList: myCircles,
      membershipStatusMap: statusMap,
    });
  },

  joinCircle: async (circleId, userId) => {
    const updated = await mockCircleRepo.joinCircle(circleId, userId);
    set((state) => ({
      circlesList: state.circlesList.map((c) => (c.id === circleId ? updated : c)),
      myCirclesList: state.myCirclesList.some((c) => c.id === circleId)
        ? state.myCirclesList
        : [updated, ...state.myCirclesList],
      selectedCircle: state.selectedCircle?.id === circleId ? updated : state.selectedCircle,
    }));
    get().logAnalytics('circle_joined', { circleId, title: updated.title });
    return updated;
  },

  leaveCircle: async (circleId, userId) => {
    await mockCircleRepo.leaveCircle(circleId, userId);
    set((state) => {
      const updatedCircles = state.circlesList.map((c) => {
        if (c.id === circleId) {
          return {
            ...c,
            members: c.members.filter((m) => m !== userId),
            currentMemberCount: Math.max(0, c.currentMemberCount - 1),
          };
        }
        return c;
      });

      return {
        circlesList: updatedCircles,
        myCirclesList: state.myCirclesList.filter((c) => c.id !== circleId),
        selectedCircle: state.selectedCircle?.id === circleId ? null : state.selectedCircle,
      };
    });
    get().logAnalytics('circle_left', { circleId });
  },

  joinCommunity: async (communityId, userId, userName, answers) => {
    const res = await mockCommunityRepo.joinCommunity(communityId, userId, userName, answers);
    set((state) => ({
      membershipStatusMap: {
        ...state.membershipStatusMap,
        [communityId]: res.status,
      },
    }));
    if (res.status === 'approved') {
      get().logAnalytics('community_joined', { communityId });
    }
    return res;
  },

  cancelJoinRequest: async (communityId, userId) => {
    await mockCommunityRepo.cancelJoinRequest(communityId, userId);
    set((state) => ({
      membershipStatusMap: {
        ...state.membershipStatusMap,
        [communityId]: 'none',
      },
    }));
  },

  leaveCommunity: async (communityId, userId) => {
    await mockCommunityRepo.leaveCommunity(communityId, userId);
    set((state) => ({
      membershipStatusMap: {
        ...state.membershipStatusMap,
        [communityId]: 'none',
      },
      selectedCommunity: state.selectedCommunity?.id === communityId ? null : state.selectedCommunity,
    }));
  },

  createCommunity: async (data) => {
    const created = await mockCommunityRepo.createCommunity(data);
    set((state) => ({
      communitiesList: [created, ...state.communitiesList],
      membershipStatusMap: {
        ...state.membershipStatusMap,
        [created.id]: 'approved',
      },
    }));
    get().logAnalytics('community_created', { communityId: created.id, name: created.name });
    return created;
  },

  createCircle: async (data) => {
    const created = await mockCircleRepo.createCircle(data);
    set((state) => ({
      circlesList: [created, ...state.circlesList],
      myCirclesList: [created, ...state.myCirclesList],
    }));
    get().logAnalytics('circle_joined', { circleId: created.id, title: created.title });
    return created;
  },

  createPost: async (communityId, authorId, authorName, content, isHostPrompt) => {
    const post = await mockCommunityRepo.createPost(communityId, authorId, authorName, content, isHostPrompt);
    set((state) => ({
      communityPosts: {
        ...state.communityPosts,
        [communityId]: [post, ...(state.communityPosts[communityId] || [])],
      },
    }));
    return post;
  },

  resolveJoinRequest: async (requestId, actorId, action) => {
    await mockCommunityRepo.resolveJoinRequest(requestId, actorId, action);
    // Refresh pending requests
    const comms = get().communitiesList;
    for (const comm of comms) {
      const pending = await mockCommunityRepo.getPendingRequests(comm.id);
      const logs = await mockCommunityRepo.getAuditLogs(comm.id);
      set((state) => ({
        pendingRequests: { ...state.pendingRequests, [comm.id]: pending },
        auditLogs: { ...state.auditLogs, [comm.id]: logs },
      }));
    }
  },

  moderateMember: async (communityId, actorId, actorName, targetUserId, action) => {
    await mockCommunityRepo.moderateMember(communityId, actorId, actorName, targetUserId, action);
    const logs = await mockCommunityRepo.getAuditLogs(communityId);
    set((state) => ({
      auditLogs: { ...state.auditLogs, [communityId]: logs },
      membershipStatusMap: {
        ...state.membershipStatusMap,
        [communityId]: action === 'ban' ? 'banned' : action === 'mute' ? 'muted' : 'approved',
      },
    }));
  },

  moderatePost: async (communityId, actorId, actorName, postId, action) => {
    await mockCommunityRepo.moderatePost(communityId, actorId, actorName, postId, action);
    const posts = await mockCommunityRepo.getPosts(communityId);
    const logs = await mockCommunityRepo.getAuditLogs(communityId);
    set((state) => ({
      communityPosts: { ...state.communityPosts, [communityId]: posts },
      auditLogs: { ...state.auditLogs, [communityId]: logs },
    }));
  },

  analyticsEvents: [],
  logAnalytics: (event, payload = {}) => {
    set((state) => ({
      analyticsEvents: [
        ...state.analyticsEvents,
        { event, payload, timestamp: new Date().toISOString() },
      ],
    }));
  },
}));
