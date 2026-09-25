import { useChatStore } from '../state/useChatStore';
import { mockMessageRepo } from '../../../data/mocks';
import { mockUsers } from '../../../data/mocks/seedData';
import { ChatSafetyHeuristics } from '../../../domain/chatSafetyHeuristics';
import { IcebreakerGenerator } from '../../../domain/icebreakerGenerator';
import { MockChatTransport } from '../../../domain/chatTransport';

describe('Phase 7: Messages Feature Suite', () => {
  const currentUser = mockUsers[0]; // Aisha Rao (user_1)

  beforeEach(() => {
    mockMessageRepo.reset();
    useChatStore.setState({
      activeSegment: 'circles',
      conversations: [],
      isLoadingConversations: false,
      activeConversation: null,
      messages: [],
      isLoadingMessages: false,
      composerText: '',
      isSending: false,
      blockedParticipants: new Set(),
      mentionQuery: null,
      mentionCandidates: [],
      safetyPromptTarget: null,
      isMediaPickerOpen: false,
      actionSheetMessage: null,
      isVoiceTooltipOpen: false,
      analyticsEvents: [],
    });
  });

  describe('MSG-01: Inbox Segments & Badges', () => {
    it('loads conversations for circles segment', async () => {
      useChatStore.getState().setActiveSegment('circles');
      await useChatStore.getState().loadConversations(currentUser.userId);
      const state = useChatStore.getState();

      expect(state.conversations.length).toBeGreaterThan(0);
      expect(state.conversations.every((c) => c.type === 'circle')).toBe(true);
    });

    it('loads conversations for connections segment', async () => {
      useChatStore.getState().setActiveSegment('connections');
      await useChatStore.getState().loadConversations(currentUser.userId);
      const state = useChatStore.getState();

      expect(state.conversations.length).toBeGreaterThan(0);
      expect(state.conversations.every((c) => c.type === 'direct')).toBe(true);
    });

    it('loads conversations for requests segment', async () => {
      useChatStore.getState().setActiveSegment('requests');
      await useChatStore.getState().loadConversations(currentUser.userId);
      const state = useChatStore.getState();

      expect(state.conversations.length).toBeGreaterThan(0);
      expect(state.conversations.every((c) => c.type === 'request')).toBe(true);
    });
  });

  describe('MSG-02 & MSG-03: 1:1 and Circle Conversations', () => {
    it('opens a 1:1 conversation and loads thread messages', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      const state = useChatStore.getState();
      expect(state.activeConversation?.id).toBe('conv_direct_1');
      expect(state.messages.length).toBeGreaterThan(0);
      expect(state.activeConversation?.sharedContext).toContain('Sunday Photography Circle');
    });

    it('generates 2-3 rule-based icebreaker suggestion chips from shared context', () => {
      const chips = IcebreakerGenerator.generateSuggestions({
        sharedInterests: ['Photography', 'Street Art'],
        zone: 'Indiranagar',
        otherUserName: 'Rohan',
      });

      expect(chips.length).toBeGreaterThanOrEqual(2);
      expect(chips.length).toBeLessThanOrEqual(3);
      expect(chips.some((c) => c.includes('photo') || c.includes('camera') || c.includes('Indiranagar'))).toBe(true);
    });

    it('optimistically sends a text message and confirms delivery', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      useChatStore.getState().setComposerText('Are you bringing the 50mm lens?');
      const success = await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName,
        currentUser.photos[0]
      );

      expect(success).toBe(true);
      const messages = useChatStore.getState().messages;
      const sentMsg = messages[messages.length - 1];
      expect(sentMsg.body).toBe('Are you bringing the 50mm lens?');
      expect(sentMsg.senderId).toBe(currentUser.userId);
      expect(sentMsg.status).toBe('sent');
    });

    it('detects @mentions query in circle conversations', async () => {
      const circleConv = mockMessageRepo.mockConversations.find((c) => c.type === 'circle')!;
      await useChatStore.getState().openConversation(circleConv, currentUser.userId);

      useChatStore.getState().setComposerText('Hey @rohan');
      const state = useChatStore.getState();
      expect(state.mentionQuery).toBe('rohan');
      expect(state.mentionCandidates.length).toBeGreaterThan(0);
    });

    it('toggles mute on a conversation', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_circle_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      const beforeMute = useChatStore.getState().activeConversation?.isMuted ?? false;
      await useChatStore.getState().toggleMuteActiveConversation();
      const afterMute = useChatStore.getState().activeConversation?.isMuted;
      expect(afterMute).toBe(!beforeMute);
    });

    it('blocks participant mid-conversation and disables composer', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      await useChatStore.getState().blockActiveParticipant(currentUser.userId);
      const state = useChatStore.getState();
      expect(state.activeConversation?.isBlocked).toBe(true);

      // Subsequent send is blocked
      useChatStore.getState().setComposerText('Message after blocked');
      const sent = await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName
      );
      expect(sent).toBe(false);
    });
  });

  describe('MSG-04: Message Request & Permission Gating', () => {
    it('disables sending replies before request is accepted', async () => {
      const reqConv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_req_1')!;
      await useChatStore.getState().openConversation(reqConv, currentUser.userId);

      expect(useChatStore.getState().activeConversation?.requestStatus).toBe('pending');

      useChatStore.getState().setComposerText('Replying without accepting');
      const sent = await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName
      );
      expect(sent).toBe(false);
    });

    it('accepting message request unlocks conversation and enables replies', async () => {
      const reqConv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_req_1')!;
      await useChatStore.getState().openConversation(reqConv, currentUser.userId);

      await useChatStore.getState().respondToRequest('accepted');
      expect(useChatStore.getState().activeConversation?.requestStatus).toBe('accepted');

      useChatStore.getState().setComposerText('Thanks for reaching out! Excited for the event.');
      const sent = await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName
      );
      expect(sent).toBe(true);
    });

    it('declining message request closes the conversation', async () => {
      const reqConv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_req_1')!;
      await useChatStore.getState().openConversation(reqConv, currentUser.userId);

      await useChatStore.getState().respondToRequest('declined');
      expect(useChatStore.getState().activeConversation).toBeNull();
    });
  });

  describe('MSG-05: Media Picker (MVP vs V2)', () => {
    it('sends image attachment with clean moderation state', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      const success = await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName,
        currentUser.photos[0],
        {
          type: 'image',
          mediaUri: 'https://images.unsplash.com/photo-sample.jpg',
        }
      );

      expect(success).toBe(true);
      const messages = useChatStore.getState().messages;
      const lastMsg = messages[messages.length - 1];
      expect(lastMsg.type).toBe('image');
      expect(lastMsg.mediaUri).toBe('https://images.unsplash.com/photo-sample.jpg');
    });
  });

  describe('MSG-06 & Section 10: Threat Controls & Safety Heuristics', () => {
    it('intercepts phone numbers and raises safety prompt without silent blocking', () => {
      const check = ChatSafetyHeuristics.evaluateMessage('Text me at +91 9876543210 for details');
      expect(check.triggered).toBe(true);
      expect(check.triggerType).toBe('phone_number');
    });

    it('intercepts payment requests (UPI) and triggers scam warning', () => {
      const check = ChatSafetyHeuristics.evaluateMessage('Please send 500 Rs to username@okhdfcbank');
      expect(check.triggered).toBe(true);
      expect(check.triggerType).toBe('upi_payment');
    });

    it('intercepts off-platform migration attempts (WhatsApp / Telegram)', () => {
      const check = ChatSafetyHeuristics.evaluateMessage('Join my telegram channel t.me/bangalore_group');
      expect(check.triggered).toBe(true);
      expect(check.triggerType).toBe('off_platform');
    });

    it('allows "Keep Chatting" bypass when user confirms safety prompt', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      useChatStore.getState().setComposerText('Ping me on whatsapp 9876543210');
      const sentInitially = await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName
      );

      // Should be paused for safety prompt
      expect(sentInitially).toBe(false);
      let state = useChatStore.getState();
      expect(state.safetyPromptTarget).not.toBeNull();
      expect(state.safetyPromptTarget?.text).toBe('Ping me on whatsapp 9876543210');

      // User confirms "Keep Chatting"
      await state.safetyPromptTarget?.onConfirmSend();
      state = useChatStore.getState();
      expect(state.safetyPromptTarget).toBeNull();
    });
  });

  describe('Message Actions', () => {
    it('supports delete for me', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      const initialCount = useChatStore.getState().messages.length;
      const firstMsg = useChatStore.getState().messages[0];

      await useChatStore.getState().deleteMessageForMe(firstMsg.id, currentUser.userId);
      expect(useChatStore.getState().messages.length).toBe(initialCount - 1);
      expect(useChatStore.getState().messages.some((m) => m.id === firstMsg.id)).toBe(false);
    });
  });

  describe('Transport & Privacy-Safe Analytics', () => {
    it('buckets message length without exposing message content in analytics', () => {
      expect(MockChatTransport.getLengthBucket('Hi')).toBe('short');
      expect(
        MockChatTransport.getLengthBucket(
          'This is a medium length conversational text for our circle meetup in Indiranagar'
        )
      ).toBe('medium');
      expect(MockChatTransport.getLengthBucket('A'.repeat(200))).toBe('long');
    });

    it('logs analytics events for message sending with length bucket only', async () => {
      const conv = mockMessageRepo.mockConversations.find((c) => c.id === 'conv_direct_1')!;
      await useChatStore.getState().openConversation(conv, currentUser.userId);

      useChatStore.getState().setComposerText('Excited to meet everyone!');
      await useChatStore.getState().sendMessage(
        currentUser.userId,
        currentUser.displayName
      );

      const events = useChatStore.getState().analyticsEvents;
      const sentEvent = events.find((e) => e.event === 'message_sent');
      expect(sentEvent).toBeDefined();
      expect(sentEvent?.payload.lengthBucket).toBe('short');
      expect(sentEvent?.payload.text).toBeUndefined(); // Never exposes raw content
    });
  });
});
