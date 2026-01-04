"use client";

import { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { setTokens } from "../../../lib/auth";

export default function LoginPage() {
  const [token, setToken] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Login (placeholder)</h1>

      <Card title="JWT/OIDC-ready scaffold">
        <div className="text-sm text-slate-700">
          Your backend currently uses API keys. If you later add JWT/OIDC (Keycloak/Entra/etc.),
          implement real login here (PKCE redirect or password grant for internal tools).
        </div>

        <div className="mt-3 grid gap-2 max-w-xl">
          <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste JWT access token (temporary)" />
          <Button
            onClick={() => setTokens({ accessToken: token.trim() })}
            disabled={!token.trim()}
          >
            Save token
          </Button>
        </div>

        <div className="mt-3 text-xs text-slate-600">
          When a token is present, requests include <code className="font-mono">Authorization: Bearer ...</code>.
        </div>
      </Card>
    </div>
  );
}
