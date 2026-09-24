/**
 * Typed Analytics Wrapper for Project LIGHT
 * Blueprint Section 16 Event Taxonomy
 */

export interface AnalyticsEvents {
  app_opened: { app_version: string; source?: string };
  session_checked?: { authenticated: boolean };
  signup_started: { method: 'phone' | 'email' | 'google' | 'apple' };
  signup_completed: { method: string; referral?: string };
  onboarding_started: { entry?: string };
  onboarding_step_completed: { step: string; [key: string]: unknown };
  onboarding_step_skipped: { step: string; [key: string]: unknown };
  onboarding_age_blocked: { attempted_age?: number };
  onboarding_completed: { intent: string; interests_count: number; user_id?: string; zone?: string; primary_intent?: string };
  interest_selected: { interest_id: string; category: string; position?: number };
  profile_completed: { completion_pct: number; user_id?: string };
  home_viewed: { state: string; local_density_bucket?: string };
  discover_viewed: { tab: string };
  circle_viewed: { circle_id: string; source?: string };
  circle_joined: { circle_id: string; source?: string };
  circle_left: { circle_id: string; tenure_days?: number };
  community_joined: { community_id: string };
  community_created: { category: string; zone: string };
  profile_viewed: { profile_id: string; context?: string };
  connection_sent: { recipient_id: string; context?: string; intent: string };
  connection_accepted: { connection_id: string };
  connection_removed: { connection_id: string; reason_optional?: string };
  conversation_started: { connection_id: string };
  message_sent: { conversation_type: 'direct' | 'circle'; length_bucket: string };
  repeat_interaction: { context_type: string; days_since_first: number };
  event_viewed: { event_id: string };
  event_rsvp_confirmed: { event_id: string };
  event_checkin: { event_id: string };
  event_followup_completed: { event_id: string; outcome: string };
  friendship_marked: { connection_id: string };
  dating_intent_selected: { connection_id: string };
  date_plan_confirmed: { connection_id: string; venue_category: string };
  recommendation_feedback_sent: { object_type: string; reason: string };
  report_submitted: { target_type: string; category: string; severity_client?: string };
  user_blocked: { context?: string };
  safety_warning_shown: { risk_type: string };
  verification_completed: { type: string };
  subscription_started: { plan: string; price_band: string };
  subscription_cancelled: { plan: string; tenure_band: string };
  account_deleted: { reason_category: string };
}

export type EventName = keyof AnalyticsEvents;

class AnalyticsService {
  private enabled = false;
  private postHogApiKey: string | null = null;

  public init(config?: { enabled?: boolean; postHogApiKey?: string }) {
    this.enabled = config?.enabled ?? false;
    this.postHogApiKey = config?.postHogApiKey ?? null;
  }

  public track<K extends EventName>(event: K, properties: AnalyticsEvents[K]): void {
    if (!this.enabled && __DEV__) {
      // Development logging
      console.log(`[Analytics: ${event}]`, properties);
      return;
    }

    if (this.enabled) {
      if (this.postHogApiKey) {
        // PostHog adapter call (stubbed for MVP, ready for key injection)
        // posthog.capture(event, properties);
      }
      console.log(`[Analytics Event Tracked: ${event}]`, properties);
    }
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[Analytics: identify] ${userId}`, traits);
    }
  }

  public reset(): void {
    if (__DEV__) {
      console.log('[Analytics: reset]');
    }
  }
}

export const analytics = new AnalyticsService();
export default analytics;
