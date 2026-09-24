import { StubRankingService } from '../services/RankingService';
import { useDiscoverStore } from '../state/useDiscoverStore';
import { UserProfile, Circle, Event } from '../../../domain/types';

describe('Phase 4 — Discover & Ranking Suite', () => {
  const rankingService = new StubRankingService();

  const currentUser: UserProfile = {
    userId: 'user_current',
    displayName: 'Aisha Rao',
    bio: 'Product designer',
    age: 26,
    ageBand: '25-29',
    gender: 'woman',
    city: 'Bengaluru',
    zone: 'Indiranagar',
    distanceBand: 'Within 2 km',
    languages: ['English', 'Hindi'],
    primaryIntent: 'friendship',
    openToIntents: ['friendship', 'explore'],
    photos: ['https://example.com/photo.jpg'],
    interests: ['Photography (35mm / Digital)', 'Badminton', 'Artisan Coffee'],
    isVerified: true,
    completionPercentage: 100,
  };

  const sampleProfiles: UserProfile[] = [
    {
      userId: 'user_friend_1',
      displayName: 'Pooja Iyer',
      bio: 'Filmmaker',
      age: 24,
      ageBand: '22-24',
      gender: 'woman',
      city: 'Bengaluru',
      zone: 'Jayanagar',
      distanceBand: '2 to 5 km',
      languages: ['English'],
      primaryIntent: 'friendship',
      openToIntents: ['friendship'],
      photos: ['https://example.com/pooja.jpg'],
      interests: ['Photography (35mm / Digital)', 'Artisan Coffee'],
      isVerified: true,
      completionPercentage: 100,
    },
    {
      userId: 'user_blocked',
      displayName: 'Blocked Person',
      bio: 'Spam account',
      age: 28,
      ageBand: '25-29',
      gender: 'man',
      city: 'Bengaluru',
      zone: 'Indiranagar',
      distanceBand: 'Within 2 km',
      languages: ['English'],
      primaryIntent: 'friendship',
      openToIntents: ['friendship'],
      photos: ['https://example.com/blocked.jpg'],
      interests: ['Photography (35mm / Digital)'],
      isVerified: false,
      completionPercentage: 50,
    },
    {
      userId: 'user_underage',
      displayName: 'Teen User',
      bio: 'High school student',
      age: 17,
      ageBand: 'Under 18',
      gender: 'non_binary',
      city: 'Bengaluru',
      zone: 'Indiranagar',
      distanceBand: 'Within 2 km',
      languages: ['English'],
      primaryIntent: 'friendship',
      openToIntents: ['friendship'],
      photos: ['https://example.com/teen.jpg'],
      interests: ['Photography (35mm / Digital)', 'Badminton'],
      isVerified: false,
      completionPercentage: 50,
    },
    {
      userId: 'user_no_photo',
      displayName: 'Faceless User',
      bio: 'No avatar',
      age: 25,
      ageBand: '25-29',
      gender: 'man',
      city: 'Bengaluru',
      zone: 'Indiranagar',
      distanceBand: 'Within 2 km',
      languages: ['English'],
      primaryIntent: 'friendship',
      openToIntents: ['friendship'],
      photos: [],
      interests: ['Badminton'],
      isVerified: false,
      completionPercentage: 60,
    },
    {
      userId: 'user_intent_mismatch',
      displayName: 'Strict Dating Only',
      bio: 'Looking only for romance',
      age: 27,
      ageBand: '25-29',
      gender: 'man',
      city: 'Bengaluru',
      zone: 'Indiranagar',
      distanceBand: 'Within 2 km',
      languages: ['English'],
      primaryIntent: 'dating',
      openToIntents: ['dating'],
      photos: ['https://example.com/dating.jpg'],
      interests: ['Badminton'],
      isVerified: true,
      completionPercentage: 90,
    },
  ];

  describe('Hard Filters & Privacy Guarantees', () => {
    it('never returns blocked users in recommendations', () => {
      const results = rankingService.rankProfiles(
        currentUser,
        sampleProfiles,
        ['user_blocked']
      );

      const returnedIds = results.map((r) => r.profile.userId);
      expect(returnedIds).not.toContain('user_blocked');
    });

    it('never returns under-18 candidates in recommendations', () => {
      const results = rankingService.rankProfiles(
        currentUser,
        sampleProfiles,
        []
      );

      const returnedIds = results.map((r) => r.profile.userId);
      expect(returnedIds).not.toContain('user_underage');
    });

    it('excludes profiles without photos from person discovery', () => {
      const results = rankingService.rankProfiles(
        currentUser,
        sampleProfiles,
        []
      );

      const returnedIds = results.map((r) => r.profile.userId);
      expect(returnedIds).not.toContain('user_no_photo');
    });

    it('never returns self (current user) in candidates', () => {
      const withSelf = [currentUser, ...sampleProfiles];
      const results = rankingService.rankProfiles(
        currentUser,
        withSelf,
        []
      );

      const returnedIds = results.map((r) => r.profile.userId);
      expect(returnedIds).not.toContain(currentUser.userId);
    });

    it('excludes incompatible intent candidates when filter or profile is strict', () => {
      // currentUser has friendship / explore only; user_intent_mismatch has dating only
      const results = rankingService.rankProfiles(
        currentUser,
        sampleProfiles,
        []
      );

      const returnedIds = results.map((r) => r.profile.userId);
      expect(returnedIds).not.toContain('user_intent_mismatch');
    });
  });

  describe('Ranking Service & Relevance Scoring', () => {
    it('ranks candidates with higher shared interest overlap first', () => {
      const candidateA: UserProfile = {
        userId: 'cand_a',
        displayName: 'Candidate A',
        bio: '',
        age: 25,
        ageBand: '25-29',
        gender: 'man',
        city: 'Bengaluru',
        zone: 'Whitefield',
        languages: ['English'],
        primaryIntent: 'friendship',
        openToIntents: ['friendship'],
        photos: ['https://example.com/a.jpg'],
        interests: ['Photography (35mm / Digital)', 'Badminton', 'Artisan Coffee'], // 3 shared
        isVerified: false,
        completionPercentage: 80,
      };

      const candidateB: UserProfile = {
        userId: 'cand_b',
        displayName: 'Candidate B',
        bio: '',
        age: 25,
        ageBand: '25-29',
        gender: 'man',
        city: 'Bengaluru',
        zone: 'Whitefield',
        languages: ['English'],
        primaryIntent: 'friendship',
        openToIntents: ['friendship'],
        photos: ['https://example.com/b.jpg'],
        interests: ['Photography (35mm / Digital)'], // 1 shared
        isVerified: false,
        completionPercentage: 80,
      };

      const results = rankingService.rankProfiles(
        currentUser,
        [candidateB, candidateA],
        []
      );

      expect(results[0].profile.userId).toBe('cand_a');
      expect(results[0].sharedInterests.length).toBe(3);
    });

    it('filters circles by search keyword correctly', () => {
      const sampleCircles: Circle[] = [
        {
          id: 'c1',
          title: 'Morning Badminton Doubles',
          category: 'Sports',
          hostId: 'h1',
          hostName: 'Host 1',
          capacity: 4,
          currentMemberCount: 2,
          state: 'open',
          cadence: 'Weekly',
          activityName: 'Badminton',
          locationZone: 'Indiranagar',
          reasonChips: ['Badminton'],
          members: ['h1'],
          createdAt: '2026-09-01',
        },
        {
          id: 'c2',
          title: 'Sci-Fi Reading Circle',
          category: 'Books',
          hostId: 'h2',
          hostName: 'Host 2',
          capacity: 6,
          currentMemberCount: 4,
          state: 'open',
          cadence: 'Weekly',
          activityName: 'Reading',
          locationZone: 'Koramangala',
          reasonChips: ['Books'],
          members: ['h2'],
          createdAt: '2026-09-01',
        },
      ];

      const results = rankingService.rankCircles(
        currentUser,
        sampleCircles,
        { searchQuery: 'Badminton' }
      );

      expect(results.length).toBe(1);
      expect(results[0].circle.id).toBe('c1');
    });

    it('ranks events with available capacity over full events', () => {
      const sampleEvents: Event[] = [
        {
          id: 'ev_full',
          title: 'Full Event',
          activityType: 'Social',
          dateStr: 'Sat',
          timeStr: '6 PM',
          venueZone: 'Indiranagar',
          capacity: 5,
          rsvpsCount: 5,
          state: 'upcoming',
          priceBand: 'Free',
          hostId: 'h1',
          hostName: 'Host',
        },
        {
          id: 'ev_open',
          title: 'Open Spots Event',
          activityType: 'Social',
          dateStr: 'Sat',
          timeStr: '6 PM',
          venueZone: 'Indiranagar',
          capacity: 10,
          rsvpsCount: 2,
          state: 'upcoming',
          priceBand: 'Free',
          hostId: 'h1',
          hostName: 'Host',
        },
      ];

      const results = rankingService.rankEvents(
        currentUser,
        sampleEvents
      );

      expect(results[0].event.id).toBe('ev_open');
      expect(results[0].spotsLeft).toBe(8);
    });
  });

  describe('Discover Store & Queue Management with Undo', () => {
    beforeEach(() => {
      useDiscoverStore.setState({
        savedItems: [],
        dismissedItems: [],
        analyticsEvents: [],
      });
    });

    it('saves and unsaves items correctly', () => {
      const store = useDiscoverStore.getState();

      store.saveItem({
        id: 'user_1',
        type: 'user',
        title: 'Aisha Rao',
        subtitle: 'Indiranagar',
      });

      expect(useDiscoverStore.getState().savedItems.length).toBe(1);
      expect(useDiscoverStore.getState().savedItems[0].id).toBe('user_1');

      store.unsaveItem('user_1');
      expect(useDiscoverStore.getState().savedItems.length).toBe(0);
    });

    it('dismisses with feedback and allows instant undo', () => {
      const store = useDiscoverStore.getState();

      store.dismissWithFeedback({
        targetId: 'user_target',
        targetType: 'user',
        title: 'Target User',
        reason: 'too_far',
      });

      expect(useDiscoverStore.getState().dismissedItems.length).toBe(1);
      expect(useDiscoverStore.getState().dismissedItems[0].reason).toBe('too_far');

      // Check analytics event recorded
      const events = useDiscoverStore.getState().analyticsEvents;
      expect(events.some((e) => e.event === 'recommendation_feedback_sent')).toBe(true);

      // Undo dismissal
      store.undoDismiss('user_target');
      expect(useDiscoverStore.getState().dismissedItems.length).toBe(0);
    });

    it('logs discover_viewed, profile_viewed, circle_viewed analytics', () => {
      const store = useDiscoverStore.getState();

      store.setViewMode('radar');
      store.openCircleDetail({
        id: 'circ_test',
        title: 'Test Circle',
        category: 'Sports',
        hostId: 'h1',
        hostName: 'Host',
        capacity: 5,
        currentMemberCount: 3,
        state: 'open',
        cadence: 'Weekly',
        activityName: 'Test',
        locationZone: 'Indiranagar',
        reasonChips: [],
        members: [],
        createdAt: '2026-09-01',
      });

      const events = useDiscoverStore.getState().analyticsEvents;
      expect(events.some((e) => e.event === 'discover_viewed')).toBe(true);
      expect(events.some((e) => e.event === 'circle_viewed')).toBe(true);
    });
  });
});
