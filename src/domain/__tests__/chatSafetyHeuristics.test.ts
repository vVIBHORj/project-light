import { ChatSafetyHeuristics } from '../chatSafetyHeuristics';
import { IcebreakerGenerator } from '../icebreakerGenerator';
import { MockChatTransport } from '../chatTransport';
import { Message } from '../types';

describe('Phase 7: Chat Safety Heuristics & Transport Tests', () => {
  describe('MSG-06: Phone Number Heuristics', () => {
    it('detects standard Indian 10-digit mobile numbers', () => {
      const res = ChatSafetyHeuristics.evaluateMessage('Hey, call me at 9876543210');
      expect(res.triggered).toBe(true);
      expect(res.triggerType).toBe('phone_number');
      expect(res.detectedSnippet).toContain('9876543210');
    });

    it('detects +91 formatted numbers and hyphenated numbers', () => {
      const res1 = ChatSafetyHeuristics.evaluateMessage('My number is +91-9876543210');
      expect(res1.triggered).toBe(true);
      expect(res1.triggerType).toBe('phone_number');

      const res2 = ChatSafetyHeuristics.evaluateMessage('Reach me on 98765 43210');
      expect(res2.triggered).toBe(true);
      expect(res2.triggerType).toBe('phone_number');
    });

    it('detects spelled out disguised phone numbers', () => {
      const res = ChatSafetyHeuristics.evaluateMessage(
        'Ping me on nine eight seven six five four three two one zero'
      );
      expect(res.triggered).toBe(true);
      expect(res.triggerType).toBe('phone_number');
    });
  });

  describe('MSG-06: UPI / Payment Request Heuristics', () => {
    it('detects bank UPI IDs', () => {
      const handles = [
        'Pay me at aisha@okhdfcbank please',
        'Send to rohan@okaxis',
        'vikram@paytm',
        'sneha@ybl',
      ];

      for (const text of handles) {
        const res = ChatSafetyHeuristics.evaluateMessage(text);
        expect(res.triggered).toBe(true);
        expect(res.triggerType).toBe('upi_payment');
      }
    });

    it('detects payment phrases asking for advances or gpay', () => {
      const phrases = [
        'Please send advance money before Saturday',
        'GPay me for the turf booking',
        'Paytm karo for the slot',
        'Send via UPI to confirm',
      ];

      for (const text of phrases) {
        const res = ChatSafetyHeuristics.evaluateMessage(text);
        expect(res.triggered).toBe(true);
        expect(res.triggerType).toBe('upi_payment');
      }
    });
  });

  describe('MSG-06: Off-Platform Migration Heuristics', () => {
    it('detects requests to move conversation to WhatsApp/Telegram/Instagram', () => {
      const texts = [
        "Let's move to whatsapp",
        'Chat on telegram instead',
        'DM me on insta @aisha_shoots',
        'Add me on snap',
        'Check my t.me/aisharao channel',
        'wa.me/919876543210',
      ];

      for (const text of texts) {
        const res = ChatSafetyHeuristics.evaluateMessage(text);
        expect(res.triggered).toBe(true);
        expect(res.triggerType).toBe('off_platform');
      }
    });
  });

  describe('MSG-06: External Links Heuristics', () => {
    it('detects external links and shorteners', () => {
      const links = [
        'Check this portfolio https://mysite.com/gallery',
        'Join through http://external-meetup.org',
        'Open bit.ly/secret-link-123',
      ];

      for (const text of links) {
        const res = ChatSafetyHeuristics.evaluateMessage(text);
        expect(res.triggered).toBe(true);
        expect(res.triggerType).toBe('external_link');
      }
    });

    it('passes safe natural conversation messages without false positives', () => {
      const safeTexts = [
        'Looking forward to the Indiranagar photo walk tomorrow morning!',
        'See you at 8 AM at the badminton court.',
        'Which board games are we playing this weekend?',
        'Monza GP was unbelievable yesterday!',
      ];

      for (const text of safeTexts) {
        const res = ChatSafetyHeuristics.evaluateMessage(text);
        expect(res.triggered).toBe(false);
      }
    });
  });

  describe('MSG-02: Rule-Based Icebreaker Generator', () => {
    it('generates 2-3 rule-based icebreakers based on photography interest', () => {
      const chips = IcebreakerGenerator.generateSuggestions({
        sharedInterests: ['Photography', 'Street Art'],
        zone: 'Indiranagar',
        otherUserName: 'Rohan',
      });

      expect(chips.length).toBeGreaterThanOrEqual(2);
      expect(chips.length).toBeLessThanOrEqual(3);
      expect(chips.some((c) => c.includes('camera') || c.includes('photo'))).toBe(true);
    });

    it('generates badminton and coffee specific icebreakers', () => {
      const chips = IcebreakerGenerator.generateSuggestions({
        sharedInterests: ['Badminton', 'Artisan Coffee'],
        zone: 'Koramangala',
        otherUserName: 'Sneha',
      });

      expect(chips.length).toBeGreaterThanOrEqual(2);
      expect(chips.some((c) => c.includes('play') || c.includes('court') || c.includes('coffee'))).toBe(true);
    });
  });

  describe('Realtime ChatTransport & Privacy Analytics', () => {
    it('publishes and delivers messages to subscribers', async () => {
      const transport = new MockChatTransport();
      const received: Message[] = [];

      const unsubscribe = transport.subscribe('conv_test_1', (msg) => {
        received.push(msg);
      });

      const sampleMsg: Message = {
        id: 'msg_1',
        conversationId: 'conv_test_1',
        senderId: 'user_1',
        senderName: 'Aisha',
        body: 'Hello world',
        createdAt: new Date().toISOString(),
        moderationState: 'clean',
        status: 'sending',
      };

      const result = await transport.publish(sampleMsg);
      expect(result.success).toBe(true);
      expect(result.message.status).toBe('sent');
      expect(received.length).toBe(1);
      expect(received[0].body).toBe('Hello world');

      unsubscribe();
    });

    it('enforces rate limits on rapid message bursts', async () => {
      const transport = new MockChatTransport({ rateLimitMaxMessages: 3, rateLimitWindowMs: 5000 });

      const msg = (id: string): Message => ({
        id,
        conversationId: 'conv_1',
        senderId: 'user_spammer',
        senderName: 'Spammer',
        body: `Spam #${id}`,
        createdAt: new Date().toISOString(),
        moderationState: 'clean',
      });

      expect((await transport.publish(msg('1'))).success).toBe(true);
      expect((await transport.publish(msg('2'))).success).toBe(true);
      expect((await transport.publish(msg('3'))).success).toBe(true);

      const fourth = await transport.publish(msg('4'));
      expect(fourth.success).toBe(false);
      expect(fourth.rateLimited).toBe(true);
    });

    it('calculates privacy-safe message length buckets without saving content', () => {
      expect(MockChatTransport.getLengthBucket('Hi!')).toBe('short');
      expect(
        MockChatTransport.getLengthBucket(
          'See you tomorrow at 8 AM at the Indiranagar photo walk. Bringing my 35mm film camera.'
        )
      ).toBe('medium');
      expect(MockChatTransport.getLengthBucket('A'.repeat(200))).toBe('long');
    });
  });
});
