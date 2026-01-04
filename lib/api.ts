import { z } from "zod";
import { apiRequest } from "./http";

// OpenAPI (generated via `npm run gen:openapi` -> src/gen/openapi.ts)
import type { paths } from "../src/gen/openapi";

/**
 * Helper: extract JSON payload type from an OpenAPI response object.
 */
type JsonOf<T> = T extends { content: { "application/json": infer J } } ? J : never;

/**
 * Some backends respond with 200 vs 201 depending on controller style.
 * Use unions to keep types flexible while still derived from OpenAPI.
 */
type AnyJsonResponse<T> = JsonOf<T>;

/* ----------------------------- OpenAPI types ----------------------------- */

type DemoCacheResApi =
  | AnyJsonResponse<paths["/api/demo/cache"]["get"]["responses"]["200"]>
  | AnyJsonResponse<paths["/api/demo/cache"]["get"]["responses"]["201"]>;

type DemoIdempotentReqApi =
  paths["/api/demo/idempotent"]["post"]["requestBody"] extends { content: { "application/json": infer J } }
    ? J
    : never;

type DemoIdempotentResApi =
  | AnyJsonResponse<paths["/api/demo/idempotent"]["post"]["responses"]["200"]>
  | AnyJsonResponse<paths["/api/demo/idempotent"]["post"]["responses"]["201"]>;

type DemoRateLimitedResApi =
  | AnyJsonResponse<paths["/api/demo/ratelimited"]["get"]["responses"]["200"]>
  | AnyJsonResponse<paths["/api/demo/ratelimited"]["get"]["responses"]["201"]>;

type DemoRetryResApi =
  | AnyJsonResponse<paths["/api/demo/retry"]["get"]["responses"]["200"]>
  | AnyJsonResponse<paths["/api/demo/retry"]["get"]["responses"]["201"]>;

type CreateClientReqApi =
  paths["/api/admin/clients"]["post"]["requestBody"] extends { content: { "application/json": infer J } }
    ? J
    : never;

type CreateClientResApi =
  | AnyJsonResponse<paths["/api/admin/clients"]["post"]["responses"]["201"]>
  | AnyJsonResponse<paths["/api/admin/clients"]["post"]["responses"]["200"]>;

type ListClientsResApi =
  | AnyJsonResponse<paths["/api/admin/clients"]["get"]["responses"]["200"]>
  | AnyJsonResponse<paths["/api/admin/clients"]["get"]["responses"]["201"]>;

type CreateCredentialReqApi =
  paths["/api/admin/clients/{clientId}/credentials"]["post"]["requestBody"] extends {
    content: { "application/json": infer J };
  }
    ? J
    : never;

type CreateCredentialResApi =
  | AnyJsonResponse<paths["/api/admin/clients/{clientId}/credentials"]["post"]["responses"]["201"]>
  | AnyJsonResponse<paths["/api/admin/clients/{clientId}/credentials"]["post"]["responses"]["200"]>;

/* ----------------------------- Zod schemas ------------------------------ */
/**
 * Keep Zod as runtime safety layer, even with OpenAPI types present.
 * If backend changes, Zod will fail fast during dev.
 */

export const DemoCacheResponseSchema = z.object({
  customerId: z.number(),
  stableValue: z.string(),
  generatedAt: z.string().optional(),
});
export type DemoCacheResponse = z.infer<typeof DemoCacheResponseSchema>;

export const DemoIdempotentRequestSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});
export type DemoIdempotentRequest = z.infer<typeof DemoIdempotentRequestSchema>;

export const DemoIdempotentResponseSchema = z.object({
  paymentId: z.string(),
  amount: z.number(),
  currency: z.string(),
});
export type DemoIdempotentResponse = z.infer<typeof DemoIdempotentResponseSchema>;

export const DemoRateLimitedResponseSchema = z
  .object({
    ok: z.boolean(),
    now: z.string().optional(),
  })
  .passthrough();
export type DemoRateLimitedResponse = z.infer<typeof DemoRateLimitedResponseSchema>;

export const DemoRetryResponseSchema = z
  .object({
    status: z.string(),
    attempt: z.number(),
  })
  .passthrough();
export type DemoRetryResponse = z.infer<typeof DemoRetryResponseSchema>;

// admin (minimal assumptions)
export const ApiClientDtoSchema = z
  .object({
    id: z.number(),
    clientName: z.string().optional(),
    clientCode: z.string().optional(),
  })
  .passthrough();
export type ApiClientDto = z.infer<typeof ApiClientDtoSchema>;

export const ApiClientCredentialCreatedSchema = z
  .object({
    id: z.number().optional(),
    apiKeyRaw: z.string(),
    policyClientKey: z.string().optional(),
  })
  .passthrough();
export type ApiClientCredentialCreated = z.infer<typeof ApiClientCredentialCreatedSchema>;

/* ------------------------------ API calls ------------------------------- */

export async function demoCache(customerId: number): Promise<DemoCacheResponse> {
  // OpenAPI compile-time: DemoCacheResApi
  const res = await apiRequest<DemoCacheResApi>(`/api/demo/cache?customerId=${customerId}`);
  return DemoCacheResponseSchema.parse(res);
}

export async function demoIdempotent(
  body: DemoIdempotentRequest,
  idempotencyKey: string
): Promise<DemoIdempotentResponse> {
  // OpenAPI compile-time: DemoIdempotentReqApi/DemoIdempotentResApi
  const req = DemoIdempotentRequestSchema.parse(body) as DemoIdempotentReqApi;
  const res = await apiRequest<DemoIdempotentResApi>(`/api/demo/idempotent`, {
    method: "POST",
    body: req,
    idempotencyKey,
  });
  return DemoIdempotentResponseSchema.parse(res);
}

export async function demoRateLimited(): Promise<DemoRateLimitedResponse> {
  const res = await apiRequest<DemoRateLimitedResApi>(`/api/demo/ratelimited`);
  return DemoRateLimitedResponseSchema.parse(res);
}

export async function demoRetry(failTimes: number): Promise<DemoRetryResponse> {
  const res = await apiRequest<DemoRetryResApi>(`/api/demo/retry?failTimes=${failTimes}`);
  return DemoRetryResponseSchema.parse(res);
}

export async function createClient(payload: { clientName: string; clientCode: string }): Promise<ApiClientDto> {
  // OpenAPI compile-time: CreateClientReqApi/CreateClientResApi
  const req = payload as CreateClientReqApi;
  const res = await apiRequest<CreateClientResApi>(`/api/admin/clients`, { method: "POST", body: req });
  return ApiClientDtoSchema.parse(res);
}

export async function listClients(): Promise<ApiClientDto[]> {
  const res = await apiRequest<ListClientsResApi>(`/api/admin/clients`);
  return z.array(ApiClientDtoSchema).parse(res);
}

export async function createCredential(
  clientId: number,
  payload: { credentialName: string }
): Promise<ApiClientCredentialCreated> {
  const req = payload as CreateCredentialReqApi;
  const res = await apiRequest<CreateCredentialResApi>(`/api/admin/clients/${clientId}/credentials`, {
    method: "POST",
    body: req,
  });
  return ApiClientCredentialCreatedSchema.parse(res);
}
