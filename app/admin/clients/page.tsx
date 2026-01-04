"use client";

import { useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useClients, useCreateClient, useCreateCredential } from "../../../lib/hooks";
import type { ApiError } from "../../../lib/http";

export default function ClientsPage() {
  const q = useClients();
  const createClient = useCreateClient();
  const createCred = useCreateCredential();

  const [clientName, setClientName] = useState("Console Client");
  const [clientCode, setClientCode] = useState("console-client");
  const [credentialName, setCredentialName] = useState("default");

  const err = (q.error || createClient.error || createCred.error) as ApiError | undefined;

  const clients = useMemo(() => q.data ?? [], [q.data]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">API Clients</h1>

      <Card title="Create client">
        <div className="grid gap-2 max-w-xl">
          <div className="grid grid-cols-2 gap-2">
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
            <Input value={clientCode} onChange={(e) => setClientCode(e.target.value)} placeholder="Client code" />
          </div>
          <Button
            onClick={() => createClient.mutate({ clientName: clientName.trim(), clientCode: clientCode.trim() })}
            disabled={createClient.isPending || !clientName.trim() || !clientCode.trim()}
          >
            Create
          </Button>
        </div>
      </Card>

      <Card title="Clients">
        {q.isLoading ? <div className="text-sm">Loading…</div> : null}
        {err ? (
          <pre className="text-xs bg-slate-900 text-white p-3 rounded overflow-auto">{JSON.stringify(err, null, 2)}</pre>
        ) : null}

        <div className="mt-2 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-600">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2 font-mono">{c.id}</td>
                  <td className="p-2">{c.clientName ?? c.client_name ?? ""}</td>
                  <td className="p-2 font-mono">{c.clientCode ?? c.client_code ?? ""}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Input
                        value={credentialName}
                        onChange={(e) => setCredentialName(e.target.value)}
                        className="max-w-[160px]"
                        placeholder="credential name"
                      />
                      <Button
                        onClick={async () => {
                          const res = await createCred.mutateAsync({ clientId: c.id, credentialName: credentialName.trim() });
                          alert(`API key (copy now):\n\n${res.apiKeyRaw}\n\npolicyClientKey: ${res.policyClientKey ?? "(n/a)"}`);
                        }}
                        disabled={createCred.isPending || !credentialName.trim()}
                      >
                        Create key
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-600">
          “Create key” returns <code className="font-mono">apiKeyRaw</code> once. Copy it and set it in <b>Settings</b>.
        </div>
      </Card>
    </div>
  );
}
