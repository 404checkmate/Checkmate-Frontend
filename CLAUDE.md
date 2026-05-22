# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 5173 (auto-opens browser)
npm run build        # Production build (runs fetch-content prebuild first)
npm run lint         # ESLint
npm run preview      # Preview production build locally
npm run fetch-content  # Fetch curated article data (runs automatically before build)
```

There is no test suite — no `npm test` command exists.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in values:

- `VITE_API_BASE_URL=/api` — Use `/api` (recommended) so Vite dev proxy forwards to `http://localhost:8080`, avoiding CORS entirely. Using an absolute URL requires the backend's `CORS_ORIGIN` to match.
- `VITE_DEV_PROXY_TARGET=http://localhost:8080` — Override proxy target if backend runs elsewhere (optional).
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Required in production; optional locally if testing without auth.

**Rule:** Never access `import.meta.env.VITE_*` directly. All env vars are centralized in `src/config/env.js` — import from there.

## Architecture

### Path Alias

`@` resolves to `./src/`. Use `@/` for all internal imports.

### Routing (`src/router/index.jsx`)

React Router v7 with `useRoutes()`. All pages are `lazy()`-loaded and wrapped in `<Suspense>`. To add a page:
1. Create the component in `src/pages/`
2. Add a `lazy()` import in `src/router/index.jsx`
3. Add the route to the `routes` array
4. Wrap with `<ProtectedRoute>` if auth is required

Key route patterns:
- `/trips/new/destination` → multi-step trip creation (step 1 of 3, continuing through `/trips/:id/loading` → `/trips/:id/search`)
- `/trips/guest/*` — same flow but unauthenticated; guest state is upgraded to a real trip after login
- `/curation/:country` — static curated articles (content fetched at build time)

### API Layer (`src/api/`)

`src/api/client.js` creates an Axios instance. The request interceptor attaches the JWT:
1. Tries `supabase.auth.getSession()` first
2. Falls back to `localStorage.getItem('checkmate:auth_token')`

The response interceptor does **not** auto-logout on 401 (intentional — avoids race conditions during Supabase session hydration).

Feature-specific API functions live in separate modules: `trips.js`, `checklists.js`, `guideArchives.js`, `master.js`, `users.js`.

### Auth Flow (`src/hooks/useAuth.js`, `src/api/auth.js`, `src/lib/supabase.js`)

Supabase handles Google/Kakao OAuth (PKCE flow). The sequence:
1. `startGoogleLogin()` / `startKakaoLogin()` → Supabase OAuth redirect
2. `/auth/callback` → `consumeAuthCallback()` parses the session, optionally stores a localStorage fallback token
3. `/auth/consent` → terms acceptance (always shown post-login)
4. `/onboarding` → profile setup (only if `FEATURE_PROFILE_ONBOARDING_ENABLED`)

`useAuth()` hook provides `{ user, loading, isLoggedIn }`. It subscribes to `supabase.auth.onAuthStateChange` for real-time session updates.

### State Management

No Redux or Zustand. Pattern is: **custom hooks + localStorage** for persistence.

Key localStorage utilities in `src/utils/`:
- `tripPlanContextStorage.js` — active trip plan (destination, dates, companions, styles) across page navigations
- `activeTripIdStorage.js` — created trip ID
- `savedTripItems.js` — checklist items before backend persistence
- `guideArchiveStorage.js` / `guideArchiveEntryChecklistStorage.js` — guide archive local state
- `pendingGuestSearch.js` / `pendingTripSubmit.js` — guest-to-logged-in upgrade flow

### Component Structure

```
src/components/
  auth/        — Login, OAuth buttons
  common/      — Shared UI primitives
  guide/       — Guide archive views and checklist items
  home/        — HomePage search bar and landing sections
  onboarding/  — Profile setup steps
  search/      — TripSearchPage checklist UI
  trip/        — Trip creation flow components
  ProtectedRoute.jsx
```

Sub-components (dropdowns, panels, step-specific widgets) live alongside their parent page component or in the corresponding `components/` subfolder — not in `pages/`.

### Custom Hooks (`src/hooks/`)

Business logic is extracted from pages into hooks. Pattern used throughout:

- `useDesktopSearchSubmit` — trip creation API call + navigation from home search bar
- `useSearchBarMasterData` — fetches countries/companions/styles for the search bar
- `useChecklistLoad` — loads and polls checklist generation status
- `useTripSearchSave` — saves checklist selections to the backend
- `useGuideArchiveReclassify` — LLM reclassification of guide archive items
- `useGuestTripUpgrade` — upgrades a guest trip to an authenticated trip after login

### Mocks (`src/mocks/`)

Static fallback data for countries, travel styles, and companions. The API layer overwrites these with live data at runtime; mocks serve as initial state and offline fallback.
