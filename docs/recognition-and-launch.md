# Style Assist: recognition and outfit browsing

This change prepares a testable web build. It does not certify an App Store or Google Play release.

## What changed

- Clothing capture sends front/back/label images to POST /api/wardrobe/recognize.
- The server uses the existing Replit OpenAI integration, with image inputs, a strict JSON schema, response validation, a 45-second provider timeout, request-size limits, basic per-IP throttling and a four-request concurrency limit. Images and provider payloads are not logged.
- Default vision model: gpt-5.4, matching the project's existing integration. CLOTHING_VISION_MODEL can select another compatible image-input / structured-output model supported by the configured provider.
- The app always presents editable details before saving. Unavailable recognition offers manual entry and never substitutes random answers. Appearance-based fabric guesses are kept separate from label/user-confirmed composition.
- Photos are analysed at up to 1400px; saved wardrobe images remain compressed in browser storage. Original photo appearance is preserved. The old corner-colour background eraser is no longer automatically applied; true garment segmentation and 3-D are not implemented in this change.
- Outfit browsing enumerates all tops/bottoms/shoes/dresses/layers and excludes seen exact combinations before selecting the next three. Candidate memory is bounded to the requested page size. It no longer discards shoe-only or layer alternatives. Each page still scans the available combinations; large wardrobes will need server-side jobs or indexing if profiling shows slowdowns.
- The browsing relevance threshold is the existing rule-based score of 65. These scores are styling heuristics, not calibrated AI confidence probabilities. The default generator for other callers retains its existing threshold of 50.
- Dresses remain dresses. Compound seasonal labels are normalised. The browsing and home screens exclude clothes marked In wash or On loan and update when saved items change.
- Earlier looks can be selected again. Exhaustion offers a link to wardrobe gaps. Adding more owned clothes remains an option.
- The AI Stylist route now opens the real outfit generator instead of static sample cards. New incoming-item lists start empty rather than seeding pretend purchases.
- Shop displays wardrobe-category gaps and a truthful unavailable-products state. All four merchant adapters are disabled until live feeds are implemented. No affiliate programme is activated and no fake product price, stock or rating is shown by these paths.
- Shared TypeScript errors (duplicate schema exports, missing type dependencies, retry error import, optional image data) and the missing toast component were repaired.

## Run and validate

Use Node 24 and pnpm. Run `pnpm install`, `pnpm test`, and `PORT=5173 BASE_PATH=/ pnpm run build`.
The API requires DATABASE_URL plus AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY in the server environment. Never put these values in client VITE variables or GitHub files. Existing routes still require the database at startup.

The browser sends /api requests to the API service. Local Vite development proxies to port 8080. For a separately hosted client, configure VITE_API_BASE_URL and the API's allowed origins appropriately.

Automated regression tests cover exhaustive pagination on a small known wardrobe, later wardrobe items, shoe/layer variants, dress handling, seasons, incomplete wardrobes, label-evidence handling, malformed recognition output, request limits and disabled mock commerce.

Validation completed: nine core regression checks, HTTP recognition contract/error/throttle tests with a mocked provider, TypeScript checks, and production web/API builds. Browser/device checks were not completed: the local test browser was unavailable and its download timed out.

Live clothing recognition accuracy is NOT verified by those tests. Before release, use a labelled set of real front/back/tag photos including the misclassified jersey, trousers, folded jumpers, dresses, different backgrounds, blurry labels and non-clothing objects. Record category accuracy, corrections, label transcription errors, latency and per-item cost. Provider access must be tested in the deployed Replit environment.

## Remaining release gates

1. Authentication and data isolation: existing wardrobe/profile/stylist database routes are not scoped to an authenticated user. Implement per-user access before a public multi-user launch. The new photo endpoint's basic in-memory rate limit is not a substitute for authenticated quotas, a shared limiter or spend controls.
2. Persistence: captured wardrobe photos/items are currently browser-local. Implement authenticated durable storage, migration/sync, deletion/export and backup behaviour before promising cross-device accounts. Existing randomly classified items need review; the new model does not silently overwrite them.
3. Recognition evaluation: real garment photos and live provider credentials, physical-device camera/file-format tests, actual cost and latency measurement. No API credentials were available for live paid recognition in this change.
4. Commerce: approved feeds and affiliate accounts, real product URLs, availability/sizing/currency filtering, relevant item compatibility and disclosure. Merchant names are planned integrations, not partnerships.
5. Payments and privacy: audit current local subscription toggles/trial copy, implement actual billing if charging, update privacy/data handling disclosures and check current store requirements.
6. Native distribution: the repository contains a Vite web/PWA app. Native iOS/Android projects, signing, store accounts, device testing and submission have not been delivered here.
7. Production hardening: verify all other screens, account flows, analytics privacy and endpoint authorisation; review deployment logs and monitor failures. This is a focused repair, not a full security or launch certification.
