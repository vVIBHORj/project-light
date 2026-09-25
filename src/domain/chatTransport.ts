import { Message } from './types';

export type TransportListener = (message: Message) => void;

export interface ChatTransportOptions {
  rateLimitMaxMessages?: number;
  rateLimitWindowMs?: number;
}

export interface SendMessageResult {
  success: boolean;
  message: Message;
  error?: string;
  rateLimited?: boolean;
}

/**
 * ChatTransport provides the real-time messaging transport interface.
 * Implemented with in-memory timers/event dispatchers for mock phase,
 * directly swappable for Supabase Realtime in Phase 13.
 */
export interface IChatTransport {
  subscribe(conversationId: string, listener: TransportListener): () => void;
  publish(message: Message): Promise<SendMessageResult>;
  checkRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number };
}

export class MockChatTransport implements IChatTransport {
  private listeners: Map<string, Set<TransportListener>> = new Map();
  private userSendTimestamps: Map<string, number[]> = new Map();
  private maxMessages: number;
  private windowMs: number;

  constructor(options?: ChatTransportOptions) {
    this.maxMessages = options?.rateLimitMaxMessages || 5;
    this.windowMs = options?.rateLimitWindowMs || 10000; // 10s window
  }

  subscribe(conversationId: string, listener: TransportListener): () => void {
    if (!this.listeners.has(conversationId)) {
      this.listeners.set(conversationId, new Set());
    }
    const set = this.listeners.get(conversationId)!;
    set.add(listener);

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(conversationId);
      }
    };
  }

  checkRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const timestamps = this.userSendTimestamps.get(userId) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxMessages) {
      const oldestInWindow = validTimestamps[0];
      const retryAfterMs = Math.max(0, this.windowMs - (now - oldestInWindow));
      return { allowed: false, retryAfterMs };
    }

    return { allowed: true };
  }

  recordSend(userId: string) {
    const now = Date.now();
    const timestamps = this.userSendTimestamps.get(userId) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);
    validTimestamps.push(now);
    this.userSendTimestamps.set(userId, validTimestamps);
  }

  async publish(message: Message): Promise<SendMessageResult> {
    const rateCheck = this.checkRateLimit(message.senderId);
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: {
          ...message,
          status: 'failed',
          errorReason: `Rate limit reached. Please wait ${Math.ceil(
            (rateCheck.retryAfterMs || 1000) / 1000
          )}s.`,
        },
        error: 'RATE_LIMITED',
        rateLimited: true,
      };
    }

    this.recordSend(message.senderId);

    // Simulate network delivery
    const deliveredMessage: Message = {
      ...message,
      status: 'sent',
      isOptimistic: false,
    };

    // Notify active subscribers
    const listeners = this.listeners.get(message.conversationId);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(deliveredMessage);
        } catch {
          // ignore subscriber errors
        }
      });
    }

    return {
      success: true,
      message: deliveredMessage,
    };
  }

  /**
   * Helper to compute message length bucket for privacy-safe analytics
   */
  static getLengthBucket(body: string): 'short' | 'medium' | 'long' {
    const len = (body || '').length;
    if (len < 30) return 'short';
    if (len <= 150) return 'medium';
    return 'long';
  }
}

export const chatTransport = new MockChatTransport();
