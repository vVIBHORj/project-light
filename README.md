# LIGHT ✨

**An India-first relationship-formation app — built to help people find their *people*, not just their next match.**

LIGHT is a mobile app (React Native + Expo) for **Friendship, Dating, Community, and Exploring** — all as equal, first-class intents on one social graph, not four separate apps bolted together.

---

## 🚫 What LIGHT deliberately does NOT do (and why that's the whole point)

Every mainstream dating/social app in the market is built around swiping, scores, and infinite feeds. LIGHT is built on the opposite set of rules — and these rules are **non-negotiable product constraints**, not marketing copy:

| ❌ What everyone else does | ✅ What LIGHT does instead |
|---|---|
| Compatibility % ("92% Match") | **2–4 concrete "reason chips"** from real shared signals — never a fake score |
| Live radar showing exact people nearby | **Zone + distance bands** ("2–5 km"). The radar shows Circles & activities — **never people's exact location** |
| Swipe left/right on strangers | **Connect / Save / Not relevant** on context cards — no swipe deck, ever |
| One giant feed you scroll forever | **Bounded, curated Home** — no infinite feed, no doom-scroll |
| Streaks, "someone's waiting for you," fake urgency | None. No streaks, no manufactured FOMO, no popularity/follower counts |
| Big anonymous match pools | **Small Circles of 4–8 people**, built around a shared activity |
| Dating as the default lens | **Friendship, Dating, Community, Explore** are equal, user-chosen intents on one graph |
| Precise GPS tracking | **Exact coordinates are never collected or stored** — city + zone + distance band only |
| Unsolicited DMs from strangers | 1:1 chat unlocks **only** after mutual connection or an accepted, context-carrying message request |
| Trust/credibility "scores" | No trust score, ever — verification is a badge with a plain-language explanation, nothing more |

This isn't a dating app with a friendship tab bolted on — it's built ground-up around **small-group, activity-based, safety-first connection**, tuned for India from day one (regional languages, Indian cities/zones, culturally relevant safety resources).

---

## 🧭 Core Concepts

- **Circles** — the core unit of the product. Small groups (4–8 people) formed around a shared activity (badminton, photography, board games, hiking, etc.), not an anonymous match.
- **Communities** — larger interest/location-based spaces that host multiple Circles and events.
- **Intents** — Friendship, Dating, Community, Explore/Undecided — chosen explicitly by the user and layered over a single social graph, with dating visibility governed by strict mutual-opt-in rules.
- **Reason Chips** — every recommendation shows the *actual stored signal* behind it ("3 shared interests," "Both free Sunday evening") instead of a black-box score.
- **The Orb** — the center tab of the app; it *is* Circles.

---

## 🛡️ Safety by design

Safety isn't a settings menu — it's structurally baked into the product:

- 18+ only, enforced at onboarding with an age-hold flow for anyone underage.
- Report / Block / Restrict reachable from **every** profile, message, post, and community.
- Conversation-level heuristics gently flag phone numbers, payment/UPI requests, external links, or "move off-platform" asks — without silently blocking anyone.
- A dedicated Safety Center with India-specific emergency numbers (100/112, 1091, 181), trusted-contact sharing, pre-date check-ins, and a transparent case-status timeline for every report.
- Every admin/moderator action is written to an immutable audit log.
- Private data classes (public / private / matching-only / sensitive) are enforced at the data layer so private fields can *never* leak through a public profile.

---

## 🧱 Tech Stack

- **Framework:** [Expo](https://expo.dev) (React Native) with [Expo Router](https://expo.github.io/router/) (file-based routing) and `react-native-web` for web preview
- **Language:** TypeScript (strict mode)
- **State:** [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query)
- **Forms/Validation:** `react-hook-form` + `zod`
- **UI:** `expo-blur`, `expo-linear-gradient`, `react-native-svg`, `react-native-reanimated`, `lucide-react-native`
- **i18n:** `i18next` / `react-i18next` (English by default, Hinglish-ready)
- **Backend (planned):** [Supabase](https://supabase.com) (Postgres + RLS, Auth, Realtime, Storage, Edge Functions) behind a repository interface, so the entire app currently runs on a mock data layer with zero backend lock-in
- **Testing:** Jest + React Native Testing Library

### Architecture at a glance

```
src/
├── features/        # auth, onboarding, profile, home, discover, circles,
│                     # connections, messages, events, safety, settings, admin
├── design-system/    # design tokens + shared UI components
├── data/             # repository interfaces (mock now, Supabase later)
├── domain/           # types, state machines, ranking/recommendation logic
├── lib/              # analytics, i18n, storage, permissions
└── mocks/            # seed data (users, Circles, communities, events)
```

Screens **never** talk to mock data directly — everything goes through repository interfaces, so swapping the mock layer for a real Supabase backend is a drop-in change, not a rewrite.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo` works out of the box, no global install required)
- A phone with [Expo Go](https://expo.dev/go) installed, or an Android/iOS simulator

### Installation

```bash
git clone https://github.com/vVIBHORj/project-light.git
cd project-light
npm install
```

### Running the app

```bash
npm start        # launches the Expo dev server (scan the QR code with Expo Go)
npm run android  # run on an Android emulator/device
npm run ios      # run on an iOS simulator/device
npm run web      # run in the browser
```

### Other useful scripts

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
npm test           # Jest test suite
```

---

## 📚 Project Documentation

This repo ships with its own product spec and build history, useful if you want to understand *why* a screen behaves the way it does:

- [`LIGHT_product_blueprint.docx`](./LIGHT_product_blueprint.docx) — the full product blueprint: behaviour, screen IDs, data model, APIs, analytics events, safety rules, and account lifecycle.
- [`LIGHT_Antigravity_Prompt_Pack.md`](./LIGHT_Antigravity_Prompt_Pack.md) — the phased build plan (Phase 0 → Phase 14) the app was built against, from the design system through backend integration, hardening, and release.
- [`Project LIGHT — Application Blueprint (PRD + UX Spec).html`](<./Project LIGHT — Application Blueprint (PRD + UX Spec).html>) — the PRD + UX spec in browsable form.
- [`docs/`](./docs) — supporting design and reference material.

---

## 🗺️ Current Status

LIGHT is under active development. The UI is being built first against a fully-featured mock data layer (repositories with simulated latency/failure) so every flow is clickable end-to-end before the real backend is wired in. Supabase integration, hardening, accessibility, and release prep are later phases in the build plan above.

---

## 🤝 Contributing

This project is currently maintained by [@vVIBHORj](https://github.com/vVIBHORj). Issues and pull requests are welcome — please open an issue to discuss significant changes before submitting a PR.
