PROJECT SAATH | PRODUCT + UX + TECHNICAL BLUEPRINT | v1.0

PROJECT LIGHT

India-first relationship formation platform: Product Requirements, UX, System Behavior, Safety, Data, APIs, QA and Roadmap

Working name; validate trademark/domain availability separately.

Version 1.0 | 24 September 2026

| **Document intent: **A single source of truth for founder, product, design, mobile/web frontend, backend, QA, trust & safety, analytics and recommendation engineering. This document is deliberately implementation-oriented and separates MVP from later scope. |
| --- |

| **Research basis: **The attached requirements define the requested screen-by-screen and system-level coverage. Source references inside this document use numbered research IDs and URLs. |
| --- |

PRODUCT THESIS

Find people nearby who share a reason to interact.

Make the first interaction easy.

Make the second interaction possible.

Let friendship, activity partnership, or dating emerge by mutual choice.

| **Product boundary: **The product is not a generic social feed, a Reddit replacement, a Discord replacement, or a swipe-only dating marketplace. Communities and dating are supporting structures around the core job: forming meaningful local connections. |
| --- |

# 0. Executive Product Architecture

The strongest research-supported direction is a relationship-progression product, not a three-product bundle. The initial experience should be organized around activities and small recurring Circles, with Friendship, Dating and Explore/Undecided represented as user intents rather than isolated app silos.

## 0.1 Product purpose

Primary problem: a young adult may have interests, online contacts and access to a large city but still lack a reliable path from stranger to acquaintance to recurring social connection. Existing products are often optimized for a particular stage: content, community, messaging, dating discovery or event listings.

Product job: reduce the social friction between "I want to meet people like me" and "I have people I actually see/talk to again." The system should create context, permission, repetition and safety.

## 0.2 Initial target segment

| **Segment** | **Initial status** | **Why** | **Primary job** |
| --- | --- | --- | --- |
| 18-29 urban young professionals / recent graduates | CORE | Clear life-transition and local-network problem; can participate on evenings/weekends | Find a few nearby people to do things with |
| People newly moved to a city | CORE SUBSEGMENT | Strong context for needing a new social graph | Build a local social circle |
| College students 18+ | PILOT/ADJACENT | High density but campus-specific social graph already exists | Discover interest Circles outside existing friends |
| General dating-app users | ADJACENT | Useful for testing dating progression after trust is established | Find a partner without swipe-first fatigue |
| Hobby/community hosts | CORE SUPPLY | Create the supply that makes the network useful | Host recurring activities and Circles |
| Under-18 users | EXCLUDED | Safety, legal and product-complexity burden | Not supported in initial product |

## 0.3 Relationship intents

Do not create four disconnected modes. Use one underlying graph with an intent layer.

| **Intent** | **Meaning** | **Default behavior** | **Visibility** |
| --- | --- | --- | --- |
| Friendship | Open to platonic connections | Friend-first recommendations and Circles | Visible to eligible users |
| Dating | Open to romantic progression | Dating-compatible connections and dating escalation | Visible only to users whose intent rules permit it |
| Community | Primarily interested in shared topics/activities | Community and event recommendations; no required 1:1 | Visible; no unsolicited DMs by default |
| Explore / Undecided | Wants social discovery without committing to an outcome | Circle/activity-first discovery | No dating assumption |

## 0.4 Core loop

Need social connection

  -> choose interest/activity/context

  -> discover a Circle or local activity

  -> join a small group

  -> do something concrete

  -> interact repeatedly

  -> mutual connection

  -> friendship / activity partnership / dating

  -> return because the social graph is now becoming personal

## 0.5 Application hierarchy

APP

|-- AUTHENTICATION

|   |-- signup / login / OTP / account recovery

|   `-- security sessions

|

|-- ONBOARDING

|   |-- age & identity

|   |-- interests / tastes

|   |-- social style / availability

|   |-- intent / dating preferences

|   `-- privacy & discovery controls

|

|-- HOME

|   |-- this week

|   |-- active Circles

|   `-- next action

|

|-- DISCOVER

|   |-- Circles

|   |-- People

|   |-- Activities / Events

|   `-- search

|

|-- COMMUNITIES

|   |-- local interest communities

|   |-- Circle creation / hosting

|   `-- moderation

|

|-- CONNECTIONS

|   |-- mutual connections

|   |-- friendship progression

|   `-- dating progression

|

|-- MESSAGES

|   |-- Circle/group chat

|   |-- accepted 1:1 conversations

|   `-- message safety

|

|-- EVENTS

|   |-- discover / create / RSVP

|   `-- attendance / follow-up

|

|-- SAFETY

|   |-- report / block / restrict

|   |-- date safety

|   `-- trust & support

|

`-- ME

    |-- profile / verification

    |-- privacy / settings

    |-- subscription

    `-- account deletion

## 0.6 What is deliberately not in the first product

Infinite short-video/content feed.

Public follower counts and influencer-first ranking.

Full Reddit/Discord-grade community infrastructure.

Endless dating swipes.

Public phone numbers, Instagram handles or precise distance.

A single "87% compatible" score that implies scientific certainty.

Large event marketplace and ticketing stack.

AI companion/therapist/dating coach.

Under-18 social discovery.

Collection of sensitive data without a demonstrated product purpose.

# 1. Evidence and Research Basis

This section records the evidence that informs the product architecture. Reddit evidence is qualitative and self-selected; it is used for pattern discovery, not as population statistics.

| **ID** | **Source** | **Date** | **Geography/sample** | **Topic** | **What it supports / limitation** | **URL** |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | WHO | 2025 | Global | Commission/Q&A on social connection | WHO reported loneliness affecting about 1 in 6 people globally and highlighted elevated rates among young people. Use: validates the problem area, not willingness to pay. | https://www.who.int/news-room/questions-and-answers/item/social-connection |
| R02 | Pew Research Center | 2025 | United States, 1,391 teens | Teens and social media | 74% said social media made them feel more connected to friends; 39% felt overwhelmed by drama. Use: online social connection has benefits and costs. | https://www.pewresearch.org/internet/2025/04/22/teens-social-media-and-mental-health/ |
| R03 | Pew Research Center | 2025 | United States teens | Friendship networks | 64% reported having 1-4 close friends. Use: small relationship networks are meaningful; not representative of India. | https://www.pewresearch.org/social-trends/2025/03/13/teens-friendships-and-emotional-support-networks/ |
| R04 | Eventbrite | 2025 | Survey of event attendees / 18-35 audience | Fourth Spaces | 84% of surveyed interest-based event attendees reported developing close friendships through gatherings; company study. Use: supports testing interest-to-IRL progression. | https://www.eventbrite.com/blog/press/newsroom/fourth-spaces-bridge-digital-and-physical-worlds/ |
| R05 | Hinge | 2025 | Hinge users/global product research | Product evolution | Hinge stated that lack of responsiveness and conversations going nowhere contribute to dating fatigue and described changes to recommendations and profile depth. | https://hinge.co/newsroom/hinge-2025-product-evolution |
| R06 | Match Group | 2026 annual report for 2025 | Global company results | 2025 revenue/payers | Match Group reported $3.487B total revenue in 2025; Tinder $1.863B direct revenue; Hinge $691M direct revenue; Tinder 9.026M payers and Hinge 1.801M. Use: dating monetization is demonstrated, but the market is competitive. | https://www.sec.gov/Archives/edgar/data/891103/000089110326000025/mtch-20251231.htm |
| R07 | Bumble | 2026 | Global company/product | Bumble For Friends + Plans | Bumble For Friends supports friend discovery; Plans supports public/private local group meetups and group chats. Use: "groups + IRL" is already incumbent territory. | https://fec.honey.bumble.com/the-buzz/bumble-for-friends-plans |
| R08 | Bumble | 2026 | Global | Plans activity guidance | Bumble explicitly positions Plans around like-minded local people, group chats and IRL activities. | https://bumble.com/the-buzz/en-us/bumble-for-friends-how-to-host-plans |
| R09 | QuackQuack | 2026 | India, company-reported | Indian dating product | QuackQuack currently claims 43M users, 53M chats/month, 432K matches/month and positions itself for friends, dates and in-between. Company-reported. | https://www.quackquack.in/ |
| R10 | Yubo | 2025 | Global, company-reported | 18+ social discovery and age assurance | Yubo shifted to 18+ and described age estimation plus ID verification controls. Use: adult social discovery requires strong age/safety architecture. | https://www.yubo.live/newsroom/yubo-in-2025 |
| R11 | Reddit - BangaloreMeetups | 2026 | Self-selected Bangalore users | Loneliness/new city/small group | Multiple 2026 posts describe new-city loneliness, WFH isolation and preference for small groups/activities. Use: qualitative pattern only. | https://www.reddit.com/r/BangaloreMeetups/ |
| R12 | Reddit - Indiangirlsontinder | 2026 | Self-selected Indian dating-app users | Dry conversation / ghosting | 2026 threads include users describing matches but dry chats, ghosting and failure to convert conversations into dates. Use: qualitative pattern only. | https://www.reddit.com/r/Indiangirlsontinder/ |
| R13 | Reddit - Delhi | 2024 | Self-selected Delhi users | Fake profile | A 2024 post documented a fake Hinge profile using manipulated identity/photos. Use: qualitative safety signal. | https://www.reddit.com/r/delhi/comments/1f53pzd/folks_beware_of_fake_profiles/ |
| R14 | MeitY | 2025 | India | DPDP Rules 2025 | Rules published 14 Nov 2025; enforcement timeline and Board materials published with them. Use: privacy/data lifecycle must be designed deliberately. | https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa |
| R15 | MeitY | 2022/current framework | India | IT Intermediary Rules | Intermediaries must publish grievance officer details/mechanism and follow due diligence requirements; exact applicability depends on intermediary classification. Use: trust & safety operations need governance. | https://www.meity.gov.in/static/uploads/2024/02/IT-Intermediary-Rules-2021-updated-on-28.10.2022-2.pdf |
| R16 | JAMM | 2026 | India/app stores | IRL activity social product | JAMM positions social discovery around activities and small-group meetups. Use: activity-first social discovery is an emerging category, not a blank market. | https://play.google.com/store/apps/details?id=app.jamm.social |
| R17 | Cerca / TechCrunch | 2025 | United States | Gen Z dating product | Cerca launched with a social-circle model and limits on swiping; shows alternatives to conventional swipe mechanics are being tested. | https://techcrunch.com/2025/10/12/dating-app-cerca-will-show-how-gen-z-really-dates-at-techcrunch-disrupt-2025/ |
| R18 | Clyx / TechCrunch | 2025 | United States | Event/community relationship formation | Clyx raised $14M and built recurring programs around in-person social connection; founder framing emphasizes repetition. | https://techcrunch.com/2025/09/10/this-gen-z-founded-app-just-raised-14m-to-take-on-the-loneliness-episdemic/ |

| **Current-status rule: **Where a source is company-reported (e.g., user counts, downloads, revenue claims), this specification treats it as directional evidence rather than audited market share. Regulatory implementation should be rechecked with Indian counsel before launch. |
| --- |

# 2. Product Principles and Decision Rules

| **ID** | **Principle** | **Implementation consequence** |
| --- | --- | --- |
| P01 | Optimize for meaningful connection, not volume. | Primary outcome is repeated positive interaction; swipes/likes are secondary. |
| P02 | Context before cold DM. | Give users a shared activity/community reason to interact before private messaging. |
| P03 | Intent is explicit but not the whole product. | Friendship, dating, community and explore are preferences layered over one social graph. |
| P04 | Small groups before giant feeds. | Target 4-8 person Circles for early relationship formation. |
| P05 | Photo is identity, not the product. | Show useful context and interests before turning the experience into appearance ranking. |
| P06 | User-controlled escalation. | Moving from group -> private -> friendship/date requires mutual signals where possible. |
| P07 | Safety is a system property. | Prevention, detection, user controls, moderation and incident response are designed together. |
| P08 | Privacy by minimization. | Collect data only when it supports a named product/safety purpose. |
| P09 | AI assists; it does not manipulate. | No fake messages, emotional dependency mechanics or opaque high-stakes decisions without human review. |
| P10 | A community is successful only if people participate. | Creation count is not success; active and recurring participation is. |
| P11 | Offline is optional and structured. | No pressure to meet; when users do, use public venues, group context and safety tooling. |
| P12 | No false precision. | Explain recommendation reasons instead of exposing unjustified compatibility percentages. |
| P13 | Build for Indian density. | Launch one city/zone/cohort first; do not rely on national averages to solve local liquidity. |
| P14 | Do not manufacture engagement. | Avoid streaks, public popularity scores and notifications designed mainly to provoke compulsive checking. |
| P15 | Every feature needs a job. | If it does not materially support discover -> interact -> repeat -> connect, classify it as feature bloat or later scope. |

# 3. Core Product System Behavior

## 3.1 Interaction objects

| **Object** | **Definition** | **MVP rule** |
| --- | --- | --- |
| Community | A larger interest/location/topic space with persistent membership | May exist before there is an event; does not require 1:1 dating |
| Circle | A small, time-bounded or recurring group, ideally 4-8 people, centered on an activity/topic | Primary MVP social unit |
| Activity | A concrete action such as badminton, movie discussion, photography walk | Every Circle should have at least one actionable prompt/activity |
| Connection | Mutual private social link created after compatible interest | No unsolicited 1:1 messages by default |
| Dating connection | A Connection where both users have mutually opted into dating intent | Can only be surfaced to eligible users |
| Event | Scheduled group activity with place/time/capacity | MVP can use simple host-created events; ticketing later |
| Trust signal | Explainable verification/participation signal | Never expose a synthetic "trust score" in MVP |

## 3.2 Relationship state machine

STRANGER

  -> SAME INTEREST

  -> SAME COMMUNITY

  -> SAME CIRCLE

  -> REPEATED INTERACTION

  -> MUTUAL CONNECTION

  -> FRIEND / ACTIVITY PARTNER

  -> [OPTIONAL] DATING

At any point:

  MUTE / RESTRICT / BLOCK / REPORT / LEAVE COMMUNITY

## 3.3 Core recommendation principle

The recommendation engine should optimize for useful next actions, not a universal compatibility score. A recommendation should answer: why this person/group/activity, why now, and what can the user do next?

# 4. End-to-End New User Journey

APP DISCOVERY

  -> STORE INSTALL

  -> SPLASH

  -> WELCOME

  -> AUTH

  -> PHONE/EMAIL VERIFICATION

  -> AGE ASSURANCE

  -> BASIC IDENTITY

  -> PRIVACY & SAFETY CONTROLS

  -> INTENT

  -> INTERESTS

  -> TASTE

  -> SOCIAL STYLE

  -> AVAILABILITY

  -> CITY / AREA

  -> PROFILE

  -> OPTIONAL VERIFICATION

  -> ACTIVATION CHECK

  -> HOME

  -> FIRST ACTION: JOIN CIRCLE / BROWSE ACTIVITY / DISCOVER COMMUNITY

  -> GROUP INTERACTION

  -> REPEAT INTERACTION

  -> MUTUAL CONNECTION

  -> FRIENDSHIP / DATING / ACTIVITY PARTNERSHIP

  -> OPTIONAL OFFLINE EXPERIENCE

  -> FOLLOW-UP

  -> RETENTION LOOP

  -> OPTIONAL PAID EXPERIENCE / PREMIUM

  -> SETTINGS

  -> LOGOUT OR DELETE ACCOUNT

## 4.1 Activation definition

For MVP analytics, an activated user is one who completes minimum profile setup and takes at least one high-intent social action: joins a relevant Circle, RSVPs to an activity, participates in a group interaction, or sends/accepts a mutual connection request. A signup alone is not activation.

# 5. Screen-by-Screen UX Specification

Every production screen must be specified against the following contract. UI designers should create at least: default, loading, success, empty, error, permission-denied, restricted/banned, offline and destructive-action states where applicable.

## AUTH-01 - Splash / Session Check

| **Purpose** | Bootstrap the app and decide whether the user is new, returning, or blocked. |
| --- | --- |
| **Who sees it** | All users |
| **Entry point** | Cold app launch |
| **UI components** | Logo, minimal motion, version check, maintenance flag |
| **Primary CTA** | Continue automatically |
| **Secondary actions** | Retry on failure |
| **User inputs** | None |
| **Backend/API requirements** | GET /session; GET /config/bootstrap |
| **Data collected** | device/app version, session state |
| **Next possible screens** | AUTH-02 or HOME-01 or SAFE-08 |
| **Success state** | Routes without visible delay after bootstrap |
| **Empty state** | N/A |
| **Error state** | Service unavailable -> retry/offline message |
| **Edge cases** | Expired token; banned account; mandatory update; maintenance |
| **Analytics events** | app_opened, session_checked |
| **MVP / V2 / V3** | MVP |

## AUTH-02 - Welcome

| **Purpose** | Explain the value proposition without implying a dating-only product. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | AUTH-01 |
| **UI components** | Headline; 1-sentence promise; 2-3 proof chips; primary signup; login link; safety/privacy link |
| **Primary CTA** | Create account |
| **Secondary actions** | Log in / Read safety |
| **User inputs** | None |
| **Backend/API requirements** | GET /config/legal-links |
| **Data collected** | consent version viewed |
| **Next possible screens** | AUTH-03 or AUTH-04 |
| **Success state** | User selects an entry path |
| **Empty state** | N/A |
| **Error state** | Config failure uses cached copy |
| **Edge cases** | App reopened after partial signup |
| **Analytics events** | welcome_viewed |
| **MVP / V2 / V3** | MVP |

## AUTH-03 - Create Account

| **Purpose** | Create a new account using a low-friction identifier. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | AUTH-02 |
| **UI components** | Phone/email tabs; Google/Apple where platform-appropriate; terms/privacy links |
| **Primary CTA** | Send verification code |
| **Secondary actions** | Switch method |
| **User inputs** | phone/email, consent acknowledgement |
| **Backend/API requirements** | POST /auth/signup |
| **Data collected** | identifier, consent version, referral code |
| **Next possible screens** | AUTH-05 |
| **Success state** | Verification challenge created |
| **Empty state** | Identifier already registered -> AUTH-04 |
| **Error state** | OTP service unavailable -> retry |
| **Edge cases** | Rate limit, duplicate account, invalid identifier |
| **Analytics events** | signup_started, signup_method_selected |
| **MVP / V2 / V3** | MVP |

## AUTH-04 - Existing Account / Login

| **Purpose** | Route returning users into secure sign-in. |
| --- | --- |
| **Who sees it** | Returning users |
| **Entry point** | AUTH-02 or AUTH-03 duplicate |
| **UI components** | Identifier field; continue; social login; recovery link |
| **Primary CTA** | Send verification code |
| **Secondary actions** | Recover access |
| **User inputs** | identifier |
| **Backend/API requirements** | POST /auth/login/start |
| **Data collected** | login attempt metadata |
| **Next possible screens** | AUTH-05 or AUTH-07 |
| **Success state** | Challenge created |
| **Empty state** | Account not found -> offer signup |
| **Error state** | Rate limit / unknown error |
| **Edge cases** | Account deleted but within recovery window |
| **Analytics events** | login_started |
| **MVP / V2 / V3** | MVP |

## AUTH-05 - OTP Verification

| **Purpose** | Verify the identifier. |
| --- | --- |
| **Who sees it** | New and returning users |
| **Entry point** | AUTH-03/AUTH-04 |
| **UI components** | 6-digit OTP; countdown; masked identifier; paste code |
| **Primary CTA** | Verify |
| **Secondary actions** | Resend / Change identifier |
| **User inputs** | OTP |
| **Backend/API requirements** | POST /auth/verify; POST /auth/otp/resend |
| **Data collected** | OTP attempt count |
| **Next possible screens** | AUTH-06 or HOME-01 or AUTH-07 |
| **Success state** | Verified session issued |
| **Empty state** | Expired -> resend state |
| **Error state** | Wrong/expired/too many attempts |
| **Edge cases** | SIM change; multiple devices |
| **Analytics events** | otp_submitted, otp_success, otp_failure, otp_resent |
| **MVP / V2 / V3** | MVP |

## AUTH-06 - Account Recovery

| **Purpose** | Recover access without exposing private account information. |
| --- | --- |
| **Who sees it** | Returning users |
| **Entry point** | AUTH-04 |
| **UI components** | Recovery options; verification challenge; support route |
| **Primary CTA** | Start recovery |
| **Secondary actions** | Cancel |
| **User inputs** | identifier; recovery proof |
| **Backend/API requirements** | POST /auth/recovery/start |
| **Data collected** | recovery request metadata |
| **Next possible screens** | AUTH-05 or support route |
| **Success state** | Recovery challenge initiated |
| **Empty state** | No eligible recovery -> support route |
| **Error state** | Suspicious recovery attempt |
| **Edge cases** | Lost number/email; account compromise |
| **Analytics events** | recovery_started |
| **MVP / V2 / V3** | MVP |

## AUTH-07 - Suspicious Login / Security Challenge

| **Purpose** | Protect an account after anomalous sign-in signals. |
| --- | --- |
| **Who sees it** | Risk-flagged users |
| **Entry point** | AUTH-01/AUTH-05 |
| **UI components** | Security warning; device/location coarse signal; verify identity; sign out sessions |
| **Primary CTA** | Secure account |
| **Secondary actions** | Review sessions |
| **User inputs** | security challenge |
| **Backend/API requirements** | POST /security/challenge; GET /sessions |
| **Data collected** | device fingerprint, risk reason, session list |
| **Next possible screens** | HOME-01 or SAFE-08 |
| **Success state** | Risk resolved and session established |
| **Empty state** | Challenge unavailable -> support |
| **Error state** | False positive; account takeover attempt |
| **Edge cases** | Multiple devices; compromised session |
| **Analytics events** | security_challenge_shown, security_resolved |
| **MVP / V2 / V3** | MVP |

## AUTH-08 - Session / Device Management

| **Purpose** | Let users review and revoke active sessions. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | SET-08 |
| **UI components** | Current device; active devices; last active; revoke buttons |
| **Primary CTA** | Revoke selected session |
| **Secondary actions** | Revoke all others |
| **User inputs** | selected session IDs |
| **Backend/API requirements** | GET /sessions; DELETE /sessions/{id} |
| **Data collected** | session metadata |
| **Next possible screens** | SET-08 |
| **Success state** | Selected sessions revoked |
| **Empty state** | No other sessions -> informative empty state |
| **Error state** | Revocation failure |
| **Edge cases** | Current session accidentally selected |
| **Analytics events** | session_revoked |
| **MVP / V2 / V3** | V2 |

## ONB-01 - Age Gate

| **Purpose** | Prevent under-18 social discovery and collect minimum age data. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | AUTH-05 |
| **UI components** | DOB fields; age explanation; privacy note |
| **Primary CTA** | Continue |
| **Secondary actions** | Back |
| **User inputs** | date of birth |
| **Backend/API requirements** | POST /onboarding/age |
| **Data collected** | DOB, age-band, age-assurance state |
| **Next possible screens** | ONB-02 or ONB-01-blocked |
| **Success state** | 18+ passes |
| **Empty state** | Under 18 -> locked informational state |
| **Error state** | Age service failure |
| **Edge cases** | DOB inconsistency / suspected fraud |
| **Analytics events** | age_submitted, age_rejected |
| **MVP / V2 / V3** | MVP |

## ONB-02 - Identity Basics

| **Purpose** | Capture the minimum public identity needed to operate the graph. |
| --- | --- |
| **Who sees it** | 18+ new users |
| **Entry point** | ONB-01 |
| **UI components** | Display name; first-name preference; gender; pronouns optional; language |
| **Primary CTA** | Continue |
| **Secondary actions** | Skip optional items |
| **User inputs** | display name, gender, pronouns, languages |
| **Backend/API requirements** | PUT /profile/basic |
| **Data collected** | public identity fields |
| **Next possible screens** | ONB-03 |
| **Success state** | Profile identity saved |
| **Empty state** | No optional pronouns/languages accepted |
| **Error state** | Validation error |
| **Edge cases** | Name policy / impersonation flag |
| **Analytics events** | identity_saved |
| **MVP / V2 / V3** | MVP |

## ONB-03 - Intent

| **Purpose** | Capture what the user wants from the product without creating separate app silos. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | ONB-02 |
| **UI components** | Friendship, Dating, Community/Activities, Explore/Unsure; primary intent plus open-to settings |
| **Primary CTA** | Continue |
| **Secondary actions** | Back |
| **User inputs** | intent, open-to flags |
| **Backend/API requirements** | PUT /preferences/intent |
| **Data collected** | intent preferences |
| **Next possible screens** | ONB-04 |
| **Success state** | Intent saved |
| **Empty state** | None |
| **Error state** | Validation error |
| **Edge cases** | User later changes intent |
| **Analytics events** | intent_selected |
| **MVP / V2 / V3** | MVP |

## ONB-04 - Interests

| **Purpose** | Build initial interest/activity graph. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | ONB-03 |
| **UI components** | Searchable chips; categories; minimum 5; activity-oriented labels |
| **Primary CTA** | Continue |
| **Secondary actions** | Skip with warning |
| **User inputs** | interest IDs |
| **Backend/API requirements** | PUT /profile/interests |
| **Data collected** | interest IDs + source |
| **Next possible screens** | ONB-05 |
| **Success state** | Minimum interest set reached |
| **Empty state** | No interests -> guided examples |
| **Error state** | Search service failure |
| **Edge cases** | Rare interest has no density |
| **Analytics events** | interest_selected, interests_completed |
| **MVP / V2 / V3** | MVP |

## ONB-05 - Taste Fingerprint

| **Purpose** | Collect a small amount of specific taste data where it can improve context and prompts. |
| --- | --- |
| **Who sees it** | Users with chosen interests |
| **Entry point** | ONB-04 |
| **UI components** | Conditional cards: artists, films, games, books, teams, creators; 3-5 items max |
| **Primary CTA** | Continue |
| **Secondary actions** | Skip |
| **User inputs** | selected taste items |
| **Backend/API requirements** | PUT /profile/taste |
| **Data collected** | taste entity IDs |
| **Next possible screens** | ONB-06 |
| **Success state** | Taste saved or skipped |
| **Empty state** | No supported catalog match -> free text/skip |
| **Error state** | Catalog unavailable |
| **Edge cases** | Copyright/licensing assumptions; stale catalog |
| **Analytics events** | taste_item_selected, taste_skipped |
| **MVP / V2 / V3** | MVP |

## ONB-06 - Social Style

| **Purpose** | Capture actionable group/interaction preferences. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | ONB-05 |
| **UI components** | Small/large group; talk/do; online/offline; quiet/social; spontaneous/planned |
| **Primary CTA** | Continue |
| **Secondary actions** | Back |
| **User inputs** | preference values |
| **Backend/API requirements** | PUT /preferences/social |
| **Data collected** | social preference vector |
| **Next possible screens** | ONB-07 |
| **Success state** | Preferences saved |
| **Empty state** | None |
| **Error state** | Validation error |
| **Edge cases** | Preferences may change later |
| **Analytics events** | social_style_completed |
| **MVP / V2 / V3** | MVP |

## ONB-07 - Availability & Lifestyle

| **Purpose** | Improve activity recommendations using availability rather than intrusive routine tracking. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | ONB-06 |
| **UI components** | Weekday/weekend; time ranges; activity energy; budget band optional |
| **Primary CTA** | Continue |
| **Secondary actions** | Skip optional budget |
| **User inputs** | availability, activity style, optional budget band |
| **Backend/API requirements** | PUT /preferences/availability |
| **Data collected** | availability ranges |
| **Next possible screens** | ONB-08 |
| **Success state** | Availability saved |
| **Empty state** | Use default broad window |
| **Error state** | Save error |
| **Edge cases** | Frequent schedule changes |
| **Analytics events** | availability_completed |
| **MVP / V2 / V3** | MVP |

## ONB-08 - Location & Discovery Radius

| **Purpose** | Create local density without exposing exact location. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | ONB-07 |
| **UI components** | City; neighborhood/zone; optional approximate location permission; radius bands |
| **Primary CTA** | Continue |
| **Secondary actions** | Enter manually |
| **User inputs** | city, zone, radius, location permission |
| **Backend/API requirements** | PUT /profile/location; POST /location/permission |
| **Data collected** | city/zone/geohash, permission status |
| **Next possible screens** | ONB-09 |
| **Success state** | Local discovery enabled |
| **Empty state** | Manual city selection |
| **Error state** | Location service failure |
| **Edge cases** | Spoofed GPS; user moves city |
| **Analytics events** | location_set, location_permission_result |
| **MVP / V2 / V3** | MVP |

## ONB-09 - Privacy / Discovery Controls

| **Purpose** | Let users control how discoverable they are before entering the network. |
| --- | --- |
| **Who sees it** | New users |
| **Entry point** | ONB-08 |
| **UI components** | Discovery toggle; DM policy; exact location privacy; profile visibility; safety education |
| **Primary CTA** | Finish setup |
| **Secondary actions** | Back / review later |
| **User inputs** | visibility settings |
| **Backend/API requirements** | PUT /preferences/privacy |
| **Data collected** | visibility/privacy settings |
| **Next possible screens** | PROF-01 or HOME-01 |
| **Success state** | Privacy baseline saved |
| **Empty state** | Defaults applied if skipped |
| **Error state** | Save failure |
| **Edge cases** | User wants hidden profile |
| **Analytics events** | privacy_setup_completed |
| **MVP / V2 / V3** | MVP |

## PROF-01 - Profile Home

| **Purpose** | Show the user’s own profile and completeness. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Home/Me |
| **UI components** | Photo; display name; age; intent; interest badges; verification; community badges; edit controls |
| **Primary CTA** | Edit profile |
| **Secondary actions** | Preview as other user |
| **User inputs** | None |
| **Backend/API requirements** | GET /me/profile |
| **Data collected** | profile aggregate |
| **Next possible screens** | PROF-02/03/04/05 |
| **Success state** | Profile loads |
| **Empty state** | Profile incomplete state |
| **Error state** | Load failure |
| **Edge cases** | Suspended/deleted content |
| **Analytics events** | profile_viewed |
| **MVP / V2 / V3** | MVP |

## PROF-02 - Edit Profile

| **Purpose** | Edit only information relevant to social discovery. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | PROF-01 |
| **UI components** | Photo slots; short bio; interests; taste; social style; languages; intent |
| **Primary CTA** | Save changes |
| **Secondary actions** | Cancel |
| **User inputs** | edited fields |
| **Backend/API requirements** | PUT /profile; PUT /profile/interests; PUT /profile/taste |
| **Data collected** | profile fields + versions |
| **Next possible screens** | PROF-01 |
| **Success state** | Changes saved |
| **Empty state** | No changes -> disabled save |
| **Error state** | Validation/upload errors |
| **Edge cases** | Profile under moderation review |
| **Analytics events** | profile_edit_started, profile_updated |
| **MVP / V2 / V3** | MVP |

## PROF-03 - Public Profile Preview

| **Purpose** | Show what another eligible user can see. |
| --- | --- |
| **Who sees it** | Authenticated users viewing self/other |
| **Entry point** | DISC-03 / profile deep link |
| **UI components** | Context first; photos; interests; shared Circles; verification badges; intent; connect CTA |
| **Primary CTA** | Connect (other user) |
| **Secondary actions** | Report / block / save if allowed |
| **User inputs** | None |
| **Backend/API requirements** | GET /users/{id}/public-profile |
| **Data collected** | public profile only |
| **Next possible screens** | CONN-01 / SAFE-02 / previous screen |
| **Success state** | Public profile rendered |
| **Empty state** | Restricted profile -> explanation |
| **Error state** | User deleted/blocked |
| **Edge cases** | Private field leak prevention |
| **Analytics events** | public_profile_viewed |
| **MVP / V2 / V3** | MVP |

## PROF-04 - Verification Center

| **Purpose** | Manage identity, photo and community verification. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | PROF-01 / SET-07 |
| **UI components** | Verification levels; status; why verify; start button; privacy explanation |
| **Primary CTA** | Start selected verification |
| **Secondary actions** | Learn more |
| **User inputs** | verification type |
| **Backend/API requirements** | POST /verification/start; GET /verification/status |
| **Data collected** | verification status, provider ref |
| **Next possible screens** | PROF-05 or PROF-01 |
| **Success state** | Verification state updated |
| **Empty state** | No verification available -> explanation |
| **Error state** | Provider failure |
| **Edge cases** | Document rejected; retry limits |
| **Analytics events** | verification_started, verification_completed, verification_failed |
| **MVP / V2 / V3** | MVP/V2 |

## PROF-05 - Verification Result / Badge Explain

| **Purpose** | Explain successful or failed verification without overstating safety. |
| --- | --- |
| **Who sees it** | Authenticated user |
| **Entry point** | PROF-04 |
| **UI components** | Result; what badge means; what it does not mean; next step |
| **Primary CTA** | Done |
| **Secondary actions** | Retry if permitted |
| **User inputs** | none |
| **Backend/API requirements** | GET /verification/status |
| **Data collected** | verification outcome |
| **Next possible screens** | PROF-01 |
| **Success state** | Badge status shown |
| **Empty state** | Not verified -> retry/support |
| **Error state** | Timeout |
| **Edge cases** | Verification revoked later |
| **Analytics events** | verification_result_viewed |
| **MVP / V2 / V3** | MVP |

## HOME-01 - Home / This Week

| **Purpose** | Answer the user’s primary question: what can I do with people like me this week? |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | First activation / bottom nav |
| **UI components** | Greeting; next best action; 2-4 recommended Circles; upcoming activities; active chats; safety notices |
| **Primary CTA** | Join Circle / RSVP |
| **Secondary actions** | Browse all |
| **User inputs** | none |
| **Backend/API requirements** | GET /home; GET /recommendations/home |
| **Data collected** | recommendation cards, counts, alerts |
| **Next possible screens** | COMM-01 / EVENT-01 / DISC-01 / MSG-01 |
| **Success state** | At least one actionable card displayed |
| **Empty state** | No local density -> expand radius/change interests |
| **Error state** | Partial load -> skeleton + retry |
| **Edge cases** | User not activated; city has no supply |
| **Analytics events** | home_viewed, home_action_clicked |
| **MVP / V2 / V3** | MVP |

## HOME-02 - Active Circle Hub

| **Purpose** | Return users to ongoing social contexts rather than another feed. |
| --- | --- |
| **Who sees it** | Users with active Circles |
| **Entry point** | HOME-01 |
| **UI components** | Active Circle cards; recent activity; next meetup; unread group messages |
| **Primary CTA** | Open Circle |
| **Secondary actions** | Browse Discover |
| **User inputs** | none |
| **Backend/API requirements** | GET /me/active-circles |
| **Data collected** | Circle state, unread counts |
| **Next possible screens** | COMM-03 / MSG-03 / EVENT-04 |
| **Success state** | Existing context surfaced |
| **Empty state** | No active Circles -> suggested first activity |
| **Error state** | Load failure |
| **Edge cases** | Circle archived/removed |
| **Analytics events** | active_circle_viewed |
| **MVP / V2 / V3** | MVP |

## HOME-03 - Post-Event Follow-up Hub

| **Purpose** | Convert offline participation into repeat connection. |
| --- | --- |
| **Who sees it** | Users after events |
| **Entry point** | Notification/deep link/home |
| **UI components** | Event recap; attendees; connect suggestions; next activity; private feedback prompt |
| **Primary CTA** | Keep in touch / join next activity |
| **Secondary actions** | Dismiss |
| **User inputs** | feedback, attendee connection choices |
| **Backend/API requirements** | GET /events/{id}/followup; POST /events/{id}/feedback |
| **Data collected** | attendance, feedback, connection intents |
| **Next possible screens** | CONN-02 / EVENT-06 |
| **Success state** | User takes follow-up action |
| **Empty state** | No follow-up eligible -> recap only |
| **Error state** | Event cancelled data |
| **Edge cases** | User did not attend; safety incident |
| **Analytics events** | event_followup_viewed, repeat_activity_clicked |
| **MVP / V2 / V3** | MVP |

## DISC-01 - Discover Landing

| **Purpose** | Give users a small, purposeful set of discovery paths. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Bottom nav / Home |
| **UI components** | Tabs: Circles, People, Activities; search shortcut; local context |
| **Primary CTA** | Open Circles |
| **Secondary actions** | People / Activities / Search |
| **User inputs** | filters optional |
| **Backend/API requirements** | GET /discover/summary |
| **Data collected** | counts and recommendation sets |
| **Next possible screens** | COMM-01 / DISC-04 / EVENT-01 / DISC-08 |
| **Success state** | Relevant path chosen |
| **Empty state** | No supply -> broaden suggestions |
| **Error state** | Load failure |
| **Edge cases** | Location stale |
| **Analytics events** | discover_viewed |
| **MVP / V2 / V3** | MVP |

## DISC-02 - Circle Recommendations

| **Purpose** | Recommend small groups based on interests, area and availability. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | DISC-01 |
| **UI components** | Cards with why-this-card; size; topic; activity; time; host signals |
| **Primary CTA** | Join / Ask to join |
| **Secondary actions** | Save / Not relevant |
| **User inputs** | filter selections |
| **Backend/API requirements** | GET /discover/circles |
| **Data collected** | ranked Circle candidates |
| **Next possible screens** | COMM-02 |
| **Success state** | Circle joined/requested |
| **Empty state** | No results -> expand radius or interests |
| **Error state** | Search/rank failure |
| **Edge cases** | Full/closed Circle |
| **Analytics events** | circle_recommendation_viewed, circle_join_started |
| **MVP / V2 / V3** | MVP |

## DISC-03 - People Recommendations

| **Purpose** | Discover people only when there is a meaningful context for connection. |
| --- | --- |
| **Who sees it** | Users open to people discovery |
| **Entry point** | DISC-01 / after Circle interaction |
| **UI components** | Person cards showing shared interests, shared Circle, activity, availability, verification, intent |
| **Primary CTA** | Connect |
| **Secondary actions** | Pass / report |
| **User inputs** | filters; reason feedback |
| **Backend/API requirements** | GET /discover/people; POST /recommendations/feedback |
| **Data collected** | candidate features, feedback |
| **Next possible screens** | PROF-03 / CONN-01 |
| **Success state** | Connection request created |
| **Empty state** | No candidates -> suggested Circles/Activities |
| **Error state** | Rank failure |
| **Edge cases** | Blocked user; intent mismatch; safety hold |
| **Analytics events** | people_discovery_viewed, person_connect_clicked, person_passed |
| **MVP / V2 / V3** | MVP |

## DISC-04 - Activity / Event Discovery

| **Purpose** | Find concrete things to do with a small group. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | DISC-01 / Home |
| **UI components** | date filters; activity cards; size; area; cost band; safety label |
| **Primary CTA** | View event |
| **Secondary actions** | Save / Share |
| **User inputs** | filters |
| **Backend/API requirements** | GET /events/discover |
| **Data collected** | event cards |
| **Next possible screens** | EVENT-01 |
| **Success state** | Events available |
| **Empty state** | No events -> create activity / broaden search |
| **Error state** | Load failure |
| **Edge cases** | Cancelled/stale event |
| **Analytics events** | event_discovery_viewed |
| **MVP / V2 / V3** | MVP |

## DISC-05 - Interest Explore

| **Purpose** | Explore the local interest graph without becoming a content feed. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Search / Discover |
| **UI components** | Interest clusters; local community counts; activity counts; trending only when density-backed |
| **Primary CTA** | Open interest |
| **Secondary actions** | Search |
| **User inputs** | interest query |
| **Backend/API requirements** | GET /interests/explore |
| **Data collected** | interest metadata |
| **Next possible screens** | DISC-02 / COMM-01 |
| **Success state** | Interest context loaded |
| **Empty state** | No local result -> national informational result |
| **Error state** | Catalog failure |
| **Edge cases** | Sensitive-interest taxonomy |
| **Analytics events** | interest_explore_viewed |
| **MVP / V2 / V3** | V2 |

## DISC-06 - Recommendation Explanation

| **Purpose** | Explain why an item was recommended and let the user correct the system. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Any recommendation card |
| **UI components** | Shared signals; why now; feedback buttons; hide preference |
| **Primary CTA** | Keep |
| **Secondary actions** | Not relevant / hide signal |
| **User inputs** | feedback choice |
| **Backend/API requirements** | POST /recommendations/feedback |
| **Data collected** | feedback reason |
| **Next possible screens** | previous screen |
| **Success state** | Recommendation adapted |
| **Empty state** | No explanation available -> generic reason |
| **Error state** | Service failure |
| **Edge cases** | User may game preferences |
| **Analytics events** | recommendation_explanation_viewed, recommendation_feedback_sent |
| **MVP / V2 / V3** | MVP |

## DISC-07 - Discovery Filters

| **Purpose** | Let users control boundaries without creating an endless filter marketplace. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | DISC-02/03/04 |
| **UI components** | Age range for eligible contexts; radius; intent; language; availability; group size; verified-only |
| **Primary CTA** | Apply filters |
| **Secondary actions** | Reset |
| **User inputs** | filter values |
| **Backend/API requirements** | GET /filters/options; local client validation |
| **Data collected** | saved temporary filters |
| **Next possible screens** | DISC-02/03/04 |
| **Success state** | Filtered set shown |
| **Empty state** | No results -> relax one filter |
| **Error state** | Invalid combination |
| **Edge cases** | Excessively narrow filters |
| **Analytics events** | filters_applied |
| **MVP / V2 / V3** | MVP |

## DISC-08 - Save / Not Relevant Queue

| **Purpose** | Preserve user feedback and saved items without public popularity mechanics. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | DISC cards |
| **UI components** | Saved people/Circles/events; hidden reasons; restore option |
| **Primary CTA** | Open item |
| **Secondary actions** | Remove / restore |
| **User inputs** | item ID, reason |
| **Backend/API requirements** | GET /me/saved; POST /saved |
| **Data collected** | saved state |
| **Next possible screens** | previous screen |
| **Success state** | State updated |
| **Empty state** | Empty saved state |
| **Error state** | Load failure |
| **Edge cases** | Deleted/blocked item |
| **Analytics events** | item_saved, item_unsaved, not_relevant_marked |
| **MVP / V2 / V3** | V2 |

## COMM-01 - Community Directory

| **Purpose** | Browse local interest communities. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Discover / Communities |
| **UI components** | Search; categories; location; member count; active Circle count; safety/verification indicators |
| **Primary CTA** | Open community |
| **Secondary actions** | Search / Create Circle |
| **User inputs** | query, filters |
| **Backend/API requirements** | GET /communities |
| **Data collected** | community summaries |
| **Next possible screens** | COMM-02 / COMM-04 |
| **Success state** | Directory loaded |
| **Empty state** | No local communities -> create/request one |
| **Error state** | Load failure |
| **Edge cases** | Location mismatch |
| **Analytics events** | community_directory_viewed |
| **MVP / V2 / V3** | MVP |

## COMM-02 - Community Detail

| **Purpose** | Explain why a community matters before joining. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | COMM-01 |
| **UI components** | Name; purpose; rules; active Circles; upcoming events; member signals; moderator info; join status |
| **Primary CTA** | Join community |
| **Secondary actions** | Report / leave / share |
| **User inputs** | none |
| **Backend/API requirements** | GET /communities/{id}; GET /communities/{id}/rules |
| **Data collected** | community profile |
| **Next possible screens** | COMM-03 / DISC-02 |
| **Success state** | Join state saved |
| **Empty state** | Private community -> request state |
| **Error state** | Banned/removed -> explanation |
| **Edge cases** | Age/location gate |
| **Analytics events** | community_viewed, community_joined |
| **MVP / V2 / V3** | MVP |

## COMM-03 - Community Home

| **Purpose** | Provide lightweight persistent community context. |
| --- | --- |
| **Who sees it** | Members |
| **Entry point** | COMM-02 |
| **UI components** | Announcements; 3-5 recent prompts; active Circles; events; moderators; rules shortcut |
| **Primary CTA** | Join Circle / participate |
| **Secondary actions** | Open chat / events / leave |
| **User inputs** | post/comment only if enabled |
| **Backend/API requirements** | GET /communities/{id}/home |
| **Data collected** | content summary |
| **Next possible screens** | COMM-05 / EVENT-01 / MSG-04 |
| **Success state** | User participates or joins Circle |
| **Empty state** | Quiet community -> activity CTA |
| **Error state** | Load failure |
| **Edge cases** | Moderation hold |
| **Analytics events** | community_home_viewed |
| **MVP / V2 / V3** | MVP |

## COMM-04 - Community Join / Approval

| **Purpose** | Handle public/private entry and safety checks. |
| --- | --- |
| **Who sees it** | Eligible users |
| **Entry point** | COMM-02 |
| **UI components** | Why join; rules acceptance; questions if needed; approval status |
| **Primary CTA** | Request / Join |
| **Secondary actions** | Cancel |
| **User inputs** | rule acknowledgement; answers |
| **Backend/API requirements** | POST /communities/{id}/join; POST /communities/{id}/request |
| **Data collected** | membership record, answers |
| **Next possible screens** | COMM-03 or pending |
| **Success state** | Membership active/pending |
| **Empty state** | No further action |
| **Error state** | Approval service failure |
| **Edge cases** | Banned user / age-gated community |
| **Analytics events** | community_join_requested, rules_accepted |
| **MVP / V2 / V3** | MVP |

## COMM-05 - Community Feed / Threads

| **Purpose** | Support enough discussion to create context; not a full social feed. |
| --- | --- |
| **Who sees it** | Members |
| **Entry point** | COMM-03 |
| **UI components** | Pinned prompts; threads; replies; simple reactions; report; slow mode |
| **Primary CTA** | Reply / create post |
| **Secondary actions** | React / report |
| **User inputs** | text/media if enabled |
| **Backend/API requirements** | GET /communities/{id}/posts; POST /posts; POST /comments |
| **Data collected** | content + moderation metadata |
| **Next possible screens** | COMM-03 / MSG-04 |
| **Success state** | Post/comment created |
| **Empty state** | Empty -> starter prompt |
| **Error state** | Content policy block |
| **Edge cases** | Spam/NSFW/link flood |
| **Analytics events** | post_created, comment_created |
| **MVP / V2 / V3** | MVP |

## COMM-06 - Community Chat

| **Purpose** | Provide coordination channel; reduce need for external group apps. |
| --- | --- |
| **Who sees it** | Members |
| **Entry point** | COMM-03 |
| **UI components** | Group chat; pinned event; member controls; report |
| **Primary CTA** | Send message |
| **Secondary actions** | React / report / mute |
| **User inputs** | message text/media |
| **Backend/API requirements** | GET /conversations/community/{id}; WS /chat |
| **Data collected** | messages |
| **Next possible screens** | EVENT-02 / MSG-04 |
| **Success state** | Message delivered |
| **Empty state** | Read-only or muted state |
| **Error state** | Send failure -> retry |
| **Edge cases** | Moderator slow mode / ban |
| **Analytics events** | community_chat_opened, message_sent |
| **MVP / V2 / V3** | MVP |

## COMM-07 - Create Community

| **Purpose** | Allow validated hosts to propose a persistent interest space. |
| --- | --- |
| **Who sees it** | Trusted/eligible users |
| **Entry point** | COMM-01 / profile |
| **UI components** | Name; purpose; category; interests; location; visibility; age rules; rules |
| **Primary CTA** | Submit community |
| **Secondary actions** | Cancel |
| **User inputs** | community metadata |
| **Backend/API requirements** | POST /communities |
| **Data collected** | community draft |
| **Next possible screens** | COMM-08 |
| **Success state** | Created/pending approval |
| **Empty state** | Draft discarded |
| **Error state** | Validation error |
| **Edge cases** | Duplicate/spam/sensitive topic |
| **Analytics events** | community_creation_started |
| **MVP / V2 / V3** | V2 |

## COMM-08 - Community Approval / Pending

| **Purpose** | Make moderation status clear. |
| --- | --- |
| **Who sees it** | Community creator |
| **Entry point** | COMM-07 |
| **UI components** | Status, reason if delayed, expected next action, draft details |
| **Primary CTA** | Return to community when live |
| **Secondary actions** | Edit/cancel request |
| **User inputs** | none |
| **Backend/API requirements** | GET /communities/{id}/approval |
| **Data collected** | approval status |
| **Next possible screens** | COMM-03 or COMM-07 |
| **Success state** | Published |
| **Empty state** | Rejected -> edit route |
| **Error state** | Service error |
| **Edge cases** | Moderator request for changes |
| **Analytics events** | community_submitted, community_approved, community_rejected |
| **MVP / V2 / V3** | V2 |

## COMM-09 - Community Moderator Console

| **Purpose** | Handle membership/content moderation for hosts. |
| --- | --- |
| **Who sees it** | Approved moderators |
| **Entry point** | COMM-03 / Admin role |
| **UI components** | Reports; members; content queue; rules; warnings; remove/ban; audit trail |
| **Primary CTA** | Review item |
| **Secondary actions** | Filter / escalate |
| **User inputs** | moderation action + reason |
| **Backend/API requirements** | GET /communities/{id}/moderation; POST /moderation/actions |
| **Data collected** | community moderation data |
| **Next possible screens** | SAFE-07 / COMM-03 |
| **Success state** | Action logged |
| **Empty state** | No queue -> healthy state |
| **Error state** | Permission error |
| **Edge cases** | Moderator abuse; dual-control for severe actions |
| **Analytics events** | moderation_action_started, moderation_action_completed |
| **MVP / V2 / V3** | V2 |

## COMM-10 - Community Report / Leave

| **Purpose** | Let users exit or report a community safely. |
| --- | --- |
| **Who sees it** | Members/visitors |
| **Entry point** | COMM-02/03 |
| **UI components** | Reason options; evidence; block moderator option where relevant; leave confirmation |
| **Primary CTA** | Submit / Leave |
| **Secondary actions** | Cancel |
| **User inputs** | reason, evidence |
| **Backend/API requirements** | POST /reports; DELETE /memberships |
| **Data collected** | report + membership state |
| **Next possible screens** | SAFE-01 / DISC-01 |
| **Success state** | Report acknowledged / membership removed |
| **Empty state** | N/A |
| **Error state** | Submit failure |
| **Edge cases** | Abusive moderator; protected evidence |
| **Analytics events** | community_reported, community_left |
| **MVP / V2 / V3** | MVP |

## CONN-01 - Connect Request

| **Purpose** | Create mutual permission for private interaction. |
| --- | --- |
| **Who sees it** | Users viewing eligible person |
| **Entry point** | DISC-03 / PROF-03 / group follow-up |
| **UI components** | Why connect; shared context; optional note; intent alignment |
| **Primary CTA** | Send connection |
| **Secondary actions** | Cancel / report |
| **User inputs** | optional note, intent choice |
| **Backend/API requirements** | POST /connections |
| **Data collected** | request record, reason |
| **Next possible screens** | CONN-02 / DISC-03 |
| **Success state** | Request sent |
| **Empty state** | Already connected -> open chat |
| **Error state** | Policy block |
| **Edge cases** | Recipient disabled requests |
| **Analytics events** | connection_sent |
| **MVP / V2 / V3** | MVP |

## CONN-02 - Connection Decision

| **Purpose** | Let the recipient accept, limit, or decline. |
| --- | --- |
| **Who sees it** | Recipient |
| **Entry point** | Notification / CONN-01 |
| **UI components** | Context, shared Circle, sender intent, verification, accept/decline/restrict |
| **Primary CTA** | Accept |
| **Secondary actions** | Decline / restrict / report |
| **User inputs** | decision |
| **Backend/API requirements** | POST /connections/{id}/decision |
| **Data collected** | connection state |
| **Next possible screens** | MSG-01 / SAFE-01 |
| **Success state** | Mutual connection created or declined |
| **Empty state** | Request expired/withdrawn |
| **Error state** | Decision failure |
| **Edge cases** | Blocked sender |
| **Analytics events** | connection_accepted, connection_declined |
| **MVP / V2 / V3** | MVP |

## CONN-03 - Connections List

| **Purpose** | Manage mutual relationships. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Profile/home/messages |
| **UI components** | Friend/dating/activity filters; context; status |
| **Primary CTA** | Open connection |
| **Secondary actions** | Remove/restrict |
| **User inputs** | filters |
| **Backend/API requirements** | GET /connections |
| **Data collected** | connection records |
| **Next possible screens** | PROF-03 / MSG-01 |
| **Success state** | List rendered |
| **Empty state** | No connections -> first-activity CTA |
| **Error state** | Load failure |
| **Edge cases** | Stale/deleted connection |
| **Analytics events** | connections_viewed |
| **MVP / V2 / V3** | MVP |

## CONN-04 - Friendship Progression

| **Purpose** | Turn repeated interaction into a deliberate friendship state. |
| --- | --- |
| **Who sees it** | Mutually connected users |
| **Entry point** | CONN-02 / post-event |
| **UI components** | Connection history; suggested next activity; "stay friends" action; shared contexts |
| **Primary CTA** | Keep in touch |
| **Secondary actions** | Not now / remove |
| **User inputs** | friendship intent |
| **Backend/API requirements** | POST /connections/{id}/friendship |
| **Data collected** | relationship state |
| **Next possible screens** | MSG-01 / EVENT-04 |
| **Success state** | Friendship state active |
| **Empty state** | No shared activity -> suggest one |
| **Error state** | Service error |
| **Edge cases** | Either party changes intent |
| **Analytics events** | friendship_marked |
| **MVP / V2 / V3** | MVP |

## CONN-05 - Dating Progression

| **Purpose** | Allow mutually opted-in romantic progression without forcing dating at first contact. |
| --- | --- |
| **Who sees it** | Users with compatible dating intent |
| **Entry point** | CONN-04 / connection |
| **UI components** | Dating opt-in; shared context; date planning CTA; safety explanation |
| **Primary CTA** | Opt into dating |
| **Secondary actions** | Stay friends / no longer dating |
| **User inputs** | dating intent |
| **Backend/API requirements** | POST /dating/connections/{id} |
| **Data collected** | dating relationship state |
| **Next possible screens** | MSG-01 / EVENT-07 / SAFE-05 |
| **Success state** | Both opt in -> dating active |
| **Empty state** | Only one opts in -> remain connection |
| **Error state** | Policy block |
| **Edge cases** | Conflicting intent / age rules |
| **Analytics events** | dating_intent_selected, dating_opted_in |
| **MVP / V2 / V3** | MVP |

## CONN-06 - Remove / Unmatch

| **Purpose** | End a connection with low friction and clear expectations. |
| --- | --- |
| **Who sees it** | Connected users |
| **Entry point** | CONN-03 / MSG-02 |
| **UI components** | Simple confirmation; optional non-accusatory reason; block/report shortcuts |
| **Primary CTA** | Remove connection |
| **Secondary actions** | Block / report |
| **User inputs** | reason optional |
| **Backend/API requirements** | DELETE /connections/{id}; POST /blocks |
| **Data collected** | connection state |
| **Next possible screens** | DISC-03 / MSG-01 / SAFE-02 |
| **Success state** | Connection removed |
| **Empty state** | N/A |
| **Error state** | Action failure |
| **Edge cases** | Existing safety case |
| **Analytics events** | connection_removed, unmatch_selected |
| **MVP / V2 / V3** | MVP |

## MSG-01 - Inbox

| **Purpose** | Show only conversations that the user is permitted to have. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Bottom nav / connection accepted |
| **UI components** | Connections, Circles, events; unread counts; safety state |
| **Primary CTA** | Open conversation |
| **Secondary actions** | Mute / search |
| **User inputs** | filters |
| **Backend/API requirements** | GET /conversations |
| **Data collected** | conversation list |
| **Next possible screens** | MSG-02/03/04 |
| **Success state** | Relevant conversations shown |
| **Empty state** | No messages -> join Circle CTA |
| **Error state** | Load failure |
| **Edge cases** | Conversation archived/blocked |
| **Analytics events** | inbox_viewed |
| **MVP / V2 / V3** | MVP |

## MSG-02 - 1:1 Conversation

| **Purpose** | Enable private conversation after mutual connection. |
| --- | --- |
| **Who sees it** | Connected users |
| **Entry point** | MSG-01 / CONN-02 |
| **UI components** | Shared-context header; prompt cards; composer; attachments later; block/report |
| **Primary CTA** | Send message |
| **Secondary actions** | Activity suggestion / block / report |
| **User inputs** | message, attachment if allowed |
| **Backend/API requirements** | GET /conversations/{id}; POST /messages; WS |
| **Data collected** | message content + safety metadata |
| **Next possible screens** | EVENT-05 / SAFE-03 / CONN-04 |
| **Success state** | Message delivered |
| **Empty state** | New thread -> prompt suggestions |
| **Error state** | Send failure |
| **Edge cases** | Recipient blocked/deactivated; safety warning |
| **Analytics events** | conversation_opened, message_sent |
| **MVP / V2 / V3** | MVP |

## MSG-03 - Circle / Group Chat

| **Purpose** | Coordinate a small group around an activity. |
| --- | --- |
| **Who sees it** | Circle members |
| **Entry point** | COMM-06 / HOME-02 |
| **UI components** | Pinned activity, members, composer, report, mute |
| **Primary CTA** | Send message |
| **Secondary actions** | Open event |
| **User inputs** | message/media if enabled |
| **Backend/API requirements** | GET /conversations/{id}; POST /messages |
| **Data collected** | group messages |
| **Next possible screens** | EVENT-05 / SAFE-03 |
| **Success state** | Group coordination occurs |
| **Empty state** | Group locked after event -> read-only recap |
| **Error state** | Send failure |
| **Edge cases** | Removed member cannot post |
| **Analytics events** | group_chat_opened, message_sent |
| **MVP / V2 / V3** | MVP |

## MSG-04 - Message Request / Permission

| **Purpose** | Hold unsolicited contact outside the mutual-connection model. |
| --- | --- |
| **Who sees it** | Recipient / initiator |
| **Entry point** | Optional legacy/import use |
| **UI components** | Request context; limited preview; accept/restrict/report |
| **Primary CTA** | Accept |
| **Secondary actions** | Decline / block |
| **User inputs** | request decision |
| **Backend/API requirements** | POST /message-requests/{id} |
| **Data collected** | request state |
| **Next possible screens** | MSG-02 / SAFE-03 |
| **Success state** | Private chat unlocked |
| **Empty state** | No permission -> keep blocked |
| **Error state** | Service error |
| **Edge cases** | Spam rate limit |
| **Analytics events** | message_request_viewed |
| **MVP / V2 / V3** | MVP |

## MSG-05 - Media / Voice Note Picker

| **Purpose** | Add richer communication only after basic text interaction works. |
| --- | --- |
| **Who sees it** | Connected users |
| **Entry point** | MSG-02 |
| **UI components** | Photo/video/voice controls; consent warning; size/type limits |
| **Primary CTA** | Attach/send |
| **Secondary actions** | Cancel |
| **User inputs** | media bytes, mime type, caption |
| **Backend/API requirements** | POST /media/upload; POST /messages |
| **Data collected** | media metadata, moderation status |
| **Next possible screens** | MSG-02 |
| **Success state** | Attachment delivered |
| **Empty state** | No attachment -> prompt |
| **Error state** | Upload failure |
| **Edge cases** | NSFW/malware scan fail |
| **Analytics events** | media_upload_started, media_sent |
| **MVP / V2 / V3** | V2 |

## MSG-06 - Conversation Safety Prompt

| **Purpose** | Interrupt suspicious, coercive or financially risky interactions. |
| --- | --- |
| **Who sees it** | At-risk conversation participants |
| **Entry point** | MSG-02/03 |
| **UI components** | Inline alert; scam education; block/report; do not continue outside platform reminder |
| **Primary CTA** | Review / report |
| **Secondary actions** | Dismiss once |
| **User inputs** | none |
| **Backend/API requirements** | POST /safety/conversation-events |
| **Data collected** | risk signal, warning shown |
| **Next possible screens** | SAFE-03 |
| **Success state** | User warned / report started |
| **Empty state** | No warning |
| **Error state** | Detection failure -> no UX impact |
| **Edge cases** | Scam pattern; financial solicitation; coercion |
| **Analytics events** | safety_warning_shown |
| **MVP / V2 / V3** | MVP |

## EVENT-01 - Event Directory

| **Purpose** | Discover concrete, safe, local activities. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Home/Discover |
| **UI components** | Date/time; area; group size; price band; host; verification; safety label |
| **Primary CTA** | Open event |
| **Secondary actions** | Save / share |
| **User inputs** | filters |
| **Backend/API requirements** | GET /events |
| **Data collected** | event summaries |
| **Next possible screens** | EVENT-03 |
| **Success state** | Event list available |
| **Empty state** | No event -> propose a Circle |
| **Error state** | Load failure |
| **Edge cases** | Event cancelled |
| **Analytics events** | event_directory_viewed |
| **MVP / V2 / V3** | MVP |

## EVENT-02 - Create Event / Activity

| **Purpose** | Let a host convert a Circle/community idea into a scheduled action. |
| --- | --- |
| **Who sees it** | Trusted users/hosts |
| **Entry point** | COMM-03 / Connections |
| **UI components** | Title, category, date/time, approximate venue, capacity, visibility, rules |
| **Primary CTA** | Create event |
| **Secondary actions** | Save draft |
| **User inputs** | event fields |
| **Backend/API requirements** | POST /events |
| **Data collected** | event draft |
| **Next possible screens** | EVENT-03 |
| **Success state** | Draft created |
| **Empty state** | Invalid event -> field errors |
| **Error state** | Venue invalid |
| **Edge cases** | Unsafe venue; excessive capacity; duplicate event |
| **Analytics events** | event_creation_started, event_created |
| **MVP / V2 / V3** | MVP |

## EVENT-03 - Event Detail

| **Purpose** | Give a complete decision surface before RSVP. |
| --- | --- |
| **Who sees it** | Eligible users |
| **Entry point** | EVENT-01/02 |
| **UI components** | What/when/where; approximate location; host; attendees count; rules; safety; accessibility; price |
| **Primary CTA** | RSVP / request to join |
| **Secondary actions** | Share / report |
| **User inputs** | none |
| **Backend/API requirements** | GET /events/{id} |
| **Data collected** | event details |
| **Next possible screens** | EVENT-04 / SAFE-05 |
| **Success state** | RSVP recorded |
| **Empty state** | Full -> waitlist |
| **Error state** | Load failure |
| **Edge cases** | Cancelled/full/restricted |
| **Analytics events** | event_viewed, event_rsvp_started |
| **MVP / V2 / V3** | MVP |

## EVENT-04 - RSVP / Attendance State

| **Purpose** | Manage participation. |
| --- | --- |
| **Who sees it** | Event participants |
| **Entry point** | EVENT-03 |
| **UI components** | Going/waitlist/cancel; reminders; group chat; venue details near event time |
| **Primary CTA** | Confirm / manage RSVP |
| **Secondary actions** | Cancel RSVP |
| **User inputs** | attendance state |
| **Backend/API requirements** | POST /events/{id}/rsvp; DELETE /events/{id}/rsvp |
| **Data collected** | RSVP state |
| **Next possible screens** | MSG-03 / EVENT-05 |
| **Success state** | Participant state updated |
| **Empty state** | Waitlisted |
| **Error state** | RSVP failure |
| **Edge cases** | Capacity changed |
| **Analytics events** | event_rsvp_confirmed, event_rsvp_cancelled |
| **MVP / V2 / V3** | MVP |

## EVENT-05 - Pre-Event Safety & Check-In

| **Purpose** | Provide safety expectations and optional check-in without exposing location tracking. |
| --- | --- |
| **Who sees it** | Attendees |
| **Entry point** | Near event start |
| **UI components** | Public venue reminder; emergency contact shortcut; check-in; report; meetup code |
| **Primary CTA** | Check in |
| **Secondary actions** | Skip check-in / leave |
| **User inputs** | optional check-in state |
| **Backend/API requirements** | POST /events/{id}/checkin |
| **Data collected** | check-in timestamp, safety state |
| **Next possible screens** | EVENT-06 |
| **Success state** | Attendance confirmed |
| **Empty state** | No check-in -> can still attend |
| **Error state** | Network failure -> local retry |
| **Edge cases** | Venue changed; host absent |
| **Analytics events** | event_checkin |
| **MVP / V2 / V3** | MVP |

## EVENT-06 - Post-Event Recap / Follow-up

| **Purpose** | Convert the event into continued social connection. |
| --- | --- |
| **Who sees it** | Attendees |
| **Entry point** | After event |
| **UI components** | Recap; private feedback; attendee list; connect suggestions; next activity |
| **Primary CTA** | Connect / join next |
| **Secondary actions** | Dismiss |
| **User inputs** | feedback, connection intent |
| **Backend/API requirements** | GET /events/{id}/followup; POST /events/{id}/feedback |
| **Data collected** | feedback + relationship signals |
| **Next possible screens** | HOME-03 / CONN-01 |
| **Success state** | Follow-up action complete |
| **Empty state** | No attendees to recommend -> feedback only |
| **Error state** | Save failure |
| **Edge cases** | Incident report supersedes normal follow-up |
| **Analytics events** | event_followup_completed |
| **MVP / V2 / V3** | MVP |

## EVENT-07 - Date Planning

| **Purpose** | Help dating users move from chat to a safe public activity. |
| --- | --- |
| **Who sees it** | Dating-connected users |
| **Entry point** | CONN-05 / MSG-02 |
| **UI components** | Public venue categories; time options; shared interests; safety checklist |
| **Primary CTA** | Propose date |
| **Secondary actions** | Keep chatting |
| **User inputs** | venue/time proposal |
| **Backend/API requirements** | POST /dates/proposals |
| **Data collected** | date plan, venue category, time |
| **Next possible screens** | SAFE-05 / EVENT-03 |
| **Success state** | Mutual date plan created |
| **Empty state** | No overlap -> suggest new times |
| **Error state** | Venue unavailable |
| **Edge cases** | High-risk venue, one-sided proposal |
| **Analytics events** | date_plan_started, date_plan_confirmed |
| **MVP / V2 / V3** | MVP |

## SAFE-01 - Safety Center

| **Purpose** | Centralize user protection and help. |
| --- | --- |
| **Who sees it** | All authenticated users |
| **Entry point** | Profile/settings/notifications |
| **UI components** | Report, block, restrict, privacy, dating safety, scam education, incident support |
| **Primary CTA** | Report or block |
| **Secondary actions** | Privacy controls |
| **User inputs** | none |
| **Backend/API requirements** | GET /safety/center |
| **Data collected** | safety shortcuts |
| **Next possible screens** | SAFE-02/03/04/05/06 |
| **Success state** | Action selected |
| **Empty state** | N/A |
| **Error state** | Load failure -> direct action fallbacks |
| **Edge cases** | Immediate danger -> external emergency services guidance |
| **Analytics events** | safety_center_viewed |
| **MVP / V2 / V3** | MVP |

## SAFE-02 - Report User / Profile

| **Purpose** | Create a structured report and immediately protect the reporter. |
| --- | --- |
| **Who sees it** | Any user |
| **Entry point** | Profile / safety |
| **UI components** | Category, evidence, block toggle, context summary |
| **Primary CTA** | Submit report |
| **Secondary actions** | Block first / cancel |
| **User inputs** | reason, evidence |
| **Backend/API requirements** | POST /reports/users |
| **Data collected** | report record |
| **Next possible screens** | SAFE-07 / previous screen |
| **Success state** | Report ID and protection state |
| **Empty state** | No reason selected |
| **Error state** | Upload/API failure |
| **Edge cases** | Retaliation risk; evidence privacy |
| **Analytics events** | report_started, report_submitted, user_blocked |
| **MVP / V2 / V3** | MVP |

## SAFE-03 - Report Message / Content

| **Purpose** | Report a specific harmful message or post with enough context. |
| --- | --- |
| **Who sees it** | Users with content access |
| **Entry point** | Message/community |
| **UI components** | Selected content, report category, evidence, block/restrict |
| **Primary CTA** | Submit |
| **Secondary actions** | Cancel |
| **User inputs** | reason, evidence |
| **Backend/API requirements** | POST /reports/content |
| **Data collected** | report + content reference |
| **Next possible screens** | SAFE-07 / MSG-02 |
| **Success state** | Content hidden locally and report submitted |
| **Empty state** | N/A |
| **Error state** | Submission failure |
| **Edge cases** | Evidence deleted by offender |
| **Analytics events** | content_reported |
| **MVP / V2 / V3** | MVP |

## SAFE-04 - Block / Restrict

| **Purpose** | Stop contact/discovery without requiring a full report. |
| --- | --- |
| **Who sees it** | Any user |
| **Entry point** | Profile/chat/community |
| **UI components** | Block/restrict consequences; confirmation |
| **Primary CTA** | Block |
| **Secondary actions** | Restrict / cancel |
| **User inputs** | user ID |
| **Backend/API requirements** | POST /blocks; POST /restrictions |
| **Data collected** | block state |
| **Next possible screens** | previous screen / SET-06 |
| **Success state** | Contact/discovery removed |
| **Empty state** | N/A |
| **Error state** | Action failure |
| **Edge cases** | Mutual community remains with limited visibility |
| **Analytics events** | user_blocked, user_restricted |
| **MVP / V2 / V3** | MVP |

## SAFE-05 - Date Safety

| **Purpose** | Support safer offline dating/meetups. |
| --- | --- |
| **Who sees it** | Dating/event participants |
| **Entry point** | EVENT-07 / EVENT-05 |
| **UI components** | Public venue reminder; transport independence; check-in; trusted contact shortcut; report; leave date |
| **Primary CTA** | Start safety plan |
| **Secondary actions** | Skip optional reminders |
| **User inputs** | safety plan settings |
| **Backend/API requirements** | POST /dates/{id}/safety-plan |
| **Data collected** | safety plan record, optional trusted contact |
| **Next possible screens** | EVENT-05 / SAFE-06 |
| **Success state** | Safety plan saved |
| **Empty state** | User declines optional tools -> continue |
| **Error state** | Network failure -> local fallback |
| **Edge cases** | Emergency situation |
| **Analytics events** | date_safety_opened, safety_plan_saved |
| **MVP / V2 / V3** | MVP |

## SAFE-06 - Trusted Contact Setup

| **Purpose** | Allow optional user-controlled notification to a chosen contact for an offline experience. |
| --- | --- |
| **Who sees it** | Users choosing feature |
| **Entry point** | SAFE-05 / Settings |
| **UI components** | Contact selection, consent, what is shared, expiry |
| **Primary CTA** | Save trusted contact |
| **Secondary actions** | Skip |
| **User inputs** | contact, event/date, expiry |
| **Backend/API requirements** | POST /trusted-contacts |
| **Data collected** | encrypted contact reference, consent log |
| **Next possible screens** | SAFE-05 |
| **Success state** | Trusted contact configured |
| **Empty state** | Not configured -> skip |
| **Error state** | Verification/contact error |
| **Edge cases** | Abuse by coercive contact; wrong contact |
| **Analytics events** | trusted_contact_added |
| **MVP / V2 / V3** | V2 |

## SAFE-07 - Safety Case Status

| **Purpose** | Give reporter transparency without exposing moderation internals. |
| --- | --- |
| **Who sees it** | Reporters |
| **Entry point** | SAFE-02/03 notifications |
| **UI components** | Case ID; received; action/closed; appeal where relevant; support links |
| **Primary CTA** | View outcome |
| **Secondary actions** | Appeal if available |
| **User inputs** | case ID, appeal text |
| **Backend/API requirements** | GET /reports/{id}; POST /reports/{id}/appeal |
| **Data collected** | case state |
| **Next possible screens** | SET-01 / prior screen |
| **Success state** | Status shown |
| **Empty state** | No active cases -> history |
| **Error state** | Load error |
| **Edge cases** | Sensitive evidence not displayed |
| **Analytics events** | report_status_viewed, appeal_started |
| **MVP / V2 / V3** | MVP/V2 |

## SAFE-08 - Safety / Age Restriction Hold

| **Purpose** | Stop access where age or safety conditions make the account ineligible. |
| --- | --- |
| **Who sees it** | Underage/unsafe accounts |
| **Entry point** | AUTH/ONB/bootstrap |
| **UI components** | Reason, allowed actions, appeal/support route |
| **Primary CTA** | Contact support |
| **Secondary actions** | Exit app |
| **User inputs** | none |
| **Backend/API requirements** | GET /account/status |
| **Data collected** | eligibility state |
| **Next possible screens** | AUTH-02 or support |
| **Success state** | Access blocked correctly |
| **Empty state** | N/A |
| **Error state** | Support unavailable -> help link |
| **Edge cases** | False positive age result |
| **Analytics events** | account_restricted_viewed |
| **MVP / V2 / V3** | MVP |

## SET-01 - Settings Home

| **Purpose** | Centralize account, privacy, notifications, security and subscription controls. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | Me |
| **UI components** | Grouped rows; account status; data controls |
| **Primary CTA** | Open selected setting |
| **Secondary actions** | Back |
| **User inputs** | none |
| **Backend/API requirements** | GET /settings/summary |
| **Data collected** | settings state |
| **Next possible screens** | SET-02... |
| **Success state** | Settings loaded |
| **Empty state** | N/A |
| **Error state** | Load failure |
| **Edge cases** | Account suspended |
| **Analytics events** | settings_viewed |
| **MVP / V2 / V3** | MVP |

## SET-02 - Privacy & Discovery Settings

| **Purpose** | Control who can discover/contact the user. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | SET-01 |
| **UI components** | Visibility; intent discoverability; radius; exact area; message policy; community visibility |
| **Primary CTA** | Save |
| **Secondary actions** | Reset defaults |
| **User inputs** | privacy fields |
| **Backend/API requirements** | GET/PUT /settings/privacy |
| **Data collected** | privacy settings |
| **Next possible screens** | SET-01 |
| **Success state** | Settings saved |
| **Empty state** | Defaults explain |
| **Error state** | Save failure |
| **Edge cases** | Changes affect current connections differently |
| **Analytics events** | privacy_settings_updated |
| **MVP / V2 / V3** | MVP |

## SET-03 - Dating Preferences

| **Purpose** | Manage romantic discovery rules separately from general social preferences. |
| --- | --- |
| **Who sees it** | Users with dating enabled |
| **Entry point** | SET-01 |
| **UI components** | Age range; gender/orientation preference as user chooses; distance band; relationship intent; dealbreakers |
| **Primary CTA** | Save |
| **Secondary actions** | Disable dating discovery |
| **User inputs** | preference values |
| **Backend/API requirements** | GET/PUT /settings/dating |
| **Data collected** | dating preferences |
| **Next possible screens** | SET-01 |
| **Success state** | Dating rules updated |
| **Empty state** | Dating disabled -> explanation |
| **Error state** | Validation error |
| **Edge cases** | Sensitive preference visibility |
| **Analytics events** | dating_preferences_updated |
| **MVP / V2 / V3** | MVP |

## SET-04 - Friendship Preferences

| **Purpose** | Manage friend-discovery boundaries. |
| --- | --- |
| **Who sees it** | Users open to friendship |
| **Entry point** | SET-01 |
| **UI components** | group size; age band; language; activity; distance; availability |
| **Primary CTA** | Save |
| **Secondary actions** | Disable friend discovery |
| **User inputs** | preference values |
| **Backend/API requirements** | GET/PUT /settings/friendship |
| **Data collected** | friendship preferences |
| **Next possible screens** | SET-01 |
| **Success state** | Saved |
| **Empty state** | No preferences -> defaults |
| **Error state** | Save failure |
| **Edge cases** | Niche group filters too restrictive |
| **Analytics events** | friendship_preferences_updated |
| **MVP / V2 / V3** | MVP |

## SET-05 - Notification Preferences

| **Purpose** | Prevent notification overload and preserve safety/system alerts. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | SET-01 |
| **UI components** | Push/in-app/email categories; quiet hours; event reminders; safety cannot be disabled entirely |
| **Primary CTA** | Save |
| **Secondary actions** | Reset |
| **User inputs** | notification preferences |
| **Backend/API requirements** | GET/PUT /settings/notifications |
| **Data collected** | preference state |
| **Next possible screens** | SET-01 |
| **Success state** | Saved |
| **Empty state** | Defaults if unset |
| **Error state** | Save failure |
| **Edge cases** | Device permission denied |
| **Analytics events** | notification_settings_updated |
| **MVP / V2 / V3** | MVP |

## SET-06 - Blocked / Restricted Users

| **Purpose** | Review protection list. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | SET-01/SAFE-04 |
| **UI components** | Blocked/restricted list; unblock; consequences |
| **Primary CTA** | Unblock |
| **Secondary actions** | Back |
| **User inputs** | user ID |
| **Backend/API requirements** | GET/DELETE /blocks; GET/DELETE /restrictions |
| **Data collected** | block state |
| **Next possible screens** | PROF-03 / SET-01 |
| **Success state** | State updated |
| **Empty state** | No blocked users |
| **Error state** | Load failure |
| **Edge cases** | User permanently banned cannot be restored |
| **Analytics events** | blocked_list_viewed |
| **MVP / V2 / V3** | MVP |

## SET-07 - Verification & Connected Accounts

| **Purpose** | Manage verification and OAuth connections. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | SET-01 |
| **UI components** | Verification status; Google/Apple; phone/email; revoke connection |
| **Primary CTA** | Manage |
| **Secondary actions** | Disconnect where allowed |
| **User inputs** | none |
| **Backend/API requirements** | GET /verification/status; GET/DELETE /connections/oauth |
| **Data collected** | account links |
| **Next possible screens** | SET-01 |
| **Success state** | Status shown |
| **Empty state** | No connected account |
| **Error state** | Action error |
| **Edge cases** | Last login method cannot be removed without alternative |
| **Analytics events** | account_connections_viewed |
| **MVP / V2 / V3** | V2 |

## SET-08 - Security / Sessions

| **Purpose** | Manage login security and sessions. |
| --- | --- |
| **Who sees it** | Authenticated users |
| **Entry point** | SET-01 |
| **UI components** | Passwordless state; active sessions; security challenge history; logout other devices |
| **Primary CTA** | Log out other devices |
| **Secondary actions** | Open session list |
| **User inputs** | session IDs |
| **Backend/API requirements** | GET/DELETE /sessions |
| **Data collected** | sessions |
| **Next possible screens** | SET-01 / AUTH-08 |
| **Success state** | Sessions revoked |
| **Empty state** | Only current session |
| **Error state** | API failure |
| **Edge cases** | Suspicious session requires challenge |
| **Analytics events** | sessions_viewed, logout_other_devices |
| **MVP / V2 / V3** | MVP |

## ADMIN-01 - Admin Overview

| **Purpose** | Show moderation and service health priorities. |
| --- | --- |
| **Who sees it** | Authorized staff |
| **Entry point** | Internal admin login |
| **UI components** | Safety queue; reports; verification anomalies; system health; metrics |
| **Primary CTA** | Open queue |
| **Secondary actions** | Search/filter |
| **User inputs** | filters |
| **Backend/API requirements** | GET /admin/overview |
| **Data collected** | aggregate moderation data |
| **Next possible screens** | ADMIN-02... |
| **Success state** | Dashboard loaded |
| **Empty state** | No queue -> healthy state |
| **Error state** | Service error |
| **Edge cases** | Role mismatch |
| **Analytics events** | admin_dashboard_viewed |
| **MVP / V2 / V3** | V2 |

## ADMIN-02 - User Safety Queue

| **Purpose** | Review user/profile reports. |
| --- | --- |
| **Who sees it** | Trust & safety staff |
| **Entry point** | ADMIN-01 |
| **UI components** | Severity; evidence; history; linked reports; actions; notes |
| **Primary CTA** | Resolve / escalate |
| **Secondary actions** | Assign / filter |
| **User inputs** | case, action, reason |
| **Backend/API requirements** | GET /admin/reports/users; POST /admin/cases/actions |
| **Data collected** | case record |
| **Next possible screens** | ADMIN-03 / SAFE-07 |
| **Success state** | Action logged |
| **Empty state** | No cases |
| **Error state** | Load failure |
| **Edge cases** | Protected case handling |
| **Analytics events** | case_reviewed, case_actioned |
| **MVP / V2 / V3** | V2 |

## ADMIN-03 - Content / Message Moderation Queue

| **Purpose** | Review reports and automated flags from messages/posts. |
| --- | --- |
| **Who sees it** | Moderators |
| **Entry point** | ADMIN-01 |
| **UI components** | Content preview; context; classifier signals; action buttons; user history |
| **Primary CTA** | Remove / warn / escalate |
| **Secondary actions** | Dismiss / assign |
| **User inputs** | action, reason |
| **Backend/API requirements** | GET /admin/moderation/content; POST /admin/moderation/actions |
| **Data collected** | moderation item |
| **Next possible screens** | ADMIN-04 |
| **Success state** | Content action recorded |
| **Empty state** | No queue |
| **Error state** | Load failure |
| **Edge cases** | Illegal content evidence handling |
| **Analytics events** | content_case_actioned |
| **MVP / V2 / V3** | V2 |

## ADMIN-04 - Verification Review

| **Purpose** | Review failed/high-risk verification cases and provider signals. |
| --- | --- |
| **Who sees it** | Trust & safety staff |
| **Entry point** | ADMIN-01 |
| **UI components** | Verification evidence, provider outcome, user risk history |
| **Primary CTA** | Approve / reject / request retry |
| **Secondary actions** | Escalate |
| **User inputs** | decision, reason |
| **Backend/API requirements** | GET /admin/verification; POST /admin/verification/actions |
| **Data collected** | verification case |
| **Next possible screens** | ADMIN-02 |
| **Success state** | Decision logged |
| **Empty state** | No cases |
| **Error state** | Provider error |
| **Edge cases** | Sensitive documents access logging |
| **Analytics events** | verification_case_actioned |
| **MVP / V2 / V3** | V2 |

## ADMIN-05 - Community Moderation

| **Purpose** | Handle community abuse and host issues. |
| --- | --- |
| **Who sees it** | Moderators |
| **Entry point** | ADMIN-01 |
| **UI components** | Community; host; reports; member actions; rules |
| **Primary CTA** | Restrict/remove/escalate |
| **Secondary actions** | Assign |
| **User inputs** | action, reason |
| **Backend/API requirements** | GET /admin/communities; POST /admin/community-actions |
| **Data collected** | community case |
| **Next possible screens** | ADMIN-02 |
| **Success state** | Case closed |
| **Empty state** | No cases |
| **Error state** | Load failure |
| **Edge cases** | Host retaliation risk |
| **Analytics events** | community_case_actioned |
| **MVP / V2 / V3** | V2 |

## ADMIN-06 - Audit / Appeals

| **Purpose** | Maintain traceability for severe moderation decisions. |
| --- | --- |
| **Who sees it** | Authorized staff |
| **Entry point** | ADMIN-01 |
| **UI components** | Audit log; decision chain; appeal evidence; actor; timestamps |
| **Primary CTA** | Review appeal |
| **Secondary actions** | Filter/export if permitted |
| **User inputs** | case/action filters |
| **Backend/API requirements** | GET /admin/audit; POST /admin/appeals/actions |
| **Data collected** | immutable audit records |
| **Next possible screens** | ADMIN-02/03/04 |
| **Success state** | Decision logged |
| **Empty state** | No appeals |
| **Error state** | Load failure |
| **Edge cases** | Tampering detection |
| **Analytics events** | appeal_reviewed |
| **MVP / V2 / V3** | V2 |

# 6. Master User Flows

| **Flow ID** | **User goal** | **Start** | **Steps** | **Decision points** | **End state** |
| --- | --- | --- | --- | --- | --- |
| F01 | New signup | AUTH-02 | AUTH-02 -> AUTH-03 -> AUTH-05 -> ONB-01 -> ONB-09 -> PROF-01 -> HOME-01 | Age >= 18?; identifier already exists?; verification passes? | Activated account or restricted state |
| F02 | Existing login | AUTH-02 | AUTH-04 -> AUTH-05 -> AUTH-07 if risk -> HOME-01 | OTP valid?; suspicious login? | Authenticated session |
| F03 | Forgot access | AUTH-04 | AUTH-06 -> AUTH-05 -> HOME-01 | Recovery proof accepted? | Recovered session or support case |
| F04 | Complete onboarding | ONB-01 | ONB-01 -> ONB-02 -> ONB-03 -> ONB-04 -> ONB-05 -> ONB-06 -> ONB-07 -> ONB-08 -> ONB-09 -> HOME-01 | Minimum profile complete?; location set? | Discoverable profile |
| F05 | Edit profile | PROF-01 | PROF-01 -> PROF-02 -> PROF-01 | Validation passed? | Updated profile |
| F06 | Discover Circle | DISC-01 | DISC-01 -> DISC-02 -> COMM-02 -> COMM-04 -> COMM-03 | Public/private? approval required? | Community membership |
| F07 | Discover person | DISC-03 | DISC-03 -> PROF-03 -> CONN-01 -> CONN-02 -> MSG-02 | Eligible?; request accepted? | Mutual connection or declined |
| F08 | Start friendship | CONN-02 | CONN-02 -> MSG-02 -> EVENT-07/05 -> CONN-04 | Repeated interaction?; mutual connection? | Friendship state |
| F09 | Start dating | CONN-02 | CONN-02 -> MSG-02 -> CONN-05 -> EVENT-07 -> SAFE-05 -> EVENT-05 -> EVENT-06 | Both opted into dating?; safe date plan? | Dating relationship / ended safely |
| F10 | Join community | COMM-02 | COMM-02 -> COMM-04 -> COMM-03 | Request needed?; blocked? | Member |
| F11 | Create community | COMM-01 | COMM-01 -> COMM-07 -> COMM-08 -> COMM-03 | Approved? | Published community or revision |
| F12 | Create event | COMM-03 | COMM-03 -> EVENT-02 -> EVENT-03 -> EVENT-04 | Valid time/venue/capacity? | Event published |
| F13 | Join event | EVENT-01 | EVENT-01 -> EVENT-03 -> EVENT-04 -> EVENT-05 -> EVENT-06 | Capacity?; eligibility? | Attendance + follow-up |
| F14 | Community -> friendship | COMM-03 | COMM-03 -> COMM-06 -> repeated messages -> DISC/CONN -> CONN-04 | Mutual connection? | Friendship state |
| F15 | Community -> dating | COMM-03 | COMM-03 -> repeated interaction -> CONN-01 -> CONN-02 -> CONN-05 | Dating intent compatible? | Dating-enabled connection |
| F16 | Unmatch | MSG-02 | MSG-02 -> CONN-06 | Safety concern? | Connection removed |
| F17 | Block | PROF-03 | PROF-03 -> SAFE-04 | Confirm? | User hidden/contact blocked |
| F18 | Report user | PROF-03 | PROF-03 -> SAFE-02 -> SAFE-04 optional -> SAFE-07 | Immediate protection required? | Case submitted |
| F19 | Report content | MSG-02/COMM-05 | content -> SAFE-03 -> SAFE-07 | Evidence available? | Content hidden/reported |
| F20 | Safety incident at event | EVENT-05 | EVENT-05 -> SAFE-01 -> SAFE-02/SAFE-05 -> SAFE-07 | Immediate danger?; emergency service required? | Protected user + safety case |
| F21 | Upgrade subscription | SET-01 | SET-01 -> subscription screen -> checkout -> entitlement | Payment success? | Entitlement active |
| F22 | Cancel subscription | SET-01 | SET-01 -> subscription -> cancel -> confirmation | Existing entitlement? | Auto-renew off / entitlement expiration |
| F23 | Logout | SET-08 | SET-08 -> revoke current session -> AUTH-02 | Network available? | Signed out |
| F24 | Delete account | SET-01 | SET-01 -> delete -> reason -> warning -> data scope -> confirm -> grace period if applicable -> logout | Reauthentication?; payment?; active safety case? | Deletion requested/processed |

## 6.1 Flow diagram format for implementation

START

  |

  v

SCREEN

  |

USER ACTION

  |

DECISION

  +-------- YES --------> NEXT SCREEN -> NEXT ACTION

  |

  +-------- NO ---------> ALTERNATE SCREEN -> RECOVERY

# 7. Onboarding and Profile Data Contract

## 7.1 Data classification

| **Field class** | **Examples** | **Visibility** | **Purpose** | **MVP** |
| --- | --- | --- | --- | --- |
| Public profile | display name, age band, city/zone, interests, short bio, profile photo | Eligible users only | Human-readable discovery | Yes |
| Private account | phone/email, login/security metadata | User/system only | Authentication | Yes |
| Matching-only | availability, group-size preference, hidden dealbreakers | Recommendation service only unless user chooses to display | Ranking | Yes |
| Safety-sensitive | reports, blocks, moderation history, verification evidence | Trust & safety only | Protection/enforcement | Yes |
| Optional sensitive preference | sexual orientation, dating preferences | User-controlled; restricted use | Eligibility/intent matching | Yes only when necessary |
| Analytics | events, timestamps, feature use | Analytics system | Product measurement | Yes |
| Raw recommendation signals | candidate scores, feature values | Recommendation system | Ranking/debugging | V2 |

## 7.2 Minimum onboarding data

| **Field** | **Required?** | **Reason** | **Skip behavior** |
| --- | --- | --- | --- |
| DOB / age assurance | REQUIRED | 18+ product eligibility and safety | No skip |
| Display name | REQUIRED | Interaction identity | No skip |
| City/area | REQUIRED | Local network density | Manual selection fallback |
| Primary intent | REQUIRED | Avoid mismatched discovery | Choose Explore if unsure |
| 5+ interests | REQUIRED for activation | Needed for initial recommendation | Activation blocked until enough signal |
| Profile photo | REQUIRED before person discovery; optional for community-only browsing | Identity and safety context | May browse Communities before photo approval |
| Social style | OPTIONAL | Useful contextual ranking | Use conservative defaults |
| Availability | OPTIONAL | Improves activity fit | Broad defaults |
| Taste entities | OPTIONAL | Better conversation context | No penalty for skipping |
| Exact GPS | NEVER REQUIRED | Privacy minimization | City/zone manual fallback |

# 8. Recommendation and Matching System

## 8.1 Ranking stages

STAGE 0: POLICY FILTERS

  - 18+ eligibility

  - block/report exclusions

  - intent eligibility

  - location boundary

  - community privacy rules

STAGE 1: CANDIDATE RETRIEVAL

  - same/related interests

  - local activity/community pool

  - availability overlap

STAGE 2: CONTEXT RANKING

  - shared activities

  - shared Circles

  - taste overlap

  - group-size fit

  - interaction recency

  - mutual response patterns

STAGE 3: DIVERSITY / EXPLORATION

  - avoid showing the same narrow archetype

  - reserve a small exploration budget

STAGE 4: EXPLANATION

  - generate human-readable reason codes

  - allow user feedback

STAGE 5: OUTCOME LEARNING

  - repeated interaction

  - reciprocal connection

  - event attendance

  - durable relationship signals

## 8.2 Proposed scoring model - MVP

Use a transparent weighted score only as an engineering ranking mechanism, not as a user-facing compatibility claim.

candidate_score =

  0.25 * interest_activity_overlap

+ 0.20 * availability_fit

+ 0.15 * location_fit

+ 0.15 * group_size_fit

+ 0.10 * intent_fit

+ 0.10 * community_context

+ 0.05 * taste_overlap

Hard filters are applied before this score. Weights are initial test parameters, not scientifically validated truths. Run experiments and learn weights from observed outcomes.

## 8.3 User-facing explanation

Never render "87% compatible." Instead render 2-4 concrete reason chips, for example: "3 shared interests", "Both prefer 4-6 person groups", "Both free Sunday evening", "Same photography Circle". The explanation should reflect actual stored signals and avoid inferred psychological claims.

## 8.4 Feedback signals

| **Feedback** | **Interpretation** | **Model use** |
| --- | --- | --- |
| Not relevant | Candidate is a poor fit in current context | Down-rank similar candidate pattern |
| Interested | Candidate/context seems useful | Increase exploration probability cautiously |
| Joined Circle | Strong contextual fit | Positive candidate/interest signal |
| Repeated interaction | High-value outcome | Primary positive training signal |
| Connection accepted | Mutuality signal | Positive but weaker than repeat interaction |
| Block/report | Safety or severe mismatch signal | Immediate exclusion/enforcement; never use as generic negative preference |
| Event attended + follow-up | High-value outcome | Strong positive relationship-context signal |

# 9. Community Design and Governance

## 9.1 Community creation constraints

Creator must have an account in good standing.

Name and description pass automated safety checks.

Location must be at city/zone or broader level; no home-address communities.

Category and interest taxonomy must be selected from controlled values, with a limited "other" path.

Private communities require join approval.

Dating-only language inside a community must not bypass the platform intent system.

Adult/sexual services, solicitation, financial schemes and unlawful activity are prohibited.

Community hosts receive explicit moderation responsibilities before publication.

## 9.2 Community health metrics

| **Metric** | **Definition** | **Why it matters** |
| --- | --- | --- |
| Active community | Community with meaningful participation in last 7/30 days | Avoid vanity group count |
| Participation rate | Active participants / members | Measures usefulness |
| Circle conversion | Members entering a Circle / active members | Tests relationship progression |
| Repeat participation | Users returning to same community/activity | Stronger retention signal |
| Report rate | Safety reports / active users | Safety burden |
| Moderator response time | Median time from report to first action | Trust/safety operations |

# 10. Trust, Safety, Privacy and Compliance Architecture

## 10.1 Threat -> control matrix

| **Threat** | **Prevent** | **Detect** | **User control** | **Moderator/system action** |
| --- | --- | --- | --- | --- |
| Fake profile | Age/identity/liveness options; profile quality gates | Image/behavior signals; reports | Block/report | Restrict, review, remove |
| Catfishing | Verification tiers; contextual history | Identity inconsistency; reports | Block/report | Verification review |
| Spam/scam | Rate limits; financial solicitation rules | Text/URL/behavior classifiers | Report/block | Freeze, review, remove |
| Harassment | Mutual connection; no unsolicited DM by default | Message classifier + reports | Block/restrict/report | Warn/restrict/ban |
| Stalking | Approximate location only; privacy controls | Repeated unwanted contacts/reports | Hide/block | Restrict/ban |
| Unsafe meetup | Public venue guidance; event rules | Incident reports/check-ins | Leave/report/trusted contact | Safety escalation |
| Ban evasion | Device/account linkage signals | Behavior + identity consistency | Report | Re-enforce action |
| Moderator abuse | Role permissions; audit logs | Audit review | Report community | Remove role/escalate |

## 10.2 Data minimization rules

Do not store exact continuous location when city/zone is enough.

Do not expose a user’s precise distance or routine schedule.

Keep safety evidence in restricted-access systems with explicit retention rules.

Separate recommendation data from public profile display.

Record consent versions for optional sensitive preferences and marketing.

Provide a user-readable export/deletion pathway where legally required.

Avoid collecting contact lists simply to create social proof; test referral flows without unnecessary address-book access.

## 10.3 Regulatory implementation note

The Digital Personal Data Protection Rules, 2025 were published by MeitY on 14 November 2025 together with an enforcement timeline and Data Protection Board materials. The IT intermediary framework includes grievance redressal obligations for covered intermediaries. Exact obligations depend on the product’s final legal classification, user base, data processing and operational model; Indian counsel should confirm the launch checklist and effective dates before production. [R14][R15]

# 11. Search and Navigation Specification

## 11.1 Bottom navigation

| **Tab** | **Primary job** | **What it must not become** |
| --- | --- | --- |
| Home | Next useful social action this week | Infinite content feed |
| Discover | Find people, Circles and activities | Endless swipe deck |
| Circles | Persistent interest communities and small groups | Reddit clone |
| Messages | Continue accepted social contexts | Unsolicited inbox |
| Me | Profile, safety, preferences, account | Settings dumping ground without grouping |

## 11.2 Global search scope

Search should initially cover Communities, Circles, Activities and selected public interest/taste entities. People search should be bounded by discovery eligibility and privacy; it must not become a global directory.

| **Search object** | **MVP** | **Filters** | **Security constraint** |
| --- | --- | --- | --- |
| Communities | Yes | location, interest, activity | Only discoverable communities |
| Circles | Yes | date, area, size, interest | Only joinable/visible Circles |
| Events | Yes | date, distance band, category, cost | Approximate location |
| People | Yes, bounded | intent, age band, area, interest | Only eligible and discoverable users |
| Music/Movies/Books | V2 | catalog-specific | Use licensed/approved metadata only |
| Topics | V2 | interest/category | Controlled taxonomy |

# 12. Notification Architecture

| **Category** | **Examples** | **Priority** | **Default** |
| --- | --- | --- | --- |
| Safety | Report outcome, security challenge, serious account action | Critical/high | ON |
| Messages | New accepted-message / group chat message | High | ON; batch where possible |
| Connection | Connection accepted, friend/dating opt-in | High | ON |
| Events | RSVP, reminder, venue update, cancellation | High | ON |
| Communities | Reply/mention/mod action | Medium | ON for joined communities |
| Recommendations | New Circle/activity | Low | Limited; digest-friendly |
| Marketing | Premium/event promotion | Low | OFF or separately consented |
| System | Policy updates, maintenance | Medium/high | ON |

| **Notification rule: **Notifications should create a useful action, not manufacture anxiety. Avoid fake scarcity, arbitrary streaks and "someone is waiting for you" messages unless there is a real pending action. |
| --- |

# 13. Monetization Architecture

| **Revenue surface** | **When** | **Free baseline** | **Paid value** | **Risk** |
| --- | --- | --- | --- | --- |
| Events | After repeat usage | Free/low-cost community activities | Ticketing/host services | Price can reduce participation |
| Premium discovery | After retention proof | Core discovery remains usable | Advanced filters, travel discovery, additional context | Turns social connection into paywall |
| Creator/host services | After host supply forms | Basic hosting | Premium tools, promotion, analytics | Could create spammy promotion |
| Dating premium | Later | Basic dating progression | Advanced discovery/visibility | Undermines non-appearance thesis if overused |
| Ads/brand partners | Much later | No disruptive ads initially | Relevant activity/community sponsorship | Trust/privacy risk |
| Premium verification | Not initial safety gate | Baseline safety remains free | Convenience/advanced identity assurance only | Creates perception that safety is pay-to-win |

Monetization must follow demonstrated value. The first economic experiment should preferably charge for an experience (event/host service) rather than for basic human connection.

# 14. Backend Data Model

| **Entity** | **Purpose** | **Important fields** |
| --- | --- | --- |
| User | Account identity | id, status, created_at, last_active_at, risk_tier |
| Profile | Public profile | user_id, display_name, bio, age_band, city_zone, languages, visibility |
| ProfileMedia | Photos/media | id, user_id, storage_key, moderation_state, sort_order |
| Interest | Controlled taxonomy | id, parent_id, name, type, status |
| UserInterest | User-interest edge | user_id, interest_id, strength/source, created_at |
| TasteEntity | Music/movie/book/game/etc. metadata | id, type, provider_id, canonical_name |
| UserTaste | Taste edge | user_id, entity_id, source, confidence |
| Preference | User preference groups | user_id, category, payload_version, values |
| LocationZone | Privacy-safe geography | id, city, zone, geohash_precision |
| Community | Persistent interest space | id, name, description, category, zone, visibility, status, host_id |
| CommunityMember | Membership | community_id, user_id, role, state, joined_at |
| CommunityRule | Community rules | community_id, rule_text, version |
| CommunityPost | Thread starter | id, community_id, author_id, body, moderation_state |
| Comment | Thread response | id, post_id, author_id, body, moderation_state |
| Reaction | Lightweight reaction | id, user_id, object_type, object_id, reaction |
| Circle | Small group | id, community_id, title, host_id, capacity, state, cadence |
| CircleMember | Circle membership | circle_id, user_id, state, joined_at |
| Connection | Mutual private relationship | id, requester_id, recipient_id, state, context_id |
| RelationshipState | Friend/dating state | connection_id, friend_state, dating_state, updated_at |
| Conversation | Messaging container | id, type, object_id, state |
| ConversationMember | Conversation permission | conversation_id, user_id, role, state |
| Message | Message content | id, conversation_id, sender_id, body/media_ref, moderation_state, created_at |
| MessageRequest | Pre-connection request | id, sender_id, recipient_id, context, state |
| Event | Scheduled activity | id, host_id, circle_id, community_id, venue_zone, starts_at, capacity, state |
| EventParticipant | RSVP/attendance | event_id, user_id, state, checked_in_at |
| EventFeedback | Post-event feedback | event_id, user_id, ratings/categories, free_text |
| Verification | Verification state | user_id, type, state, provider_ref, verified_at |
| Report | Safety/content report | id, reporter_id, target_type, target_id, category, state, severity |
| Block | Blocked relationship | blocker_id, blocked_id, created_at |
| Restriction | Restricted relationship | restrictor_id, restricted_id, created_at |
| ModerationAction | Enforcement log | case_id, actor_id, action, reason, created_at |
| Notification | User notification | id, user_id, type, payload, state, created_at |
| Recommendation | Ranking decision | request_id, candidate_id, score, reason_codes, model_version |
| RecommendationFeedback | User feedback | user_id, candidate_id, reason, created_at |
| Subscription | Entitlement | user_id, plan_id, provider, state, renewal_at |
| Payment | Payment record | id, user_id, provider_ref, amount, currency, state |
| AuditLog | Immutable admin/security action | actor_id, action, target, timestamp, metadata |

## 14.1 Conceptual relationship diagram

USER

 |-- PROFILE

 |-- INTERESTS

 |-- TASTE

 |-- PREFERENCES

 |-- VERIFICATION

 |-- SAFETY HISTORY

 |

 +--> COMMUNITY MEMBER --> COMMUNITY --> POSTS / CHAT

 |

 +--> CIRCLE MEMBER --> CIRCLE --> EVENT --> EVENT PARTICIPANT

 |

 +--> CONNECTION --> RELATIONSHIP STATE --> CONVERSATION --> MESSAGE

 |

 +--> RECOMMENDATION <--> RECOMMENDATION FEEDBACK

 |

 +--> SUBSCRIPTION --> PAYMENT

SAFETY / MODERATION cut across every object.

# 15. API Architecture

| **Endpoint** | **Purpose** | **Input** | **Auth/permissions** | **Output** |
| --- | --- | --- | --- | --- |
| POST /auth/signup | Create account challenge | identifier, consent, referral | No auth | challenge ID, masked identifier |
| POST /auth/verify | Verify OTP | challenge ID, OTP | No auth | session/token |
| POST /auth/login/start | Start login | identifier | No auth | challenge ID |
| POST /auth/otp/resend | Resend code | challenge ID | No auth/rate-limited | new expiry |
| POST /auth/recovery/start | Recovery | identifier | No auth/rate-limited | recovery challenge |
| GET /session | Session bootstrap | none | Session/refresh | account state |
| PUT /profile/basic | Update identity | display name, gender, languages | User | updated profile |
| GET /me/profile | Get own profile | none | User | profile |
| PUT /profile | Edit public profile | bio, visibility, media refs | User | profile |
| PUT /profile/interests | Update interests | interest IDs | User | interest edges |
| PUT /profile/taste | Update taste | catalog IDs | User | taste edges |
| PUT /profile/location | Set privacy-safe location | city/zone/radius | User | location state |
| GET /discover/circles | Recommend Circles | filters, cursor | User | paged candidates |
| GET /discover/people | Recommend people | filters, cursor | User | paged candidates |
| GET /events/discover | Recommend events | filters, cursor | User | paged events |
| POST /recommendations/feedback | Correct recommendation | candidate ID, reason | User | accepted |
| GET /communities | Search communities | query, filters | User | paged communities |
| POST /communities | Create community | metadata | User/host eligible | community ID |
| POST /communities/{id}/join | Join/request | none | User | membership |
| GET /communities/{id}/home | Community summary | none | Member/eligible | community home |
| POST /posts | Create post | body/media | Member + community permission | post ID |
| POST /comments | Create comment | post ID, body | Member | comment ID |
| GET /conversations | List conversations | filters | User | conversation list |
| POST /messages | Send message | conversation ID, body/media | Conversation member | message ID |
| WS /chat | Realtime messaging | connection/session | Authenticated | socket events |
| POST /connections | Send connection request | recipient, context, intent | Eligible user | connection ID |
| POST /connections/{id}/decision | Accept/decline/restrict | decision | Recipient | state |
| DELETE /connections/{id} | Remove connection | none | Connection member | deleted state |
| POST /dates/proposals | Propose date | connection, venue category, time | Dating-enabled connection | proposal |
| POST /events | Create event | event metadata | Eligible host | event ID |
| POST /events/{id}/rsvp | RSVP | state | Eligible user | participant state |
| POST /events/{id}/checkin | Check in | optional code | Participant | attendance state |
| GET /events/{id}/followup | Post-event recap | none | Participant | follow-up data |
| POST /events/{id}/feedback | Submit feedback | feedback | Participant | accepted |
| POST /reports/users | Report user | category, evidence | User | case ID |
| POST /reports/content | Report content | target, category, evidence | Viewer | case ID |
| POST /blocks | Block user | target user | User | block state |
| POST /restrictions | Restrict user | target user | User | restriction state |
| GET /reports/{id} | View report status | case ID | Reporter | case status |
| POST /verification/start | Start verification | type | User | provider flow |
| GET /verification/status | Verification status | none | User | status |
| PUT /settings/privacy | Privacy settings | values | User | saved |
| PUT /settings/notifications | Notification settings | values | User | saved |
| GET /sessions | Sessions | none | User | session list |
| DELETE /sessions/{id} | Revoke session | session ID | User | revoked |
| POST /trusted-contacts | Create trusted contact | encrypted contact/ref | User | status |
| POST /subscriptions/checkout | Create purchase | plan ID | User | checkout session |
| POST /subscriptions/cancel | Cancel renewal | plan ID | User | cancel state |
| POST /account/delete | Request deletion | reason, reauth | User | deletion state |
| POST /account/delete/cancel | Cancel deletion during grace | none | User | active state |

# 16. Analytics Event Taxonomy

| **Event** | **Trigger** | **Important properties** | **Why track** | **Phase** |
| --- | --- | --- | --- | --- |
| app_opened | App launched | app_version, source | Measure opens and release health | MVP |
| signup_started | User taps create account | method | Acquisition funnel | MVP |
| signup_completed | Account verified | method, referral | Signup success | MVP |
| onboarding_started | First onboarding screen | entry | Onboarding funnel | MVP |
| onboarding_completed | Final onboarding screen saved | intent, interests_count | Activation readiness | MVP |
| interest_selected | Interest selected | interest_id, category, position | Taxonomy quality | MVP |
| profile_completed | Minimum profile reaches activation threshold | completion_pct | Activation | MVP |
| home_viewed | Home rendered | state, local_density_bucket | Core UX state | MVP |
| discover_viewed | Discovery opens | tab | Discovery demand | MVP |
| circle_viewed | Circle detail opened | circle_id, source | Candidate quality | MVP |
| circle_joined | Membership active | circle_id, source | Core loop | MVP |
| circle_left | Membership removed | circle_id, tenure_days | Community retention | MVP |
| community_joined | Community membership active | community_id | Interest graph growth | MVP |
| community_created | Community published | category, zone | Supply growth | MVP |
| profile_viewed | Eligible public profile opened | profile_id, context | People discovery | MVP |
| connection_sent | Request sent | recipient_id, context, intent | Relationship funnel | MVP |
| connection_accepted | Request accepted | connection_id | Mutuality | MVP |
| connection_removed | Connection removed | connection_id, reason_optional | Churn/fit | MVP |
| conversation_started | First 1:1 message | connection_id | Conversation activation | MVP |
| message_sent | Message delivered | conversation_type, length_bucket | Communication | MVP |
| repeat_interaction | Meaningful repeated interaction detected | context_type, days_since_first | North Star input | MVP |
| event_viewed | Event detail opened | event_id | Activity discovery | MVP |
| event_rsvp_confirmed | RSVP confirmed | event_id | Offline pipeline | MVP |
| event_checkin | Check-in recorded | event_id | Actual attendance | MVP |
| event_followup_completed | Post-event follow-up action | event_id, outcome | Relationship conversion | MVP |
| friendship_marked | User chooses friendship state | connection_id | Relationship outcome | MVP |
| dating_intent_selected | User opts into dating for connection | connection_id | Dating conversion | MVP |
| date_plan_confirmed | Mutual date plan confirmed | connection_id, venue_category | Offline dating | MVP |
| recommendation_feedback_sent | User corrects recommendation | object_type, reason | Model learning | MVP |
| report_submitted | Safety report created | target_type, category, severity_client | Safety burden | MVP |
| user_blocked | Block applied | context | Protection | MVP |
| safety_warning_shown | Risk warning displayed | risk_type | Safety effectiveness | MVP |
| verification_completed | Verification success | type | Trust adoption | MVP |
| subscription_started | Purchase successful | plan, price_band | Monetization | MVP |
| subscription_cancelled | Renewal cancelled | plan, tenure_band | Monetization churn | MVP |
| account_deleted | Deletion confirmed | reason_category | Churn/exit analysis | MVP |

## 16.1 Derived metrics

| **Metric** | **Definition** | **Use** |
| --- | --- | --- |
| Activation rate | activated users / signup_completed | Early product health |
| Meaningful Connection Rate | activated users with repeated positive interaction / activated users | North Star |
| Circle repeat rate | Circle members returning to same Circle/activity / joined members | Tests repetition |
| Connection conversion | mutual connections / connection requests | Mutuality |
| Conversation continuation | conversations with 3+ exchanges across 24h+ / conversations started | Conversation quality |
| Offline attendance rate | checked-in attendees / confirmed RSVPs | Event reliability |
| Friendship progression rate | friendship states / mutual connections | Relationship outcome |
| Dating progression rate | dating-opt-ins / eligible mutual connections | Dating layer health |
| Report rate | reports / MAU or active users | Safety load |
| D30 retention | users active 30 days after activation / cohort | Long-term value |

# 17. QA and Testing Specification

| **Area** | **Scenario** | **Setup** | **Expected result** | **Priority** |
| --- | --- | --- | --- | --- |
| AUTH | Valid signup | Valid phone/email -> OTP -> session | Account created and session issued | P0 |
| AUTH | Wrong OTP | 4-6 invalid codes | Clear error, lockout/rate limit | P0 |
| AUTH | Expired OTP | Use after expiry | Resend path | P0 |
| AUTH | Duplicate account | Existing identifier | Route to login without revealing excess account info | P0 |
| AGE | Under-18 | DOB < 18 | Access blocked; support/appeal route | P0 |
| ONB | Minimum interests | Select fewer than threshold | Prevent activation or explain | P0 |
| PROFILE | Media upload | Valid/invalid/oversize image | Moderation state and useful error | P0 |
| PROFILE | Private field leakage | Open public profile | No phone/email/exact location exposed | P0 |
| DISC | Blocked candidate | Blocked user in candidate pool | Never surfaced | P0 |
| DISC | Intent mismatch | Dating user vs incompatible intent | Never surfaced as dating candidate | P0 |
| DISC | No density | Tiny local pool | Graceful radius/interest expansion | P0 |
| COMM | Private join | Request approval | No access before approval | P0 |
| COMM | Spam posting | High-rate posts | Rate limit / moderation | P0 |
| COMM | Moderator ban | Ban member | Access removed, audit logged | P0 |
| CONN | Mutual accept | Accept connection | 1:1 conversation unlocked | P0 |
| CONN | One-sided dating | Only one opts in | Remain non-dating connection | P0 |
| MSG | Blocked sender | Sender blocked mid-conversation | Message disabled | P0 |
| MSG | Scam pattern | Financial solicitation | Warning/report path, no silent failure | P0 |
| EVENT | Capacity race | Two users take last seat | Server-authoritative capacity | P0 |
| EVENT | Cancellation | Host cancels | All participants notified | P0 |
| EVENT | Check-in outage | No network at venue | Retry/local queue, no false failure | P1 |
| SAFETY | Report | Submit report | Case ID + immediate protection option | P0 |
| SAFETY | Block | Block user | Mutual visibility rules applied | P0 |
| SAFETY | Appeal | Appeal allowed case | Audit trail | P1 |
| PAY | Purchase success | Valid purchase | Entitlement active | P1 |
| PAY | Purchase failure | Provider declines | No entitlement; safe retry | P1 |
| ACCOUNT | Logout | Logout current | Session revoked; welcome screen | P0 |
| ACCOUNT | Delete | Confirm deletion | Correct deletion/grace process | P0 |
| SEC | Session revoke | Other device logout | Token rejected immediately or within defined TTL | P0 |
| SEC | Ban evasion | Known banned identity | Restricted access | P1 |

## 17.1 Security QA checklist

Authorization tests for every object: users must not access another user’s private fields, safety cases, hidden communities or admin APIs.

Rate-limit OTP, login, connection requests, message sending, community creation, reports and media uploads.

Test object-ID enumeration and insecure direct object references.

Validate signed media URLs, expiry and access scope.

Test moderation bypass with obfuscation, multilingual text, URLs, images and voice notes where supported.

Test ban evasion and multi-account behavior without using it to infer unrelated personal attributes.

Maintain audit logs for administrative actions and sensitive-data access.

Verify deletion/export pathways against actual storage and backup behavior before launch.

# 18. Empty and Error State Library

| **State** | **User-facing message pattern** | **CTA** | **Notes** |
| --- | --- | --- | --- |
| No nearby users | "There is not enough activity in your area yet." | Expand area / join a broader-interest Circle | Never blame the user |
| No Circles | "No active Circle matches this filter yet." | Try another interest / create a Circle | Show a real next action |
| No events | "Nothing scheduled nearby right now." | Create activity / broaden date | Avoid fake scarcity |
| No messages | "Your conversations start after a mutual connection." | Discover Circles | Reinforce product model |
| No people recommendations | "We need a little more context to recommend people." | Add interests / join a Circle | Explain required signal |
| No search results | "We could not find that in this area." | Clear filters | Preserve query |
| Network error | "We cannot reach the service right now." | Retry | Do not lose draft input |
| Verification failure | "We could not complete verification." | Retry / use another allowed method | Do not expose provider internals |
| Payment failure | "Payment did not complete." | Try again / choose another method | No entitlement on ambiguous status |
| Deleted user | "This profile is no longer available." | Back to discovery | Do not expose reason |
| Banned community | "This community is unavailable." | Return to Circles | No sensitive moderation details |
| Safety report submitted | "Your report is received. We have limited your contact with this account." | View case | Only when protection state was actually applied |

# 19. Account, Subscription and Deletion Lifecycle

## 19.1 Account states

ACTIVE

  |

  +-> PAUSED (optional later)

  +-> RESTRICTED (safety/age/security)

  +-> DELETION_REQUESTED

  +-> DELETED

DELETED must not silently become ACTIVE without the product-defined recovery rule.

## 19.2 Deletion flow

SETTINGS

  -> ACCOUNT CONTROLS

  -> DELETE ACCOUNT

  -> CHOOSE REASON (optional)

  -> CONSEQUENCES

  -> DATA RETENTION / DELETION EXPLANATION

  -> REAUTHENTICATE

  -> CONFIRM

  -> DELETION REQUEST

  -> LOGOUT

  -> GRACE PERIOD ONLY IF LEGALLY/OPERATIONALLY JUSTIFIED

  -> PERMANENT DELETION / DEIDENTIFICATION ACCORDING TO POLICY

  -> AUDIT CONFIRMATION

Before launch, define a data-retention matrix by entity: account/profile, messages, safety reports, verification artifacts, payments, analytics and legal records. Not all records necessarily have identical retention requirements. Do not claim "everything is deleted instantly" if backups or safety/legal records follow a different schedule.

## 19.3 Subscription states

| **State** | **User sees** | **Backend behavior** |
| --- | --- | --- |
| Free | Free entitlement list | No premium access |
| Active | Plan, renewal date | Entitlement checks pass |
| Renewal off | End date | Access until end of period |
| Payment pending/ambiguous | "Payment processing" | Do not duplicate-charge; verify provider |
| Payment failed | Retry/cancel | No silent loss of paid state |
| Refunded | Refund status | Entitlement adjusted according to provider policy |

# 20. Development Plan and Exit Criteria

| **Phase** | **Scope** | **Primary modules** | **Engineering focus** | **Primary metric** | **Exit criterion** |
| --- | --- | --- | --- | --- | --- |
| Phase 0 | Validation | V0 manual matching, landing page, 1 city/zone, 10-20 Circles | Research + community ops | Repeat interaction | Demonstrated recurring behavior |
| Phase 1 | Auth + onboarding | AUTH-01..08, ONB-01..09 | Mobile/backend/security | Activation | Verified adult users can complete setup |
| Phase 2 | Profile + interests | PROF-01..05 | Profile/media/taxonomy | Profile completion | Usable public/private data separation |
| Phase 3 | Discovery | DISC-01..07 | Candidate retrieval/ranking/feedback | Join rate | Users can find relevant Circles |
| Phase 4 | Communities | COMM-01..06 + moderation basics | Community/membership/chat | Participation | Users can participate, not merely join |
| Phase 5 | Connections | CONN-01..06 | Mutual permissions/relationship states | Repeat interaction | Connection progression works |
| Phase 6 | Messaging | MSG-01..04 | Realtime chat + safety | Continuation | Conversations continue with context |
| Phase 7 | Events | EVENT-01..06 | Scheduling/attendance/follow-up | Attendance + repeat | Offline activity cycle works |
| Phase 8 | Dating | CONN-05 + EVENT-07 | Dating intent/date planning | Dating progression | Dating does not damage friendship/community experience |
| Phase 9 | Safety + moderation | SAFE-01..08 + ADMIN-01..06 | Reports/queues/audits | Incident response | Severe incidents handled reliably |
| Phase 10 | Monetization | Subscriptions/events | Payments/entitlements | Paid conversion | Users pay without core connection paywall |
| Phase 11 | Analytics + optimization | All events/metrics | Experimentation/model learning | MCR/D30 | Evidence-based iteration |

## 20.1 Team responsibilities

| **Role** | **MVP responsibility** | **Should not own alone** |
| --- | --- | --- |
| Founder/Product | Problem validation, product decisions, community acquisition, metrics | Security/legal conclusions without specialists |
| UI/UX | Information architecture, wireframes, accessibility, empty/error states | Inventing new features without product rationale |
| Frontend/mobile | Navigation, state management, forms, realtime UI, permissions | Trust policy decisions |
| Backend | Auth, data model, APIs, permissions, messaging, events | Clinical/psychological compatibility claims |
| Recommendation engineer | Retrieval/ranking/feedback, experiments | Opaque "trust score" |
| QA | Flow/state/security regression, device matrix | Approving safety policy without product owner |
| Trust & Safety | Moderation policy, incident workflow, escalations | Ad-hoc automated bans without audit controls |
| Legal/privacy counsel | Terms, consent, retention, regulatory applicability | Product UX ownership |

# 21. MVP Boundary - Build This, Not the Whole Company

## 21.1 V0 - manual / no-code

| **Feature** | **Purpose** | **Cost/complexity** | **Success metric** |
| --- | --- | --- | --- |
| Landing page | Test problem/value proposition | Low | Qualified signup rate |
| Simple profile form | Collect structured interest/activity signal | Low | Profile completion |
| Manual Circle matching | Test group hypothesis | Low | Repeat interaction |
| WhatsApp/Discord coordination | Avoid chat engineering during validation | Low | Attendance/repeat |
| Founder moderation | Learn safety patterns | Low operationally/high attention | Incident handling time |
| Manual event scheduling | Test offline loop | Low | RSVP -> attendance -> follow-up |

## 21.2 V1 actual MVP

18+ authentication and age assurance.

Profile with 5-15 interests, short bio, photos and basic social style.

City/zone discovery, not exact location.

Circle directory and join/request flow.

Community detail and lightweight feed/prompts.

Group chat and mutual-connection private chat.

Connection requests with context and intent.

Basic activity/event creation, RSVP, group chat and follow-up.

Report/block/restrict, safety center, basic verification.

Recommendation explanations + user feedback.

PostHog/analytics instrumentation and admin moderation queue.

## 21.3 V2

Learning-to-rank and graph-based candidate recommendation.

Recurring Circles and stronger host tooling.

Creator/host monetization.

Voice/media messaging with moderation.

Trusted contact and richer date safety.

Advanced verification and community reputation.

Interest/taste entity search.

## 21.4 V3

Multi-city social graph expansion.

Cross-community recommendation graph.

Advanced event marketplace/ticketing.

Sophisticated outcome-based matching models.

Paid communities and creator ecosystem.

Cross-city travel social discovery.

## 21.5 DO NOT BUILD IN FIRST 6 MONTHS

Infinite feed, Stories, Reels, livestreaming.

Full Discord server replacement or Reddit-scale thread system.

Public follower counts or popularity leaderboard.

Full swipe deck with hundreds of candidates.

AI companion, therapy, emotional dependency features.

100-question personality assessment.

Precise live location or routine tracking.

Ticketing marketplace and venue inventory integration.

Marketplace for influencers.

AR/VR/social avatars.

Crypto/blockchain identity.

Complex virtual goods economy.

Under-18 networking.

# 22. 90-Day Founder Roadmap

| **Period** | **Objective** | **Founder actions** | **Planning cost** | **Success signal** | **Failure signal** |
| --- | --- | --- | --- | --- | --- |
| Days 1-15 | Problem validation | 50-75 interviews; Reddit pattern log; competitor audit; recruit 10 host candidates | 0-10K INR | Repeated job-to-be-done without leading users | If users cannot describe a recurring problem, narrow/kill thesis |
| Days 16-30 | Landing page + waitlist | 3-5 value propositions; city/interest landing pages; qualification survey | 0-10K INR | Qualified activation intent | Clicks without willingness to join activity |
| Days 31-45 | Concierge Circles | 100 invited users; 10-20 small Circles; structured prompts | 0-15K INR | Repeated interaction / Circle repeat | Users join but do not talk or return |
| Days 46-60 | Community pilot | 10 communities; recurring activities; founder moderation | 0-20K INR | Active community + repeat participation | Community creation exceeds participation |
| Days 61-75 | Connection experiment | Friendship vs dating vs explore cohorts; mutual connection workflow | 0-20K INR | Repeat interaction -> connection | People immediately leave platform or ignore connections |
| Days 76-90 | MVP + monetization test | Build V1 essentials; test paid event / optional premium | 50K-2L INR planning range | Retention + paid signal | Payment before retention / safety readiness |

# 23. Scaling Strategy

## 23.1 0 -> 100 users

Founder and host-led. Select one neighborhood/zone and 3-5 activity categories. Every user should have a credible first Circle or activity within one session.

## 23.2 100 -> 1,000

Recruit recurring hosts. Create shareable Circle links. Partner with local hobby/sports/cafe spaces. Treat Instagram, WhatsApp and Reddit as acquisition channels, not competitors to replace.

## 23.3 1,000 -> 10,000

Add micro-creators and campus/young-professional ambassadors within the same city. Expand categories only where existing communities can remain active.

## 23.4 10,000 -> 100,000

Expand within the first city and only then test a second city. Use local density, MCR, repeat participation and safety performance as gates.

## 23.5 100,000 -> 1M

Build a multi-city network only when each city can independently produce healthy local recommendation density. The network should be self-propelling through hosts, Circles, recurring activities and referrals.

## 23.6 Local density dashboard

| **Dimension** | **Minimum question before expansion** |
| --- | --- |
| Geography | How many eligible active users exist in each discovery zone? |
| Interest | Can users find 3+ meaningful Circles across target categories? |
| Time | Are activities available during users’ stated availability? |
| Group size | Can we fill 4-8-person Circles without padding? |
| Intent | Is supply sufficient for friendship and dating separately? |
| Safety | Are report and incident rates operationally manageable? |
| Economics | Does acquisition improve through host/referral loops? |

# 24. UI/UX Design System

## 24.1 Design direction

Modern + social + safe + mature + Indian + community-oriented. The visual language should feel more like a calm social activity product than a casino-like dating interface.

| **System element** | **Recommendation** |
| --- | --- |
| Color | Base neutral surfaces with one warm accent and one trust/safety accent; keep safety states visually distinct. Avoid copying Tinder/Bumble brand cues. |
| Typography | Readable sans serif; high hierarchy contrast; 16px+ body text on primary mobile flows where practical. |
| Cards | Context cards with "why this is relevant" line; limited density; no popularity scores. |
| Buttons | One primary CTA per screen; destructive actions visually separated. |
| Photos | Rounded, identity-oriented; do not make full-screen image dominance the default discovery layout. |
| Navigation | 5 bottom tabs: Home, Discover, Circles, Messages, Me. |
| Accessibility | Dynamic type, sufficient contrast, semantic labels, touch targets >= 44x44 points, screen-reader order, reduced-motion option. |
| Indian context | Support English/Hinglish wording and progressively localize interest/activity taxonomy based on observed usage. |
| Safety | Use calm, direct copy; never shame users for reporting, blocking or leaving. |
| Empty states | Explain why the state exists and offer one concrete recovery action. |

## 24.2 Core component library

InterestChip: label + icon optional; supports selected/unselected/disabled.

ContextCard: title, reason, size, area, activity, time, host signal, CTA.

PersonCard: display name, age band, 3-4 signals, verification badges, context, Connect CTA.

CircleCard: interest, location zone, member count, activity, next meet, host signal.

EventCard: activity, date/time, zone, capacity state, host, price band.

SafetySheet: report/block/restrict options; warning text; support link.

IntentPill: Friendship/Dating/Explore; never use as decorative color only.

ConnectionPrompt: one shared context + proposed next action.

ModerationBanner: community/content status and action taken.

# 25. End-to-End User Stories

## 25.1 Friendship-focused user - first 90 days

DAY 0

  -> Installs in Bengaluru after moving for first job

  -> Chooses Friendship + Explore

  -> Selects badminton, movies, F1, photography

  -> Prefers 4-6 people, weekends, activity-first

  -> Joins weekend photography Circle

DAY 1

  -> Sees Circle prompt: choose favorite street-photography spot

DAY 7

  -> Attends photo walk

  -> Connects with two people after event

DAY 30

  -> Returns to same Circle

  -> Joins badminton activity with one connection

DAY 90

  -> Has recurring local activity group

  -> Uses app primarily to coordinate next activities rather than browse strangers

## 25.2 Dating-focused user - first 90 days

DAY 0

  -> Chooses Dating but is not required to swipe

  -> Selects music, cinema, football, cafes

  -> Joins local film Circle

DAY 7

  -> Repeatedly interacts with one member around films

DAY 14

  -> Sends mutual connection request

  -> Both select dating-open

DAY 16

  -> 1:1 chat starts with shared context prompt

DAY 21

  -> Mutual date proposal: public movie + coffee venue

  -> Safety plan offered

DAY 30

  -> Post-date follow-up asks whether to stay connected, become friends, continue dating or stop

DAY 90

  -> Product continues to recommend shared activities rather than forcing more dates

## 25.3 Community creator - first 90 days

DAY 0

  -> Creator interested in indie music

  -> Applies to host Bengaluru Indie Music community

DAY 3

  -> Community approved

  -> Creates first 6-person listening Circle

DAY 7

  -> Circle meets

  -> Members rate experience privately

DAY 21

  -> Creator repeats Circle

  -> Two members become co-host candidates

DAY 60

  -> Community has several active recurring Circles

DAY 90

  -> Creator may monetize premium hosting tools/events if platform has reached monetization stage

# 26. Final Master Blueprint

                               USER

                                 |

                           AUTHENTICATION

                                 |

                           AGE ASSURANCE

                                 |

                         PRIVACY + SAFETY

                                 |

                            ONBOARDING

                                 |

                   INTERESTS + SOCIAL STYLE

                                 |

                   CITY / ZONE / AVAILABILITY

                                 |

                              PROFILE

                                 |

                    RECOMMENDATION SYSTEM

                                 |

                 +---------------+---------------+

                 |               |               |

               CIRCLES         PEOPLE         ACTIVITIES

                 |               |               |

                 +-------+-------+-------+-------+

                         |

                     INTERACTION

                         |

                   REPEATED CONTEXT

                         |

                    CONNECTION

                         |

              +----------+----------+

              |                     |

          FRIENDSHIP             DATING

              |                     |

              +----------+----------+

                         |

                  OFFLINE EXPERIENCE

                         |

                    FOLLOW-UP

                         |

                REPEAT / RETENTION

                         |

             EVENTS / PREMIUM / HOST TOOLS

                         |

              SETTINGS / LOGOUT / DELETE

CROSS-CUTTING LAYERS:

TRUST & SAFETY | PRIVACY | MODERATION | ANALYTICS | RECOMMENDATION

## 26.1 Single-source-of-truth rule

If a feature cannot answer all three questions - (1) what user problem it solves, (2) which step of the core loop it improves, and (3) what measurable outcome should change - it does not enter the MVP backlog. It may be documented as a hypothesis, V2/V3 item, or feature bloat.

## 26.2 MVP success gate

The MVP is ready for serious product-market validation only when the team can measure: activation, Circle join rate, meaningful interaction, repeat interaction, mutual connection, offline attendance, safety/report rate, D7/D30 retention and referral. A large signup number without repeated relationship formation is not sufficient evidence.

# Appendix A - Complete Screen Inventory

| **ID** | **Screen** | **Module** | **Purpose** | **Entry** | **Next** | **Phase** |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Splash / Session Check | Authentication | Bootstrap the app and decide whether the user is new, returning, or blocked. | Cold app launch | AUTH-02 or HOME-01 or SAFE-08 | MVP |
| AUTH-02 | Welcome | Authentication | Explain the value proposition without implying a dating-only product. | AUTH-01 | AUTH-03 or AUTH-04 | MVP |
| AUTH-03 | Create Account | Authentication | Create a new account using a low-friction identifier. | AUTH-02 | AUTH-05 | MVP |
| AUTH-04 | Existing Account / Login | Authentication | Route returning users into secure sign-in. | AUTH-02 or AUTH-03 duplicate | AUTH-05 or AUTH-07 | MVP |
| AUTH-05 | OTP Verification | Authentication | Verify the identifier. | AUTH-03/AUTH-04 | AUTH-06 or HOME-01 or AUTH-07 | MVP |
| AUTH-06 | Account Recovery | Authentication | Recover access without exposing private account information. | AUTH-04 | AUTH-05 or support route | MVP |
| AUTH-07 | Suspicious Login / Security Challenge | Authentication | Protect an account after anomalous sign-in signals. | AUTH-01/AUTH-05 | HOME-01 or SAFE-08 | MVP |
| AUTH-08 | Session / Device Management | Authentication | Let users review and revoke active sessions. | SET-08 | SET-08 | V2 |
| ONB-01 | Age Gate | Onboarding | Prevent under-18 social discovery and collect minimum age data. | AUTH-05 | ONB-02 or ONB-01-blocked | MVP |
| ONB-02 | Identity Basics | Onboarding | Capture the minimum public identity needed to operate the graph. | ONB-01 | ONB-03 | MVP |
| ONB-03 | Intent | Onboarding | Capture what the user wants from the product without creating separate app silos. | ONB-02 | ONB-04 | MVP |
| ONB-04 | Interests | Onboarding | Build initial interest/activity graph. | ONB-03 | ONB-05 | MVP |
| ONB-05 | Taste Fingerprint | Onboarding | Collect a small amount of specific taste data where it can improve context and prompts. | ONB-04 | ONB-06 | MVP |
| ONB-06 | Social Style | Onboarding | Capture actionable group/interaction preferences. | ONB-05 | ONB-07 | MVP |
| ONB-07 | Availability & Lifestyle | Onboarding | Improve activity recommendations using availability rather than intrusive routine tracking. | ONB-06 | ONB-08 | MVP |
| ONB-08 | Location & Discovery Radius | Onboarding | Create local density without exposing exact location. | ONB-07 | ONB-09 | MVP |
| ONB-09 | Privacy / Discovery Controls | Onboarding | Let users control how discoverable they are before entering the network. | ONB-08 | PROF-01 or HOME-01 | MVP |
| PROF-01 | Profile Home | Profile | Show the user’s own profile and completeness. | Home/Me | PROF-02/03/04/05 | MVP |
| PROF-02 | Edit Profile | Profile | Edit only information relevant to social discovery. | PROF-01 | PROF-01 | MVP |
| PROF-03 | Public Profile Preview | Profile | Show what another eligible user can see. | DISC-03 / profile deep link | CONN-01 / SAFE-02 / previous screen | MVP |
| PROF-04 | Verification Center | Profile | Manage identity, photo and community verification. | PROF-01 / SET-07 | PROF-05 or PROF-01 | MVP/V2 |
| PROF-05 | Verification Result / Badge Explain | Profile | Explain successful or failed verification without overstating safety. | PROF-04 | PROF-01 | MVP |
| HOME-01 | Home / This Week | Home | Answer the user’s primary question: what can I do with people like me this week? | First activation / bottom nav | COMM-01 / EVENT-01 / DISC-01 / MSG-01 | MVP |
| HOME-02 | Active Circle Hub | Home | Return users to ongoing social contexts rather than another feed. | HOME-01 | COMM-03 / MSG-03 / EVENT-04 | MVP |
| HOME-03 | Post-Event Follow-up Hub | Home | Convert offline participation into repeat connection. | Notification/deep link/home | CONN-02 / EVENT-06 | MVP |
| DISC-01 | Discover Landing | Discovery | Give users a small, purposeful set of discovery paths. | Bottom nav / Home | COMM-01 / DISC-04 / EVENT-01 / DISC-08 | MVP |
| DISC-02 | Circle Recommendations | Discovery | Recommend small groups based on interests, area and availability. | DISC-01 | COMM-02 | MVP |
| DISC-03 | People Recommendations | Discovery | Discover people only when there is a meaningful context for connection. | DISC-01 / after Circle interaction | PROF-03 / CONN-01 | MVP |
| DISC-04 | Activity / Event Discovery | Discovery | Find concrete things to do with a small group. | DISC-01 / Home | EVENT-01 | MVP |
| DISC-05 | Interest Explore | Discovery | Explore the local interest graph without becoming a content feed. | Search / Discover | DISC-02 / COMM-01 | V2 |
| DISC-06 | Recommendation Explanation | Discovery | Explain why an item was recommended and let the user correct the system. | Any recommendation card | previous screen | MVP |
| DISC-07 | Discovery Filters | Discovery | Let users control boundaries without creating an endless filter marketplace. | DISC-02/03/04 | DISC-02/03/04 | MVP |
| DISC-08 | Save / Not Relevant Queue | Discovery | Preserve user feedback and saved items without public popularity mechanics. | DISC cards | previous screen | V2 |
| COMM-01 | Community Directory | Communities | Browse local interest communities. | Discover / Communities | COMM-02 / COMM-04 | MVP |
| COMM-02 | Community Detail | Communities | Explain why a community matters before joining. | COMM-01 | COMM-03 / DISC-02 | MVP |
| COMM-03 | Community Home | Communities | Provide lightweight persistent community context. | COMM-02 | COMM-05 / EVENT-01 / MSG-04 | MVP |
| COMM-04 | Community Join / Approval | Communities | Handle public/private entry and safety checks. | COMM-02 | COMM-03 or pending | MVP |
| COMM-05 | Community Feed / Threads | Communities | Support enough discussion to create context; not a full social feed. | COMM-03 | COMM-03 / MSG-04 | MVP |
| COMM-06 | Community Chat | Communities | Provide coordination channel; reduce need for external group apps. | COMM-03 | EVENT-02 / MSG-04 | MVP |
| COMM-07 | Create Community | Communities | Allow validated hosts to propose a persistent interest space. | COMM-01 / profile | COMM-08 | V2 |
| COMM-08 | Community Approval / Pending | Communities | Make moderation status clear. | COMM-07 | COMM-03 or COMM-07 | V2 |
| COMM-09 | Community Moderator Console | Communities | Handle membership/content moderation for hosts. | COMM-03 / Admin role | SAFE-07 / COMM-03 | V2 |
| COMM-10 | Community Report / Leave | Communities | Let users exit or report a community safely. | COMM-02/03 | SAFE-01 / DISC-01 | MVP |
| CONN-01 | Connect Request | Connections | Create mutual permission for private interaction. | DISC-03 / PROF-03 / group follow-up | CONN-02 / DISC-03 | MVP |
| CONN-02 | Connection Decision | Connections | Let the recipient accept, limit, or decline. | Notification / CONN-01 | MSG-01 / SAFE-01 | MVP |
| CONN-03 | Connections List | Connections | Manage mutual relationships. | Profile/home/messages | PROF-03 / MSG-01 | MVP |
| CONN-04 | Friendship Progression | Connections | Turn repeated interaction into a deliberate friendship state. | CONN-02 / post-event | MSG-01 / EVENT-04 | MVP |
| CONN-05 | Dating Progression | Connections | Allow mutually opted-in romantic progression without forcing dating at first contact. | CONN-04 / connection | MSG-01 / EVENT-07 / SAFE-05 | MVP |
| CONN-06 | Remove / Unmatch | Connections | End a connection with low friction and clear expectations. | CONN-03 / MSG-02 | DISC-03 / MSG-01 / SAFE-02 | MVP |
| MSG-01 | Inbox | Messaging | Show only conversations that the user is permitted to have. | Bottom nav / connection accepted | MSG-02/03/04 | MVP |
| MSG-02 | 1:1 Conversation | Messaging | Enable private conversation after mutual connection. | MSG-01 / CONN-02 | EVENT-05 / SAFE-03 / CONN-04 | MVP |
| MSG-03 | Circle / Group Chat | Messaging | Coordinate a small group around an activity. | COMM-06 / HOME-02 | EVENT-05 / SAFE-03 | MVP |
| MSG-04 | Message Request / Permission | Messaging | Hold unsolicited contact outside the mutual-connection model. | Optional legacy/import use | MSG-02 / SAFE-03 | MVP |
| MSG-05 | Media / Voice Note Picker | Messaging | Add richer communication only after basic text interaction works. | MSG-02 | MSG-02 | V2 |
| MSG-06 | Conversation Safety Prompt | Messaging | Interrupt suspicious, coercive or financially risky interactions. | MSG-02/03 | SAFE-03 | MVP |
| EVENT-01 | Event Directory | Events | Discover concrete, safe, local activities. | Home/Discover | EVENT-03 | MVP |
| EVENT-02 | Create Event / Activity | Events | Let a host convert a Circle/community idea into a scheduled action. | COMM-03 / Connections | EVENT-03 | MVP |
| EVENT-03 | Event Detail | Events | Give a complete decision surface before RSVP. | EVENT-01/02 | EVENT-04 / SAFE-05 | MVP |
| EVENT-04 | RSVP / Attendance State | Events | Manage participation. | EVENT-03 | MSG-03 / EVENT-05 | MVP |
| EVENT-05 | Pre-Event Safety & Check-In | Events | Provide safety expectations and optional check-in without exposing location tracking. | Near event start | EVENT-06 | MVP |
| EVENT-06 | Post-Event Recap / Follow-up | Events | Convert the event into continued social connection. | After event | HOME-03 / CONN-01 | MVP |
| EVENT-07 | Date Planning | Events/Dating | Help dating users move from chat to a safe public activity. | CONN-05 / MSG-02 | SAFE-05 / EVENT-03 | MVP |
| SAFE-01 | Safety Center | Safety | Centralize user protection and help. | Profile/settings/notifications | SAFE-02/03/04/05/06 | MVP |
| SAFE-02 | Report User / Profile | Safety | Create a structured report and immediately protect the reporter. | Profile / safety | SAFE-07 / previous screen | MVP |
| SAFE-03 | Report Message / Content | Safety | Report a specific harmful message or post with enough context. | Message/community | SAFE-07 / MSG-02 | MVP |
| SAFE-04 | Block / Restrict | Safety | Stop contact/discovery without requiring a full report. | Profile/chat/community | previous screen / SET-06 | MVP |
| SAFE-05 | Date Safety | Safety | Support safer offline dating/meetups. | EVENT-07 / EVENT-05 | EVENT-05 / SAFE-06 | MVP |
| SAFE-06 | Trusted Contact Setup | Safety | Allow optional user-controlled notification to a chosen contact for an offline experience. | SAFE-05 / Settings | SAFE-05 | V2 |
| SAFE-07 | Safety Case Status | Safety | Give reporter transparency without exposing moderation internals. | SAFE-02/03 notifications | SET-01 / prior screen | MVP/V2 |
| SAFE-08 | Safety / Age Restriction Hold | Safety | Stop access where age or safety conditions make the account ineligible. | AUTH/ONB/bootstrap | AUTH-02 or support | MVP |
| SET-01 | Settings Home | Settings | Centralize account, privacy, notifications, security and subscription controls. | Me | SET-02... | MVP |
| SET-02 | Privacy & Discovery Settings | Settings | Control who can discover/contact the user. | SET-01 | SET-01 | MVP |
| SET-03 | Dating Preferences | Settings | Manage romantic discovery rules separately from general social preferences. | SET-01 | SET-01 | MVP |
| SET-04 | Friendship Preferences | Settings | Manage friend-discovery boundaries. | SET-01 | SET-01 | MVP |
| SET-05 | Notification Preferences | Settings | Prevent notification overload and preserve safety/system alerts. | SET-01 | SET-01 | MVP |
| SET-06 | Blocked / Restricted Users | Settings | Review protection list. | SET-01/SAFE-04 | PROF-03 / SET-01 | MVP |
| SET-07 | Verification & Connected Accounts | Settings | Manage verification and OAuth connections. | SET-01 | SET-01 | V2 |
| SET-08 | Security / Sessions | Settings | Manage login security and sessions. | SET-01 | SET-01 / AUTH-08 | MVP |
| ADMIN-01 | Admin Overview | Admin | Show moderation and service health priorities. | Internal admin login | ADMIN-02... | V2 |
| ADMIN-02 | User Safety Queue | Admin | Review user/profile reports. | ADMIN-01 | ADMIN-03 / SAFE-07 | V2 |
| ADMIN-03 | Content / Message Moderation Queue | Admin | Review reports and automated flags from messages/posts. | ADMIN-01 | ADMIN-04 | V2 |
| ADMIN-04 | Verification Review | Admin | Review failed/high-risk verification cases and provider signals. | ADMIN-01 | ADMIN-02 | V2 |
| ADMIN-05 | Community Moderation | Admin | Handle community abuse and host issues. | ADMIN-01 | ADMIN-02 | V2 |
| ADMIN-06 | Audit / Appeals | Admin | Maintain traceability for severe moderation decisions. | ADMIN-01 | ADMIN-02/03/04 | V2 |

# Appendix B - Flow Inventory

| **Flow** | **Goal** | **Start** | **Core sequence** | **End state** |
| --- | --- | --- | --- | --- |
| F01 | New signup | AUTH-02 | AUTH-02 -> AUTH-03 -> AUTH-05 -> ONB-01 -> ONB-09 -> PROF-01 -> HOME-01 | Activated account or restricted state |
| F02 | Existing login | AUTH-02 | AUTH-04 -> AUTH-05 -> AUTH-07 if risk -> HOME-01 | Authenticated session |
| F03 | Forgot access | AUTH-04 | AUTH-06 -> AUTH-05 -> HOME-01 | Recovered session or support case |
| F04 | Complete onboarding | ONB-01 | ONB-01 -> ONB-02 -> ONB-03 -> ONB-04 -> ONB-05 -> ONB-06 -> ONB-07 -> ONB-08 -> ONB-09 -> HOME-01 | Discoverable profile |
| F05 | Edit profile | PROF-01 | PROF-01 -> PROF-02 -> PROF-01 | Updated profile |
| F06 | Discover Circle | DISC-01 | DISC-01 -> DISC-02 -> COMM-02 -> COMM-04 -> COMM-03 | Community membership |
| F07 | Discover person | DISC-03 | DISC-03 -> PROF-03 -> CONN-01 -> CONN-02 -> MSG-02 | Mutual connection or declined |
| F08 | Start friendship | CONN-02 | CONN-02 -> MSG-02 -> EVENT-07/05 -> CONN-04 | Friendship state |
| F09 | Start dating | CONN-02 | CONN-02 -> MSG-02 -> CONN-05 -> EVENT-07 -> SAFE-05 -> EVENT-05 -> EVENT-06 | Dating relationship / ended safely |
| F10 | Join community | COMM-02 | COMM-02 -> COMM-04 -> COMM-03 | Member |
| F11 | Create community | COMM-01 | COMM-01 -> COMM-07 -> COMM-08 -> COMM-03 | Published community or revision |
| F12 | Create event | COMM-03 | COMM-03 -> EVENT-02 -> EVENT-03 -> EVENT-04 | Event published |
| F13 | Join event | EVENT-01 | EVENT-01 -> EVENT-03 -> EVENT-04 -> EVENT-05 -> EVENT-06 | Attendance + follow-up |
| F14 | Community -> friendship | COMM-03 | COMM-03 -> COMM-06 -> repeated messages -> DISC/CONN -> CONN-04 | Friendship state |
| F15 | Community -> dating | COMM-03 | COMM-03 -> repeated interaction -> CONN-01 -> CONN-02 -> CONN-05 | Dating-enabled connection |
| F16 | Unmatch | MSG-02 | MSG-02 -> CONN-06 | Connection removed |
| F17 | Block | PROF-03 | PROF-03 -> SAFE-04 | User hidden/contact blocked |
| F18 | Report user | PROF-03 | PROF-03 -> SAFE-02 -> SAFE-04 optional -> SAFE-07 | Case submitted |
| F19 | Report content | MSG-02/COMM-05 | content -> SAFE-03 -> SAFE-07 | Content hidden/reported |
| F20 | Safety incident at event | EVENT-05 | EVENT-05 -> SAFE-01 -> SAFE-02/SAFE-05 -> SAFE-07 | Protected user + safety case |
| F21 | Upgrade subscription | SET-01 | SET-01 -> subscription screen -> checkout -> entitlement | Entitlement active |
| F22 | Cancel subscription | SET-01 | SET-01 -> subscription -> cancel -> confirmation | Auto-renew off / entitlement expiration |
| F23 | Logout | SET-08 | SET-08 -> revoke current session -> AUTH-02 | Signed out |
| F24 | Delete account | SET-01 | SET-01 -> delete -> reason -> warning -> data scope -> confirm -> grace period if applicable -> logout | Deletion requested/processed |

# Appendix C - Evidence Caveats and Assumptions

Reddit posts and comments are qualitative, self-selected evidence. They identify recurring language and behaviors; they do not estimate prevalence in India.

Company-reported user counts, downloads and success stories are directional, not independent market share measurements.

U.S. studies on teens/young adults cannot be assumed to represent Indian adults; they support general behavioral hypotheses only.

The product thesis that repeated shared activity produces better relationship outcomes than conventional matching is a hypothesis to test, not a proven universal law.

Matching weights in this document are engineering starting points, not scientific claims.

Safety detection models must be evaluated for multilingual Indian usage, code-switching, abuse of reporting, false positives and false negatives.

Legal/privacy implementation requires product-specific counsel before launch, especially for age assurance, sensitive personal data, grievance handling, data retention and safety disclosures.

Pricing values are intentionally not fixed in this blueprint; price should be tested after retention/value is demonstrated.

# Appendix D - Launch Readiness Checklist

[ ] Product: core loop test has passed in a controlled local cohort.

[ ] Density: target launch zone has enough active hosts/Circles for a credible first session.

[ ] Safety: report/block/restrict flows are tested end-to-end.

[ ] Age: 18+ eligibility mechanism is operational.

[ ] Privacy: data map, retention matrix and user deletion process reviewed.

[ ] Moderation: queue, severity levels, escalation and audit logs operational.

[ ] Analytics: activation, repeat interaction, connection and safety events implemented.

[ ] Mobile: Android performance and low-bandwidth behavior validated.

[ ] Community: at least several hosts can create recurring activities without founder intervention.

[ ] Offline: venue and safety guidance tested with small groups.

[ ] Business: no paywall blocks the core connection experience before value is proven.

[ ] Operations: a named human owner exists for severe safety incidents.

Confidential working specification  |  1