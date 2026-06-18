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
});
