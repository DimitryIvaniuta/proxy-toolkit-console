import { parsePrometheus, sumByMetric } from "../../lib/prometheus";

describe("prometheus parser", () => {
  it("parses samples and sums by metric name", () => {
    const txt = [
      "# HELP a A",
      "# TYPE a counter",
      'a{method="x"} 2',
      'a{method="y"} 3',
      'b 10',
    ].join("\n");

    const s = parsePrometheus(txt);
    expect(sumByMetric(s, "a")).toBe(5);
    expect(sumByMetric(s, "b")).toBe(10);
  });
});
