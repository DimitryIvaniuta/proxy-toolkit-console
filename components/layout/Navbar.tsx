"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-14 border-b bg-white flex items-center px-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded bg-slate-900" />
        <Link href="/" className="font-semibold">
          Proxy Toolkit Console
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </header>
  );
}
