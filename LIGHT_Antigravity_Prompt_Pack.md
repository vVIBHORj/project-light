# LIGHT — Antigravity Build Prompt Pack

A step-by-step prompt sequence for building the LIGHT app in Google Antigravity, from the first splash screen through account deletion and admin tooling.

**Sources of truth**
- `docs/LIGHT_blueprint.md` → behaviour, screen IDs, data model, APIs, analytics, safety (converted from your Word document)
- `docs/design/light_concept.webp` → visual language (the happn-style glass / sky-blue mockup)

---

## 0. How to use this pack

1. Create an empty project folder and open it in Antigravity.
2. Add the two source files above. Put your mockup image at `docs/design/light_concept.webp`. Also attach it to your first message.
3. Paste **Part A (Master Rules)** into the project rules file (`AGENTS.md`, `GEMINI.md`, or the `.agent/rules` folder, whichever your Antigravity version uses) so every agent session inherits it.
4. Paste **Phase 0 to Phase 14 one at a time**, in order. Do not paste them all at once.
5. For each phase: let the agent write an implementation plan, review it, approve, and let it build. Then have the browser agent open the web build at a 390×844 viewport and screenshot every screen from that phase. Fix issues before moving on, and commit.
6. UI is built first against a mock data layer (Phases 0 to 12) so you can see and click everything early. The real backend is swapped in at Phase 13.

### Adaptation decisions already made (so the agent doesn't fight itself)

| Mockup shows | LIGHT does instead (blueprint wins on behaviour) |
|---|---|
| "92% Match" chip | 2 to 4 **reason chips** ("3 shared interests", "Both free Sunday evening") |
| "200m away", live radar of people | **Zone + distance bands** ("2 to 5 km"); radar shows Circles and activities, never people |
| Like / skip swipe cards | Connect / Save / Not relevant on context cards; no swipe deck |
| Tabs: Home, Explore, orb, Likes, Profile | Home, Discover, **Orb = Circles**, Messages, Me |
| Dating-first copy | Friendship, Dating, Community, Explore are equal intents |
| Big full-bleed photo cards everywhere | Big photo only on Welcome and the Home "Next up" hero; elsewhere compact rounded cards |

---

# PART A — MASTER RULES (paste into project rules)

```text
You are a senior React Native engineer and product designer building "LIGHT", an India-first relationship-formation app.

SOURCES OF TRUTH
- docs/LIGHT_blueprint.md is authoritative for product behaviour, screen IDs (AUTH-, ONB-, PROF-, HOME-, DISC-, COMM-, CONN-, MSG-, EVENT-, SAFE-, SET-, ADMIN-), data model (section 14), APIs (section 15), analytics events (section 16), QA (section 17), empty/error copy (section 18) and account lifecycle (section 19).
- docs/design/light_concept.webp is authoritative for visual language only: glassmorphism, sky-blue gradients, glossy 3D category icons, dark navy center orb, playful sticker display type, pill buttons, rounded cards.
- If they conflict, the blueprint wins on content and behaviour; the concept image wins on look and feel.
- Before each phase, re-read the relevant blueprint sections and cite the screen IDs you implement.

PRODUCT RULES (NON-NEGOTIABLE)
1. 18+ only. Under-18 goes to the SAFE-08 hold screen.
2. Never show a compatibility percentage. Show 2 to 4 concrete "reason chips" derived from real stored signals.
3. Never collect or show exact GPS or precise distance. Use city + zone + distance bands only.
4. No unsolicited 1:1 DMs. 1:1 chat unlocks only after a mutual connection or an accepted, context-bearing message request.
5. No infinite feed, swipe deck, streaks, public follower counts, popularity scores, or "someone is waiting for you" fake urgency.
6. Intents (Friendship, Dating, Community, Explore) are a layer over one social graph. Dating visibility follows the intent rules in blueprint 0.3 and 3.1.
7. One primary CTA per screen. Destructive actions are visually separated.
8. Report / Block / Restrict is reachable from every profile, message, post and community.
9. Calm, direct, non-shaming copy. English by default, with an i18n string catalog ready for Hinglish. No hard-coded UI strings in components.
10. Every screen implements: default, loading (skeleton), empty, error, offline, permission-denied, and restricted states where applicable. Use the copy patterns in blueprint section 18.
11. Fire analytics events named exactly as in blueprint section 16 through a single analytics wrapper.
12. If a feature does not improve discover → interact → repeat → connect (blueprint 26.1), do not build it. Respect the "DO NOT BUILD IN FIRST 6 MONTHS" list (21.5).

TECH STACK (default; ask before deviating)
- Expo (latest stable SDK) + TypeScript strict + Expo Router (file-based routing), with web enabled via react-native-web so the Antigravity browser agent can verify screens.
- Styling: StyleSheet plus a typed theme-token module. No Tailwind.
- Libraries: react-native-reanimated, react-native-gesture-handler, expo-blur, expo-linear-gradient, react-native-svg, lucide-react-native, expo-image, expo-image-picker, expo-secure-store, expo-notifications, expo-font (@expo-google-fonts/chewy and @expo-google-fonts/inter), zustand, @tanstack/react-query, react-hook-form + zod, i18next.
- Backend (introduced in Phase 13): Supabase (Postgres + RLS, Auth, Realtime, Storage, Edge Functions). Analytics: PostHog behind a wrapper.
- Tests: Jest + React Native Testing Library; unit tests mandatory for ranking, permissions and state machines.

ARCHITECTURE
- Feature folders: src/features/{auth,onboarding,profile,home,discover,circles,connections,messages,events,safety,settings,admin}.
- Shared: src/design-system (tokens + components), src/data (repositories), src/domain (types, state machines, ranking), src/lib (analytics, i18n, storage, permissions), src/mocks (seed data).
- Data access ONLY through repository interfaces (e.g. CircleRepository, ProfileRepository). Phases 0 to 12 use an in-memory mock implementation with latency simulation and failure injection; Phase 13 adds the Supabase implementation behind the same interfaces. Screens never import mock data directly.
- Mock/seed data: realistic Bengaluru launch zone (Indiranagar, Koramangala, HSR Layout, Jayanagar, Malleshwaram, Whitefield), ~40 diverse Indian users, ~10 communities, ~24 Circles (photography, badminton, indie music, films, F1, board games, running, cafés, book club, hiking), ~10 events. Use illustrated or gradient-initial avatars and stock-style placeholder images; never real people's photos.

DESIGN SYSTEM (from the concept image; implement as tokens in src/design-system/tokens.ts)
Color
- Sky gradient bg: #DDEBFB → #BBD6F8 → #A9C4F5 (top to bottom). Home header gradient: #C9F0FF → #8EC5FF.
- Primary blue #2F80ED; verified badge #2D9CFF; card photo overlay tint #4A90E2 at 55 to 60%.
- Text primary #0B0F1A; secondary #6B7280; link/job-title blue #2F80ED; on-photo text #FFFFFF.
- Intent colors (always paired with icon + label, never color alone): Friendship green #34C759, Dating coral #FF6B5B, Community blue #2F80ED, Explore violet #8B5CF6.
- Safety accent (visually distinct from brand blue): teal #0E9F8E. Destructive: #E5484D.
- Orb navy #0A1A4A with #3B82F6 rim glow and a white ring.
- Glass surface: rgba(255,255,255,0.45), blur ~24 (expo-blur intensity ~40), 1px border rgba(255,255,255,0.7), soft inner top highlight. On Android or web without blur, fall back to rgba(255,255,255,0.75).
Typography
- Display / sticker (hero words only): Chewy, white with a 3 to 4px navy (#0A1A4A) stroke plus drop shadow, rotated about -5°.
- UI: Inter. Screen title 24/700, section 20/600, body 16/400 (line-height 1.4), caption 13/400, chip/label 12/500, tab label 11/500.
Shape & spacing
- Cards radius 28; bottom sheets 32 top radius; buttons fully pill (999); icon buttons 44px circles; category icons 56px glossy squircles; avatars circular; profile thumbnails 64px rounded squares.
- Screen padding 16; spacing scale 4/8/12/16/24/32. Touch targets at least 44×44.
- Shadows: phone-level 0 12 40 rgba(47,128,237,0.25); chip-level 0 4 16 rgba(0,0,0,0.08).
Motion
- Reduced-motion setting respected. Springs for sheets. Radar pulse 2s loop. Swipe-to-start knob drags right and the track fills black.
Icons
- lucide-react-native, 1.75 stroke, rounded. Category icons are custom glossy 3D squircles built in SVG (gradient fill + top highlight + soft shadow), not emoji.
Core components to build (blueprint 24.2 + concept)
GradientBackground, GlassCard, GlassIconButton, PillButton (primary/secondary/ghost/destructive), SwipeToStart, TabBar with center Orb, Orb, CategoryIcon3D, InterestChip, IntentPill, ReasonChip, VerifiedBadge, Avatar, ContextCard, PersonCard, CircleCard, EventCard, StatCard, SafetySheet, ConnectionPrompt, ModerationBanner, BottomSheet, RadarView, OnboardingProgress, OTPInput, EmptyState, ErrorState, OfflineBanner, Skeleton, Toast.
Bottom tab bar: frosted white, 5 items: Home, Discover, Orb (Circles), Messages, Me. Active tab uses a filled dark icon plus bold label.

WORKING METHOD FOR EVERY PHASE
1. Produce a short implementation plan (files, components, routes, risks) and wait for approval.
2. Build. Keep files small and typed. No TODO placeholders that break the flow.
3. Run the web build. With the browser agent at 390×844, navigate every screen of the phase in every state and capture screenshots.
4. Compare screenshots against docs/design/light_concept.webp for visual fidelity (blur, gradients, radii, type). Fix differences.
5. Run lint, typecheck and tests. Write or update tests for logic.
6. Finish with a walkthrough artifact: screens implemented (IDs), what is mocked, what's next, known gaps. Then stop and wait.
```

---

# PART B — PHASE PROMPTS (paste one at a time)

## Phase 0 — Foundation, design system, navigation shell

```text
PHASE 0 — FOUNDATION

Read docs/LIGHT_blueprint.md sections 0, 2, 3, 11 and 24, and study docs/design/light_concept.webp closely.

Goal: a running Expo + TypeScript + Expo Router app (mobile + web) with the complete design system, the empty navigation shell, the mock data layer skeleton and tooling. No product screens yet.

Build:
1. Project scaffold with strict TypeScript, ESLint, Prettier, path aliases, Jest + RNTL, environment config, and folder structure from the master rules.
2. src/design-system/tokens.ts with all colors, gradients, typography, radii, spacing, shadows, motion (from master rules). Load Chewy and Inter with expo-font and block splash until loaded.
3. All core components listed in the master rules, each with variants and states. Highlights:
   - GradientBackground (sky preset, home preset, photo-overlay preset)
   - GlassCard / GlassIconButton with BlurView plus fallback
   - PillButton: primary is near-black (#0B0F1A) with white text as in the "Get Started" button; secondary is glass; ghost; destructive
   - SwipeToStart: 52px pill on a translucent track, white circular knob with an arrow at left, centered label; drag right with gesture handler and reanimated; the track fills black as it progresses; on release past 85% it completes, else it springs back; accessible alternative (double tap activates)
   - Orb: 3D glossy dark-navy sphere (SVG radial gradients), blue rim glow, white ring, subtle idle glow pulse
   - CategoryIcon3D: 56px glossy squircle with gradient fill, top highlight, soft colored shadow; accepts a Lucide glyph and a color scheme (blue, purple, green, orange, red)
   - TabBar: frosted white bar, 5 items, center Orb slightly raised
   - ReasonChip (small glass pill with a leading spark icon), IntentPill (icon + label), VerifiedBadge (blue check badge), StatCard (soft grey card with icon, bold value, caption)
   - BottomSheet with drag handle, 32 top radius, snap points
   - Skeleton, EmptyState, ErrorState, OfflineBanner, Toast
4. A hidden dev route /_gallery that renders every component in every state on the sky gradient so visual fidelity can be reviewed. Screenshot it at 390×844.
5. Navigation: root layout with an auth gate (stubbed), (auth) group, (onboarding) group, and (tabs) group with placeholder screens for Home, Discover, Circles (Orb), Messages, Me. Tab bar exactly as the concept (orb in the center).
6. Data layer skeleton: repository interfaces + in-memory mock implementations + latency/failure injection + seed loader. Zustand stores for session and app state. TanStack Query provider.
7. lib/analytics.ts wrapper with a typed event catalog containing every MVP event from blueprint section 16 (console + PostHog adapter, off by default).
8. lib/i18n with en catalog and a hi-Latn stub. lib/permissions with helpers for the intent-visibility and connection-eligibility rules from blueprint 0.3 and 3.1 (pure functions with unit tests).

Acceptance: app runs on web at 390×844; /_gallery matches the concept's glass look; tab bar with orb navigates between 5 placeholder screens; typecheck, lint and tests pass.
```

## Phase 1 — Splash, Welcome, Authentication (AUTH-01 to AUTH-08)

```text
PHASE 1 — SPLASH, WELCOME, AUTH  (blueprint section 5: AUTH-01..AUTH-08, section 15 auth endpoints, section 17 AUTH tests)

Build these screens using the design system and the concept image's first phone as the visual reference for Welcome.

AUTH-01 Splash / Session Check
- Sky gradient, centered "light" wordmark with a location-pin logo whose dot glows; minimal fade/scale motion. Calls session bootstrap (mock GET /session and /config/bootstrap): routes to Welcome (new), Home (returning), SAFE-08 (restricted/age hold), a maintenance screen, or a forced-update screen. Error state: retry + offline message. Expired token routes to Login.

AUTH-02 Welcome (recreate the concept's onboarding phone)
- Full-bleed saturated blue-sky photo (placeholder asset slot in assets/images/welcome-hero.png plus a cut-out subject asset slot). Layers from back to front: sky photo → giant translucent frosted letters "LIGHT" (chunky rounded, white at ~35% opacity) → cut-out subject overlapping the letters → sticker text.
- Top center: small white "light" wordmark with pin logo.
- Sticker headline "FIND YOUR PEOPLE" in Chewy, white with thick navy outline and shadow, rotated about -5°, with small hand-drawn doodle dashes (SVG) near the first word.
- Bottom sheet (frosted white to light blue, 32 radius): heading "Your people are closer than you think" in dark Chewy; subtitle "Join small local Circles around what you love. Friendship, dating or just exploring, at your pace."; three proof chips ("Small Circles of 4 to 8", "Verified adults only", "You set the pace"); SwipeToStart with "Get Started" → AUTH-03; text link "I already have an account" → AUTH-04; footer link "How we keep you safe" → Safety & privacy explainer.
- Log consent_version_viewed.

AUTH-03 Create Account
- Phone (+91 default with country picker) or email tab; required consent checkbox linking ToS + Privacy; separate optional marketing consent OFF by default; optional referral code. Validation with zod. Duplicate identifier routes to login without revealing account details. Rate limiting simulated.
AUTH-05 OTP Verification
- 6-box OTPInput with paste and autofill support, 30s resend timer, attempt counter, lockout message after repeated failures, expired-code path. Mock OTP is 123456 (configurable). Success creates a session (stored via expo-secure-store) and continues to onboarding.
AUTH-04 Login
- Identifier → OTP flow; "Trouble signing in?" → AUTH-06.
AUTH-06 Account Recovery
- Recovery challenge, generic responses that don't reveal whether an account exists.
AUTH-07 Suspicious Login / Security Challenge
- Triggered by a mock risk flag: explains what happened calmly, requires re-verification, offers "Not me" → secure account.
AUTH-08 Session / Device Management
- List sessions (device, city-level location, last active), revoke one or all others. Route it under Me → Settings → Security (wired fully in Phase 10) but build the screen and repository now.

Root auth gate: unauthenticated users can only see (auth); authenticated but not onboarded users go to onboarding; blocked users go to SAFE-08.
Analytics: app_opened, session_checked, signup_started, signup_completed.

Acceptance: full happy path Splash → Welcome → Create account → OTP → (onboarding placeholder); wrong OTP, expired OTP, duplicate account, network error and lockout states all reachable and screenshotted; Welcome visually matches the concept's first phone in layout, layering, sticker text and swipe button.
```

## Phase 2 — Onboarding & activation (ONB-01 to ONB-09 + photo + verification opt-in)

```text
PHASE 2 — ONBOARDING  (blueprint sections 4, 5 ONB-01..09, 7 data contract, 4.1 activation)

Design: one focused question per screen on the sky gradient. A glass OnboardingProgress bar at the top (step X of N) plus a back arrow. Large tap targets, one primary pill CTA at the bottom, "Skip" only where the blueprint allows. Progress persists locally and server-side (mock) so users can resume after closing the app. Never lose input on error.

Screens:
ONB-01 Age Gate — date-of-birth picker. Under 18 → SAFE-08 hold with support and appeal route; store only what is needed. Include an age-assurance step stub (provider interface) for later. Analytics on completion.
ONB-02 Identity Basics — display name (required), gender (optional, inclusive options + "Prefer not to say"), languages (English, Hindi, Kannada, Tamil, Telugu, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Hinglish; multi-select).
ONB-03 Intent — four large glass cards with IntentPill icons: Friendship, Dating, Community, Explore / Undecided. Pick a primary intent (required; "Not sure? Choose Explore") plus optional secondary. A short line under each explains who can see you. If Dating is selected, show an optional mini-step for dating preferences with an explicit consent version (blueprint: sensitive preferences only when necessary and user-controlled).
ONB-04 Interests — controlled taxonomy (seed ~70 across Sports, Music, Movies & Shows, Food & Cafés, Outdoors, Creative, Tech, Games, Wellness, Books, Travel, Learning). Category tabs + search, InterestChips with selected state, live counter. Minimum 5 required for activation, max 15. Explain why ("This is how we find your first Circles").
ONB-05 Taste Fingerprint — optional pickers for music, movies, books, games from a small mock catalog (no penalty for skipping; V2 will use licensed metadata).
ONB-06 Social Style — preferred group size (2 to 3, 4 to 6, 6 to 8, any), activity-first vs chat-first, energy (quiet / balanced / lively), pace of getting to know people. All optional with conservative defaults.
ONB-07 Availability & Lifestyle — grid of days × slots (weekday mornings/evenings, weekend morning/afternoon/evening); optional lifestyle comfort chips (student/working, alcohol-free events, vegetarian-friendly, early bird/night owl).
ONB-08 Location & Discovery Radius — manual city then zone selection; optional "use approximate location" that only resolves to a zone and never stores coordinates; radius as bands (Within 2 km, 5 km, 10 km, Anywhere in city). Exact GPS is never required.
ONB-09 Privacy / Discovery Controls — who can discover me (eligible users only by default), show age band, show zone, message-request preference, community-only mode. Conservative defaults, all reversible later in Settings.
Profile Photo — required before person discovery, optional for community-only browsing. Guidelines sheet (clear face, no minors, no other people's photos), image picker, crop, moderation_state = pending with a "reviewing" badge. Users may skip and browse communities.
Short bio (optional, 140 chars) + Profile Preview (PROF-03 style card exactly as others will see it).
Optional Verification prompt (deep-links to PROF-04 in Phase 10; stub CTA now) — skippable.
Activation check — if fewer than 5 interests, block activation and explain; otherwise a celebratory glass screen "Your first Circles are ready" that routes to Home. Set user.activated only after the blueprint 4.1 definition (profile minimum + at least one high-intent social action) and track onboarding_completed and profile_completed; activation itself is tracked once the first Circle join/RSVP happens.

Data: implement the public/private/matching-only/sensitive field classes from blueprint 7.1 in the domain types so private fields can never be returned by public-profile selectors (add a unit test).

Acceptance: complete onboarding end-to-end and land on Home; resume mid-flow; under-18 path; fewer-than-5-interests path; offline and error states; all data stored through repositories.
```

## Phase 3 — App shell, Home, Circle Hub, Follow-up Hub (HOME-01 to HOME-03)

```text
PHASE 3 — HOME  (blueprint HOME-01..03, section 11.1 "Home must not become an infinite feed")

HOME-01 Home / This Week — use the concept's second phone as the visual reference.
- Header on a sky-cyan gradient: circular user avatar; small grey "Good morning 👋" (time-aware greeting) above bold user name; right side: a glass pill "Around you" (map-pin icon → opens the radar view in Discover, Phase 4) and a circular glass bell button (→ notification center).
- Category row of five CategoryIcon3D glossy squircles with 12px labels: All (blue, people), New (purple, sparkle), This week (green, calendar), Today (orange, sun), Saved (red, bookmark). Selected state = bold label + raised icon. Filters the content below.
- "Next up" hero card (28 radius, blue-tinted photo, glass chips): top-left "New" or "Starts in 2 days" chip, top-right glass ReasonChip (e.g. spark + "3 shared interests"), bottom-left white title + host name with VerifiedBadge + zone, three glass pill tags (activity, time, group size). Right edge: vertical stack of glass circular buttons: Chat (opens Circle chat), RSVP, Save, Not relevant. NO match percentage and NO exact distance. Ghosted large text behind is optional decoration ("SEE YOU THERE").
- Below: "Your Circles" horizontal CircleCards (with next meet), "Suggested for you" ContextCards each with a "why this" line, and a single "Next action" card driven by state (finish profile, join first Circle, RSVP, follow up after an event). Bounded content, no infinite scroll.
- Low-density state (blueprint 18 "No nearby users" pattern): friendly EmptyState with CTAs "Expand area" and "Browse communities".
HOME-02 Active Circle Hub — Circle header, next meet with RSVP, "prompt of the week" icebreaker, members row (avatars, names, verification), latest chat preview, activity checklist; host-only quick actions.
HOME-03 Post-Event Follow-up Hub — pending follow-ups after events ("Stay in touch with Riya?": Connect / Not now / Report), recap link, feedback prompt.

Wire tab navigation, badge counts on Messages, pull-to-refresh, skeletons. Analytics: home_viewed (state, local_density_bucket), circle_viewed.

Acceptance: Home matches the concept's second phone in structure, glass and gradient; all five category filters work; empty/low-density, loading and error states screenshotted.
```

## Phase 4 — Discover (DISC-01 to DISC-08 + "Around you" radar)

```text
PHASE 4 — DISCOVER  (blueprint DISC-01..08, section 8 recommendation UX, section 11.2 search)

DISC-01 Discover Landing — global search bar (glass) plus filter chips row (All, Circles, People, Activities; the row scrolls horizontally like the concept's map filter chips), and sections. A toggle "List | Around you" switches to the radar view.
"Around you" radar view (adapted from the concept's third phone, privacy-safe):
- Airy white-to-sky-blue gradient, a circular radar with concentric thin blue rings labeled as distance BANDS ("Within 2 km", "2 to 5 km", "5 to 10 km"), faint street-map lines, a radial glow, and a glowing blue dot for "You" with a pulse halo (2s loop). Circle and activity bubbles (round 40px cover images, white border, small blue pill with the member count or "3 spots left") sit on the ring for their band at deterministic pseudo-random angles. NEVER plot people and NEVER show exact distances.
- Tapping a bubble opens a bottom sheet like the concept's map sheet: 64px rounded-square thumbnail, Circle name, host with VerifiedBadge, activity, zone (e.g. "Indiranagar"), three StatCards ("2 to 5 km away", "3 spots left", "Sat, 7:30 AM"), "About" text, primary CTA "Join Circle" / "Request to join", and a Save heart.
DISC-02 Circle Recommendations — CircleCards with reason chips, next meet, size, area, host signal.
DISC-03 People Recommendations — PersonCards: compact 72px rounded-square photo, name, age band, VerifiedBadge, zone, 3 to 4 ReasonChips, a one-line context ("Both in Sunday Photography Circle"), actions: Connect (only when shared context exists; otherwise "Say hi in a Circle"), Save, Not relevant. Never full-screen photo cards, never popularity numbers. Profiles without a photo are excluded from person discovery.
DISC-04 Activity / Event Discovery — EventCards with date, zone, capacity state, host, price band; filter by date, category, cost.
DISC-05 Interest Explore — browse by interest taxonomy, showing local Circles and communities for it.
DISC-06 Recommendation Explanation — bottom sheet listing the exact stored signals behind a recommendation (shared interests, availability overlap, group-size fit, shared Circle). No psychological inference. Include "Show fewer like this".
DISC-07 Discovery Filters — bottom sheet: intent, age band, area/zone, radius band, day/time, group size, price band, verified only.
DISC-08 Save / Not Relevant Queue — two tabs with undo; "Not relevant" opens a reason picker (Not my interest / Wrong time / Too far / Not comfortable / Other) that posts recommendation feedback.
Search: covers Communities, Circles, Events and bounded People search (only eligible, discoverable users; no global directory). Preserve the query in empty results and offer "Clear filters".

Use the repository layer with stub ranking for now (a simple interest-overlap sort) behind a RankingService interface; the real ranking arrives in Phase 12. Hard filters must already work: blocked users, intent mismatch and under-18 are never returned.

Analytics: discover_viewed, profile_viewed, circle_viewed, recommendation_feedback_sent.
Acceptance: list and radar views work; blocked or intent-mismatched candidates never appear (test); low-density graceful expansion; screenshots of radar and sheet match the concept's map phone in feel while using bands.
```

## Phase 5 — Circles & Communities (COMM-01 to COMM-10)

```text
PHASE 5 — CIRCLES & COMMUNITIES  (blueprint COMM-01..10, section 9 governance, section 3.1 objects)

The center Orb tab opens "Circles" with a glass segmented control: My Circles | Communities. A Circle is the primary social unit (4 to 8 people, tied to an activity); a Community is a larger interest/location space.

COMM-01 Community Directory — category chips, search, CommunityCards (cover, name, zone, "active this month", host). No public follower counts or leaderboards.
COMM-02 Community Detail — cover, description, rules preview, upcoming Circles, host with VerifiedBadge, join CTA (open) or "Request to join" (private).
COMM-03 Community Home — About, rules, upcoming Circles and events, weekly prompt, lightweight feed preview, member count (no popularity ranking).
COMM-04 Join / Approval — accept rules sheet, answers to host questions for private communities, no access before approval.
COMM-08 Approval / Pending — pending state with cancel request.
COMM-05 Feed / Threads — lightweight: host prompts, member posts, comments, reactions. Rate-limited posting, report on every item, moderation states (visible, hidden, removed by mod) shown with ModerationBanner. Not a Reddit clone: no infinite scroll, no voting, no ranking by popularity.
COMM-06 Community Chat — group chat with the standard chat UI (final chat components built in Phase 7; use a shared ChatView interface so both agree).
COMM-07 Create Community — form with controlled taxonomy (limited "other"), name/description safety check (banned-term and solicitation checks), zone or city level only (never home address), visibility (public/private), host responsibilities acceptance before publish. Dating-only language does not bypass the intent system. Submits for approval in mock.
Circle creation (host) — inside a community: title, activity, capacity 4 to 8, cadence (one-off/weekly/monthly), zone, first date/time, first prompt. Circle detail screen with members, next meet, prompt, chat, RSVP, leave.
COMM-09 Moderator Console (lite) — pending join requests, reported items queue, remove post, mute/ban member, all writing audit log entries.
COMM-10 Report / Leave — report community sheet, leave confirmation.

Analytics: community_created, community_joined, circle_joined, circle_left.
Rules to test: private community content invisible before approval; banned member loses access and it's audit-logged; capacity limits enforced server-authoritatively in the mock (no overbooking).

Acceptance: join a public Circle, request a private community, create a community and a Circle as host, moderate a report, leave a Circle; all empty and error states.
```

## Phase 6 — Connections (CONN-01 to CONN-06)

```text
PHASE 6 — CONNECTIONS  (blueprint CONN-01..06, section 3.2 relationship state machine)

Implement the relationship state machine as a pure, tested domain module: STRANGER → SAME INTEREST → SAME COMMUNITY → SAME CIRCLE → REPEATED INTERACTION → MUTUAL CONNECTION → FRIEND / ACTIVITY PARTNER → [OPTIONAL] DATING, with MUTE / RESTRICT / BLOCK / REPORT available at any point.

CONN-01 Connect Request — bottom sheet from a profile: shows the shared context (required), optional short note, and the intent of the request (Friend / Activity partner / Dating, dating only if both intents permit). One primary CTA "Send request".
CONN-02 Connection Decision — recipient sees who, the shared context and a ConnectionPrompt; Accept / Decline / Restrict. Accept unlocks a 1:1 conversation with a context banner. Decline is silent and non-shaming.
CONN-03 Connections List — grouped by state (Friends, Activity partners, Dating, Pending), with the shared context for each.
CONN-04 Friendship Progression — suggested next shared activity ("Join Saturday's badminton together"), mark as Friend, invite to Circle.
CONN-05 Dating Progression — only when both users have mutually opted into dating; explicit two-sided opt-in with clear language; one-sided opt-in remains a non-dating connection and the other person is never told who declined; leads to date planning (Phase 8).
CONN-06 Remove / Unmatch — confirmation, optional reason, ends chat access; block/report shortcuts.

Analytics: connection_sent, connection_accepted, connection_removed, friendship_marked, dating_intent_selected.
Tests: mutual accept unlocks chat; one-sided dating stays non-dating; blocked users cannot send requests; intent eligibility.

Acceptance: send, accept, decline, friend-mark, dating opt-in (both sides), remove flows all work through the repository with correct permissions.
```

## Phase 7 — Messages (MSG-01 to MSG-06)

```text
PHASE 7 — MESSAGES  (blueprint MSG-01..06, section 10 threat controls)

Chat visual language: incoming bubbles white glass; outgoing bubbles primary-blue gradient with white text; 20px radius with a tighter corner; sky-gradient background; glass composer with attach and send circular buttons.

MSG-01 Inbox — segments: Circles | Connections | Requests. Unread badges, last message preview, context tag on each thread. Empty state (blueprint 18): "Your conversations start after a mutual connection." with CTA "Discover Circles".
MSG-02 1:1 Conversation — top context banner ("You met in Sunday Photography Circle") plus 2 to 3 rule-based icebreaker suggestion chips built from real shared context (no AI-written messages). Message states (sending/sent/failed with retry), timestamps grouped by day, long-press for report/copy/delete-for-me. Disabled composer if either side blocks.
MSG-03 Circle / Group Chat — sender names and avatars, pinned prompt of the week, event announcements as system cards, mention support, mute option.
MSG-04 Message Request / Permission — for community-context requests: recipient sees sender profile, context and message, and can Accept / Decline / Block; no reply possible until accepted.
MSG-05 Media Picker — image sharing only in MVP (with moderation_state and unsafe-image placeholder); voice notes visible but disabled with "Coming soon" (V2).
MSG-06 Conversation Safety Prompt — client heuristics that gently interrupt when a message contains a phone number, UPI/payment request, external link, or asks to move off-platform: calm sheet with "Keep chatting" / "Report" / "Learn more". Never silently block.

Realtime: build against a ChatTransport interface (mock timers now, Supabase Realtime in Phase 13). Rate limit sending. Support optimistic updates and offline queue.
Analytics: conversation_started, message_sent (length bucket only, never content).
Tests: blocked sender disables send; message request gating; safety prompt patterns.

Acceptance: send and receive in 1:1 and group, accept a request, trigger a scam-pattern warning, block mid-conversation.
```

## Phase 8 — Events (EVENT-01 to EVENT-07)

```text
PHASE 8 — EVENTS  (blueprint EVENT-01..07, section 17 EVENT tests)

EVENT-01 Event Directory — EventCards (date, zone, capacity state, host, price band), filters by date/category/cost/verified host.
EVENT-02 Create Event / Activity — host form: title, activity, Circle/community link, date/time, zone + venue category (public venues recommended, exact address shared only with confirmed attendees), capacity, cost (free/low-cost; no ticketing in MVP), house rules. Validation and draft saving.
EVENT-03 Event Detail — hero image with glass chips, host with VerifiedBadge, what to expect, who's going (avatars only, no follower counts), map preview by zone (not exact until RSVP confirmed), safety notes, primary CTA RSVP.
EVENT-04 RSVP / Attendance State — Going / Waitlist / Cancelled; capacity enforced server-authoritatively in the mock (test the "last seat race"); cancel flow; add to calendar; host cancellation notifies everyone.
EVENT-05 Pre-Event Safety & Check-In — reminder checklist (public place, tell a friend, share plan with trusted contact), reveals exact venue, check-in (optional code) with offline retry queue and no false failures.
EVENT-06 Post-Event Recap / Follow-up — attendance recap, private feedback (categories + optional text), follow-up actions (Connect with someone, Join next session, Report an issue) feeding HOME-03.
EVENT-07 Date Planning — only for dating-enabled connections: propose a public venue category and time, counter-propose, mutual confirmation, safety plan offer, post-date follow-up asking whether to stay connected / become friends / continue dating / stop.

Analytics: event_viewed, event_rsvp_confirmed, event_checkin, event_followup_completed, date_plan_confirmed.

Acceptance: create → RSVP → reminder → check-in → recap → follow-up works end to end; waitlist and cancellation paths; date-plan flow only reachable for mutually dating connections.
```

## Phase 9 — Safety (SAFE-01 to SAFE-08)

```text
PHASE 9 — SAFETY  (blueprint SAFE-01..08, section 10.1 threat → control matrix)

Use the teal safety accent so safety UI is visually distinct from brand blue. Copy: calm, direct, never shaming for reporting, blocking or leaving.

SAFE-01 Safety Center — entry from Me and from every overflow menu: report, block, restrict, date safety tips, trusted contacts, case status, community guidelines, grievance officer contact (placeholder per IT Rules), emergency numbers for India (100 / 112, 1091 women helpline, 181) labelled as informational.
SAFE-02 Report User / Profile and SAFE-03 Report Message / Content — category, severity hint, optional evidence, confirmation with case ID and immediate protection option ("Limit contact with this account"). Only claim protection was applied when it actually was.
SAFE-04 Block / Restrict — explain the difference (Restrict is quiet and reversible), apply mutual visibility rules, effect on shared Circles.
SAFE-05 Date Safety — pre-date tips, share plan, check-in timer with a "Something's wrong" quick action.
SAFE-06 Trusted Contact Setup — store contact via an encrypted reference; test-share flow; consent language.
SAFE-07 Safety Case Status — timeline of a report (received → in review → action taken/no action), appeal option where allowed.
SAFE-08 Safety / Age Restriction Hold — for under-18, restricted or banned accounts: calm explanation, appeal or support route, no sensitive moderation detail.

Analytics: report_submitted, user_blocked, safety_warning_shown.
Tests: block hides both ways; restricted user can't message; report always yields a case ID; safe empty/error states from blueprint 18.

Acceptance: all safety sheets reachable from profile, message, post and community; state persisted through repositories.
```

## Phase 10 — Me: Profile, Verification, Settings, Account lifecycle (PROF-01 to 05, SET-01 to 08, section 19)

```text
PHASE 10 — ME TAB  (blueprint PROF-01..05, SET-01..08, section 19 account/subscription/deletion lifecycle)

PROF-01 Profile Home — avatar, name, VerifiedBadge, intents (IntentPills), interests, Circles joined, completeness card, shortcuts to Edit, Preview, Verification, Settings, Safety.
PROF-02 Edit Profile — photos (reorder, add, remove, moderation state), bio, interests, taste, social style, availability, zone.
PROF-03 Public Profile Preview — exactly what others see; confirm that no phone, email or exact location leaks (test).
PROF-04 Verification Center — verification tiers (photo/liveness, ID via provider interface stub), plain-language explanation of each, status per type.
PROF-05 Verification Result / Badge Explain — success, failure ("We could not complete verification." with retry and alternatives, never provider internals), what the badge means and does not mean. Do NOT show a "trust score".
SET-01 Settings Home — grouped sections, not a dumping ground.
SET-02 Privacy & Discovery — everything from ONB-09, plus pause discovery and community-only mode.
SET-03 Dating Preferences and SET-04 Friendship Preferences — editable, consent-versioned for sensitive data.
SET-05 Notification Preferences — categories and defaults from blueprint section 12 (Safety ON, Messages ON, Marketing OFF, Recommendations limited/digest).
SET-06 Blocked / Restricted Users — list with unblock/unrestrict.
SET-07 Verification & Connected Accounts — manage phone/email, no contact-list access.
SET-08 Security / Sessions — reuse AUTH-08.
Subscription (blueprint section 13 + 19.3) — a "LIGHT Plus" screen with clearly optional extras (advanced filters, host tools) and mock purchase states (active, cancelled, failed, restored). Core connection features are never paywalled and safety is never paid.
Logout — revoke session, return to Welcome.
Delete Account (19.2) — reason (optional) → consequences → data retention explanation (do not claim instant total deletion) → re-authenticate → confirm → deletion request → logout; grace-period cancel screen when applicable. Account states ACTIVE / RESTRICTED / DELETION_REQUESTED / DELETED must be enforced by the session bootstrap.

Analytics: verification_completed, subscription_started, subscription_cancelled, account_deleted.

Acceptance: edit profile and see public preview update; verification success and failure; notification toggles persisted; delete + cancel-deletion flow; logout.
```

## Phase 11 — Admin console (ADMIN-01 to ADMIN-06)

```text
PHASE 11 — ADMIN / TRUST & SAFETY CONSOLE  (blueprint ADMIN-01..06, section 20.1 roles, 17.1 security)

A separate route group /admin, web-first with a desktop layout (sidebar + tables; not phone-framed), guarded by a mock role (admin / moderator / support) with a permissions matrix. Same tokens, calmer and denser styling.

ADMIN-01 Overview — open cases, median time-to-first-action, report rate, active communities, verification backlog.
ADMIN-02 User Safety Queue — filter by severity/category, case detail with evidence (restricted access), actions: warn, restrict, ban, dismiss; every action needs a reason.
ADMIN-03 Content / Message Moderation Queue — reported items with context, take down / restore.
ADMIN-04 Verification Review — approve/reject with reason, evidence access logged.
ADMIN-05 Community Moderation — review community reports, remove moderator roles, suspend communities.
ADMIN-06 Audit / Appeals — immutable audit log, appeal review with decision trail.

Rules: every admin action writes an AuditLog entry; sensitive-data access is logged; no automatic bans without audit controls; role checks on every route and repository call (test with an unauthorized role).

Acceptance: resolve a report end to end from the user app through the queue to the reporter's case status (SAFE-07).
```

## Phase 12 — Recommendation engine, notifications, analytics, state library

```text
PHASE 12 — INTELLIGENCE & CROSS-CUTTING  (blueprint sections 8, 12, 16, 18)

1. Recommendation engine (src/domain/ranking, pure TypeScript with unit tests):
   - Stage 0 policy filters: 18+, block/report exclusions, intent eligibility, location boundary, community privacy.
   - Stage 1 retrieval: same/related interests, local activity/community pool, availability overlap.
   - Stage 2 context ranking with candidate_score = 0.25*interest_activity_overlap + 0.20*availability_fit + 0.15*location_fit + 0.15*group_size_fit + 0.10*intent_fit + 0.10*community_context + 0.05*taste_overlap, weights in a config file marked experimental.
   - Stage 3 diversity plus a small exploration budget.
   - Stage 4 explanation: generate reason codes → 2 to 4 human ReasonChips from stored signals only. Never expose the raw score or a percentage.
   - Stage 5 feedback hooks per blueprint 8.4 (not relevant, interested, joined, repeated interaction, connection accepted, block/report = exclusion not preference).
   - Graceful low-density expansion (widen radius, related interests) with honest messaging.
   Replace the stub RankingService from Phase 4 with this.
2. Notification system per blueprint section 12: in-app notification center, categories and defaults, expo-notifications local reminders for events, batching of message notifications, recommendations as a limited digest, no fake urgency or streaks. Respect settings from SET-05.
3. Analytics: verify every MVP event in blueprint section 16 fires exactly once with the documented properties; add derived-metric helpers (Activation rate, Meaningful Connection Rate, Circle repeat rate, Connection conversion, Conversation continuation, Offline attendance rate, D30 retention) as query definitions/documentation.
4. Empty/error state library: implement every pattern from blueprint section 18 as reusable components and confirm each screen uses them.
5. Offline behaviour: cached last-known Home/Circles, queued actions (messages, check-ins), clear OfflineBanner, no lost drafts.

Acceptance: ranking unit tests (hard filters, intent mismatch, low density, explanation generation), notification settings respected, analytics audit report generated as an artifact.
```

## Phase 13 — Real backend (Supabase)

```text
PHASE 13 — BACKEND INTEGRATION  (blueprint sections 14, 15, 10.2, 17.1, 19)

Replace the in-memory repositories with Supabase implementations behind the SAME interfaces; keep the mock implementation switchable via env for demos and tests.

1. Database migrations for the MVP subset of the section 14 entities: User, Profile, ProfileMedia, Interest, UserInterest, TasteEntity, UserTaste, Preference, LocationZone, Community, CommunityMember, CommunityRule, CommunityPost, Comment, Reaction, Circle, CircleMember, Connection, RelationshipState, Conversation, ConversationMember, Message, MessageRequest, Event, EventParticipant, EventFeedback, Verification, Report, Block, Restriction, ModerationAction, Notification, Recommendation, RecommendationFeedback, Subscription, Payment, AuditLog, plus consent_records.
2. Row Level Security on every table implementing the data classification in blueprint 7.1: private fields (phone, email, exact anything) never selectable by other users; safety evidence only for moderator/admin roles; hidden communities and private Circles invisible to non-members; admin APIs role-gated.
3. Auth: phone OTP via Supabase Auth with a pluggable SMS provider (e.g. MSG91 or Twilio), rate limits, session table for device management and revocation.
4. Storage buckets with signed, expiring URLs for profile media and chat images; moderation_state workflow.
5. Realtime chat via Supabase Realtime behind ChatTransport; presence limited to typing.
6. Edge Functions: capacity-safe RSVP (transactional, server-authoritative), connection state transitions, report intake + protection action, scheduled deletion job honoring the retention matrix, notification fan-out, OTP throttling, moderation hooks (text/URL pattern checks).
7. Seed script for the Bengaluru launch zone and the interest taxonomy.
8. DPDP-minded plumbing: consent versions stored, data export and delete endpoints (POST /account/delete, /account/delete/cancel), audit logging, retention matrix document at docs/retention-matrix.md (mark legal review needed).
9. Automated authorization tests: IDOR/enumeration attempts, cross-user private field access, blocked-user access, non-admin calls to admin APIs.

Acceptance: the whole app runs against Supabase locally (supabase start) with seed data; the security QA checklist in blueprint 17.1 passes; mock mode still works.
```

## Phase 14 — Hardening, accessibility, QA, release

```text
PHASE 14 — HARDENING & RELEASE  (blueprint sections 17, 18, Appendix D launch checklist)

1. Accessibility pass: dynamic type, contrast (glass text over gradients must meet WCAG AA, adjust overlays if needed), semantic labels on every control including the Orb (label "Circles"), screen-reader order, reduced-motion, touch targets at least 44×44, focus order in sheets.
2. QA suite: implement the P0 scenarios from the blueprint section 17 table as automated tests where possible (AUTH, AGE, ONB, PROFILE leakage, DISC blocked/intent, COMM private join, CONN mutual/one-sided, MSG blocked/scam, EVENT capacity race, SAFETY report/block, ACCOUNT logout/delete, SEC session revoke). Add Maestro or Detox happy-path E2E for: onboarding → join Circle → RSVP → check-in → follow-up → connect → chat.
3. Performance: list virtualization, image caching with expo-image, blur cost review on low-end Android, cold start under 2.5s target on a mid device, bundle analysis.
4. Security: secure storage audit, no secrets in the client, rate-limit review, deep-link validation, screenshot/PII log scrubbing.
5. Release: EAS build profiles (dev, preview, production), app icon and splash from the LIGHT mark, store listing checklist, privacy labels, in-app links to Terms/Privacy/grievance contact, Appendix D launch readiness checklist tracked in docs/launch-checklist.md.
6. Documentation: README (setup, env, mock vs Supabase modes), architecture overview, design-system guide, and a screen-to-blueprint coverage matrix listing every screen ID in Appendix A with status (built / mocked / V2).

Acceptance: green test suite, coverage matrix showing every MVP screen, accessibility audit artifact, a preview build ready to install.
```

---

## Appendix — Quick reference

**Screen coverage by phase**

| Phase | Blueprint IDs |
|---|---|
| 1 | AUTH-01 to AUTH-08 |
| 2 | ONB-01 to ONB-09 (+ photo, profile preview, activation) |
| 3 | HOME-01 to HOME-03 |
| 4 | DISC-01 to DISC-08 |
| 5 | COMM-01 to COMM-10 |
| 6 | CONN-01 to CONN-06 |
| 7 | MSG-01 to MSG-06 |
| 8 | EVENT-01 to EVENT-07 |
| 9 | SAFE-01 to SAFE-08 |
| 10 | PROF-01 to PROF-05, SET-01 to SET-08, subscription, logout, deletion |
| 11 | ADMIN-01 to ADMIN-06 |

**Tips**
- If a phase is too large for one session, ask the agent to split it and build the first half, then the second, using the same working method.
- Keep `docs/LIGHT_blueprint.md` open in the workspace so the agent can search it by screen ID.
- Commit after every phase. If the agent drifts from the design, reattach `light_concept.webp` and ask it to diff its screenshots against the concept.
- Voice notes, learning-to-rank, ticketing and multi-city are intentionally out of scope (blueprint V2/V3).
