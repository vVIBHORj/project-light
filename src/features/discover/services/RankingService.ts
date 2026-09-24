import { UserProfile, Circle, Event, RelationshipIntent } from '../../../domain/types';

export interface CandidateUser {
  profile: UserProfile;
  sharedInterests: string[];
  sharedCircles: string[];
  availabilityOverlap: boolean;
  groupSizeFit: boolean;
  distanceBand: string;
  hasSharedContext: boolean;
  sharedContextDescription?: string;
  relevanceScore: number;
}

export interface CandidateCircle {
  circle: Circle;
  sharedInterests: string[];
  distanceBand: string;
  relevanceScore: number;
  spotsLeft: number;
}

export interface CandidateEvent {
  event: Event;
  distanceBand: string;
  spotsLeft: number;
  relevanceScore: number;
}

export interface DiscoveryFilterOptions {
  searchQuery?: string;
  intent?: RelationshipIntent | 'all';
  ageBand?: string;
  zone?: string;
  radiusBand?: 'Within 2 km' | '2 to 5 km' | '5 to 10 km' | 'All';
  dayTime?: string;
  groupSize?: string;
  priceBand?: 'Free' | 'Under ₹500' | 'All';
  verifiedOnly?: boolean;
}

export interface RecommendationFeedbackPayload {
  targetId: string;
  targetType: 'user' | 'circle' | 'event';
  reason: 'not_my_interest' | 'wrong_time' | 'too_far' | 'not_comfortable' | 'other';
  note?: string;
  timestamp: string;
}

export interface RankingService {
  rankProfiles(
    currentUser: UserProfile,
    allProfiles: UserProfile[],
    blockedUserIds: string[],
    filters?: DiscoveryFilterOptions
  ): CandidateUser[];

  rankCircles(
    currentUser: UserProfile,
    allCircles: Circle[],
    filters?: DiscoveryFilterOptions
  ): CandidateCircle[];

  rankEvents(
    currentUser: UserProfile,
    allEvents: Event[],
    filters?: DiscoveryFilterOptions
  ): CandidateEvent[];
}

export class StubRankingService implements RankingService {
  /**
   * Hard filters applied before ranking:
   * 1. Under 18 excluded.
   * 2. Blocked users excluded.
   * 3. Profiles without photos excluded from person discovery.
   * 4. Intent mismatch: if currentUser has an explicit intent (e.g. 'dating'), candidates must have compatible openToIntents.
   * 5. Current user excluded from their own results.
   */
  rankProfiles(
    currentUser: UserProfile,
    allProfiles: UserProfile[],
    blockedUserIds: string[],
    filters?: DiscoveryFilterOptions
  ): CandidateUser[] {
    const blockedSet = new Set(blockedUserIds);

    const eligible = allProfiles.filter((candidate) => {
      // Exclude self
      if (candidate.userId === currentUser.userId) return false;

      // Hard filter: Blocked users
      if (blockedSet.has(candidate.userId)) return false;

      // Hard filter: Age < 18
      if (candidate.age < 18) return false;

      // Hard filter: Profiles without a photo are excluded from person discovery
      if (!candidate.photos || candidate.photos.length === 0 || !candidate.photos[0]) {
        return false;
      }

      // Hard filter: Intent compatibility
      if (filters?.intent && filters.intent !== 'all') {
        const candidateIntents = [candidate.primaryIntent, ...(candidate.openToIntents || [])];
        if (!candidateIntents.includes(filters.intent)) return false;
      } else {
        // Default intent check between current user and candidate
        const currentUserIntents = [currentUser.primaryIntent, ...(currentUser.openToIntents || [])];
        const candidateIntents = [candidate.primaryIntent, ...(candidate.openToIntents || [])];
        const hasIntentOverlap = currentUserIntents.some((i) => candidateIntents.includes(i));
        if (!hasIntentOverlap) return false;
      }

      // Filter: Verified only
      if (filters?.verifiedOnly && !candidate.isVerified) return false;

      // Filter: Zone
      if (filters?.zone && filters.zone !== 'All' && candidate.zone !== filters.zone) {
        return false;
      }

      // Filter: Radius band
      if (filters?.radiusBand && filters.radiusBand !== 'All' && candidate.distanceBand !== filters.radiusBand) {
        return false;
      }

      // Filter: Age band
      if (filters?.ageBand && filters.ageBand !== 'All' && candidate.ageBand !== filters.ageBand) {
        return false;
      }

      // Filter: Search query (Name, Interests, Zone, Bio)
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = candidate.displayName.toLowerCase().includes(q);
        const matchesZone = candidate.zone.toLowerCase().includes(q);
        const matchesInterests = candidate.interests.some((i) => i.toLowerCase().includes(q));
        const matchesBio = candidate.bio.toLowerCase().includes(q);
        if (!matchesName && !matchesZone && !matchesInterests && !matchesBio) {
          return false;
        }
      }

      return true;
    });

    // Score candidates by interest overlap
    const scored: CandidateUser[] = eligible.map((candidate) => {
      const userInterests = new Set(currentUser.interests || []);
      const sharedInterests = candidate.interests.filter((int) => userInterests.has(int));

      // Mock shared circle context
      const sharedCircles: string[] = [];
      let hasSharedContext = false;
      let sharedContextDescription: string | undefined;

      if (candidate.userId === 'user_3') {
        sharedCircles.push('Indiranagar 35mm Film Walk');
        hasSharedContext = true;
        sharedContextDescription = 'Both in Sunday Photography Circle';
      } else if (sharedInterests.length > 0) {
        hasSharedContext = true;
        sharedContextDescription = `Shares ${sharedInterests[0]} & ${candidate.zone} zone`;
      }

      const relevanceScore = sharedInterests.length * 10 + (candidate.zone === currentUser.zone ? 5 : 0) + (candidate.isVerified ? 2 : 0);

      return {
        profile: candidate,
        sharedInterests,
        sharedCircles,
        availabilityOverlap: true,
        groupSizeFit: true,
        distanceBand: candidate.distanceBand || '2 to 5 km',
        hasSharedContext,
        sharedContextDescription,
        relevanceScore,
      };
    });

    // Graceful expansion if strict filters yield no results and query wasn't matching
    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  rankCircles(
    currentUser: UserProfile,
    allCircles: Circle[],
    filters?: DiscoveryFilterOptions
  ): CandidateCircle[] {
    const eligible = allCircles.filter((circle) => {
      if (filters?.zone && filters.zone !== 'All' && !circle.locationZone.includes(filters.zone)) {
        return false;
      }
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = circle.title.toLowerCase().includes(q);
        const matchesCategory = circle.category.toLowerCase().includes(q);
        const matchesActivity = circle.activityName.toLowerCase().includes(q);
        const matchesZone = circle.locationZone.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesActivity && !matchesZone) {
          return false;
        }
      }
      return true;
    });

    const scored: CandidateCircle[] = eligible.map((circle) => {
      const sharedInterests = (currentUser.interests || []).filter(
        (int) =>
          circle.title.toLowerCase().includes(int.toLowerCase()) ||
          circle.category.toLowerCase().includes(int.toLowerCase()) ||
          circle.activityName.toLowerCase().includes(int.toLowerCase())
      );

      const spotsLeft = Math.max(0, circle.capacity - circle.currentMemberCount);
      const isLocal = circle.locationZone.toLowerCase().includes(currentUser.zone.toLowerCase());
      const distanceBand = isLocal ? 'Within 2 km' : '2 to 5 km';
      const relevanceScore = (sharedInterests.length > 0 ? 15 : 5) + (spotsLeft > 0 ? 5 : 0) + (isLocal ? 10 : 0);

      return {
        circle,
        sharedInterests: sharedInterests.length > 0 ? sharedInterests : [circle.category],
        distanceBand,
        relevanceScore,
        spotsLeft,
      };
    });

    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  rankEvents(
    currentUser: UserProfile,
    allEvents: Event[],
    filters?: DiscoveryFilterOptions
  ): CandidateEvent[] {
    const eligible = allEvents.filter((ev) => {
      if (filters?.zone && filters.zone !== 'All' && !ev.venueZone.includes(filters.zone)) {
        return false;
      }
      if (filters?.priceBand && filters.priceBand !== 'All') {
        if (filters.priceBand === 'Free' && !ev.priceBand.toLowerCase().includes('free')) {
          return false;
        }
      }
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesType = ev.activityType.toLowerCase().includes(q);
        const matchesVenue = ev.venueZone.toLowerCase().includes(q);
        if (!matchesTitle && !matchesType && !matchesVenue) {
          return false;
        }
      }
      return true;
    });

    const scored: CandidateEvent[] = eligible.map((ev) => {
      const isLocal = ev.venueZone.toLowerCase().includes(currentUser.zone.toLowerCase());
      const distanceBand = isLocal ? 'Within 2 km' : '2 to 5 km';
      const spotsLeft = Math.max(0, ev.capacity - ev.rsvpsCount);
      const relevanceScore = (spotsLeft > 0 ? 10 : 2) + (isLocal ? 10 : 0);

      return {
        event: ev,
        distanceBand,
        spotsLeft,
        relevanceScore,
      };
    });

    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const rankingService = new StubRankingService();
