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
- **Description**: AI-powered personal stylist app with wardrobe management, style profiles, and AI outfit generation
- **Key features**:
  - Wardrobe manager (CRUD for clothing items with category/colour/season/brand)
  - Style profile (gender, height, sizes, fabric preferences)
  - AI Stylist Studio — generates 3 complete outfit suggestions using GPT-5.4, following the editorial stylist prompt
  - Session history to revisit past outfit suggestions
  - Dashboard with wardrobe stats

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
