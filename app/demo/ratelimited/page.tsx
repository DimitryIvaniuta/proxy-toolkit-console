"use client";

import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useDemoRateLimited } from "../../../lib/hooks";
import type { ApiError } from "../../../lib/http";

export default function RateLimitedPage() {
  const m = useDemoRateLimited();
  const err = m.error as ApiError | undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Rate limit demo</h1>

      <Card title="Request">
        <div className="flex gap-2">
          <Button onClick={() => m.mutate()} disabled={m.isPending}>Call</Button>
          <Button
            className="bg-slate-200 text-slate-900 hover:bg-slate-300"
            onClick={async () => {
              for (let i = 0; i < 15; i++) {
                // eslint-disable-next-line no-await-in-loop
                await m.mutateAsync();
              }
            }}
          >
            Burst x15
          </Button>
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Calls <code className="font-mono">GET /api/demo/ratelimited</code>.
          When backend returns 429, check <code className="font-mono">retryAfter</code>.
        </div>
      </Card>

      <Card title="Response">
        {m.isPending ? <div className="text-sm">Loading…</div> : null}
        {err ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(err, null, 2)}</pre>
        ) : null}
        {m.data ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(m.data, null, 2)}</pre>
        ) : null}
      </Card>
    </div>
  );
}
