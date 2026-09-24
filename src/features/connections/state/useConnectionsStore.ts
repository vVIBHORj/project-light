import { create } from 'zustand';
import { ConnectionItem, SendConnectionRequestDto } from '../../../data/repositories';
import { mockConnectionRepo } from '../../../data/mocks';
import { UserProfile } from '../../../domain/types';

export type ConnectionsTabFilter = 'all' | 'friends' | 'activity_partners' | 'dating' | 'pending';

interface ConnectionsState {
  // Navigation
  activeTab: ConnectionsTabFilter;
  setActiveTab: (tab: ConnectionsTabFilter) => void;

  // Data List
  connectionsList: ConnectionItem[];
  isLoading: boolean;

  // Modal Targets
  targetProfileForConnect: UserProfile | null;
  targetConnectionForDecision: ConnectionItem | null;
  targetConnectionForDating: ConnectionItem | null;
  targetConnectionForRemove: ConnectionItem | null;
  targetConnectionForInvite: ConnectionItem | null;

  // Modal Visibility
  isConnectRequestOpen: boolean;
  isDecisionSheetOpen: boolean;
  isDatingOptInOpen: boolean;
  isRemoveModalOpen: boolean;
  isInviteModalOpen: boolean;

  // Modal Setters
  openConnectRequest: (profile: UserProfile) => void;
  closeConnectRequest: () => void;
  openDecisionSheet: (connection: ConnectionItem) => void;
  closeDecisionSheet: () => void;
  openDatingOptIn: (connection: ConnectionItem) => void;
  closeDatingOptIn: () => void;
  openRemoveModal: (connection: ConnectionItem) => void;
  closeRemoveModal: () => void;
  openInviteModal: (connection: ConnectionItem) => void;
  closeInviteModal: () => void;

  // Async Actions
  loadConnections: (userId: string) => Promise<void>;
  sendConnectRequest: (data: SendConnectionRequestDto) => Promise<ConnectionItem>;
  acceptConnection: (connectionId: string) => Promise<ConnectionItem>;
  declineConnection: (connectionId: string) => Promise<ConnectionItem>;
  restrictConnection: (connectionId: string) => Promise<ConnectionItem>;
  markFriend: (connectionId: string) => Promise<ConnectionItem>;
  markActivityPartner: (connectionId: string) => Promise<ConnectionItem>;
  setDatingOptIn: (connectionId: string, userId: string, optIn: boolean) => Promise<ConnectionItem>;
  removeConnection: (connectionId: string, reason?: string) => Promise<void>;

  // Analytics
  analyticsEvents: { event: string; payload: Record<string, unknown>; timestamp: string }[];
  logAnalytics: (event: string, payload?: Record<string, unknown>) => void;
}

export const useConnectionsStore = create<ConnectionsState>((set, get) => ({
  activeTab: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),

  connectionsList: [],
  isLoading: false,

  targetProfileForConnect: null,
  targetConnectionForDecision: null,
  targetConnectionForDating: null,
  targetConnectionForRemove: null,
  targetConnectionForInvite: null,

  isConnectRequestOpen: false,
  isDecisionSheetOpen: false,
  isDatingOptInOpen: false,
  isRemoveModalOpen: false,
  isInviteModalOpen: false,

  openConnectRequest: (profile) =>
    set({ targetProfileForConnect: profile, isConnectRequestOpen: true }),
  closeConnectRequest: () =>
    set({ targetProfileForConnect: null, isConnectRequestOpen: false }),

  openDecisionSheet: (connection) =>
    set({ targetConnectionForDecision: connection, isDecisionSheetOpen: true }),
  closeDecisionSheet: () =>
    set({ targetConnectionForDecision: null, isDecisionSheetOpen: false }),

  openDatingOptIn: (connection) =>
    set({ targetConnectionForDating: connection, isDatingOptInOpen: true }),
  closeDatingOptIn: () =>
    set({ targetConnectionForDating: null, isDatingOptInOpen: false }),

  openRemoveModal: (connection) =>
    set({ targetConnectionForRemove: connection, isRemoveModalOpen: true }),
  closeRemoveModal: () =>
    set({ targetConnectionForRemove: null, isRemoveModalOpen: false }),

  openInviteModal: (connection) =>
    set({ targetConnectionForInvite: connection, isInviteModalOpen: true }),
  closeInviteModal: () =>
    set({ targetConnectionForInvite: null, isInviteModalOpen: false }),

  loadConnections: async (userId) => {
    set({ isLoading: true });
    try {
      const items = await mockConnectionRepo.getConnections(userId);
      set({ connectionsList: items });
    } finally {
      set({ isLoading: false });
    }
  },

  sendConnectRequest: async (data) => {
    const created = await mockConnectionRepo.sendConnectionRequest(data);
    set((state) => ({
      connectionsList: [created, ...state.connectionsList],
    }));
    get().logAnalytics('connection_sent', {
      recipientId: data.recipientId,
      intent: data.intent,
    });
    return created;
  },

  acceptConnection: async (connectionId) => {
    const updated = await mockConnectionRepo.respondToConnection(connectionId, 'accepted');
    set((state) => ({
      connectionsList: state.connectionsList.map((c) => (c.id === connectionId ? updated : c)),
    }));
    get().logAnalytics('connection_accepted', { connectionId });
    return updated;
  },

  declineConnection: async (connectionId) => {
    const updated = await mockConnectionRepo.respondToConnection(connectionId, 'declined');
    set((state) => ({
      connectionsList: state.connectionsList.filter((c) => c.id !== connectionId),
    }));
    return updated;
  },

  restrictConnection: async (connectionId) => {
    const updated = await mockConnectionRepo.respondToConnection(connectionId, 'restricted');
    set((state) => ({
      connectionsList: state.connectionsList.filter((c) => c.id !== connectionId),
    }));
    return updated;
  },

  markFriend: async (connectionId) => {
    const updated = await mockConnectionRepo.markAsFriend(connectionId);
    set((state) => ({
      connectionsList: state.connectionsList.map((c) => (c.id === connectionId ? updated : c)),
    }));
    get().logAnalytics('friendship_marked', { connectionId });
    return updated;
  },

  markActivityPartner: async (connectionId) => {
    const updated = await mockConnectionRepo.markAsActivityPartner(connectionId);
    set((state) => ({
      connectionsList: state.connectionsList.map((c) => (c.id === connectionId ? updated : c)),
    }));
    return updated;
  },

  setDatingOptIn: async (connectionId, userId, optIn) => {
    const updated = await mockConnectionRepo.setDatingOptIn(connectionId, userId, optIn);
    set((state) => ({
      connectionsList: state.connectionsList.map((c) => (c.id === connectionId ? updated : c)),
    }));
    get().logAnalytics('dating_intent_selected', { connectionId, optIn });
    return updated;
  },

  removeConnection: async (connectionId, reason) => {
    await mockConnectionRepo.removeConnection(connectionId, reason);
    set((state) => ({
      connectionsList: state.connectionsList.filter((c) => c.id !== connectionId),
    }));
    get().logAnalytics('connection_removed', { connectionId, reason });
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
