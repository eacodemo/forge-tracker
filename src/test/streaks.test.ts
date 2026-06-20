import { describe, it, expect } from "vitest";
import {
  computeStreakCrossMonth,
  computeStreaksCrossMonth,
  computeMaxStreakCrossMonth,
  computeLongestStreakMonth,
} from "../utils/streaks";

function makeKey(year: number, month: number, hi: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${day}`;
}

describe("computeStreakCrossMonth", () => {
  it("returns streak of 5 consecutive days", () => {
    const checks: Record<string, true> = {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDay = now.getDate();

    for (let i = 0; i < 5; i++) {
      checks[makeKey(year, month, 0, todayDay - i)] = true as const;
    }

    const streak = computeStreakCrossMonth(checks, 0, year, month, todayDay);
    expect(streak).toBe(5);
  });

  it("returns streak of 0 when today is not checked", () => {
    const checks: Record<string, true> = {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDay = now.getDate();

    checks[makeKey(year, month, 0, todayDay - 1)] = true as const;

    const streak = computeStreakCrossMonth(checks, 0, year, month, todayDay);
    expect(streak).toBe(0);
  });

  it("computes cross-month streak (last days of prev month + first days of current)", () => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    const todayDay = now.getDate();

    if (todayDay < 5) {
      month = month - 1;
      if (month < 0) { month = 11; year--; }
    }

    const prevDim = new Date(year, month + 1, 0).getDate();
    const checks: Record<string, true> = {};

    for (let i = 0; i < 3; i++) {
      checks[makeKey(year, month, 0, prevDim - i)] = true as const;
    }
    for (let i = 1; i <= 4; i++) {
      checks[makeKey(year, month + 1 > 11 ? 0 : month + 1, 0, i)] = true as const;
    }

    const targetMonth = month + 1 > 11 ? 0 : month + 1;
    const targetYear = month + 1 > 11 ? year + 1 : year;
    const streak = computeStreakCrossMonth(checks, 0, targetYear, targetMonth, 4);
    expect(streak).toBeGreaterThanOrEqual(4);
  });

  it("stops streak at first gap", () => {
    const checks: Record<string, true> = {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDay = now.getDate();

    checks[makeKey(year, month, 0, todayDay)] = true as const;
    checks[makeKey(year, month, 0, todayDay - 1)] = true as const;
    // gap at todayDay - 2
    checks[makeKey(year, month, 0, todayDay - 3)] = true as const;
    checks[makeKey(year, month, 0, todayDay - 4)] = true as const;

    const streak = computeStreakCrossMonth(checks, 0, year, month, todayDay);
    expect(streak).toBe(2);
  });
});

describe("computeStreaksCrossMonth", () => {
  it("returns streaks for all habits", () => {
    const checks: Record<string, true> = {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDay = now.getDate();

    for (let i = 0; i < 3; i++) {
      checks[makeKey(year, month, 0, todayDay - i)] = true as const;
    }
    checks[makeKey(year, month, 1, todayDay)] = true as const;

    const streaks = computeStreaksCrossMonth(checks, 2, year, month, todayDay);
    expect(streaks).toHaveLength(2);
    expect(streaks[0]).toBe(3);
    expect(streaks[1]).toBe(1);
  });
});

describe("computeMaxStreakCrossMonth", () => {
  it("finds max streak across all habits", () => {
    const checks: Record<string, true> = {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDay = now.getDate();

    for (let i = 0; i < 10; i++) {
      checks[makeKey(year, month, 0, todayDay - i)] = true as const;
    }
    for (let i = 0; i < 3; i++) {
      checks[makeKey(year, month, 1, todayDay - i)] = true as const;
    }

    const maxStreak = computeMaxStreakCrossMonth(checks, 2);
    expect(maxStreak).toBe(10);
  });

  it("returns 0 for empty checks", () => {
    expect(computeMaxStreakCrossMonth({}, 2)).toBe(0);
  });
});

describe("computeLongestStreakMonth", () => {
  it("finds longest streak within a month", () => {
    const checks: Record<string, true> = {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    checks[makeKey(year, month, 0, 1)] = true as const;
    checks[makeKey(year, month, 0, 2)] = true as const;
    checks[makeKey(year, month, 0, 3)] = true as const;
    checks[makeKey(year, month, 0, 5)] = true as const;

    const longest = computeLongestStreakMonth(checks, 0, year, month);
    expect(longest).toBe(3);
  });

  it("returns 0 when no checks in month", () => {
    const now = new Date();
    const longest = computeLongestStreakMonth({}, 0, now.getFullYear(), now.getMonth());
    expect(longest).toBe(0);
  });
});
