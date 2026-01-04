# MSW Offline Mocking

This project supports offline development using **Mock Service Worker (MSW)**.

## Enable
In `.env.local` set:
```env
NEXT_PUBLIC_MSW=1
```

Then initialize the service worker once:
```bash
npm run msw:init
```

Start dev:
```bash
npm run dev
```

MSW intercepts requests to your backend base URL (NEXT_PUBLIC_API_BASE_URL) and serves mock responses defined in:
- `src/mocks/handlers.ts`

Disable by removing `NEXT_PUBLIC_MSW` or setting it to `0`.
