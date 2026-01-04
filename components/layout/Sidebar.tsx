"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Gauge, KeyRound, ShieldCheck, Repeat, DatabaseZap, Activity } from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/demo/cache", label: "Cache", icon: DatabaseZap },
  { href: "/demo/idempotent", label: "Idempotency", icon: ShieldCheck },
  { href: "/demo/ratelimited", label: "Rate Limit", icon: Activity },
  { href: "/demo/retry", label: "Retry", icon: Repeat },
    { href: "/metrics", label: "Metrics", icon: Gauge },
  { href: "/admin/clients", label: "API Clients", icon: KeyRound },
  { href: "/auth/login", label: "Auth", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white p-3">
      <nav className="space-y-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "flex items-center gap-3 rounded px-3 py-2 text-sm",
                active ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded border bg-slate-50 p-3 text-xs text-slate-700">
        <div className="font-medium text-slate-900">Tip</div>
        <div className="mt-1">
          Set <code className="font-mono">X-Api-Key</code> once in <Link className="underline" href="/settings">Settings</Link>.
        </div>
      </div>
    </aside>
  );
}
