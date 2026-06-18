export function pctColor(p: number): string {
  if (p >= 0.8) return "var(--success)";
  if (p >= 0.5) return "var(--warn)";
  if (p > 0) return "var(--danger)";
  return "var(--fg4)";
}
