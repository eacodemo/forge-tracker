import type { GamStats, Level, Badge } from "../types";
import { computeMaxStreakCrossMonth } from "./streaks";
import { getChallengeXP, loadChallengeStore } from "./challenges";
import type { TranslationSet } from "../i18n/translations";

export const XP = {
  CHECK:10, STREAK_7:50, STREAK_14:100, STREAK_30:200, STREAK_60:500, STREAK_100:1000,
  PERFECT_DAY:25, PERFECT_WEEK:100, PERFECT_MONTH:500,
  VARIETY:150,
};

export function buildLevels(L: TranslationSet): Level[] {
  const names = L.gamify?.levelNames || ["Iniciado","Constante","Disciplinado","Imparable","Élite","Leyenda","Maestro"];
  return [
    { level:1, name:names[0]||"Iniciado",     xpMin:0,    xpMax:200  },
    { level:2, name:names[1]||"Constante",     xpMin:200,  xpMax:500  },
    { level:3, name:names[2]||"Disciplinado",  xpMin:500,  xpMax:1000 },
    { level:4, name:names[3]||"Imparable",     xpMin:1000, xpMax:2000 },
    { level:5, name:names[4]||"Élite",         xpMin:2000, xpMax:4000 },
    { level:6, name:names[5]||"Leyenda",       xpMin:4000, xpMax:8000 },
    { level:7, name:names[6]||"Maestro",       xpMin:8000, xpMax:Infinity },
  ];
}

export const LEVELS: Level[] = [
  { level:1, name:"Iniciado",     xpMin:0,    xpMax:200  },
  { level:2, name:"Constante",    xpMin:200,  xpMax:500  },
  { level:3, name:"Disciplinado", xpMin:500,  xpMax:1000 },
  { level:4, name:"Imparable",    xpMin:1000, xpMax:2000 },
  { level:5, name:"Élite",        xpMin:2000, xpMax:4000 },
  { level:6, name:"Leyenda",      xpMin:4000, xpMax:8000 },
  { level:7, name:"Maestro",      xpMin:8000, xpMax:Infinity },
];

const BADGE_ICONS: Record<string, string> = {
  first_check:"✅", streak_3:"🔥", streak_7:"⚡", streak_14:"💫", streak_30:"💎", streak_60:"🔷", streak_100:"💠",
  perfect_day:"🌟", perfect_week:"🏆", perfect_month:"🌕", variety:"🎨", century:"💯", consistent:"📅",
  grind:"⚔️", dedicated:"⚜️", legend:"👑", master:"🗿",
};

const BADGE_CHECKS: Record<string, (s:GamStats&{level:number})=>boolean> = {
  first_check:  s=>s.totalChecks>=1,
  streak_3:     s=>s.maxStreak>=3,
  streak_7:     s=>s.maxStreak>=7,
  streak_14:    s=>s.maxStreak>=14,
  streak_30:    s=>s.maxStreak>=30,
  streak_60:    s=>s.maxStreak>=60,
  streak_100:   s=>s.maxStreak>=100,
  perfect_day:  s=>s.perfectDays>=1,
  perfect_week: s=>s.perfectWeeks>=1,
  perfect_month:s=>s.maxCombo>=28,
  variety:      s=>s.categoriesUsed>=4,
  century:      s=>s.totalChecks>=100,
  consistent:   s=>s.activeDaysMonth>=15,
  grind:        s=>s.totalChecks>=500,
  dedicated:    s=>s.totalChecks>=2500,
  legend:       s=>s.level>=6,
  master:       s=>s.level>=7,
};

export function buildBadgeDefs(L: TranslationSet) {
  const defs = L.gamify?.badgeDefs || {};
  return Object.keys(BADGE_CHECKS).map(id => {
    const d = (defs as any)[id] || {};
    return { id, icon: BADGE_ICONS[id]||"🏆", name: d.name||id, desc: d.desc||"", check: BADGE_CHECKS[id] };
  });
}

const KEY_RE = /^(\d{4})-(\d{2})-(\d+)-(\d+)$/;

export function computeStats(checks: Record<string, true>, habits: { length: number; [index: number]: { cat?: string } }, archivedCheckCount: number = 0): GamStats {
  const totalChecks = Object.keys(checks).length + archivedCheckCount;

  const cats = new Set<string>();
  for (let i=0; i<habits.length; i++) if (habits[i]?.cat) cats.add(habits[i]!.cat!);
  const categoriesUsed = cats.size;

  const maxStreak = computeMaxStreakCrossMonth(checks, habits.length);

  const now = new Date();
  const yr  = now.getFullYear();
  const mm  = String(now.getMonth()+1).padStart(2,"0");
  const dim = new Date(yr, now.getMonth()+1, 0).getDate();

  let perfectDays=0, activeDays=0, weekPerfect=0, perfectWeeks=0, maxCombo=0, curCombo=0;
  for (let d=1; d<=dim; d++) {
    const cnt = Array.from({length: habits.length}, (_, hi) => checks[`${yr}-${mm}-${hi}-${d}`] ? 1 : 0).filter(Boolean).length;
    if (cnt>0) activeDays++;
    if (cnt===habits.length && habits.length>0) {
      perfectDays++;
      curCombo++;
      maxCombo = Math.max(maxCombo, curCombo);
      if(++weekPerfect>=7) perfectWeeks++;
    } else {
      curCombo=0;
      weekPerfect=0;
    }
  }

  return { totalChecks, maxStreak, perfectDays, perfectWeeks, maxCombo, activeDaysMonth:activeDays, categoriesUsed };
}

export function computeXP(stats: GamStats): number {
  const baseXP = stats.totalChecks*XP.CHECK +
    (stats.maxStreak>=7?XP.STREAK_7:0) +
    (stats.maxStreak>=14?XP.STREAK_14:0) +
    (stats.maxStreak>=30?XP.STREAK_30:0) +
    (stats.maxStreak>=60?XP.STREAK_60:0) +
    (stats.maxStreak>=100?XP.STREAK_100:0) +
    stats.perfectDays*XP.PERFECT_DAY +
    stats.perfectWeeks*XP.PERFECT_WEEK +
    (stats.maxCombo>=28?XP.PERFECT_MONTH:0) +
    (stats.categoriesUsed>=4?XP.VARIETY:0);
  const store = loadChallengeStore();
  const challengeXP = getChallengeXP(store);
  return baseXP + challengeXP;
}

export function getLevel(xp: number): Level {
  return LEVELS.find(l=>xp>=l.xpMin&&xp<l.xpMax)||LEVELS[LEVELS.length-1];
}

export function getLevelTranslated(xp: number, L: TranslationSet): Level {
  const levels = buildLevels(L);
  return levels.find(l=>xp>=l.xpMin&&xp<l.xpMax)||levels[levels.length-1];
}

const DEFAULT_BADGE_DEFS = buildBadgeDefs({ gamify: { badgeDefs: {} } } as any);

export function getEarnedBadges(stats: GamStats): Badge[] {
  const level = getLevel(computeXP(stats)).level;
  return DEFAULT_BADGE_DEFS.map(b=>({ ...b, earned: b.check({...stats, level}) }));
}

export function getEarnedBadgesTranslated(stats: GamStats, L: TranslationSet): Badge[] {
  const level = getLevelTranslated(computeXP(stats), L).level;
  const defs = buildBadgeDefs(L);
  return defs.map(b=>({ ...b, earned: b.check({...stats, level}) }));
}

export { DEFAULT_BADGE_DEFS as BADGES };
