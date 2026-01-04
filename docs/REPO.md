# Suggested GitHub repository

**Name:** proxy-toolkit-console  
**Description:** Next.js (React 19 + TypeScript) console UI for Spring Proxy Toolkit backend (Audit/Cache/Idempotency/RateLimit/Retry) with React Query, Tailwind, Vitest and Playwright.

## Setup
1) Copy `.env.example` to `.env.local`
2) Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
3) `npm i`
4) `npm run dev`

## Notes
- Use Settings page to store `X-Api-Key` in localStorage.
- Idempotency demo sends `X-Idempotency-Key` header.
