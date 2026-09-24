import { create } from 'zustand';
import {
  CandidateUser,
  CandidateCircle,
  DiscoveryFilterOptions,
  RecommendationFeedbackPayload,
} from '../services/RankingService';
import { Circle } from '../../../domain/types';

export interface SavedItem {
  id: string;
  type: 'user' | 'circle' | 'event';
  title: string;
  subtitle: string;
  photoUri?: string;
  savedAt: number;
}

export interface DismissedFeedback {
  id: string;
  targetId: string;
  targetType: 'user' | 'circle' | 'event';
  title: string;
  reason: 'not_my_interest' | 'wrong_time' | 'too_far' | 'not_comfortable' | 'other';
  dismissedAt: number;
}

interface DiscoverState {
  // Navigation & View Mode
  viewMode: 'list' | 'radar';
  activeFilterTab: 'all' | 'circles' | 'people' | 'activities';
  setViewMode: (mode: 'list' | 'radar') => void;
  setActiveFilterTab: (tab: 'all' | 'circles' | 'people' | 'activities') => void;

  // Search & Filters
  searchQuery: string;
  filters: DiscoveryFilterOptions;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<DiscoveryFilterOptions>) => void;
  clearFilters: () => void;

  // Saved & Feedback Queues (with Undo)
  savedItems: SavedItem[];
  dismissedItems: DismissedFeedback[];
  saveItem: (item: Omit<SavedItem, 'savedAt'>) => void;
  unsaveItem: (id: string) => void;
  dismissWithFeedback: (feedback: Omit<DismissedFeedback, 'id' | 'dismissedAt'>) => void;
  undoDismiss: (targetId: string) => void;

  // Selected Entity for Sheets & Explanation
  selectedExplanationUser: CandidateUser | null;
  selectedExplanationCircle: CandidateCircle | null;
  selectedCircleDetail: Circle | null;
  selectedCandidateForFeedback: { id: string; name: string; type: 'user' | 'circle' | 'event' } | null;

  // Sheet Controls
  isFilterSheetOpen: boolean;
  isExplanationSheetOpen: boolean;
  isCircleDetailSheetOpen: boolean;
  isFeedbackSheetOpen: boolean;
  isQueueSheetOpen: boolean;

  openExplanation: (user?: CandidateUser, circle?: CandidateCircle) => void;
  closeExplanation: () => void;
  openCircleDetail: (circle: Circle) => void;
  closeCircleDetail: () => void;
  openFeedbackSheet: (target: { id: string; name: string; type: 'user' | 'circle' | 'event' }) => void;
  closeFeedbackSheet: () => void;
  setFilterSheetOpen: (open: boolean) => void;
  setQueueSheetOpen: (open: boolean) => void;

  // Analytics Logs
  analyticsEvents: { event: string; payload: Record<string, unknown>; timestamp: string }[];
  logAnalytics: (event: string, payload?: Record<string, unknown>) => void;
}

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  viewMode: 'list',
  activeFilterTab: 'all',
  setViewMode: (mode) => {
    set({ viewMode: mode });
    get().logAnalytics('discover_viewed', { viewMode: mode });
  },
  setActiveFilterTab: (tab) => {
    set({ activeFilterTab: tab });
    get().logAnalytics('discover_viewed', { filterTab: tab, viewMode: get().viewMode });
  },

  searchQuery: '',
  filters: {
    intent: 'all',
    radiusBand: 'All',
    zone: 'All',
    priceBand: 'All',
    verifiedOnly: false,
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  clearFilters: () =>
    set({
      searchQuery: '',
      filters: {
        intent: 'all',
        radiusBand: 'All',
        zone: 'All',
        priceBand: 'All',
        verifiedOnly: false,
      },
    }),

  savedItems: [],
  dismissedItems: [],

  saveItem: (item) => {
    set((state) => {
      if (state.savedItems.some((s) => s.id === item.id)) return state;
      return {
        savedItems: [{ ...item, savedAt: Date.now() }, ...state.savedItems],
      };
    });
  },

  unsaveItem: (id) => {
    set((state) => ({
      savedItems: state.savedItems.filter((s) => s.id !== id),
    }));
  },

  dismissWithFeedback: (feedback) => {
    const newEntry: DismissedFeedback = {
      ...feedback,
      id: `fb_${Date.now()}`,
      dismissedAt: Date.now(),
    };
    set((state) => ({
      dismissedItems: [newEntry, ...state.dismissedItems],
    }));

    const payload: RecommendationFeedbackPayload = {
      targetId: feedback.targetId,
      targetType: feedback.targetType,
      reason: feedback.reason,
      timestamp: new Date().toISOString(),
    };
    get().logAnalytics('recommendation_feedback_sent', payload as unknown as Record<string, unknown>);
  },

  undoDismiss: (targetId) => {
    set((state) => ({
      dismissedItems: state.dismissedItems.filter((d) => d.targetId !== targetId),
    }));
  },

  selectedExplanationUser: null,
  selectedExplanationCircle: null,
  selectedCircleDetail: null,
  selectedCandidateForFeedback: null,

  isFilterSheetOpen: false,
  isExplanationSheetOpen: false,
  isCircleDetailSheetOpen: false,
  isFeedbackSheetOpen: false,
  isQueueSheetOpen: false,

  openExplanation: (user, circle) => {
    set({
      selectedExplanationUser: user || null,
      selectedExplanationCircle: circle || null,
      isExplanationSheetOpen: true,
    });
  },
  closeExplanation: () => {
    set({
      selectedExplanationUser: null,
      selectedExplanationCircle: null,
      isExplanationSheetOpen: false,
    });
  },

  openCircleDetail: (circle) => {
    set({
      selectedCircleDetail: circle,
      isCircleDetailSheetOpen: true,
    });
    get().logAnalytics('circle_viewed', { circleId: circle.id, circleTitle: circle.title });
  },
  closeCircleDetail: () => {
    set({
      selectedCircleDetail: null,
      isCircleDetailSheetOpen: false,
    });
  },

  openFeedbackSheet: (target) => {
    set({
      selectedCandidateForFeedback: target,
      isFeedbackSheetOpen: true,
    });
  },
  closeFeedbackSheet: () => {
    set({
      selectedCandidateForFeedback: null,
      isFeedbackSheetOpen: false,
    });
  },

  setFilterSheetOpen: (open) => set({ isFilterSheetOpen: open }),
  setQueueSheetOpen: (open) => set({ isQueueSheetOpen: open }),

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
