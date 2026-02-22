export type RiskLevel = "OK" | "WARN" | "DANGER";

export type RiskResult = {
  level: RiskLevel;
  reason: string;
  threshold: number;
  absDiff: number;
};

export function evaluateLineRisk(line: { diff: string | number | null | undefined }, threshold: number): RiskResult {
  const raw = line.diff;
  const diff = raw === null || raw === undefined ? 0 : typeof raw === "number" ? raw : Number(raw);
  const absDiff = Number.isFinite(diff) ? Math.abs(diff) : 0;
  if (absDiff === 0) {
    return { level: "OK", reason: "Diff is zero", threshold, absDiff };
  }
  if (absDiff <= threshold) {
    return { level: "WARN", reason: `Diff within threshold (${threshold})`, threshold, absDiff };
  }
  return { level: "DANGER", reason: `Diff above threshold (${threshold})`, threshold, absDiff };
}

export function summarizeRisks(
  lines: Array<{ providerId: string; providerName?: string; diff: string | number | null | undefined }>,
  threshold: number
) {
  const summary = {
    threshold,
    warnCount: 0,
    dangerCount: 0,
    dangerLines: [] as Array<{ providerId: string; providerName?: string; diff: number }>
  };

  for (const line of lines) {
    const result = evaluateLineRisk({ diff: line.diff }, threshold);
    if (result.level === "WARN") summary.warnCount += 1;
    if (result.level === "DANGER") {
      summary.dangerCount += 1;
      summary.dangerLines.push({
        providerId: line.providerId,
        providerName: line.providerName,
        diff: line.diff === null || line.diff === undefined ? 0 : Number(line.diff)
      });
    }
  }

  return summary;
}
