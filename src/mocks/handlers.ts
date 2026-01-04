import { http, HttpResponse } from "msw";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Minimal in-memory stores for offline demos
let stableValueByCustomer = new Map<number, string>();
let idempotentByKey = new Map<string, any>();
let clients: any[] = [{ id: 1, clientName: "Mock Client", clientCode: "mock-client" }];

export const handlers = [
  http.get(`${baseUrl}/api/demo/cache`, ({ request }) => {
    const url = new URL(request.url);
    const customerId = Number(url.searchParams.get("customerId") ?? "0");
    if (!stableValueByCustomer.has(customerId)) {
      stableValueByCustomer.set(customerId, `mock-${customerId}-${Math.random().toString(16).slice(2)}`);
    }
    return HttpResponse.json({
      customerId,
      stableValue: stableValueByCustomer.get(customerId),
      generatedAt: new Date().toISOString(),
    });
  }),

  http.post(`${baseUrl}/api/demo/idempotent`, async ({ request }) => {
    const idem = request.headers.get("x-idempotency-key") || "no-key";
    const body = await request.json().catch(() => ({}));
    if (!idempotentByKey.has(idem)) {
      idempotentByKey.set(idem, {
        paymentId: `mock-pay-${Math.random().toString(16).slice(2)}`,
        amount: body.amount ?? 0,
        currency: body.currency ?? "PLN",
      });
    }
    return HttpResponse.json(idempotentByKey.get(idem));
  }),

  http.get(`${baseUrl}/api/demo/ratelimited`, () => {
    // Simulate occasional 429
    const r = Math.random();
    if (r < 0.3) {
      return HttpResponse.json(
        {
          status: 429,
          error: "Too Many Requests",
          message: "Rate limit exceeded (mock)",
          path: "/api/demo/ratelimited",
          correlationId: "mock-correlation",
          timestamp: new Date().toISOString(),
        },
        { status: 429, headers: { "Retry-After": "2" } },
      );
    }
    return HttpResponse.json({ ok: true, now: new Date().toISOString() });
  }),

  http.get(`${baseUrl}/api/demo/retry`, ({ request }) => {
    const url = new URL(request.url);
    const failTimes = Number(url.searchParams.get("failTimes") ?? "0");
    // just succeed with attempt = failTimes + 1
    return HttpResponse.json({ status: "SUCCESS", attempt: Math.max(1, failTimes + 1) });
  }),

  http.get(`${baseUrl}/api/admin/clients`, () => HttpResponse.json(clients)),

  http.post(`${baseUrl}/api/admin/clients`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const id = clients.length ? Math.max(...clients.map((c) => c.id)) + 1 : 1;
    const c = { id, clientName: body.clientName ?? "New Client", clientCode: body.clientCode ?? `client-${id}` };
    clients = [c, ...clients];
    return HttpResponse.json(c, { status: 201 });
  }),

  http.post(`${baseUrl}/api/admin/clients/:clientId/credentials`, async ({ params }) => {
    const clientId = Number(params.clientId);
    return HttpResponse.json(
      { id: clientId * 1000 + 1, apiKeyRaw: "mock-api-key", policyClientKey: "apiKey:mock-api-key" },
      { status: 201 },
    );
  }),

  // prometheus text
  http.get(`${baseUrl}/actuator/prometheus`, () => {
    const body = [
      '# HELP proxy_toolkit_cache_hits_total Cache hits',
      '# TYPE proxy_toolkit_cache_hits_total counter',
      'proxy_toolkit_cache_hits_total 5',
      '# HELP proxy_toolkit_cache_misses_total Cache misses',
      '# TYPE proxy_toolkit_cache_misses_total counter',
      'proxy_toolkit_cache_misses_total 2',
      '# HELP proxy_toolkit_idempotency_served_total Idempotency served',
      '# TYPE proxy_toolkit_idempotency_served_total counter',
      'proxy_toolkit_idempotency_served_total 3',
    ].join("\n");
    return new HttpResponse(body, { status: 200, headers: { "Content-Type": "text/plain; version=0.0.4" } });
  }),
];
