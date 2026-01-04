import { apiRequest } from "../../lib/http";

// Simple unit test: ensure headers are set
describe("apiRequest", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as any;
    // minimal localStorage
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      configurable: true,
    });
    window.localStorage.setItem("proxyToolkit.apiKey", "abc");
    // crypto.randomUUID stub
    // (globalThis as any).crypto = { randomUUID: () => "uuid-1" };
    vi.stubGlobal("crypto", { randomUUID: () => "uuid-1" } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllGlobals();
  });

  it("adds X-Api-Key, X-Correlation-Id and optional X-Idempotency-Key", async () => {
    await apiRequest("/api/demo/idempotent", { method: "POST", body: { a: 1 }, idempotencyKey: "idem-123" });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [, init] = (globalThis.fetch as any).mock.calls[0];

    expect(init.headers["X-Api-Key"]).toBe("abc");
    expect(init.headers["X-Correlation-Id"]).toBe("uuid-1");
    expect(init.headers["X-Idempotency-Key"]).toBe("idem-123");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });
});
