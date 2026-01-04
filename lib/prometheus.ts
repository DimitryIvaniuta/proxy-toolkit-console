export type PromSample = {
  name: string;
  labels: Record<string, string>;
  value: number;
};

const LINE_RE = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{([^}]*)\})?\s+([-+eE0-9\.]+)\s*(\d+)?$/;

function parseLabels(raw?: string): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  // label="value",foo="bar"
  // minimal parser - good enough for actuator metrics
  const parts = raw.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx <= 0) continue;
    const k = p.slice(0, idx).trim();
    let v = p.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[k] = v.replace(/\\n/g, "\n").replace(/\\\"/g, '"');
  }
  return out;
}

export function parsePrometheus(text: string): PromSample[] {
  const out: PromSample[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(LINE_RE);
    if (!m) continue;
    const name = m[1];
    const labels = parseLabels(m[3]);
    const value = Number(m[4]);
    if (!Number.isFinite(value)) continue;
    out.push({ name, labels, value });
  }
  return out;
}

export function sumByMetric(samples: PromSample[], metricName: string): number {
  return samples.filter(s => s.name === metricName).reduce((a, s) => a + s.value, 0);
}
