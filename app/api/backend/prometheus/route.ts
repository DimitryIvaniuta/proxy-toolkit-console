import { API_BASE_URL } from "../../../../lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(`${API_BASE_URL}/actuator/prometheus`, {
    // avoid Next.js caching for live metrics
    cache: "no-store",
    headers: { "Accept": "text/plain" },
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "text/plain; charset=utf-8",
    },
  });
}
