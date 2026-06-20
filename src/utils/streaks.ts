import { DAYS_IN_MONTH } from "../i18n/translations";

const KEY_RE = /^(\d{4})-(\d{2})-(\d+)-(\d+)$/;

function makeKey(year: number, month: number, hi: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${day}`;
}

function prevDay(year: number, month: number, day: number): { year: number; month: number; day: number } {
  if (day > 1) return { year, month, day: day - 1 };
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevDays = DAYS_IN_MONTH(prevYear, prevMonth);
  return { year: prevYear, month: prevMonth, day: prevDays };
}

export function computeStreakCrossMonth(
  checks: Record<string, true>,
  habitIdx: number,
  year: number,
  month: number,
  todayDay: number,
): number {
  let streak = 0;
  let { year: cy, month: cm, day: cd } = { year, month, day: todayDay };

  for (let i = 0; i < 400; i++) {
    const key = makeKey(cy, cm, habitIdx, cd);
    if (checks[key]) {
      streak++;
      const prev = prevDay(cy, cm, cd);
      cy = prev.year;
      cm = prev.month;
      cd = prev.day;
    } else {
      break;
    }
  }
  return streak;
}

export function computeStreaksCrossMonth(
  checks: Record<string, true>,
  habitsLength: number,
  year: number,
  month: number,
  todayDay: number,
): number[] {
  const streaks: number[] = [];
  for (let hi = 0; hi < habitsLength; hi++) {
    streaks.push(computeStreakCrossMonth(checks, hi, year, month, todayDay));
  }
  return streaks;
}

export function computeMaxStreakCrossMonth(
  checks: Record<string, true>,
  habitsLength: number,
): number {
  let maxStreak = 0;
  const byHabit: Record<number, Set<string>> = {};

  Object.keys(checks).forEach(k => {
    const m = k.match(KEY_RE);
    if (!m) return;
    const hi = parseInt(m[3]);
    if (!byHabit[hi]) byHabit[hi] = new Set();
    byHabit[hi].add(`${m[1]}-${m[2]}-${m[4]}`);
  });

  Object.values(byHabit).forEach(daySet => {
    const sorted = Array.from(daySet).sort();
    let cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1]);
      const currDate = new Date(sorted[i]);
      const diff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        cur++;
      } else {
        maxStreak = Math.max(maxStreak, cur);
        cur = 1;
      }
    }
    maxStreak = Math.max(maxStreak, cur);
  });

  return maxStreak;
}

export function computeLongestStreakMonth(
  checks: Record<string, true>,
  habitIdx: number,
  year: number,
  month: number,
): number {
  const daysInMonth = DAYS_IN_MONTH(year, month);
  let longest = 0;
  let cur = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (checks[makeKey(year, month, habitIdx, d)]) {
      cur++;
      longest = Math.max(longest, cur);
    } else {
      cur = 0;
    }
  }
  return longest;
}
