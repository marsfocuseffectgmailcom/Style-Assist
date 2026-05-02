# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.4)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### AI Fashion Stylist — `artifacts/stylist-app`

- **Preview path**: `/`
- **Description**: "Style Assist" (internal name Drape) — AI-powered personal stylist app, mobile-first dark UI (teal #3F6F73 / soft teal #7FA9A3 / gold #C8A96A on navy #1F2A37). Australian app (AUD currency).
- **Key features**:
  - Wardrobe manager — 11 items enriched with `colors[]`, `styleTags[]`, `seasonTags[]`
  - Style profile (gender, height, sizes, fabric preferences)
  - AI Styling Engine (`stylingEngine.ts`) — 6-dimension scoring: eventMatch(30) + colourHarmony(25) + styleConsistency(20) + seasonSuitability(10) + userPreference(10) + freshness(5)
  - **Stylist Insight system** — each outfit has reason (1 sentence), tips (2-4 bullets, stylist tone), optional upgrade suggestion, score breakdown; all shown in expandable card panel
  - Outfit Timeline Engine — save outfits to a day-by-day plan; `generateMonthPlan()` builds 28 days with freshness + name-dedup tracking
  - Plan Ahead — event outfit planner
  - Shop screen — affiliate-ready product recommendations
  - Notifications — context-aware via `NotificationsContext.tsx`
  - First Experience Flow — 6-step onboarding overlay (`FirstExperienceFlow.tsx`)
  - **Wardrobe Capture** — 4-step add-item flow (`AddItemFlow.tsx`) with photo tips, front/back/tag camera capture, simulated AI detection (category/colour/pattern/style/material/season/occasion), editable AI fields, manual fields (name, brand, size, fit, material, weather, status), image compression, persisted to localStorage via `useWardrobeCapture` hook
  - **Tonight Mode** (`TonightModeSheet.tsx` + `OutfitResultScreen.tsx` tonight variant) — bottom sheet launched from two "Tonight Mode" buttons on Home (Moon icon, gold style). Sheet: single-screen selection with 5 occasions (Casual, Dinner, Going out, Work, Event), 5 optional weather chips (tap-to-toggle, tap again deselects), "Use a go-to item" animated toggle (teal when on). On "Get my outfit": runs `generateOutfits` for today filtered to high/safe confidence, boosts go-to item outfits when toggle is on, navigates to OutfitResultScreen with `mode: "tonight"`. Tonight variant of result screen: heading "Ready for tonight", subtitle "This will work — no overthinking needed.", max 1 bullet tip in "Why this works", tonight-specific rotation phrases ("This is a good moment to bring this back in — it fits naturally here."), action labels "Wear this" / "Try another option" / "Save for later".
  - **Outfit Result Screen** (`OutfitResultScreen.tsx`, route `/timeline/outfit-result`) — premium post-generation detail view. Sections: header ("Your outfit is ready" / subtitle), confidence badge + outfit name + score, horizontal-scroll item cards (photo, category, name, colour, role label pill), "Why this works" (reason paragraph + 2 bullet tips in pink), "Style tip" (third tip in a gold-tinted card), "Rotation intelligence" ("Your wardrobe" section, only shown when ≥1 item has a reach preference — three positive phrasings, no negative language), and three action buttons (Save outfit → saves to timeline; Try another look → back to GenerateOutfitScreen; Plan for later → /plan-ahead). GenerateOutfitScreen CTA changed from "Add to Timeline" to "View outfit →".
  - **Item Preference** — per-item preference sheet (`ItemPreferenceSheet.tsx` + `useItemPreferences.ts`). Two sections: "How often do you reach for this?" (3 options, neutral language only) and "How does this feel on you?" (5 feel options). `aria-pressed` on all buttons, `toggleFeel` uses functional state update to avoid stale closure. Preferences persisted to localStorage key `style-assist-item-prefs`. Scoring engine: go-to items get +3 reach boost (max +6/outfit); not-lately items get a positive rotation tip in outfit explanations. Wardrobe cards show a thin coloured underline (teal/gold/muted) for set preferences.
  - Preference tracking — `useStylePreferences` hook signals like/skip on save; seeds future scoring
  - **Personalisation System** — `usePersonalisation` hook (NOT a context; each caller gets own instance, all sync via localStorage). Tracks: outfitFeedback (accept/reject/reshuffle per outfit), wearLog (per item count/lastWorn), appOpenHours, tonightModeCount, styleDirection (casual/balanced/polished), totalSignals, clearedAt (ISO timestamp of last reset). localStorage key `style-assist-personalisation`. `PersonalisationHint` component (teal sparkle pill) shown on outfit card when totalSignals ≥ 3. `ItemUsagePill` "Frequently worn" badge on items worn ≥ 3 times. Profile > `StyleMemoryCard`: direction buttons with `aria-pressed`, signal count subtitle, reset button uses `store.clearedAt` to derive `justCleared` (< 2.4s old) — no local state. `stylePreferences.ts` exports `loadPreferencesWithDirection()` which applies tag boosts for chosen direction; `outfitGenerator.ts` uses this.
- **Key lib files**:
  - `src/lib/stylingEngine.ts` — scoring engine + tip/upgrade/reason builders
  - `src/lib/outfitGenerator.ts` — `generateOutfits()` / `generateMonthPlan()` with cross-day name deduplication
  - `src/lib/mockData.ts` — enriched `WardrobeItem` type (colors/styleTags/seasonTags)
  - `src/lib/stylePreferences.ts` + `src/hooks/useStylePreferences.ts`
  - `src/contexts/NotificationsContext.tsx`
  - `src/pages/GenerateOutfitScreen.tsx` — score meter, Stylist notes panel, breakdown expand
  - `src/pages/FirstExperienceFlow.tsx`
- **Design tokens** (unified navy system):
  - Backgrounds: base `#1F2A37`, elevated `#2A3645`, card `#243140`, deepest `#1C2A37`
  - Accent primary: `#3F6F73` (teal), secondary: `#7FA9A3` (light teal)
  - Success: `#5F8F7F`, Warning/Gold: `#C8A96A`, Error: `#B86B6B`
  - Text: primary `#F2F4F5`, sub `#AABBC0`, muted `#6B8490`, dim `#5E7580`
  - Rules: minimal/calm, accent used sparingly, no neon or bright colors
- **localStorage keys**: `style-assist-onboarded`, `style-assist-timeline`, `style-assist-incoming-items`, `style-assist-planned-events`, `style-assist-notifications`, `style-assist-fte-done`, `style-assist-preferences`, `style-assist-recent-items`, `drape-subscription` (free/pro), `drape-daily-generates` (generate count + date), `drape-wear-count`, `drape-review-done`
- **Launch features** added (MVP):
  - **Freemium paywall** — `useSubscription.ts` hook; free tier = 3 AI outfit generates/day; "See alternatives" on Home blocks with `UpgradeSheet` when limit hit; `UpgradeSheet.tsx` is a reusable bottom drawer accepting `onUpgrade` callback
  - **In-app review nudge** — `ReviewNudge.tsx` bottom sheet; triggers after 3rd "Wear this" confirmation; 5-star rating; one-time (stored in localStorage); shown 2.2s after wear confirm to not interrupt the moment
  - **Outfit photo diary** — "Capture today's fit" dashed button in the worn-today state; hidden camera file input; photo thumbnail shown once captured; tracked via `fit_photo_added` analytics event
  - **Privacy policy** — `/privacy` route (`PrivacyPolicy.tsx`); 10 sections (overview, data collection, AI processing, analytics, retention, rights, children, changes, contact); linked from Profile settings list; required for Play Store submission
  - **Profile plan card** — shows real subscription state (Free vs Pro); Free: upgrade CTA with perk list; Pro: billing grid + cancel button; PRO badge in gold
- **Australian seasons**: summer=Dec-Feb, autumn=Mar-May, winter=Jun-Aug, spring=Sep-Nov
- **Confidence thresholds**: ≥82=high (teal), 65-81=safe (gold), 50-64=experimental (coral), <50 excluded

### API Server — `artifacts/api-server`

- **Preview path**: `/api`
- **Routes**:
  - `GET/POST /api/wardrobe` — list and create wardrobe items
  - `PATCH/DELETE /api/wardrobe/:id` — update/delete wardrobe items
  - `GET /api/wardrobe/stats` — stats by category and season
  - `GET/PUT /api/profile` — get/upsert style profile
  - `POST /api/stylist/generate` — generate AI outfit suggestions
  - `GET /api/stylist/history` — past stylist sessions

## Database Schema

- `wardrobe_items` — clothing items with name, category, colour, season, brand, notes
- `style_profiles` — user body profile and style preferences
- `stylist_sessions` — past outfit generation sessions with stored outfits JSON
- `conversations` + `messages` — OpenAI integration conversation tables (from integration template)

## AI Integration

Uses Replit AI Integrations for OpenAI (gpt-5.4). No user API key required.
The stylist system prompt from the attached asset is embedded in the backend route.
