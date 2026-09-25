import { create } from 'zustand';
import { Conversation, Message, MessageType, SystemCardPayload } from '../../../domain/types';
import { mockMessageRepo } from '../../../data/mocks';
import { ChatSafetyHeuristics, SafetyCheckResult } from '../../../domain/chatSafetyHeuristics';
import { chatTransport, MockChatTransport } from '../../../domain/chatTransport';

export type InboxSegment = 'circles' | 'connections' | 'requests';

export interface ChatState {
  // Inbox State
  activeSegment: InboxSegment;
  conversations: Conversation[];
  isLoadingConversations: boolean;

  // Active Thread State
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;
  composerText: string;
  isSending: boolean;
  blockedParticipants: Set<string>;

  // Mention State (MSG-03)
  mentionQuery: string | null;
  mentionCandidates: { id: string; name: string }[];

  // Modals & Safety Sheets (MSG-05, MSG-06)
  safetyPromptTarget: {
    text: string;
    checkResult: SafetyCheckResult;
    onConfirmSend: () => void;
  } | null;
  isMediaPickerOpen: boolean;
  actionSheetMessage: Message | null;
  isVoiceTooltipOpen: boolean;

  // Analytics
  analyticsEvents: { event: string; payload: Record<string, unknown>; timestamp: string }[];

  // Actions
  setActiveSegment: (segment: InboxSegment) => void;
  loadConversations: (userId: string) => Promise<void>;
  openConversation: (conversation: Conversation, currentUserId: string) => Promise<void>;
  closeConversation: () => void;
  setComposerText: (text: string) => void;
  sendMessage: (
    currentUserId: string,
    currentUserName: string,
    currentUserAvatar?: string,
    options?: { type?: MessageType; mediaUri?: string; systemCardPayload?: SystemCardPayload; forceBypassSafety?: boolean }
  ) => Promise<boolean>;
  retryFailedMessage: (messageId: string) => Promise<void>;
  respondToRequest: (action: 'accepted' | 'declined' | 'blocked') => Promise<void>;
  toggleMuteActiveConversation: () => Promise<void>;
  blockActiveParticipant: (actorUserId: string) => Promise<void>;
  deleteMessageForMe: (messageId: string, userId: string) => Promise<void>;
  setActionSheetMessage: (msg: Message | null) => void;
  setMediaPickerOpen: (open: boolean) => void;
  setVoiceTooltipOpen: (open: boolean) => void;
  closeSafetyPrompt: () => void;
  logAnalytics: (event: string, payload?: Record<string, unknown>) => void;
}

let activeTransportUnsubscribe: (() => void) | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
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

  setActiveSegment: (segment) => set({ activeSegment: segment }),

  loadConversations: async (userId) => {
    set({ isLoadingConversations: true });
    try {
      const list = await mockMessageRepo.getConversations(userId, get().activeSegment);
      set({ conversations: list });
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  openConversation: async (conversation, _currentUserId) => {
    // Unsubscribe from previous conversation transport
    if (activeTransportUnsubscribe) {
      activeTransportUnsubscribe();
      activeTransportUnsubscribe = null;
    }

    set({
      activeConversation: conversation,
      isLoadingMessages: true,
      composerText: '',
      mentionQuery: null,
    });

    try {
      const msgs = await mockMessageRepo.getMessages(conversation.id);
      set({ messages: msgs });

      // Subscribe to real-time transport updates
      activeTransportUnsubscribe = chatTransport.subscribe(conversation.id, (incomingMsg) => {
        set((state) => {
          if (state.activeConversation?.id !== conversation.id) return state;
          // Avoid duplicate messages if already present optimistically
          const exists = state.messages.some((m) => m.id === incomingMsg.id);
          if (exists) {
            return {
              messages: state.messages.map((m) => (m.id === incomingMsg.id ? incomingMsg : m)),
            };
          }
          return {
            messages: [...state.messages, incomingMsg],
          };
        });
      });

      get().logAnalytics('conversation_started', {
        conversationId: conversation.id,
        type: conversation.type,
      });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  closeConversation: () => {
    if (activeTransportUnsubscribe) {
      activeTransportUnsubscribe();
      activeTransportUnsubscribe = null;
    }
    set({ activeConversation: null, messages: [], composerText: '' });
  },

  setComposerText: (text) => {
    set({ composerText: text });

    // Handle @mentions in circle/group chats (MSG-03)
    const active = get().activeConversation;
    if (active?.type === 'circle') {
      const match = text.match(/@([a-zA-Z0-9_]*)$/);
      if (match) {
        const query = match[1].toLowerCase();
        // Sample group member candidates
        const candidates = [
          { id: 'user_2', name: 'Rohan Mehta' },
          { id: 'user_3', name: 'Pooja Iyer' },
          { id: 'user_4', name: 'Vikram Nair' },
        ].filter((c) => c.name.toLowerCase().includes(query));
        set({ mentionQuery: query, mentionCandidates: candidates });
      } else {
        set({ mentionQuery: null, mentionCandidates: [] });
      }
    }
  },

  sendMessage: async (currentUserId, currentUserName, currentUserAvatar, options) => {
    const active = get().activeConversation;
    if (!active) return false;

    // Disabled composer if blocked or pending message request
    if (active.isBlocked || get().blockedParticipants.has(active.id)) {
      return false;
    }
    if (active.type === 'request' && active.requestStatus === 'pending') {
      return false;
    }

    const text = get().composerText.trim();
    const mediaUri = options?.mediaUri;
    const isImage = options?.type === 'image';
    const isSystem = options?.type === 'system_card';

    if (!text && !mediaUri && !isSystem) return false;

    // Check Safety Heuristics (MSG-06) on text unless force bypassed
    if (text && !options?.forceBypassSafety && !isSystem) {
      const safetyCheck = ChatSafetyHeuristics.evaluateMessage(text);
      if (safetyCheck.triggered) {
        set({
          safetyPromptTarget: {
            text,
            checkResult: safetyCheck,
            onConfirmSend: async () => {
              set({ safetyPromptTarget: null });
              await get().sendMessage(currentUserId, currentUserName, currentUserAvatar, {
                ...options,
                forceBypassSafety: true,
              });
            },
          },
        });
        get().logAnalytics('safety_prompt_triggered', {
          triggerType: safetyCheck.triggerType,
          conversationId: active.id,
        });
        return false;
      }
    }

    const optimisticId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      conversationId: active.id,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      body: text,
      type: isImage ? 'image' : isSystem ? 'system_card' : 'text',
      mediaUri,
      mediaModerationState: mediaUri ? 'clean' : undefined,
      systemCardPayload: options?.systemCardPayload,
      createdAt: new Date().toISOString(),
      status: 'sending',
      moderationState: 'clean',
      isOptimistic: true,
    };

    // Optimistic UI update
    set((state) => ({
      messages: [...state.messages, optimisticMsg],
      composerText: '',
      mentionQuery: null,
      isSending: true,
    }));

    try {
      // Publish via ChatTransport for rate-limiting and real-time delivery
      const transportRes = await chatTransport.publish(optimisticMsg);

      if (!transportRes.success) {
        // Mark optimistic message as failed
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === optimisticId
              ? { ...m, status: 'failed', errorReason: transportRes.message.errorReason }
              : m
          ),
          isSending: false,
        }));
        return false;
      }

      // Persist to repository
      const saved = await mockMessageRepo.sendMessage(
        active.id,
        currentUserId,
        currentUserName,
        text,
        {
          type: optimisticMsg.type,
          mediaUri,
          systemCardPayload: options?.systemCardPayload,
          senderAvatar: currentUserAvatar,
        }
      );

      // Update state with confirmed saved message
      set((state) => ({
        messages: state.messages.map((m) => (m.id === optimisticId ? saved : m)),
        isSending: false,
      }));

      // Privacy-Safe Analytics (Length bucket only, NEVER content!)
      get().logAnalytics('message_sent', {
        lengthBucket: MockChatTransport.getLengthBucket(text),
        conversationType: active.type,
        hasMedia: !!mediaUri,
      });

      return true;
    } catch (err: unknown) {
      const errorReason = err instanceof Error ? err.message : 'Failed to send message';
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === optimisticId ? { ...m, status: 'failed', errorReason } : m
        ),
        isSending: false,
      }));
      return false;
    }
  },

  retryFailedMessage: async (messageId) => {
    const failedMsg = get().messages.find((m) => m.id === messageId);
    if (!failedMsg || !get().activeConversation) return;

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, status: 'sending', errorReason: undefined } : m
      ),
    }));

    try {
      const transportRes = await chatTransport.publish(failedMsg);
      if (transportRes.success) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, status: 'sent' } : m
          ),
        }));
      }
    } catch {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, status: 'failed', errorReason: 'Retry failed' } : m
        ),
      }));
    }
  },

  respondToRequest: async (action) => {
    const active = get().activeConversation;
    if (!active || active.type !== 'request') return;

    const updated = await mockMessageRepo.respondToMessageRequest(active.id, action);
    if (action === 'accepted') {
      set({ activeConversation: updated });
      get().logAnalytics('message_request_accepted', { conversationId: active.id });
    } else {
      get().closeConversation();
      get().logAnalytics('message_request_declined', { conversationId: active.id });
    }
  },

  toggleMuteActiveConversation: async () => {
    const active = get().activeConversation;
    if (!active) return;
    const isMuted = await mockMessageRepo.toggleConversationMute(active.id);
    set((state) => ({
      activeConversation: state.activeConversation
        ? { ...state.activeConversation, isMuted }
        : null,
      conversations: state.conversations.map((c) =>
        c.id === active.id ? { ...c, isMuted } : c
      ),
    }));
  },

  blockActiveParticipant: async (actorUserId) => {
    const active = get().activeConversation;
    if (!active) return;
    await mockMessageRepo.blockParticipant(active.id, actorUserId);
    set((state) => {
      const nextBlocked = new Set(state.blockedParticipants);
      nextBlocked.add(active.id);
      return {
        blockedParticipants: nextBlocked,
        activeConversation: state.activeConversation
          ? { ...state.activeConversation, isBlocked: true }
          : null,
      };
    });
  },

  deleteMessageForMe: async (messageId, userId) => {
    await mockMessageRepo.deleteMessageForMe(messageId, userId);
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
      actionSheetMessage: null,
    }));
  },

  setActionSheetMessage: (msg) => set({ actionSheetMessage: msg }),
  setMediaPickerOpen: (open) => set({ isMediaPickerOpen: open }),
  setVoiceTooltipOpen: (open) => set({ isVoiceTooltipOpen: open }),
  closeSafetyPrompt: () => set({ safetyPromptTarget: null }),

  logAnalytics: (event, payload = {}) => {
    set((state) => ({
      analyticsEvents: [
        ...state.analyticsEvents,
        { event, payload, timestamp: new Date().toISOString() },
      ],
    }));
  },
}));
