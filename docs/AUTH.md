# Auth flow scaffold (future JWT/OIDC)

Backend currently uses `X-Api-Key`. This console is prepared for JWT/OIDC if you add it later.

What is already implemented:
- Token storage in localStorage (`lib/auth.ts`)
- HTTP client automatically adds `Authorization: Bearer <token>` when present (`lib/http.ts`)
- `/auth/login` placeholder page to save a token

When backend supports auth:
- For OIDC (Keycloak/Entra): implement Authorization Code + PKCE redirect
- Add refresh token / silent refresh
- Protect pages based on authentication state
