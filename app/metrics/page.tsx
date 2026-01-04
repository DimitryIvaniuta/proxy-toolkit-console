"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import type { ApiError } from "../../lib/http";
import { parsePrometheus, sumByMetric } from "../../lib/prometheus";

const IMPORTANT = [
  "proxy_toolkit_cache_hits_total",
  "proxy_toolkit_cache_misses_total",
  "proxy_toolkit_idempotency_executed_total",
  "proxy_toolkit_idempotency_served_total",
  "proxy_toolkit_ratelimit_rejected_total",
  "proxy_toolkit_retry_calls_total",
  "proxy_toolkit_retry_attempts_total",
];

export default function MetricsPage() {
  const q = useQuery({
    queryKey: ["prometheus"],
    queryFn: async () => {
      const res = await fetch("/api/backend/prometheus", { cache: "no-store" });
      if (!res.ok) {
        const t = await res.text();
        throw { status: res.status, message: t } as ApiError;
      }
      const text = await res.text();
      const samples = parsePrometheus(text);
      return { text, samples };
    },
    refetchInterval: 5000,
  });

  const err = q.error as ApiError | undefined;

  const totals = q.data ? IMPORTANT.map((name) => ({
    name,
    value: sumByMetric(q.data.samples, name),
  })) : [];

  const max = totals.reduce((m, x) => Math.max(m, x.value), 1);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Prometheus metrics</h1>

      <Card title="Summary (auto-refresh 5s)">
        <div className="flex gap-2">
          <Button onClick={() => q.refetch()} disabled={q.isFetching}>Refresh</Button>
        </div>

        {q.isFetching ? <div className="mt-3 text-sm">Loading…</div> : null}
        {err ? (
          <pre className="mt-3 text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(err, null, 2)}</pre>
        ) : null}

        {q.data ? (
          <div className="mt-3 space-y-2">
            {totals.map((t) => (
              <div key={t.name} className="grid grid-cols-[320px_1fr_80px] items-center gap-3">
                <div className="text-xs font-mono text-slate-700">{t.name}</div>
                <div className="h-3 rounded bg-slate-200 overflow-hidden">
                  <div className="h-3 bg-slate-900" style={{ width: `${Math.round((t.value / max) * 100)}%` }} />
                </div>
                <div className="text-right text-xs font-mono">{t.value.toFixed(0)}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-3 text-xs text-slate-600">
          Data is fetched server-side via <code className="font-mono">/api/backend/prometheus</code> to avoid browser CORS issues.
        </div>
      </Card>

      <Card title="Raw text">
        {q.data ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto max-h-[420px]">{q.data.text}</pre>
        ) : (
          <div className="text-sm text-slate-700">No data yet.</div>
        )}
      </Card>
    </div>
  );
}
