"use client";

import { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useDemoRetry } from "../../../lib/hooks";
import type { ApiError } from "../../../lib/http";

export default function RetryPage() {
  const [failTimes, setFailTimes] = useState("2");
  const m = useDemoRetry();
  const err = m.error as ApiError | undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Retry demo</h1>

      <Card title="Request">
        <div className="flex gap-2 max-w-md">
          <Input value={failTimes} onChange={(e) => setFailTimes(e.target.value)} />
          <Button onClick={() => m.mutate(Number(failTimes))} disabled={m.isPending}>Call</Button>
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Calls <code className="font-mono">GET /api/demo/retry?failTimes=...</code>.
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
