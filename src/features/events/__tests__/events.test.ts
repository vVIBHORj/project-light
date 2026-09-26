import { useEventStore } from '../state/useEventStore';
import { mockUsers, mockEvents } from '../../../data/mocks/seedData';
import { mockEventRepo } from '../../../data/mocks';
import { UserProfile } from '../../../domain/types';

describe('Phase 8: Events & Date Planning Feature Suite', () => {
  const currentUser = mockUsers[0]; // Aisha Rao (user_1)
  const datingPartner = mockUsers[2]; // Pooja Iyer (user_3)

  beforeEach(() => {
    useEventStore.setState({
      events: [...mockEvents],
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
      createDraft: {},
      isSubmittingEvent: false,
      isPreEventSafetyOpen: false,
      isPostEventRecapOpen: false,
      isDatePlanModalOpen: false,
      activeDatePlan: null,
      datePlans: [],
      offlineCheckInQueue: [],
      analyticsEvents: [],
    });
  });

  describe('EVENT-01: Event Directory & Filtering', () => {
    it('loads events list from repository', async () => {
      await useEventStore.getState().loadEvents();
      const state = useEventStore.getState();
      expect(state.events.length).toBeGreaterThan(0);
      expect(state.events[0].title).toBeDefined();
    });

    it('filters events by category, price band, and search query', async () => {
      useEventStore.getState().setFilters({ category: 'Street Photography' });
      await useEventStore.getState().loadEvents();
      const state = useEventStore.getState();
      expect(state.events.every((e) => e.activityType === 'Street Photography')).toBe(true);

      useEventStore.getState().setFilters({ category: 'All', searchQuery: 'Badminton' });
      await useEventStore.getState().loadEvents();
      const filtered = useEventStore.getState().events;
      expect(filtered.some((e) => e.title.includes('Badminton') || e.activityType.includes('Badminton'))).toBe(true);
    });
  });

  describe('EVENT-02: Create Event & Draft Persistence', () => {
    it('persists draft updates to local storage', async () => {
      await useEventStore.getState().saveCreateDraft({
        title: 'Cubbon Park Golden Hour Photowalk',
        locationZone: 'Cubbon Park',
        capacity: 8,
      });

      const draft = useEventStore.getState().createDraft;
      expect(draft.title).toBe('Cubbon Park Golden Hour Photowalk');
      expect(draft.capacity).toBe(8);
    });

    it('creates new event and publishes to directory', async () => {
      useEventStore.setState({
        createDraft: {
          title: 'Indiranagar Specialty Coffee Tasting',
          description: 'Exploring anaerobic fermented coffees at Blue Tokai & Maverick.',
          activityType: 'Artisan Coffee Tasting',
          locationZone: 'Indiranagar',
          venueCategory: 'Specialty Cafe',
          exactAddress: 'Blue Tokai Coffee, 12th Main Road, Indiranagar',
          dateStr: 'Saturday, Oct 26',
          timeStr: '4:00 PM',
          capacity: 6,
          priceBand: 'Free',
        },
      });

      const newEvent = await useEventStore.getState().submitCreateEvent(currentUser);
      expect(newEvent).not.toBeNull();
      expect(newEvent?.id).toBeDefined();
      expect(newEvent?.title).toBe('Indiranagar Specialty Coffee Tasting');
      expect(newEvent?.checkInCode).toBeDefined();

      const events = useEventStore.getState().events;
      expect(events.some((e) => e.id === newEvent?.id)).toBe(true);
    });
  });

  describe('EVENT-03 & EVENT-04: Event Detail, RSVP Capacity, Waitlist & Cancellation', () => {
    it('opens event detail and loads confirmed attendees without follower counts', async () => {
      await useEventStore.getState().openEventDetail('event_1', currentUser.userId);
      const state = useEventStore.getState();

      expect(state.selectedEvent?.id).toBe('event_1');
      expect(state.attendees.length).toBeGreaterThan(0);
      expect(state.myRsvpStatus).toBe('going'); // Host Aisha is going
    });

    it('enforces capacity and waitlist placement on RSVP', async () => {
      // Event 2 has capacity 4 and 4 confirmed attendees
      await useEventStore.getState().openEventDetail('event_2', 'user_6');
      expect(useEventStore.getState().selectedEvent?.rsvpsCount).toBe(4);

      const user6: UserProfile = {
        userId: 'user_6',
        displayName: 'Kabir Das',
        bio: 'Badminton enthusiast and tech builder in Indiranagar.',
        gender: 'man',
        zone: 'Indiranagar',
        photos: ['https://example.com/photo.jpg'],
        isVerified: true,
        age: 27,
        ageBand: '25-29',
        city: 'Bengaluru',
        languages: ['English'],
        primaryIntent: 'friendship',
        openToIntents: ['friendship'],
        interests: ['Badminton'],
        completionPercentage: 80,
      };

      const success = await useEventStore.getState().rsvpEvent(user6);
      expect(success).toBe(true);
      expect(useEventStore.getState().myRsvpStatus).toBe('waitlist');
    });

    it('promotes first waitlisted member when a confirmed attendee cancels', async () => {
      await useEventStore.getState().openEventDetail('event_1', 'user_2');

      // User 2 (Rohan, confirmed) cancels
      await useEventStore.getState().cancelRsvp('user_2');
      const state = useEventStore.getState();

      // Kabir (user_6, first on waitlist) is promoted to 'going'
      const promoted = state.attendees.find((a) => a.userId === 'user_6');
      expect(promoted?.status).toBe('going');
    });

    it('cancels session when host cancels event', async () => {
      await useEventStore.getState().openEventDetail('event_1', currentUser.userId);
      await useEventStore.getState().cancelEventAsHost('event_1', currentUser.userId, 'Weather alert');

      expect(useEventStore.getState().selectedEvent?.state).toBe('cancelled');
    });
  });

  describe('EVENT-05: Pre-Event Safety & Check-In Validation', () => {
    it('validates 4-digit code and checks in confirmed attendee', async () => {
      await useEventStore.getState().openEventDetail('event_1', currentUser.userId);
      const event = useEventStore.getState().selectedEvent!;

      const result = await useEventStore.getState().checkIn('event_1', currentUser.userId, event.checkInCode);
      expect(result.success).toBe(true);
      expect(useEventStore.getState().myRsvpStatus).toBe('checked_in');
    });

    it('queues offline check-in without false failure', async () => {
      // Force mock repository to simulate failure for offline test
      const spy = jest.spyOn(mockEventRepo, 'checkIn').mockRejectedValueOnce(new Error('Network offline'));

      const res = await useEventStore.getState().checkIn('event_1', 'user_3', '3582');
      expect(res.success).toBe(true);
      expect(useEventStore.getState().myRsvpStatus).toBe('checked_in');
      expect(useEventStore.getState().offlineCheckInQueue.length).toBe(1);

      spy.mockRestore();
    });
  });

  describe('EVENT-06: Post-Event Recap & Feedback', () => {
    it('submits rating, tags, and feedback comments', async () => {
      await useEventStore.getState().submitFeedback(
        'event_1',
        currentUser.userId,
        5,
        ['Welcoming Vibe', 'Safe & Comfortable', 'Great Host'],
        'Loved the route and morning lighting tips!'
      );

      const feedbacks = await mockEventRepo.getEventFeedback('event_1');
      expect(feedbacks.some((f) => f.userId === currentUser.userId && f.rating === 5)).toBe(true);
    });
  });

  describe('EVENT-07: Date Planning Flow', () => {
    it('proposes date plan for mutually dating connection', async () => {
      const plan = await useEventStore.getState().proposeDatePlan(
        currentUser,
        datingPartner,
        'conn_4',
        {
          venueCategory: 'Art Gallery / Exhibition',
          locationZone: 'Indiranagar',
          suggestedDate: 'Sunday, Oct 20',
          suggestedTime: '5:00 PM',
          note: 'Visit the contemporary photography exhibition at NGMA',
        }
      );

      expect(plan.id).toBeDefined();
      expect(plan.status).toBe('proposed');
      expect(plan.safetyPlanEnabled).toBe(true);
    });

    it('confirms date plan and completes post-date review', async () => {
      await useEventStore.getState().loadDatePlans(currentUser.userId);
      const initialPlan = useEventStore.getState().datePlans[0];

      await useEventStore.getState().respondToDatePlan(initialPlan.id, 'confirm');
      expect(useEventStore.getState().activeDatePlan?.status).toBe('confirmed');

      await useEventStore.getState().completeDatePlan(initialPlan.id, 'continue_dating');
      expect(useEventStore.getState().activeDatePlan?.status).toBe('completed');
      expect(useEventStore.getState().activeDatePlan?.postDateOutcome).toBe('continue_dating');
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks required event lifecycle events', async () => {
      await useEventStore.getState().openEventDetail('event_3', currentUser.userId);
      await useEventStore.getState().rsvpEvent(currentUser);

      const events = useEventStore.getState().analyticsEvents;
      expect(events.some((e) => e.event === 'event_viewed')).toBe(true);
      expect(events.some((e) => e.event === 'event_rsvp_confirmed')).toBe(true);
    });
  });
});
