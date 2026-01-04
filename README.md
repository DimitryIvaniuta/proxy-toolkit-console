# Proxy Toolkit Console (Frontend)

A **Next.js (App Router)** console UI for your **Spring Proxy Toolkit** backend (Audit / Cache / Idempotency / RateLimit / Retry).
Built with **React 19.2 + TypeScript**, a professional client data layer (**TanStack Query**), and a production-friendly layout
(**Navbar + Sidebar + Footer + central canvas**).

This frontend is designed to work with your backend running on `http://localhost:8080` and provides:
- Demo pages to exercise the toolkit: cache / idempotency / rate limit / retry
- Admin UI to create API clients and credentials (API keys)
- A Prometheus metrics dashboard (parses `/actuator/prometheus` and visualizes key counters)
- Offline development mode using **MSW**
- Optional **JWT/OIDC-ready auth scaffold** (Bearer token support)
- OpenAPI-generated TypeScript types **wired into `lib/api.ts`** (while still validating runtime payloads with Zod)

---

## Recommended GitHub repository

**Name:** `proxy-toolkit-console`  
**Description:** Next.js (React 19.2 + TypeScript) console UI for Spring Proxy Toolkit backend with React Query, MSW offline mocks, OpenAPI types, Prometheus dashboard, Vitest and Playwright.

---

## Tech stack

- **Next.js** (App Router)
- **React 19.2**, **TypeScript**
- **TanStack Query** (server-state, caching, retries, mutations)
- **Zod** (runtime validation)
- **Tailwind CSS** (UI styling)
- **MSW** (offline mocks)
- **Vitest + Testing Library** (unit/component tests)
- **Playwright** (E2E smoke tests)

---

## Project structure

```
app/
  - admin/
    - clients/
      - page.tsx
  - api/
    - backend/
      - prometheus/
  - auth/
    - login/
      - page.tsx
  - demo/
    - cache/
      - page.tsx
    - idempotent/
      - page.tsx
    - ratelimited/
      - page.tsx
    - retry/
      - page.tsx
  - metrics/
    - page.tsx
  - settings/
    - page.tsx
  - globals.css
  - layout.tsx
  - page.tsx
  - providers.tsx
components/
  - layout/
    - Footer.tsx
    - Navbar.tsx
    - Shell.tsx
    - Sidebar.tsx
  - ui/
    - Button.tsx
    - Card.tsx
    - Input.tsx
docs/
  - AUTH.md
  - METRICS.md
  - MSW.md
  - OPENAPI.md
  - REPO.md
e2e/
  - smoke.spec.ts
lib/
  - api.ts
  - auth.ts
  - config.ts
  - hooks.ts
  - http.ts
  - idempotency.ts
  - prometheus.ts
public/
src/
  - gen/
    - .gitkeep
  - mocks/
    - browser.ts
    - enableMsw.ts
    - handlers.ts
  - test/
    - http.apiRequest.test.ts
    - prometheus.parse.test.ts
    - sidebar.test.tsx
.env.example
.eslintrc.json
.gitignore
next-env.d.ts
next.config.mjs
package.json
playwright.config.ts
postcss.config.mjs
README.md
tailwind.config.ts
tsconfig.json
vitest.config.ts
vitest.setup.ts
```

Key folders:
- `app/` – Next.js routes (pages + API proxy routes)
- `components/` – layout + UI primitives
- `lib/` – HTTP client, API functions, React Query hooks, Prometheus parsing
- `src/gen/` – OpenAPI generated types (`openapi-typescript`)
- `src/mocks/` – MSW handlers/worker
- `docs/` – detailed how-tos (OpenAPI/MSW/Auth/Metrics)

---

## Prerequisites

- Node.js 20+ (recommended)
- Backend running locally (Spring Proxy Toolkit)
  - API base: `http://localhost:8080`
  - Actuator enabled (for metrics): `/actuator/prometheus`

---

## Environment variables

Copy and adjust:

```bash
cp .env.example .env.local
```

`.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# enable offline mocks
NEXT_PUBLIC_MSW=0
```

---

## Run locally

```bash
npm i
npm run dev
```

Open: http://localhost:3000

---

## Backend headers used by this UI

This UI uses the same headers as your backend toolkit:

- `X-Api-Key` – required for client identification (policy/rate limit scoping)
- `X-Idempotency-Key` – required for idempotent POST (must be stable for retries)
- `X-Correlation-Id` – generated per request (for tracing/log correlation)
- `Authorization: Bearer <token>` – optional (future JWT/OIDC support)

### Where to set the API key
Open **Settings** page and paste the raw API key returned by the backend admin endpoint.  
The UI stores it in **localStorage** and sends it as `X-Api-Key` on every request.

---

## Pages

### Dashboard
`/` – overview and quick-start

### Settings
`/settings`
- store/clear `X-Api-Key`
- store/clear optional bearer token (future auth)

### Demo
- `/demo/cache` → `GET /api/demo/cache?customerId=...`
- `/demo/idempotent` → `POST /api/demo/idempotent` + `X-Idempotency-Key`
- `/demo/ratelimited` → `GET /api/demo/ratelimited`
- `/demo/retry` → `GET /api/demo/retry?failTimes=...`

### Admin
`/admin/clients`
- list/create API clients
- create credentials (returns raw `apiKeyRaw` once)

### Metrics
`/metrics`
- reads Prometheus exposition format from backend
- visualizes important counters (cache hits/misses, idempotency served, rate-limit rejects, retry attempts)
- auto-refreshes every 5 seconds

---

## HTTP client design (professional)

All calls go through `lib/http.ts`:
- uses `fetch` (works best with Next.js)
- injects `X-Api-Key`, `X-Correlation-Id`, optional `X-Idempotency-Key`
- converts backend errors into a typed `ApiError` object
- includes `retryAfter` if backend sends `Retry-After` header (e.g. 429)

### Fix for React Query error typing
React Query exposes `error` as `unknown` (or `Error | null`).  
Use a type guard (recommended) instead of unsafe casting.

`lib/http.ts` should expose:
```ts
export function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "status" in e;
}
```

Then:
```ts
const err = isApiError(m.error) ? m.error : undefined;
```

---

## OpenAPI types (generated) and wired into `lib/api.ts`

This project supports generating types from your backend OpenAPI endpoint.

### Generate types
Backend must expose:
- `GET /v3/api-docs` (Springdoc)

Generate:
```bash
# macOS/Linux
OPENAPI_URL=http://localhost:8080/v3/api-docs npm run gen:openapi

# Windows PowerShell
$env:OPENAPI_URL="http://localhost:8080/v3/api-docs"
npm run gen:openapi
```

Output:
- `src/gen/openapi.ts`

### How it is used
`lib/api.ts` imports:
```ts
import type { paths } from "../src/gen/openapi";
```

and types each call using OpenAPI `paths[...]` request/response shapes **while still validating with Zod**.
This gives you:
- compile-time safety (OpenAPI)
- runtime safety (Zod)

---

## Offline dev with MSW (Mock Service Worker)

### Enable
In `.env.local` set:
```env
NEXT_PUBLIC_MSW=1
```

Initialize worker once:
```bash
npm run msw:init
```

Run:
```bash
npm run dev
```

MSW handlers live in:
- `src/mocks/handlers.ts`

It mocks:
- demo endpoints
- admin endpoints (minimal)
- `/actuator/prometheus` text endpoint

Disable by setting `NEXT_PUBLIC_MSW=0`.

---

## Auth scaffold (future JWT/OIDC)

Backend currently uses `X-Api-Key`.  
This UI is ready if you later add JWT/OIDC (Keycloak/Entra/etc.):

- `lib/auth.ts` stores tokens in localStorage
- `lib/http.ts` automatically adds `Authorization: Bearer <token>` if present
- `/auth/login` is a placeholder screen (for future real OIDC PKCE login)

When you enable real OIDC:
- implement Authorization Code + PKCE flow
- implement refresh token / silent refresh
- protect routes based on auth state

---

## Prometheus dashboard and CORS

### How metrics are fetched
Browser CORS can block `http://localhost:8080/actuator/prometheus`.

This project uses a Next.js server route as a **BFF proxy**:
- UI calls: `GET /api/backend/prometheus`
- Next.js route fetches: `{
  process.env.NEXT_PUBLIC_API_BASE_URL
}/actuator/prometheus`

Files:
- `app/api/backend/prometheus/route.ts`
- `lib/prometheus.ts` (parser)

---

## Testing

### Unit/component tests
```bash
npm run test
npm run test:coverage
```

### E2E tests (Playwright)
```bash
npm run dev
# in another terminal:
npm run test:e2e
```

---

## Common issues

### 1) Backend CORS blocks calls
If you call backend directly from browser (not through Next.js proxy), backend must allow:
- Origin: `http://localhost:3000`
- Methods: `OPTIONS, GET, POST, ...`
- Headers: `X-Api-Key, X-Idempotency-Key, X-Correlation-Id, Content-Type, Authorization`

### 2) Idempotency 409 Conflict
If you reuse the same `X-Idempotency-Key` with a **different payload**, strict backend returns 409.
Rule:
- same key + same payload = retry
- new payload = new key

---

## Scripts

- `npm run dev` – start dev server
- `npm run build` / `npm run start` – production build/run
- `npm run lint` – lint
- `npm run gen:openapi` – generate OpenAPI TS types
- `npm run msw:init` – install MSW worker in `public/`
- `npm run test` / `npm run test:coverage` – unit tests
- `npm run test:e2e` – Playwright tests

---

## License
Internal/demo project. Add a license if you plan to publish publicly.
