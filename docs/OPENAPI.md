# OpenAPI Type Generation

This console can generate TypeScript types from your Spring Boot OpenAPI endpoint.

## Prerequisite
Ensure the backend exposes:
- `GET /v3/api-docs` (Springdoc)

## Generate
```bash
# Windows PowerShell example:
$env:OPENAPI_URL="http://localhost:8080/v3/api-docs"
npm run gen:openapi

# macOS/Linux:
OPENAPI_URL=http://localhost:8080/v3/api-docs npm run gen:openapi
```

Output:
- `src/gen/openapi.ts`

## Using generated types
The project keeps Zod runtime validation for safety, but you can use OpenAPI types for compile-time help:
```ts
import type { paths } from "@/src/gen/openapi";
type CreateClientRes = paths["/api/admin/clients"]["post"]["responses"]["201"]["content"]["application/json"];
```


## Project integration
`lib/api.ts` is already wired to import `paths` from `src/gen/openapi.ts`.
