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
- **Description**: "Style Assist" (internal name Drape) — AI-powered personal stylist app, mobile-first dark UI (pink #FF4D8D / coral #FF7A5C / gold #C8A96A on near-black #0F1115). Australian app (AUD currency).
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
  - **Item Preference** — per-item preference sheet (`ItemPreferenceSheet.tsx` + `useItemPreferences.ts`). Two sections: "How often do you reach for this?" (3 options, neutral language only) and "How does this feel on you?" (5 feel options). `aria-pressed` on all buttons, `toggleFeel` uses functional state update to avoid stale closure. Preferences persisted to localStorage key `style-assist-item-prefs`. Scoring engine: go-to items get +3 reach boost (max +6/outfit); not-lately items get a positive rotation tip in outfit explanations. Wardrobe cards show a thin coloured underline (teal/gold/muted) for set preferences.
  - Preference tracking — `useStylePreferences` hook signals like/skip on save; seeds future scoring
- **Key lib files**:
  - `src/lib/stylingEngine.ts` — scoring engine + tip/upgrade/reason builders
  - `src/lib/outfitGenerator.ts` — `generateOutfits()` / `generateMonthPlan()` with cross-day name deduplication
  - `src/lib/mockData.ts` — enriched `WardrobeItem` type (colors/styleTags/seasonTags)
  - `src/lib/stylePreferences.ts` + `src/hooks/useStylePreferences.ts`
  - `src/contexts/NotificationsContext.tsx`
  - `src/pages/GenerateOutfitScreen.tsx` — score meter, Stylist notes panel, breakdown expand
  - `src/pages/FirstExperienceFlow.tsx`
- **Design tokens**: base `#0F1115`, elevated `#151922`, card `#1A1F2B`, text `#F6F3EE`, no blue vars
- **localStorage keys**: `style-assist-onboarded`, `style-assist-timeline`, `style-assist-incoming-items`, `style-assist-planned-events`, `style-assist-notifications`, `style-assist-fte-done`, `style-assist-preferences`, `style-assist-recent-items`
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
