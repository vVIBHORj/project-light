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
  RelationshipIntent,
} from '../../domain/types';

export interface AuthRepository {
  getBootstrapConfig(): Promise<BootstrapConfig>;
  getSession(): Promise<{ user: User | null; token: string | null }>;
  signUp(
    identifier: string,
    method: 'phone' | 'email',
    referralCode?: string
  ): Promise<AuthChallenge>;
  login(identifier: string): Promise<AuthChallenge>;
  verifyOtp(challengeId: string, code: string): Promise<{ user: User; token: string }>;
  resendOtp(challengeId: string): Promise<AuthChallenge>;
  requestRecovery(identifier: string): Promise<{ success: boolean; message: string }>;
  resolveSecurityChallenge(challengeId: string, action: 'confirm_me' | 'not_me'): Promise<{ success: boolean; token?: string }>;
  getSessions(): Promise<UserSession[]>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllOtherSessions(): Promise<void>;
  signOut(): Promise<void>;
}

export interface ProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  getInterests(): Promise<Interest[]>;
  getRecommendedProfiles(filters?: { intent?: string; zone?: string }): Promise<UserProfile[]>;
}

export interface CreateCircleDto {
  communityId?: string;
  title: string;
  category: string;
  hostId: string;
  hostName: string;
  capacity: number; // 4 to 8
  cadence: string;
  activityName: string;
  locationZone: string;
  firstDateStr?: string;
  firstPrompt?: string;
}

export interface CreateCommunityDto {
  name: string;
  description: string;
  category: string;
  zone: string;
  visibility: 'public' | 'private';
  rules: string[];
  hostId: string;
  hostName: string;
  questions?: string[];
}

export interface CircleRepository {
  getCircles(filters?: { category?: string; zone?: string; communityId?: string }): Promise<Circle[]>;
  getCircleById(id: string): Promise<Circle | null>;
  createCircle(data: CreateCircleDto): Promise<Circle>;
  joinCircle(circleId: string, userId: string): Promise<Circle>;
  leaveCircle(circleId: string, userId: string): Promise<void>;
}

export interface CommunityRepository {
  getCommunities(filters?: { category?: string; zone?: string; searchQuery?: string }): Promise<Community[]>;
  getCommunityById(id: string): Promise<Community | null>;
  createCommunity(data: CreateCommunityDto): Promise<Community>;
  joinCommunity(communityId: string, userId: string, userName?: string, answers?: string[]): Promise<{ status: 'approved' | 'pending' }>;
  cancelJoinRequest(communityId: string, userId: string): Promise<void>;
  leaveCommunity(communityId: string, userId: string): Promise<void>;
  getMembershipStatus(communityId: string, userId: string): Promise<'none' | 'pending' | 'approved' | 'muted' | 'banned'>;
  getPosts(communityId: string): Promise<import('../../domain/types').CommunityPost[]>;
  createPost(communityId: string, authorId: string, authorName: string, content: string, isHostPrompt?: boolean): Promise<import('../../domain/types').CommunityPost>;
  getPendingRequests(communityId: string): Promise<import('../../domain/types').CommunityJoinRequest[]>;
  resolveJoinRequest(requestId: string, actorId: string, action: 'approved' | 'rejected'): Promise<void>;
  moderateMember(communityId: string, actorId: string, actorName: string, targetUserId: string, action: 'mute' | 'ban' | 'unban'): Promise<void>;
  moderatePost(communityId: string, actorId: string, actorName: string, postId: string, action: 'remove' | 'hide'): Promise<void>;
  getAuditLogs(communityId: string): Promise<import('../../domain/types').CommunityAuditLog[]>;
}

export interface ConnectionItem {
  id: string;
  requesterId: string;
  recipientId: string;
  otherUser: UserProfile;
  state: import('../../domain/types').ConnectionState;
  requesterIntent: RelationshipIntent;
  recipientIntent?: RelationshipIntent;
  stage: import('../../domain/relationshipStateMachine').RelationshipStage;
  sharedContextDescription: string;
  note?: string;
  suggestedActivity?: string;
  datingOptIn: {
    requester: boolean;
    recipient: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SendConnectionRequestDto {
  requesterId: string;
  recipientId: string;
  intent: RelationshipIntent;
  sharedContext: string;
  note?: string;
}

export interface ConnectionRepository {
  getConnections(userId: string): Promise<ConnectionItem[]>;
  getConnectionById(connectionId: string): Promise<ConnectionItem | null>;
  sendConnectionRequest(data: SendConnectionRequestDto): Promise<ConnectionItem>;
  respondToConnection(connectionId: string, decision: 'accepted' | 'declined' | 'restricted'): Promise<ConnectionItem>;
  markAsFriend(connectionId: string): Promise<ConnectionItem>;
  markAsActivityPartner(connectionId: string): Promise<ConnectionItem>;
  setDatingOptIn(connectionId: string, userId: string, optIn: boolean): Promise<ConnectionItem>;
  removeConnection(connectionId: string, reason?: string): Promise<void>;
}

export interface SendMessageOptions {
  type?: import('../../domain/types').MessageType;
  mediaUri?: string;
  systemCardPayload?: import('../../domain/types').SystemCardPayload;
  senderAvatar?: string;
}

export interface MessageRepository {
  getConversations(
    userId: string,
    segment?: 'all' | 'circles' | 'connections' | 'requests'
  ): Promise<Conversation[]>;
  getConversationById(conversationId: string): Promise<Conversation | null>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    body: string,
    options?: SendMessageOptions
  ): Promise<Message>;
  respondToMessageRequest(
    conversationId: string,
    action: 'accepted' | 'declined' | 'blocked'
  ): Promise<Conversation>;
  toggleConversationMute(conversationId: string): Promise<boolean>;
  deleteMessageForMe(messageId: string, userId: string): Promise<void>;
  blockParticipant(conversationId: string, actorUserId: string): Promise<void>;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  activityType: string;
  circleId?: string;
  circleTitle?: string;
  communityId?: string;
  communityTitle?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  isHostVerified?: boolean;
  dateStr: string;
  timeStr: string;
  locationZone: string;
  venueCategory: string;
  exactAddress?: string;
  capacity: number;
  priceBand: import('../../domain/types').PriceBand | string;
  houseRules?: string[];
  safetyNotes?: string[];
  coverImage?: string;
}

export interface EventFilters {
  zone?: string;
  category?: string;
  dateFilter?: 'all' | 'today' | 'weekend' | 'this_week' | 'upcoming';
  priceBand?: string;
  verifiedHostOnly?: boolean;
  searchQuery?: string;
}

export interface CreateDatePlanDto {
  connectionId: string;
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  venueCategory: string;
  locationZone: string;
  suggestedDate: string;
  suggestedTime: string;
  note?: string;
  safetyPlanEnabled?: boolean;
}

export interface EventRepository {
  getEvents(filters?: EventFilters): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  getAttendees(eventId: string): Promise<import('../../domain/types').EventAttendee[]>;
  createEvent(data: CreateEventDto): Promise<Event>;
  cancelEventByHost(eventId: string, hostId: string, reason?: string): Promise<Event>;
  rsvpEvent(
    eventId: string,
    user: { userId: string; userName: string; userAvatar?: string; isVerified?: boolean }
  ): Promise<{ attendee: import('../../domain/types').EventAttendee; event: Event }>;
  cancelRsvp(
    eventId: string,
    userId: string
  ): Promise<{ event: Event; promotedAttendee?: import('../../domain/types').EventAttendee }>;
  checkIn(eventId: string, userId: string, code?: string): Promise<{ success: boolean; error?: string }>;
  submitFeedback(feedback: import('../../domain/types').EventFeedback): Promise<void>;
  getEventFeedback(eventId: string): Promise<import('../../domain/types').EventFeedback[]>;
  createDatePlan(data: CreateDatePlanDto): Promise<import('../../domain/types').DatePlanProposal>;
  getDatePlans(userId: string): Promise<import('../../domain/types').DatePlanProposal[]>;
  respondToDatePlan(
    planId: string,
    action: 'confirm' | 'cancel' | 'counter',
    counterNotes?: string
  ): Promise<import('../../domain/types').DatePlanProposal>;
  completeDatePlan(
    planId: string,
    outcome: import('../../domain/types').DatePlanPostOutcome
  ): Promise<import('../../domain/types').DatePlanProposal>;
}

export interface SubmitReportDto {
  reporterId: string;
  targetType: 'user' | 'message' | 'circle' | 'post' | 'comment';
  targetId: string;
  targetName: string;
  category: import('../../domain/safetyTypes').ReportCategory;
  severity: import('../../domain/safetyTypes').ReportSeverity;
  details?: string;
  evidenceSnippets?: string[];
  applyImmediateProtection?: 'none' | 'block' | 'restrict';
}

export interface AddTrustedContactDto {
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface StartDateSafetyDto {
  connectionId: string;
  partnerName: string;
  venueCategory: string;
  locationZone: string;
  startTime: string;
  timerDurationMinutes: number;
}

export interface SafetyRepository {
  submitReport(data: SubmitReportDto): Promise<import('../../domain/safetyTypes').SafetyCase>;
  getSafetyCases(userId: string): Promise<import('../../domain/safetyTypes').SafetyCase[]>;
  getSafetyCaseById(caseId: string): Promise<import('../../domain/safetyTypes').SafetyCase | null>;
  appealSafetyCase(caseId: string, reason: string): Promise<import('../../domain/safetyTypes').SafetyCase>;
  blockUser(actorUserId: string, targetUserId: string, targetName: string, reason?: string): Promise<void>;
  unblockUser(actorUserId: string, targetUserId: string): Promise<void>;
  restrictUser(actorUserId: string, targetUserId: string, targetName: string, reason?: string): Promise<void>;
  unrestrictUser(actorUserId: string, targetUserId: string): Promise<void>;
  getBlockedAndRestrictedUsers(actorUserId: string): Promise<import('../../domain/safetyTypes').RestrictionItem[]>;
  getBlockedUsers(actorUserId?: string): Promise<string[]>;
  getTrustedContacts(userId: string): Promise<import('../../domain/safetyTypes').TrustedContact[]>;
  addTrustedContact(data: AddTrustedContactDto): Promise<import('../../domain/safetyTypes').TrustedContact>;
  deleteTrustedContact(contactId: string): Promise<void>;
  startDateSafetyTimer(data: StartDateSafetyDto): Promise<import('../../domain/safetyTypes').DateSafetyPlan>;
  triggerSosAlert(planId: string): Promise<{ success: boolean; message: string }>;
}
