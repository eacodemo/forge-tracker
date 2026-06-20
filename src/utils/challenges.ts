import type { Challenge, ChallengeConfig, ChallengeStore, ChallengeType, ChallengeDifficulty, Habit } from "../types";
import type { TranslationSet } from "../i18n/translations";
import { computeStreakCrossMonth } from "./streaks";
import { DAYS_IN_MONTH } from "../i18n/translations";

const STORAGE_KEY = "forge_challenges";

const DEFAULT_CONFIG: ChallengeConfig = {
  dailyEnabled: true,
  weeklyEnabled: true,
  maxActive: 3,
  difficulty: "medium",
};

const XP_REWARDS: Record<ChallengeType, Record<ChallengeDifficulty, number>> = {
  racha:        { easy: 50,  medium: 100, hard: 200 },
  consistencia: { easy: 50,  medium: 100, hard: 150 },
  variedad:     { easy: 75,  medium: 150, hard: 250 },
  superacion:   { easy: 100, medium: 200, hard: 300 },
  recuperacion: { easy: 75,  medium: 150, hard: 200 },
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600000).toISOString();
}

function randomId(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function loadChallengeStore(): ChallengeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChallengeStore;
  } catch {}
  return { challenges: [], config: DEFAULT_CONFIG, completedTotal: 0, lastGenerated: "" };
}

export function saveChallengeStore(store: ChallengeStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function cleanExpiredChallenges(store: ChallengeStore): ChallengeStore {
  const now = new Date();
  const challenges = store.challenges.map(ch => {
    if (ch.status === "active" && new Date(ch.expiresAt) < now) {
      return { ...ch, status: "expired" as const };
    }
    return ch;
  });
  return { ...store, challenges };
}

function computeDayCompliance(
  checks: Record<string, true>,
  habits: Habit[],
  year: number,
  month: number,
  day: number,
): number {
  if (habits.length === 0) return 0;
  let done = 0;
  for (let hi = 0; hi < habits.length; hi++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${day}`;
    if (checks[key]) done++;
  }
  return done / habits.length;
}

function computeCategoriesUsedToday(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  day: number,
): number {
  const cats = new Set<string>();
  habits.forEach((h, hi) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${day}`;
    if (checks[key] && h.cat) cats.add(h.cat);
  });
  return cats.size;
}

function findRecoveryHabits(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
): { idx: number; name: string; daysSince: number }[] {
  const results: { idx: number; name: string; daysSince: number }[] = [];
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevDays = DAYS_IN_MONTH(prevYear, prevMonth);

  habits.forEach((h, hi) => {
    let lastCheckDay = -1;
    for (let d = prevDays; d >= 1; d--) {
      const key = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${hi}-${d}`;
      if (checks[key]) { lastCheckDay = d; break; }
    }
    if (lastCheckDay > 0) {
      let hasCheckThisMonth = false;
      const curDays = DAYS_IN_MONTH(year, month);
      for (let d = 1; d <= curDays; d++) {
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${d}`;
        if (checks[key]) { hasCheckThisMonth = true; break; }
      }
      if (!hasCheckThisMonth) {
        const daysSince = (prevDays - lastCheckDay) + month === 0 ? 0 : DAYS_IN_MONTH(year, month);
        results.push({ idx: hi, name: h.name, daysSince });
      }
    }
  });

  return results;
}

function generateRacha(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  todayDay: number,
  difficulty: ChallengeDifficulty,
  L: TranslationSet,
): Challenge | null {
  const withStreaks = habits
    .map((h, i) => ({ idx: i, name: h.name, streak: computeStreakCrossMonth(checks, i, year, month, todayDay) }))
    .filter(h => h.streak >= 2)
    .sort((a, b) => b.streak - a.streak);

  if (withStreaks.length === 0) return null;
  const best = withStreaks[0]!;
  const targets: Record<ChallengeDifficulty, number> = {
    easy: best.streak + 1,
    medium: best.streak + 3,
    hard: best.streak + 7,
  };
  const target = Math.min(targets[difficulty], 365);

  return {
    id: randomId(),
    type: "racha",
    title: L.challenges.rachaTitle.replace("{name}", best.name),
    description: L.challenges.rachaDesc.replace("{name}", best.name).replace("{days}", String(target - best.streak)),
    habitIdx: best.idx,
    target,
    current: best.streak,
    xpReward: XP_REWARDS.racha[difficulty],
    difficulty,
    createdAt: new Date().toISOString(),
    expiresAt: hoursFromNow(24),
    status: "active",
  };
}

function generateConsistencia(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  todayDay: number,
  difficulty: ChallengeDifficulty,
  L: TranslationSet,
): Challenge | null {
  if (habits.length === 0) return null;
  let avg = 0;
  const daysToCheck = Math.min(todayDay - 1, 7);
  if (daysToCheck > 0) {
    let total = 0;
    for (let d = Math.max(1, todayDay - daysToCheck); d < todayDay; d++) {
      for (let hi = 0; hi < habits.length; hi++) {
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${d}`;
        if (checks[key]) total++;
      }
    }
    avg = total / daysToCheck;
  }

  const targets: Record<ChallengeDifficulty, number> = {
    easy: Math.max(1, Math.floor(avg)),
    medium: Math.max(2, Math.ceil(avg + 1)),
    hard: Math.max(3, Math.ceil(avg + 2)),
  };
  const target = Math.min(targets[difficulty], habits.length);

  return {
    id: randomId(),
    type: "consistencia",
    title: L.challenges.consistenciaTitle,
    description: L.challenges.consistenciaDesc.replace("{n}", String(target)),
    target,
    current: 0,
    xpReward: XP_REWARDS.consistencia[difficulty],
    difficulty,
    createdAt: new Date().toISOString(),
    expiresAt: hoursFromNow(24),
    status: "active",
  };
}

function generateVariedad(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  todayDay: number,
  difficulty: ChallengeDifficulty,
  L: TranslationSet,
): Challenge | null {
  const catsUsed = new Set<string>();
  habits.forEach(h => { if (h.cat) catsUsed.add(h.cat); });
  const totalCats = catsUsed.size;
  if (totalCats < 2) return null;

  const thisWeekCats = computeCategoriesUsedToday(habits, checks, year, month, todayDay);
  const targets: Record<ChallengeDifficulty, number> = {
    easy: Math.min(totalCats, 2),
    medium: Math.min(totalCats, Math.ceil(totalCats * 0.6)),
    hard: totalCats,
  };
  const target = targets[difficulty];

  return {
    id: randomId(),
    type: "variedad",
    title: L.challenges.variedadTitle,
    description: L.challenges.variedadDesc.replace("{n}", String(target)),
    target,
    current: thisWeekCats,
    xpReward: XP_REWARDS.variedad[difficulty],
    difficulty,
    createdAt: new Date().toISOString(),
    expiresAt: hoursFromNow(24),
    status: "active",
  };
}

function generateSuperacion(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  todayDay: number,
  difficulty: ChallengeDifficulty,
  L: TranslationSet,
): Challenge | null {
  let bestDay = 0;
  let bestPct = 0;
  for (let d = 1; d < todayDay; d++) {
    const pct = computeDayCompliance(checks, habits, year, month, d);
    if (pct > bestPct) { bestPct = pct; bestDay = d; }
  }

  if (bestPct >= 1) return null;

  const targets: Record<ChallengeDifficulty, number> = {
    easy: Math.min(100, Math.round(bestPct * 100) + 10),
    medium: Math.min(100, Math.round(bestPct * 100) + 20),
    hard: 100,
  };
  const target = targets[difficulty];

  return {
    id: randomId(),
    type: "superacion",
    title: L.challenges.superacionTitle,
    description: L.challenges.superacionDesc.replace("{pct}", String(Math.round(bestPct * 100))),
    target,
    current: 0,
    xpReward: XP_REWARDS.superacion[difficulty],
    difficulty,
    createdAt: new Date().toISOString(),
    expiresAt: hoursFromNow(24),
    status: "active",
  };
}

function generateRecuperacion(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  difficulty: ChallengeDifficulty,
  L: TranslationSet,
): Challenge | null {
  const candidates = findRecoveryHabits(habits, checks, year, month);
  if (candidates.length === 0) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)]!;

  return {
    id: randomId(),
    type: "recuperacion",
    title: L.challenges.recuperacionTitle.replace("{name}", pick.name),
    description: L.challenges.recuperacionDesc.replace("{name}", pick.name).replace("{days}", String(pick.daysSince)),
    habitIdx: pick.idx,
    target: 1,
    current: 0,
    xpReward: XP_REWARDS.recuperacion[difficulty],
    difficulty,
    createdAt: new Date().toISOString(),
    expiresAt: hoursFromNow(24),
    status: "active",
  };
}

export function generateDailyChallenges(
  habits: Habit[],
  checks: Record<string, true>,
  year: number,
  month: number,
  todayDay: number,
  config: ChallengeConfig,
  L: TranslationSet,
): Challenge[] {
  const store = loadChallengeStore();
  const activeCount = store.challenges.filter(c => c.status === "active").length;
  const slotsAvailable = config.maxActive - activeCount;
  if (slotsAvailable <= 0) return [];

  const generators: (() => Challenge | null)[] = [
    () => generateRacha(habits, checks, year, month, todayDay, config.difficulty, L),
    () => generateConsistencia(habits, checks, year, month, todayDay, config.difficulty, L),
    () => generateVariedad(habits, checks, year, month, todayDay, config.difficulty, L),
    () => generateSuperacion(habits, checks, year, month, todayDay, config.difficulty, L),
    () => generateRecuperacion(habits, checks, year, month, config.difficulty, L),
  ];

  const shuffled = shuffle(generators);
  const newChallenges: Challenge[] = [];

  for (const gen of shuffled) {
    if (newChallenges.length >= slotsAvailable) break;
    const ch = gen();
    if (ch) {
      const isDuplicate = store.challenges.some(
        existing => existing.type === ch.type && existing.habitIdx === ch.habitIdx && existing.status === "active"
      );
      if (!isDuplicate) newChallenges.push(ch);
    }
  }

  return newChallenges;
}

export function updateChallengeProgress(
  challenges: Challenge[],
  checks: Record<string, true>,
  habits: Habit[],
  year: number,
  month: number,
  todayDay: number,
): { updated: Challenge[]; completed: Challenge[] } {
  const completed: Challenge[] = [];
  const updated = challenges.map(ch => {
    if (ch.status !== "active") return ch;
    if (new Date(ch.expiresAt) < new Date()) return { ...ch, status: "expired" as const };

    let current = ch.current;

    switch (ch.type) {
      case "racha": {
        if (ch.habitIdx !== undefined) {
          current = computeStreakCrossMonth(checks, ch.habitIdx, year, month, todayDay);
        }
        break;
      }
      case "consistencia": {
        let done = 0;
        for (let hi = 0; hi < habits.length; hi++) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${todayDay}`;
          if (checks[key]) done++;
        }
        current = done;
        break;
      }
      case "variedad": {
        current = computeCategoriesUsedToday(habits, checks, year, month, todayDay);
        break;
      }
      case "superacion": {
        let todayPct = 0;
        if (habits.length > 0) {
          let done = 0;
          for (let hi = 0; hi < habits.length; hi++) {
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${hi}-${todayDay}`;
            if (checks[key]) done++;
          }
          todayPct = Math.round((done / habits.length) * 100);
        }
        const bestPct = parseInt(ch.description.match(/\((\d+)%\)/)?.[1] || "0");
        current = todayPct > bestPct ? todayPct : 0;
        break;
      }
      case "recuperacion": {
        if (ch.habitIdx !== undefined) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${ch.habitIdx}-${todayDay}`;
          current = checks[key] ? 1 : 0;
        }
        break;
      }
    }

    const newCh = { ...ch, current };
    if (current >= ch.target && ch.status === "active") {
      newCh.status = "completed";
      newCh.completedAt = new Date().toISOString();
      completed.push(newCh);
    }
    return newCh;
  });

  return { updated, completed };
}

export function getActiveChallenges(store: ChallengeStore): Challenge[] {
  return store.challenges.filter(c => c.status === "active");
}

export function getCompletedToday(store: ChallengeStore): Challenge[] {
  const today = todayStr();
  return store.challenges.filter(c => c.status === "completed" && c.completedAt?.startsWith(today));
}

export function getChallengeXP(store: ChallengeStore): number {
  return store.challenges
    .filter(c => c.status === "completed")
    .reduce((sum, c) => sum + c.xpReward, 0);
}

export { XP_REWARDS, DEFAULT_CONFIG };
