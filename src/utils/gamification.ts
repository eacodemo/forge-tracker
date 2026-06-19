import type { GamStats, Level, Badge } from "../types";

export const XP = {
  CHECK:10, STREAK_7:50, STREAK_14:100, STREAK_30:200, STREAK_60:500, STREAK_100:1000,
  PERFECT_DAY:25, PERFECT_WEEK:100, PERFECT_MONTH:500,
  VARIETY:150,
};

export const LEVELS: Level[] = [
  { level:1, name:"Iniciado",     xpMin:0,    xpMax:200  },
  { level:2, name:"Constante",    xpMin:200,  xpMax:500  },
  { level:3, name:"Disciplinado", xpMin:500,  xpMax:1000 },
  { level:4, name:"Imparable",    xpMin:1000, xpMax:2000 },
  { level:5, name:"Élite",        xpMin:2000, xpMax:4000 },
  { level:6, name:"Leyenda",      xpMin:4000, xpMax:8000 },
  { level:7, name:"Maestro",      xpMin:8000, xpMax:Infinity },
];

const BADGE_DEFS = [
  { id:"first_check",  icon:"✅", name:"Primer paso",       desc:"Completa tu primer hábito",             check:(s:GamStats&{level:number})=>s.totalChecks>=1 },
  { id:"streak_3",     icon:"🔥", name:"Racha de 3",        desc:"3 días seguidos en un hábito",          check:(s:GamStats&{level:number})=>s.maxStreak>=3 },
  { id:"streak_7",     icon:"⚡", name:"Racha de 7",        desc:"7 días seguidos en un hábito",          check:(s:GamStats&{level:number})=>s.maxStreak>=7 },
  { id:"streak_14",    icon:"💫", name:"Racha de 14",       desc:"14 días seguidos en un hábito",         check:(s:GamStats&{level:number})=>s.maxStreak>=14 },
  { id:"streak_30",    icon:"💎", name:"Racha de 30",       desc:"30 días seguidos en un hábito",         check:(s:GamStats&{level:number})=>s.maxStreak>=30 },
  { id:"streak_60",    icon:"🔷", name:"Racha de 60",       desc:"60 días seguidos en un hábito",         check:(s:GamStats&{level:number})=>s.maxStreak>=60 },
  { id:"streak_100",   icon:"💠", name:"Racha de 100",      desc:"100 días seguidos en un hábito",        check:(s:GamStats&{level:number})=>s.maxStreak>=100 },
  { id:"perfect_day",  icon:"🌟", name:"Día perfecto",      desc:"Completa todos los hábitos en un día",  check:(s:GamStats&{level:number})=>s.perfectDays>=1 },
  { id:"perfect_week", icon:"🏆", name:"Semana perfecta",   desc:"7 días perfectos consecutivos",         check:(s:GamStats&{level:number})=>s.perfectWeeks>=1 },
  { id:"perfect_month",icon:"🌕", name:"Mes perfecto",      desc:"Completa todos los días del mes",       check:(s:GamStats&{level:number})=>s.maxCombo>=28 },
  { id:"variety",      icon:"🎨", name:"Variedad",          desc:"Hábitos en 4+ categorías distintas",    check:(s:GamStats&{level:number})=>s.categoriesUsed>=4 },
  { id:"century",      icon:"💯", name:"100 checks",        desc:"Completa 100 hábitos en total",         check:(s:GamStats&{level:number})=>s.totalChecks>=100 },
  { id:"consistent",   icon:"📅", name:"Consistente",       desc:"Activo 15+ días en un mes",             check:(s:GamStats&{level:number})=>s.activeDaysMonth>=15 },
  { id:"grind",        icon:"⚔️", name:"El Grind",          desc:"Completa 500 hábitos en total",         check:(s:GamStats&{level:number})=>s.totalChecks>=500 },
  { id:"dedicated",    icon:"⚜️", name:"Dedicación",        desc:"Completa 2500 hábitos en total",        check:(s:GamStats&{level:number})=>s.totalChecks>=2500 },
  { id:"legend",       icon:"👑", name:"Leyenda",           desc:"Llega al nivel 6",                     check:(s:GamStats&{level:number})=>s.level>=6 },
  { id:"master",       icon:"🗿", name:"Maestro",           desc:"Llega al nivel 7",                     check:(s:GamStats&{level:number})=>s.level>=7 },
];

const KEY_RE = /^(\d{4})-(\d{2})-(\d+)-(\d+)$/;

export function computeStats(checks: Record<string, true>, habits: { length: number; [index: number]: { cat?: string } }, archivedCheckCount: number = 0): GamStats {
  const totalChecks = Object.keys(checks).length + archivedCheckCount;

  const cats = new Set<string>();
  for (let i=0; i<habits.length; i++) if (habits[i]?.cat) cats.add(habits[i]!.cat!);
  const categoriesUsed = cats.size;

  const byHabit: Record<string, Record<string, number[]>> = {};
  Object.keys(checks).forEach(k => {
    const m = k.match(KEY_RE);
    if (!m) return;
    const [, yr, mm, hi, day] = m;
    const mk = `${yr}-${mm}`;
    if (!byHabit[hi]) byHabit[hi] = {};
    if (!byHabit[hi][mk]) byHabit[hi][mk] = [];
    byHabit[hi][mk].push(parseInt(day));
  });

  let maxStreak = 0;
  Object.values(byHabit).forEach(monthMap => {
    Object.values(monthMap).forEach(days => {
      const sorted = [...new Set(days)].sort((a,b)=>a-b);
      let cur = 1;
      for (let i=1; i<sorted.length; i++) {
        cur = sorted[i]===sorted[i-1]+1 ? cur+1 : 1;
        maxStreak = Math.max(maxStreak, cur);
      }
      if (sorted.length>0) maxStreak = Math.max(maxStreak, cur);
    });
  });

  const now = new Date();
  const yr  = now.getFullYear();
  const mm  = String(now.getMonth()+1).padStart(2,"0");
  const dim = new Date(yr, now.getMonth()+1, 0).getDate();

  let perfectDays=0, activeDays=0, weekPerfect=0, perfectWeeks=0, maxCombo=0, curCombo=0;
  const seenCats = new Set<string>();
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
  return stats.totalChecks*XP.CHECK +
    (stats.maxStreak>=7?XP.STREAK_7:0) +
    (stats.maxStreak>=14?XP.STREAK_14:0) +
    (stats.maxStreak>=30?XP.STREAK_30:0) +
    (stats.maxStreak>=60?XP.STREAK_60:0) +
    (stats.maxStreak>=100?XP.STREAK_100:0) +
    stats.perfectDays*XP.PERFECT_DAY +
    stats.perfectWeeks*XP.PERFECT_WEEK +
    (stats.maxCombo>=28?XP.PERFECT_MONTH:0) +
    (stats.categoriesUsed>=4?XP.VARIETY:0);
}

export function getLevel(xp: number): Level {
  return LEVELS.find(l=>xp>=l.xpMin&&xp<l.xpMax)||LEVELS[LEVELS.length-1];
}

export function getEarnedBadges(stats: GamStats): Badge[] {
  const level = getLevel(computeXP(stats)).level;
  return BADGE_DEFS.map(b=>({ ...b, earned: b.check({...stats, level}) }));
}

export { BADGE_DEFS as BADGES };
