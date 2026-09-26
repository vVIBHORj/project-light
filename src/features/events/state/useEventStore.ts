import { create } from 'zustand';
import {
  Event,
  EventAttendee,
  EventRsvpState,
  DatePlanProposal,
  DatePlanPostOutcome,
  UserProfile,
} from '../../../domain/types';
import { mockEventRepo } from '../../../data/mocks';
import { CreateEventDto, EventFilters } from '../../../data/repositories';
import { storage } from '../../../lib/storage';

export interface EventState {
  // Directory & List
  events: Event[];
  isLoadingEvents: boolean;
  filters: EventFilters;

  // Selected Detail & Attendees (EVENT-03)
  selectedEvent: Event | null;
  attendees: EventAttendee[];
  isLoadingAttendees: boolean;
  myRsvpStatus: EventRsvpState | 'none';

  // Create Event Form (EVENT-02)
  isCreateModalOpen: boolean;
  createDraft: Partial<CreateEventDto>;
  isSubmittingEvent: boolean;

  // Modals & Flows (EVENT-05, EVENT-06, EVENT-07)
  isPreEventSafetyOpen: boolean;
  isPostEventRecapOpen: boolean;
  isDatePlanModalOpen: boolean;
  activeDatePlan: DatePlanProposal | null;
  datePlans: DatePlanProposal[];

  // Offline Check-In Queue (EVENT-05)
  offlineCheckInQueue: { eventId: string; userId: string; code?: string; timestamp: string }[];

  // Analytics & Logging
  analyticsEvents: { event: string; payload: Record<string, unknown>; timestamp: string }[];

  // Actions
  loadEvents: (filtersOverride?: EventFilters) => Promise<void>;
  setFilters: (filters: Partial<EventFilters>) => void;
  openEventDetail: (eventId: string, currentUserId: string) => Promise<void>;
  closeEventDetail: () => void;
  rsvpEvent: (currentUser: UserProfile) => Promise<boolean>;
  cancelRsvp: (currentUserId: string) => Promise<void>;
  openCreateModal: (initial?: Partial<CreateEventDto>) => Promise<void>;
  closeCreateModal: () => void;
  saveCreateDraft: (draft: Partial<CreateEventDto>) => Promise<void>;
  submitCreateEvent: (host: UserProfile) => Promise<Event | null>;
  cancelEventAsHost: (eventId: string, hostId: string, reason?: string) => Promise<void>;
  checkIn: (eventId: string, currentUserId: string, code?: string) => Promise<{ success: boolean; error?: string }>;
  processOfflineQueue: () => Promise<void>;
  submitFeedback: (
    eventId: string,
    currentUserId: string,
    rating: number,
    tags: string[],
    comment?: string
  ) => Promise<void>;
  loadDatePlans: (userId: string) => Promise<void>;
  openDatePlanModal: (plan?: DatePlanProposal) => void;
  closeDatePlanModal: () => void;
  proposeDatePlan: (
    proposer: UserProfile,
    recipient: { userId: string; displayName: string },
    connectionId: string,
    data: {
      venueCategory: string;
      locationZone: string;
      suggestedDate: string;
      suggestedTime: string;
      note?: string;
    }
  ) => Promise<DatePlanProposal>;
  respondToDatePlan: (
    planId: string,
    action: 'confirm' | 'cancel' | 'counter',
    counterNotes?: string
  ) => Promise<void>;
  completeDatePlan: (planId: string, outcome: DatePlanPostOutcome) => Promise<void>;
  setPreEventSafetyOpen: (open: boolean) => void;
  setPostEventRecapOpen: (open: boolean) => void;
  logAnalytics: (event: string, payload?: Record<string, unknown>) => void;
}

const DRAFT_STORAGE_KEY = 'light_event_create_draft';
const OFFLINE_QUEUE_STORAGE_KEY = 'light_event_offline_checkins';

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoadingEvents: false,
  filters: {
    zone: 'All',
    category: 'All',
    dateFilter: 'all',
    priceBand: 'All',
    verifiedHostOnly: false,
    searchQuery: '',
  },

  selectedEvent: null,
  attendees: [],
  isLoadingAttendees: false,
  myRsvpStatus: 'none',

  isCreateModalOpen: false,
  createDraft: {
    title: '',
    activityType: 'Street Photography',
    locationZone: 'Indiranagar',
    venueCategory: 'Public Street Walk',
    dateStr: 'This Saturday',
    timeStr: '8:00 AM',
    capacity: 6,
    priceBand: 'Free',
  },
  isSubmittingEvent: false,

  isPreEventSafetyOpen: false,
  isPostEventRecapOpen: false,
  isDatePlanModalOpen: false,
  activeDatePlan: null,
  datePlans: [],

  offlineCheckInQueue: [],
  analyticsEvents: [],

  loadEvents: async (filtersOverride) => {
    set({ isLoadingEvents: true });
    try {
      const activeFilters = filtersOverride || get().filters;
      const list = await mockEventRepo.getEvents(activeFilters);
      set({ events: list });
    } finally {
      set({ isLoadingEvents: false });
    }
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().loadEvents(updated);
  },

  openEventDetail: async (eventId, currentUserId) => {
    set({ isLoadingAttendees: true, selectedEvent: null });
    try {
      const ev = await mockEventRepo.getEventById(eventId);
      const attendees = await mockEventRepo.getAttendees(eventId);
      const myAttendee = attendees.find((a) => a.userId === currentUserId);

      set({
        selectedEvent: ev,
        attendees,
        myRsvpStatus: myAttendee ? myAttendee.status : 'none',
      });

      if (ev) {
        get().logAnalytics('event_viewed', {
          eventId: ev.id,
          title: ev.title,
          zone: ev.venueZone,
        });
      }
    } finally {
      set({ isLoadingAttendees: false });
    }
  },

  closeEventDetail: () => {
    set({ selectedEvent: null, attendees: [], myRsvpStatus: 'none' });
  },

  rsvpEvent: async (currentUser) => {
    const active = get().selectedEvent;
    if (!active) return false;

    try {
      const { attendee, event } = await mockEventRepo.rsvpEvent(active.id, {
        userId: currentUser.userId,
        userName: currentUser.displayName,
        userAvatar: currentUser.photos[0],
        isVerified: currentUser.isVerified,
      });

      const nextAttendees = get().attendees.filter((a) => a.userId !== currentUser.userId);
      nextAttendees.push(attendee);

      set({
        selectedEvent: event,
        attendees: nextAttendees,
        myRsvpStatus: attendee.status,
        events: get().events.map((e) => (e.id === event.id ? event : e)),
      });

      get().logAnalytics('event_rsvp_confirmed', {
        eventId: event.id,
        rsvpStatus: attendee.status,
      });

      return true;
    } catch {
      return false;
    }
  },

  cancelRsvp: async (currentUserId) => {
    const active = get().selectedEvent;
    if (!active) return;

    try {
      const { event, promotedAttendee } = await mockEventRepo.cancelRsvp(
        active.id,
        currentUserId
      );

      let nextAttendees = get().attendees.map((a) =>
        a.userId === currentUserId ? { ...a, status: 'cancelled' as EventRsvpState } : a
      );

      if (promotedAttendee) {
        nextAttendees = nextAttendees.map((a) =>
          a.userId === promotedAttendee.userId ? promotedAttendee : a
        );
      }

      set({
        selectedEvent: event,
        attendees: nextAttendees,
        myRsvpStatus: 'cancelled',
        events: get().events.map((e) => (e.id === event.id ? event : e)),
      });

      get().logAnalytics('event_rsvp_cancelled', {
        eventId: event.id,
        promotedUserId: promotedAttendee?.userId,
      });
    } catch {
      // ignore
    }
  },

  openCreateModal: async (initial) => {
    // Attempt restore from saved draft
    let initialDraft = initial || {};
    try {
      const saved = await storage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        initialDraft = { ...parsed, ...initial };
      }
    } catch {
      // ignore parse error
    }

    set({
      isCreateModalOpen: true,
      createDraft: {
        title: '',
        activityType: 'Street Photography',
        locationZone: 'Indiranagar',
        venueCategory: 'Public Street Walk',
        dateStr: 'This Saturday',
        timeStr: '8:00 AM',
        capacity: 6,
        priceBand: 'Free',
        ...initialDraft,
      },
    });
  },

  closeCreateModal: () => {
    set({ isCreateModalOpen: false });
  },

  saveCreateDraft: async (draft) => {
    const updated = { ...get().createDraft, ...draft };
    set({ createDraft: updated });
    try {
      await storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  submitCreateEvent: async (host) => {
    set({ isSubmittingEvent: true });
    try {
      const draft = get().createDraft;
      if (!draft.title || !draft.activityType || !draft.locationZone) {
        return null;
      }

      const newEvent = await mockEventRepo.createEvent({
        title: draft.title,
        description: draft.description,
        activityType: draft.activityType,
        circleId: draft.circleId,
        circleTitle: draft.circleTitle,
        communityId: draft.communityId,
        communityTitle: draft.communityTitle,
        hostId: host.userId,
        hostName: host.displayName,
        hostAvatar: host.photos[0],
        isHostVerified: host.isVerified,
        dateStr: draft.dateStr || 'Upcoming Weekend',
        timeStr: draft.timeStr || '8:00 AM',
        locationZone: draft.locationZone,
        venueCategory: draft.venueCategory || 'Public Landmark',
        exactAddress: draft.exactAddress,
        capacity: draft.capacity || 6,
        priceBand: draft.priceBand || 'Free',
        houseRules: draft.houseRules,
        safetyNotes: draft.safetyNotes,
        coverImage: draft.coverImage,
      });

      set((state) => ({
        events: [newEvent, ...state.events],
        isCreateModalOpen: false,
        createDraft: {},
      }));

      await storage.removeItem(DRAFT_STORAGE_KEY);

      get().logAnalytics('event_created', {
        eventId: newEvent.id,
        category: newEvent.activityType,
        zone: newEvent.venueZone,
      });

      return newEvent;
    } finally {
      set({ isSubmittingEvent: false });
    }
  },

  cancelEventAsHost: async (eventId, hostId, reason) => {
    const updated = await mockEventRepo.cancelEventByHost(eventId, hostId, reason);
    set((state) => ({
      selectedEvent: state.selectedEvent?.id === eventId ? updated : state.selectedEvent,
      events: state.events.map((e) => (e.id === eventId ? updated : e)),
    }));
    get().logAnalytics('event_cancelled_by_host', { eventId, reason });
  },

  checkIn: async (eventId, currentUserId, code) => {
    try {
      const res = await mockEventRepo.checkIn(eventId, currentUserId, code);
      if (res.success) {
        set((state) => ({
          myRsvpStatus: 'checked_in',
          attendees: state.attendees.map((a) =>
            a.userId === currentUserId ? { ...a, status: 'checked_in', checkedInAt: new Date().toISOString() } : a
          ),
        }));
        get().logAnalytics('event_checkin', { eventId, mode: 'online' });
        return { success: true };
      }
      return res;
    } catch {
      // Offline fallback: enqueue checkin for background sync without false failure
      const item = {
        eventId,
        userId: currentUserId,
        code,
        timestamp: new Date().toISOString(),
      };
      const nextQueue = [...get().offlineCheckInQueue, item];
      set({
        offlineCheckInQueue: nextQueue,
        myRsvpStatus: 'checked_in',
      });
      try {
        await storage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(nextQueue));
      } catch {
        // ignore
      }
      get().logAnalytics('event_checkin', { eventId, mode: 'offline_queued' });
      return { success: true };
    }
  },

  processOfflineQueue: async () => {
    const queue = get().offlineCheckInQueue;
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        await mockEventRepo.checkIn(item.eventId, item.userId, item.code);
      } catch {
        // ignore individual sync failure
      }
    }
    set({ offlineCheckInQueue: [] });
    await storage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
  },

  submitFeedback: async (eventId, currentUserId, rating, tags, comment) => {
    await mockEventRepo.submitFeedback({
      eventId,
      userId: currentUserId,
      rating,
      tags,
      comment,
      createdAt: new Date().toISOString(),
    });
    set({ isPostEventRecapOpen: false });
    get().logAnalytics('event_followup_completed', {
      eventId,
      rating,
      tagsCount: tags.length,
    });
  },

  loadDatePlans: async (userId) => {
    const list = await mockEventRepo.getDatePlans(userId);
    set({ datePlans: list });
  },

  openDatePlanModal: (plan) => {
    set({ isDatePlanModalOpen: true, activeDatePlan: plan || null });
  },

  closeDatePlanModal: () => {
    set({ isDatePlanModalOpen: false, activeDatePlan: null });
  },

  proposeDatePlan: async (proposer, recipient, connectionId, data) => {
    const newPlan = await mockEventRepo.createDatePlan({
      connectionId,
      proposerId: proposer.userId,
      proposerName: proposer.displayName,
      recipientId: recipient.userId,
      recipientName: recipient.displayName,
      venueCategory: data.venueCategory,
      locationZone: data.locationZone,
      suggestedDate: data.suggestedDate,
      suggestedTime: data.suggestedTime,
      note: data.note,
      safetyPlanEnabled: true,
    });

    set((state) => ({
      datePlans: [newPlan, ...state.datePlans],
      activeDatePlan: newPlan,
    }));

    get().logAnalytics('date_plan_proposed', {
      connectionId,
      venueCategory: data.venueCategory,
    });

    return newPlan;
  },

  respondToDatePlan: async (planId, action, counterNotes) => {
    const updated = await mockEventRepo.respondToDatePlan(planId, action, counterNotes);
    set((state) => ({
      datePlans: state.datePlans.map((p) => (p.id === planId ? updated : p)),
      activeDatePlan: updated,
    }));
    if (action === 'confirm') {
      get().logAnalytics('date_plan_confirmed', { planId });
    }
  },

  completeDatePlan: async (planId, outcome) => {
    const updated = await mockEventRepo.completeDatePlan(planId, outcome);
    set((state) => ({
      datePlans: state.datePlans.map((p) => (p.id === planId ? updated : p)),
      activeDatePlan: updated,
    }));
    get().logAnalytics('date_plan_completed', { planId, outcome });
  },

  setPreEventSafetyOpen: (open) => set({ isPreEventSafetyOpen: open }),
  setPostEventRecapOpen: (open) => set({ isPostEventRecapOpen: open }),

  logAnalytics: (event, payload = {}) => {
    set((state) => ({
      analyticsEvents: [
        ...state.analyticsEvents,
        { event, payload, timestamp: new Date().toISOString() },
      ],
    }));
  },
}));
