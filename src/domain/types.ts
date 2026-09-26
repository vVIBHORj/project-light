export type UserStatus = 'active' | 'paused' | 'restricted' | 'deletion_requested' | 'deleted';
export type RiskTier = 'standard' | 'low' | 'elevated' | 'restricted';

export type RelationshipIntent = 'friendship' | 'dating' | 'community' | 'explore';
export type Gender = 'woman' | 'man' | 'non_binary' | 'prefer_not_to_say';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  status: UserStatus;
  riskTier: RiskTier;
  createdAt: string;
  lastActiveAt: string;
  activated?: boolean; // True once minimum profile + first high-intent social action completed
}

export interface UserSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'ios' | 'android' | 'web';
  cityLocation: string; // e.g. "Bengaluru, Indiranagar" (never exact GPS)
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface BootstrapConfig {
  maintenance: boolean;
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  legalVersion: string;
}

export interface AuthChallenge {
  challengeId: string;
  identifier: string;
  method: 'phone' | 'email';
  expiresAt: number; // timestamp
  attemptsLeft: number;
  isExistingAccount?: boolean;
  riskFlag?: boolean;
}

// Blueprint 7.1 Field Classifications
export type FieldVisibility = 'public' | 'private' | 'matching_only' | 'sensitive';

export interface SocialStyle {
  groupSize: '2-3' | '4-6' | '6-8' | 'any';
  interactionStyle: 'activity_first' | 'chat_first' | 'balanced';
  energy: 'quiet' | 'balanced' | 'lively';
  pace: 'slow' | 'steady' | 'fast';
}

export type AvailabilitySlot =
  | 'weekday_morning'
  | 'weekday_evening'
  | 'weekend_morning'
  | 'weekend_afternoon'
  | 'weekend_evening';

export type LifestyleComfort =
  | 'student'
  | 'working_professional'
  | 'alcohol_free'
  | 'vegetarian_friendly'
  | 'early_bird'
  | 'night_owl';

export interface TasteFingerprint {
  music: string[];
  movies: string[];
  books: string[];
  games: string[];
}

export interface DatingPreferences {
  interestedInGenders: Gender[];
  ageRangeMin: number;
  ageRangeMax: number;
  consentVersion: string;
}

export interface PrivacySettings {
  discoverability: 'eligible_only' | 'circles_only' | 'hidden';
  showAgeBand: boolean;
  showZone: boolean;
  communityOnlyMode: boolean;
  messageRequests: 'mutual_only' | 'filtered';
}

export interface UserProfile {
  // Public fields
  userId: string;
  displayName: string;
  bio: string;
  age: number;
  ageBand: string; // e.g. "22-26"
  gender: Gender;
  pronouns?: string;
  city: string; // e.g. "Bengaluru"
  zone: string; // e.g. "Indiranagar", "Koramangala", "HSR Layout"
  distanceBand?: string; // e.g. "2 to 5 km" (never raw GPS)
  languages: string[];
  primaryIntent: RelationshipIntent;
  openToIntents: RelationshipIntent[];
  occupation?: string;
  photos: string[];
  interests: string[];
  isVerified: boolean;
  completionPercentage: number;
  photoModerationState?: 'clean' | 'pending' | 'flagged';

  // Matching-only fields (used internally, not exposed publicly)
  socialStyle?: SocialStyle;
  availabilitySlots?: AvailabilitySlot[];
  lifestyleComforts?: LifestyleComfort[];
  tasteFingerprint?: TasteFingerprint;
  discoveryRadiusBand?: '2km' | '5km' | '10km' | 'anywhere';

  // Sensitive fields (opt-in / strict consent required)
  datingPreferences?: DatingPreferences;

  // Private fields (Never exposed to other users or public endpoints)
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  privacySettings?: PrivacySettings;
}

// Sanitized public profile view guaranteed to exclude private and sensitive matching fields
export interface PublicUserProfile {
  userId: string;
  displayName: string;
  bio: string;
  ageBand?: string;
  gender?: Gender;
  pronouns?: string;
  city: string;
  zone?: string;
  distanceBand?: string;
  languages: string[];
  primaryIntent: RelationshipIntent;
  openToIntents: RelationshipIntent[];
  occupation?: string;
  photos: string[];
  interests: string[];
  isVerified: boolean;
  completionPercentage: number;
}

export interface OnboardingDraft {
  stepIndex: number;
  dateOfBirth?: string;
  age?: number;
  ageBand?: string;
  displayName?: string;
  gender?: Gender;
  languages?: string[];
  primaryIntent?: RelationshipIntent;
  openToIntents?: RelationshipIntent[];
  datingPreferences?: DatingPreferences;
  interests?: string[];
  tasteFingerprint?: TasteFingerprint;
  socialStyle?: SocialStyle;
  availabilitySlots?: AvailabilitySlot[];
  lifestyleComforts?: LifestyleComfort[];
  city?: string;
  zone?: string;
  discoveryRadiusBand?: '2km' | '5km' | '10km' | 'anywhere';
  privacySettings?: PrivacySettings;
  photoUri?: string;
  bio?: string;
  completed?: boolean;
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  zone: string;
  visibility: 'public' | 'private';
  memberCount: number;
  hostId: string;
  hostName: string;
  rules: string[];
  createdAt: string;
}

export interface Circle {
  id: string;
  communityId?: string;
  title: string;
  category: string;
  hostId: string;
  hostName: string;
  capacity: number;
  currentMemberCount: number;
  state: 'open' | 'full' | 'active' | 'archived';
  cadence: string; // e.g. "Every Saturday morning"
  activityName: string;
  locationZone: string;
  reasonChips: string[];
  members: string[]; // userIds
  createdAt: string;
}

export type EventRsvpState = 'going' | 'waitlist' | 'cancelled' | 'checked_in';
export type EventState = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type PriceBand = 'Free' | 'Under ₹500' | 'Split cost';

export interface EventAttendee {
  userId: string;
  userName: string;
  userAvatar?: string;
  isVerified?: boolean;
  status: EventRsvpState;
  rsvpdAt: string;
  checkedInAt?: string;
}

export interface Event {
  id: string;
  circleId?: string;
  circleTitle?: string;
  communityId?: string;
  communityTitle?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  isHostVerified?: boolean;
  title: string;
  description?: string;
  activityType: string;
  dateStr: string;
  timeStr: string;
  venueZone: string;
  venueCategory?: string;
  exactAddress?: string; // Revealed only to confirmed attendees
  capacity: number;
  rsvpsCount: number;
  waitlistCount?: number;
  state: EventState;
  priceBand: PriceBand | string;
  coverImage?: string;
  houseRules?: string[];
  safetyNotes?: string[];
  checkInCode?: string;
  createdAt?: string;
}

export interface EventFeedback {
  eventId: string;
  userId: string;
  rating: number;
  tags: string[]; // e.g. ['Welcoming Vibe', 'Safe & Comfortable', 'Great Host', 'Punctual']
  comment?: string;
  createdAt: string;
}

export type DatePlanStatus =
  | 'proposed'
  | 'counter_proposed'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type DatePlanPostOutcome =
  | 'stay_connected'
  | 'friends'
  | 'continue_dating'
  | 'stop'
  | 'reported';

export interface DatePlanProposal {
  id: string;
  connectionId: string;
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  venueCategory: string; // e.g. 'Third-wave Cafe', 'Art Gallery', 'Public Botanical Gardens', 'Board Game Parlour'
  locationZone: string;
  suggestedDate: string;
  suggestedTime: string;
  note?: string;
  counterNotes?: string;
  status: DatePlanStatus;
  safetyPlanEnabled: boolean;
  postDateOutcome?: DatePlanPostOutcome;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionState = 'pending' | 'accepted' | 'declined' | 'restricted' | 'blocked';
export type RelationshipOutcome = 'friendship' | 'dating' | 'activity_partner' | 'none';

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  state: ConnectionState;
  contextId?: string;
  requesterIntent: RelationshipIntent;
  recipientIntent?: RelationshipIntent;
  outcome?: RelationshipOutcome;
  createdAt: string;
  updatedAt: string;
}

export type ConversationType = 'direct' | 'circle' | 'request';
export type MessageStatus = 'sending' | 'sent' | 'failed';
export type MessageType = 'text' | 'image' | 'system_card' | 'announcement';

export interface SystemCardPayload {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionType?: 'rsvp_event' | 'join_circle' | 'view_community';
  eventId?: string;
  circleId?: string;
  dateStr?: string;
  venue?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  avatar?: string;
  objectId?: string;
  participantIds: string[];
  participantProfiles?: UserProfile[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  sharedContext: string;
  isBlocked?: boolean;
  isMuted?: boolean;
  requestStatus?: 'pending' | 'accepted' | 'declined';
  requestOpeningMessage?: string;
  pinnedPrompt?: string;
  suggestedIcebreakers?: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  type?: MessageType;
  mediaUri?: string;
  mediaModerationState?: 'clean' | 'flagged' | 'unsafe';
  systemCardPayload?: SystemCardPayload;
  createdAt: string;
  status?: MessageStatus;
  moderationState: 'clean' | 'flagged' | 'hidden';
  isOptimistic?: boolean;
  errorReason?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  targetType: 'user' | 'message' | 'community' | 'circle' | 'post';
  targetId: string;
  category: 'harassment' | 'spam' | 'fake_profile' | 'inappropriate' | 'other';
  evidence?: string;
  status: 'received' | 'reviewing' | 'action_taken' | 'closed';
  createdAt: string;
}

// Phase 5 Governance, Membership & Feed Types
export type CommunityMembershipStatus = 'none' | 'pending' | 'approved' | 'muted' | 'banned';

export interface CommunityMember {
  userId: string;
  communityId: string;
  userName: string;
  userAvatar?: string;
  role: 'host' | 'moderator' | 'member';
  status: CommunityMembershipStatus;
  joinedAt: string;
  answers?: string[];
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isHostPrompt?: boolean;
  content: string;
  createdAt: string;
  commentsCount: number;
  reactionsCount: number;
  moderationState: 'visible' | 'hidden' | 'removed_by_mod';
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CommunityJoinRequest {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  answers: string[];
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface CommunityAuditLog {
  id: string;
  communityId: string;
  actorId: string;
  actorName: string;
  action: 'remove_post' | 'hide_post' | 'mute_member' | 'ban_member' | 'unban_member' | 'approve_join' | 'reject_join';
  targetId: string;
  reason?: string;
  timestamp: string;
}
