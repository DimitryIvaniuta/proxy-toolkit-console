import { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded border bg-white p-4", className)}>
      {title ? <h2 className="text-sm font-semibold text-slate-900">{title}</h2> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}
