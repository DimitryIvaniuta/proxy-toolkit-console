"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { clearApiKey, getApiKey, setApiKey } from "../../lib/config";
import { clearTokens, getAccessToken, setTokens } from "../../lib/auth";

export default function SettingsPage() {
    const [value, setValue] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    setValue(getApiKey() ?? "");
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card title="API Key">
        <div className="grid gap-3 max-w-xl">
          <div className="text-sm text-slate-700">
            Stored locally in your browser. Sent as <code className="font-mono">X-Api-Key</code> header.
          </div>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste apiKeyRaw from backend" />
          <div className="flex gap-2">
            <Button onClick={() => setApiKey(value.trim())} disabled={!value.trim()}>Save</Button>
            <Button
              className="bg-slate-200 text-slate-900 hover:bg-slate-300"
              onClick={() => { clearApiKey(); setValue(""); }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
