import { describe, it, expect } from "vitest";
import { computeStats, computeXP, getLevel, getEarnedBadges, XP, LEVELS } from "../utils/gamification";

function h(overrides?: Partial<{ cat: string }>) {
  return { cat: "otro", ...overrides };
}

describe("computeStats", () => {
  it("returns zeros for empty checks", () => {
    const s = computeStats({}, []);
    expect(s.totalChecks).toBe(0);
    expect(s.maxStreak).toBe(0);
    expect(s.perfectDays).toBe(0);
    expect(s.perfectWeeks).toBe(0);
    expect(s.maxCombo).toBe(0);
    expect(s.categoriesUsed).toBe(0);
  });

  it("counts total checks", () => {
    const checks = { "2026-01-0-1": true as const, "2026-01-0-2": true as const, "2026-01-1-1": true as const };
    const s = computeStats(checks, [h(), h()]);
    expect(s.totalChecks).toBe(3);
  });

  it("computes max streak correctly", () => {
    const checks = {
      "2026-01-0-1": true as const, "2026-01-0-2": true as const, "2026-01-0-3": true as const,
      "2026-01-0-5": true as const, "2026-01-0-6": true as const,
    };
    const s = computeStats(checks, [h()]);
    expect(s.maxStreak).toBe(3);
  });

  it("detects current month perfect days and combo", () => {
    const now = new Date();
    const mm  = String(now.getMonth() + 1).padStart(2, "0");
    const yr  = now.getFullYear();
    const dim = new Date(yr, now.getMonth() + 1, 0).getDate();
    const checks: Record<string, true> = {};
    for (let d = 1; d <= dim; d++) {
      checks[`${yr}-${mm}-0-${d}`] = true as const;
    }
    const s = computeStats(checks, [h()]);
    expect(s.perfectDays).toBe(dim);
    expect(s.activeDaysMonth).toBe(dim);
    expect(s.maxCombo).toBe(dim);
  });

  it("counts categories used", () => {
    const s = computeStats({}, [h({cat:"salud"}), h({cat:"mente"}), h({cat:"otro"})]);
    expect(s.categoriesUsed).toBe(3);
  });
});

describe("computeXP", () => {
  const empty = { maxStreak:0, perfectDays:0, perfectWeeks:0, maxCombo:0, activeDaysMonth:0, categoriesUsed:0 };

  it("calculates base XP from checks", () => {
    const xp = computeXP({ totalChecks: 5, ...empty });
    expect(xp).toBe(5 * XP.CHECK);
  });

  it("adds all streak bonuses cumulatively", () => {
    const xp = computeXP({ ...empty, totalChecks: 0, maxStreak: 100 });
    expect(xp).toBe(XP.STREAK_7 + XP.STREAK_14 + XP.STREAK_30 + XP.STREAK_60 + XP.STREAK_100);
  });

  it("adds perfect day, week, month bonuses", () => {
    const xp = computeXP({ totalChecks: 0, maxStreak: 0, perfectDays: 2, perfectWeeks: 1, maxCombo: 30, activeDaysMonth: 0, categoriesUsed: 0 });
    expect(xp).toBe(2 * XP.PERFECT_DAY + XP.PERFECT_WEEK + XP.PERFECT_MONTH);
  });

  it("adds variety bonus when 4+ categories", () => {
    const xp = computeXP({ totalChecks: 0, maxStreak: 0, perfectDays: 0, perfectWeeks: 0, maxCombo: 0, activeDaysMonth: 0, categoriesUsed: 4 });
    expect(xp).toBe(XP.VARIETY);
  });

  it("XP per check is exactly 10", () => {
    expect(computeXP({ totalChecks: 1, ...empty })).toBe(10);
    expect(computeXP({ totalChecks: 3, ...empty })).toBe(30);
  });

  it("XP for streak of 7 is 50", () => {
    expect(computeXP({ ...empty, totalChecks: 0, maxStreak: 7 })).toBe(XP.STREAK_7);
  });

  it("XP for perfect day is 25", () => {
    expect(computeXP({ totalChecks: 0, maxStreak: 0, perfectDays: 1, perfectWeeks: 0, maxCombo: 0, activeDaysMonth: 0, categoriesUsed: 0 })).toBe(XP.PERFECT_DAY);
  });

  it("total XP combines checks + streaks + perfects + variety", () => {
    const stats = {
      totalChecks: 10,
      maxStreak: 14,
      perfectDays: 2,
      perfectWeeks: 1,
      maxCombo: 0,
      activeDaysMonth: 0,
      categoriesUsed: 4,
    };
    const expected = (10 * XP.CHECK) + XP.STREAK_7 + XP.STREAK_14 + (2 * XP.PERFECT_DAY) + XP.PERFECT_WEEK + XP.VARIETY;
    expect(computeXP(stats)).toBe(expected);
  });
});

describe("getLevel", () => {
  it("returns level 1 for 0 XP", () => {
    expect(getLevel(0).level).toBe(1);
  });

  it("returns level 7 for very high XP", () => {
    expect(getLevel(99999).level).toBe(7);
  });

  it("returns correct level for boundary values", () => {
    expect(getLevel(199).level).toBe(1);
    expect(getLevel(200).level).toBe(2);
    expect(getLevel(499).level).toBe(2);
    expect(getLevel(500).level).toBe(3);
  });

  it("returns correct level for each range", () => {
    expect(getLevel(0).level).toBe(1);
    expect(getLevel(200).level).toBe(2);
    expect(getLevel(500).level).toBe(3);
    expect(getLevel(1000).level).toBe(4);
    expect(getLevel(2000).level).toBe(5);
    expect(getLevel(4000).level).toBe(6);
    expect(getLevel(8000).level).toBe(7);
  });

  it("returns correct xpMax for next level", () => {
    const result = getLevel(300);
    expect(result.level).toBe(2);
    expect(result.xpMax).toBe(500);
  });

  it("returns Infinity xpMax at max level", () => {
    const result = getLevel(99999);
    expect(result.level).toBe(7);
    expect(result.xpMax).toBe(Infinity);
  });
});

describe("getEarnedBadges", () => {
  const empty = { totalChecks:0, maxStreak:0, perfectDays:0, perfectWeeks:0, maxCombo:0, activeDaysMonth:0, categoriesUsed:0 };

  it("returns all 17 badges with earned status", () => {
    const badges = getEarnedBadges(empty);
    expect(badges.length).toBe(17);
    badges.forEach(b => {
      expect(b).toHaveProperty("id");
      expect(b).toHaveProperty("earned");
      expect(typeof b.earned).toBe("boolean");
    });
  });

  it("earns first_check badge with 1 check", () => {
    const badges = getEarnedBadges({ ...empty, totalChecks: 1 });
    expect(badges.find(b => b.id === "first_check")?.earned).toBe(true);
  });

  it("earns streak_14 but not streak_30 with streak 14", () => {
    const badges = getEarnedBadges({ ...empty, maxStreak: 14 });
    expect(badges.find(b => b.id === "streak_14")?.earned).toBe(true);
    expect(badges.find(b => b.id === "streak_30")?.earned).toBe(false);
  });

  it("earns dedicated badge with 2500 checks", () => {
    const badges = getEarnedBadges({ ...empty, totalChecks: 2500 });
    expect(badges.find(b => b.id === "dedicated")?.earned).toBe(true);
  });

  it("earns master badge at level 7", () => {
    const badges = getEarnedBadges({ ...empty, totalChecks: 99999 });
    expect(badges.find(b => b.id === "master")?.earned).toBe(true);
  });

  it("earns variety badge with 4 categories", () => {
    const badges = getEarnedBadges({ ...empty, categoriesUsed: 4 });
    expect(badges.find(b => b.id === "variety")?.earned).toBe(true);
  });

  it("does not earn first_check with 0 checks", () => {
    const badges = getEarnedBadges(empty);
    expect(badges.find(b => b.id === "first_check")?.earned).toBe(false);
  });

  it("does not earn streak_7 with streak of 5", () => {
    const badges = getEarnedBadges({ ...empty, maxStreak: 5 });
    expect(badges.find(b => b.id === "streak_7")?.earned).toBe(false);
  });

  it("does not earn legend badge below level 6", () => {
    const badges = getEarnedBadges({ ...empty, totalChecks: 100 });
    expect(badges.find(b => b.id === "legend")?.earned).toBe(false);
  });

  it("earns consistent badge with 15+ active days", () => {
    const badges = getEarnedBadges({ ...empty, activeDaysMonth: 15 });
    expect(badges.find(b => b.id === "consistent")?.earned).toBe(true);
  });
});

describe("XP constants", () => {
  it("has correct XP values", () => {
    expect(XP.CHECK).toBe(10);
    expect(XP.STREAK_7).toBe(50);
    expect(XP.STREAK_14).toBe(100);
    expect(XP.STREAK_30).toBe(200);
    expect(XP.STREAK_60).toBe(500);
    expect(XP.STREAK_100).toBe(1000);
    expect(XP.PERFECT_DAY).toBe(25);
    expect(XP.PERFECT_WEEK).toBe(100);
    expect(XP.PERFECT_MONTH).toBe(500);
    expect(XP.VARIETY).toBe(150);
  });

  it("has 7 levels with increasing XP requirements", () => {
    expect(LEVELS).toHaveLength(7);
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].xpMin).toBeGreaterThanOrEqual(LEVELS[i - 1].xpMax);
    }
  });
});
