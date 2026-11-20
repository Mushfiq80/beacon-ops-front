/* Deterministic time helpers (same output on server and client, no hydration drift).
   The demo runs on a fixed scenario clock; live mode will use real timestamps. */

export const SCENARIO_NOW = "2026-11-20T08:00:00Z";
export const TZ_OFFSET_HOURS = 6; // Asia/Dhaka for the Bangladesh pilot; per-country in settings

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function at(hoursFromNow: number) {
  return new Date(new Date(SCENARIO_NOW).getTime() + hoursFromNow * 3600_000).toISOString();
}

export function fmtTime(iso: string) {
  const d = new Date(new Date(iso).getTime() + TZ_OFFSET_HOURS * 3600_000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${hh}:${mm}`;
}

export function relTime(iso: string) {
  const diffH = (new Date(SCENARIO_NOW).getTime() - new Date(iso).getTime()) / 3600_000;
  const abs = Math.abs(diffH);
  const unit = abs < 1 ? `${Math.round(abs * 60)}m` : abs < 48 ? `${Math.round(abs)}h` : `${Math.round(abs / 24)}d`;
  return diffH >= 0 ? `${unit} ago` : `in ${unit}`;
}
