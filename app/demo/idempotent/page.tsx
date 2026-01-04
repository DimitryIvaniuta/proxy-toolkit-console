"use client";

import { useMemo, useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useDemoIdempotent } from "../../../lib/hooks";
import { newIdempotencyKey } from "../../../lib/idempotency";
import { isApiError, type ApiError } from "../../../lib/http";

export default function IdempotentPage() {
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("PLN");
  const [idemKey, setIdemKey] = useState(newIdempotencyKey());

  useEffect(() => {
    setIdemKey(newIdempotencyKey()); // payload changed => new operation => new key
  }, [amount, currency]);

  const m = useDemoIdempotent();

  const body = useMemo(() => ({ amount: Number(amount), currency }), [amount, currency]);

  const err: ApiError | undefined = isApiError(m.error) ? m.error : undefined;
  const unknownErr: Error | null = !isApiError(m.error) ? (m.error as Error | null) : null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Idempotency demo</h1>

      <Card title="Request">
        <div className="grid gap-3 max-w-xl">
          <div className="grid grid-cols-2 gap-2">
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" />
          </div>

          <div className="flex gap-2">
            <Input value={idemKey} onChange={(e) => setIdemKey(e.target.value)} placeholder="X-Idempotency-Key" />
            <Button
              type="button"
              className="bg-slate-200 text-slate-900 hover:bg-slate-300"
              onClick={() => setIdemKey(newIdempotencyKey())}
            >
              New key
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => m.mutate({ body, idempotencyKey: idemKey })}
              disabled={!idemKey.trim() || !Number.isFinite(body.amount)}
            >
              Send
            </Button>

            <Button
              className="bg-slate-200 text-slate-900 hover:bg-slate-300"
              onClick={() => m.reset()}
              type="button"
            >
              Reset
            </Button>
          </div>

          <div className="text-xs text-slate-600">
            Calls <code className="font-mono">POST /api/demo/idempotent</code> with <code className="font-mono">X-Idempotency-Key</code>.
            Re-send with the same key + same body → same <code className="font-mono">paymentId</code>.
          </div>
        </div>
      </Card>

      <Card title="Response">
        {m.isPending ? <div className="text-sm">Sending…</div> : null}
        {err ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(err, null, 2)}</pre>
        ) : null}
        {m.data ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(m.data, null, 2)}</pre>
        ) : null}
        {unknownErr ? <div className="text-sm">{unknownErr.message}</div> : null}
      </Card>
    </div>
  );
}
