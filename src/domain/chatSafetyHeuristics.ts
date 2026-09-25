export type SafetyPromptTrigger =
  | 'phone_number'
  | 'upi_payment'
  | 'external_link'
  | 'off_platform';

export interface SafetyCheckResult {
  triggered: boolean;
  triggerType?: SafetyPromptTrigger;
  patternMatched?: string;
  friendlyTitle?: string;
  friendlyMessage?: string;
  detectedSnippet?: string;
}

/**
 * Pure domain heuristics for gentle client-side safety prompts in conversations.
 * Detects phone numbers, UPI/payment requests, external links, and off-platform migration phrases.
 * Never silently blocks messages—enables calm, informed user agency (MSG-06).
 */
export class ChatSafetyHeuristics {
  // 1. Phone number heuristics (Indian mobile numbers, spaced digits, disguised digits)
  private static readonly PHONE_REGEXES = [
    /(?:\+?91[-\s]?)?[6-9]\d{9}\b/i,
    /\b[6-9]\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/i,
    /\b\d{5}[-\s]\d{5}\b/i,
    /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)(?:\s+(?:zero|one|two|three|four|five|six|seven|eight|nine)){6,}\b/i,
  ];

  // 2. UPI / payment request heuristics
  private static readonly UPI_HANDLE_REGEX =
    /\b[\w.-]+@(?:okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|apl|upi|axisbank|icici|sbi|postbank|kotak|ibl)\b/i;

  private static readonly PAYMENT_PHRASES = [
    /\bupi:\/\/pay\b/i,
    /\b(?:gpay|google\s*pay|phonepe|paytm|bhim)\s+(?:me|karo|number|id|pe)\b/i,
    /\b(?:send|transfer|pay)\s+(?:advance|deposit|money|cash|rs\.?|inr|tokens?)\b/i,
    /\b(?:send|pay)\s+(?:on|via|through)\s+(?:gpay|phonepe|paytm|upi)\b/i,
    /\bqr\s*code\s+for\s+payment\b/i,
  ];

  // 3. External link heuristics
  private static readonly LINK_REGEX =
    /\b(?:https?:\/\/|www\.)[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?\b/i;

  private static readonly SUSPICIOUS_DOMAINS = [
    /\b(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|shorturl\.at)\/[a-zA-Z0-9_-]+\b/i,
  ];

  // 4. Off-platform migration heuristics
  private static readonly OFF_PLATFORM_PATTERNS = [
    /\b(?:talk|chat|message|ping|text|connect|continue)\s+(?:on|over)\s+(?:whatsapp|telegram|insta(?:gram)?|snap(?:chat)?|signal)\b/i,
    /\b(?:let'?s\s+move|switch\s+to|come\s+to|move\s+to)\s+(?:whatsapp|telegram|insta(?:gram)?|snap(?:chat)?|signal)\b/i,
    /\b(?:my\s+)?(?:whatsapp|telegram|insta(?:gram)?|snap(?:chat)?)\s+(?:handle|username|id|number|is)\b/i,
    /(?:https?:\/\/)?(?:t\.me|wa\.me)\/[a-zA-Z0-9_+.-]+/i,
    /\b(?:add|follow|dm|reach)\s+me\s+(?:on\s+)?(?:insta(?:gram)?|snap(?:chat)?|telegram|whatsapp)\b/i,
    /\b(?:snap|insta)\s+handle\b/i,
  ];

  /**
   * Evaluates message content against safety heuristics.
   */
  static evaluateMessage(text: string): SafetyCheckResult {
    if (!text || text.trim().length === 0) {
      return { triggered: false };
    }

    const trimmed = text.trim();

    // 1. Check UPI / Payment first (high financial risk)
    const upiMatch = trimmed.match(this.UPI_HANDLE_REGEX);
    if (upiMatch) {
      return {
        triggered: true,
        triggerType: 'upi_payment',
        patternMatched: upiMatch[0],
        detectedSnippet: upiMatch[0],
        friendlyTitle: 'Payment & Financial Safety Reminder',
        friendlyMessage:
          'Sharing UPI IDs or requesting advance payments in 1:1 chat can lead to financial scams. Project LIGHT never asks for direct peer payments for circle discovery.',
      };
    }

    for (const phraseRegex of this.PAYMENT_PHRASES) {
      const match = trimmed.match(phraseRegex);
      if (match) {
        return {
          triggered: true,
          triggerType: 'upi_payment',
          patternMatched: match[0],
          detectedSnippet: match[0],
          friendlyTitle: 'Payment & Financial Safety Reminder',
          friendlyMessage:
            'Asking for advance money or payment transfers before meeting in group circles is discouraged for your safety.',
        };
      }
    }

    // 2. Check Off-Platform Migration
    for (const offPlatformRegex of this.OFF_PLATFORM_PATTERNS) {
      const match = trimmed.match(offPlatformRegex);
      if (match) {
        return {
          triggered: true,
          triggerType: 'off_platform',
          patternMatched: match[0],
          detectedSnippet: match[0],
          friendlyTitle: 'Moving Off-Platform Reminder',
          friendlyMessage:
            'Staying on Project LIGHT ensures verified safety, mutual circle context, and reporting protections. Be cautious when moving conversations to third-party apps.',
        };
      }
    }

    // 3. Check Phone numbers
    for (const phoneRegex of this.PHONE_REGEXES) {
      const match = trimmed.match(phoneRegex);
      if (match) {
        return {
          triggered: true,
          triggerType: 'phone_number',
          patternMatched: match[0],
          detectedSnippet: match[0],
          friendlyTitle: 'Personal Phone Number Detected',
          friendlyMessage:
            'Sharing your personal phone number early can compromise your privacy. You can chat safely within LIGHT without revealing contact details.',
        };
      }
    }

    // 4. Check External Links
    const linkMatch = trimmed.match(this.LINK_REGEX);
    if (linkMatch) {
      return {
        triggered: true,
        triggerType: 'external_link',
        patternMatched: linkMatch[0],
        detectedSnippet: linkMatch[0],
        friendlyTitle: 'External Link Notice',
        friendlyMessage:
          'External links may lead to unverified websites. Only open links from people you know and trust in your shared circles.',
      };
    }

    for (const shortenerRegex of this.SUSPICIOUS_DOMAINS) {
      const match = trimmed.match(shortenerRegex);
      if (match) {
        return {
          triggered: true,
          triggerType: 'external_link',
          patternMatched: match[0],
          detectedSnippet: match[0],
          friendlyTitle: 'Shortened Link Notice',
          friendlyMessage:
            'Shortened links hide their destination URL. Proceed with caution to keep your account secure.',
        };
      }
    }

    return { triggered: false };
  }
}
