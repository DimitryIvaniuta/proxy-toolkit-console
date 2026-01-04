"use client";

import { useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useDemoCache } from "../../../lib/hooks";
import type { ApiError } from "../../../lib/http";

export default function CachePage() {
  const [customerId, setCustomerId] = useState("42");
  const id = useMemo(() => Number(customerId), [customerId]);
  const q = useDemoCache(id);

  const err = q.error as ApiError | undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Cache demo</h1>

      <Card title="Request">
        <div className="flex gap-2 max-w-md">
          <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          <Button onClick={() => q.refetch()}>Call</Button>
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Calls <code className="font-mono">GET /api/demo/cache?customerId=...</code>
        </div>
      </Card>

      <Card title="Response">
        {q.isFetching ? <div className="text-sm">Loading…</div> : null}
        {err ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(err, null, 2)}</pre>
        ) : null}
        {q.data ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(q.data, null, 2)}</pre>
        ) : null}
        <div className="mt-2 text-xs text-slate-600">
          Second call with same customerId should return the same <code className="font-mono">stableValue</code>.
        </div>
      </Card>
    </div>
  );
}
