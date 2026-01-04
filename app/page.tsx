import { Card } from "../components/ui/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="What is this?">
          <p className="text-sm text-slate-700">
            This console calls your Spring Proxy Toolkit backend and demonstrates:
            Audit, Cache, Idempotency, Rate limiting, Retries and Metrics.
          </p>
        </Card>

        <Card title="Quick start">
          <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
            <li>Open <b>Settings</b> and set <code className="font-mono">X-Api-Key</code>.</li>
            <li>Try <b>Cache</b> page (same value on second call).</li>
            <li>Try <b>Idempotency</b> (same paymentId with same key).</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
