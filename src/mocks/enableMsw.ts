export async function enableMswIfNeeded() {
  // Enable only when explicitly requested to avoid surprises.
  // In dev: set NEXT_PUBLIC_MSW=1
  if (process.env.NEXT_PUBLIC_MSW !== "1") return;

  if (typeof window === "undefined") return;
  const { worker } = await import("./browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}
