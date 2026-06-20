import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDailyChallenges,
  updateChallengeProgress,
  loadChallengeStore,
  saveChallengeStore,
  cleanExpiredChallenges,
  getActiveChallenges,
  getCompletedToday,
  getChallengeXP,
  DEFAULT_CONFIG,
} from "../utils/challenges";
import { LANGS } from "../i18n/translations";
import type { Challenge, ChallengeStore, Habit } from "../types";

const L = LANGS.es;

beforeEach(() => {
  localStorage.clear();
});

function makeHabit(overrides?: Partial<Habit>): Habit {
  return {
    name: "Test Habit",
    cat: "salud",
    type: "boolean",
    ...overrides,
  };
}

function makeStore(overrides?: Partial<ChallengeStore>): ChallengeStore {
  return {
    challenges: [],
    config: DEFAULT_CONFIG,
    completedTotal: 0,
    lastGenerated: "",
    ...overrides,
  };
}

function makeChallenge(overrides?: Partial<Challenge>): Challenge {
  return {
    id: "ch_test_001",
    type: "consistencia",
    title: "Test Challenge",
    description: "Test description",
    target: 3,
    current: 0,
    xpReward: 100,
    difficulty: "medium",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    status: "active",
    ...overrides,
  };
}

describe("generateDailyChallenges", () => {
  it("generates challenges when slots are available", () => {
    const habits = [makeHabit(), makeHabit({ cat: "mente" })];
    const checks: Record<string, true> = {};
    const now = new Date();
    const challenges = generateDailyChallenges(
      habits, checks,
      now.getFullYear(), now.getMonth(), now.getDate(),
      DEFAULT_CONFIG, L
    );
    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges.length).toBeLessThanOrEqual(DEFAULT_CONFIG.maxActive);
  });

  it("does not generate when no slots available", () => {
    const existing = Array.from({ length: 3 }, () => makeChallenge());
    saveChallengeStore(makeStore({ challenges: existing }));

    const habits = [makeHabit()];
    const checks: Record<string, true> = {};
    const now = new Date();
    const challenges = generateDailyChallenges(
      habits, checks,
      now.getFullYear(), now.getMonth(), now.getDate(),
      DEFAULT_CONFIG, L
    );
    expect(challenges.length).toBe(0);
  });

  it("does not generate duplicates of active challenges", () => {
    const habits = [makeHabit()];
    const checks: Record<string, true> = {};
    const now = new Date();

    const first = generateDailyChallenges(
      habits, checks,
      now.getFullYear(), now.getMonth(), now.getDate(),
      DEFAULT_CONFIG, L
    );
    first.forEach(ch => {
      const store = loadChallengeStore();
      store.challenges.push(ch);
      saveChallengeStore(store);
    });

    const second = generateDailyChallenges(
      habits, checks,
      now.getFullYear(), now.getMonth(), now.getDate(),
      DEFAULT_CONFIG, L
    );
    const newTypes = second.map(c => c.type);
    const existingTypes = first.map(c => c.type);
    newTypes.forEach(t => {
      expect(existingTypes).not.toContain(t);
    });
  });
});

describe("updateChallengeProgress", () => {
  it("updates consistencia progress based on today's checks", () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const habits = [makeHabit(), makeHabit({ cat: "mente" })];
    const checks: Record<string, true> = {};
    checks[`${year}-${String(month + 1).padStart(2, "0")}-0-${day}`] = true as const;

    const ch = makeChallenge({ type: "consistencia", target: 2, current: 0 });
    const { updated } = updateChallengeProgress([ch], checks, habits, year, month, day);
    expect(updated[0].current).toBe(1);
  });

  it("marks challenge as completed when current >= target", () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const habits = [makeHabit(), makeHabit({ cat: "mente" })];
    const checks: Record<string, true> = {};
    checks[`${year}-${String(month + 1).padStart(2, "0")}-0-${day}`] = true as const;
    checks[`${year}-${String(month + 1).padStart(2, "0")}-1-${day}`] = true as const;

    const ch = makeChallenge({ type: "consistencia", target: 2, current: 0 });
    const { updated, completed } = updateChallengeProgress([ch], checks, habits, year, month, day);
    expect(updated[0].status).toBe("completed");
    expect(completed.length).toBe(1);
  });

  it("expires challenges past their expiration date", () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const ch = makeChallenge({
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
      status: "active",
    });
    const { updated } = updateChallengeProgress([ch], {}, [], year, month, day);
    expect(updated[0].status).toBe("expired");
  });
});

describe("cleanExpiredChallenges", () => {
  it("marks expired active challenges", () => {
    const expired = makeChallenge({
      status: "active",
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
    });
    const active = makeChallenge({ status: "active" });
    const store = makeStore({ challenges: [expired, active] });
    const cleaned = cleanExpiredChallenges(store);
    expect(cleaned.challenges[0].status).toBe("expired");
    expect(cleaned.challenges[1].status).toBe("active");
  });
});

describe("getChallengeXP", () => {
  it("sums XP from completed challenges only", () => {
    const completed1 = makeChallenge({ status: "completed", xpReward: 100 });
    const completed2 = makeChallenge({ status: "completed", xpReward: 200 });
    const active = makeChallenge({ status: "active", xpReward: 150 });
    const store = makeStore({ challenges: [completed1, completed2, active] });
    expect(getChallengeXP(store)).toBe(300);
  });

  it("returns 0 when no completed challenges", () => {
    const store = makeStore({ challenges: [makeChallenge({ status: "active" })] });
    expect(getChallengeXP(store)).toBe(0);
  });
});

describe("getActiveChallenges", () => {
  it("returns only active challenges", () => {
    const active = makeChallenge({ status: "active" });
    const completed = makeChallenge({ status: "completed" });
    const expired = makeChallenge({ status: "expired" });
    const store = makeStore({ challenges: [active, completed, expired] });
    expect(getActiveChallenges(store)).toHaveLength(1);
    expect(getActiveChallenges(store)[0].status).toBe("active");
  });
});
