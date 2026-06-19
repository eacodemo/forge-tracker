import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { loadData, loadDataAsync, saveData, saveDataAsync, archiveOldChecks, makeKey, makeNoteKey } from "../utils/storage";
import { LANGS, DAYS_IN_MONTH } from "../i18n/translations";
import { useAccent } from "./useAccent";
import { playCheck, playUncheck } from "../utils/sound";
import { useGamificationWorker } from "./useGamificationWorker";
import { useUndo } from "./useUndo";
import type { Data, MonthStats, Level, Badge, GamStats, Habit } from "../types";
import type { TranslationSet } from "../i18n/translations";

function getToday(): Date { return new Date(); }

export interface ToastState {
  msg: string;
  type: string;
}

export interface UseHabitDataReturn {
  data: Data;
  view: string;
  setView: (v: string) => void;
  year: number;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  monthIdx: number;
  setMonthIdx: React.Dispatch<React.SetStateAction<number>>;
  todayDay: number;
  todayMonth: number;
  todayYear: number;
  isCurrentMonth: boolean;
  monthName: string;
  daysInMonth: number;
  habits: Habit[];
  checks: Record<string, true>;
  numeric: Record<string, number>;
  notes: Record<string, string>;
  profile: Data["profile"];
  lang: string;
  theme: string;
  L: TranslationSet;
  monthStats: MonthStats;
  gamStats: GamStats;
  xp: number;
  levelData: Level;
  badges: Badge[];
  xpPct: number;
  initials: string;
  levelNames: string[];
  toast: ToastState | null;
  onboarded: boolean;
  update: (patch: Partial<Data>) => void;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  toggleCheck: (hi: number, day: number) => void;
  setNumeric: (hi: number, day: number, val: number) => void;
  setNote: (day: number, text: string) => void;
  toggleTheme: () => void;
  showToast: (msg: string, type?: string) => void;
  undo: () => void;
}

export function useHabitData(): UseHabitDataReturn {
  const [data, setData] = useState<Data>(() => {
    const d = loadData();
    if (d._repaired) {
      setTimeout(() => {
        console.warn("[Forge] Data was repaired on load:", d._issues);
      }, 1000);
    }
    return d;
  });
  const [year, setYear] = useState(() => getToday().getFullYear());
  const [monthIdx, setMonthIdx] = useState(() => getToday().getMonth());
  const [view, setView] = useState("tracker");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [now, setNow] = useState(getToday);
  useEffect(() => {
    const id = setInterval(() => setNow(getToday()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);
  const todayDay    = now.getDate();
  const todayMonth  = now.getMonth();
  const todayYear   = now.getFullYear();

  const { habits, checks, numeric, notes, profile, onboarded } = data;
  const checksRef = useRef(checks);
  const numericRef = useRef(numeric);
  const notesRef = useRef(notes);
  useEffect(() => { checksRef.current = checks; }, [checks]);
  useEffect(() => { numericRef.current = numeric; }, [numeric]);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  const lang      = profile?.lang      || "es";
  const theme     = profile?.theme     || "dark";
  const accent    = profile?.accent    || "red";
  const userName  = profile?.name      || "";
  const L         = LANGS[lang]        || LANGS.es;

  const monthName   = L.months[monthIdx];
  const daysInMonth = DAYS_IN_MONTH(year, monthIdx);
  const isCurrentMonth = todayYear===year && todayMonth===monthIdx;

  useAccent(accent, theme);

  useEffect(() => {
    if (data._repaired && data._issues && data._issues.length > 0) {
      showToast(`⚠️ Datos reparados automáticamente (${data._issues.length} problema${data._issues.length > 1 ? "s" : ""})`, "danger");
    }
  }, []);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onNavigate) return;
    const cleanup = api.onNavigate(v => setView(v));
    return () => { if (cleanup) cleanup(); };
  }, []);

  const dataRef = useRef(data);
  const userWrittenRef = useRef(false);
  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onDailyCheck) return;
    const cleanup = api.onDailyCheck(() => {
      const d    = dataRef.current;
      const m    = getToday().getMonth();
      const day  = getToday().getDate();
      const yr   = getToday().getFullYear();
      const mm   = String(m+1).padStart(2,"0");
      const done = d.habits.filter((_: Habit, hi: number) => d.checks[`${yr}-${mm}-${hi}-${day}`]).length;
      const total= d.habits.length;
      const pct  = total?Math.round(done/total*100):0;
      const Lnow = LANGS[d.profile?.lang]||LANGS.es;
      const msg  = pct===100
        ? Lnow.notif.perfect
        : Lnow.notif.progress.replace("{done}",String(done)).replace("{total}",String(total)).replace("{pct}",String(pct));
      api.notify(Lnow.notif.title, msg);
    });
    return () => { if (cleanup) cleanup(); };
  }, []);

  useEffect(() => {
    loadDataAsync().then(fromDB => {
      if (userWrittenRef.current) return;
      if (!fromDB || !fromDB.onboarded) return;
      const cleaned = archiveOldChecks(fromDB, 6);
      if (JSON.stringify(cleaned) !== JSON.stringify(fromDB)) {
        setData(cleaned);
        saveData(cleaned);
        saveDataAsync(cleaned).catch(() => {});
      } else if (JSON.stringify(fromDB) !== JSON.stringify(data)) {
        setData(fromDB);
      }
    }).catch(() => {});
  }, []);

  function showToast(msg: string, type: string = "success"): void {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({msg,type});
    toastTimerRef.current = setTimeout(()=>setToast(null), 3500);
  }

  function update(patch: Partial<Data>): void {
    userWrittenRef.current = true;
    setData(d => {
      const next = {...d, ...patch};
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const saved = saveData(next);
        if (saved) saveDataAsync(next).catch(() => {});
        else showToast("⚠️ Error guardando datos — almacenamiento lleno", "danger");
      }, 300);
      return next;
    });
  }

  const { push: pushUndo, undo } = useUndo();

  const toggleCheck = useCallback((hi: number, day: number) => {
    const k = makeKey(year, monthIdx, hi, day);
    const latestChecks = checksRef.current;
    const wasChecked = !!latestChecks[k];
    const next = {...latestChecks};
    if (wasChecked) { delete next[k]; playUncheck(); }
    else { next[k]=true; playCheck(); showToast("+10 XP", "gold"); }
    update({checks:next});
    pushUndo(() => {
      const revert = {...(dataRef.current.checks || {})};
      if (wasChecked) revert[k] = true; else delete revert[k];
      update({checks:revert});
    });
  },[year,monthIdx]);

  const setNumeric = useCallback((hi: number, day: number, val: number) => {
    const k    = makeKey(year, monthIdx, hi, day);
    const h    = habits[hi];
    const goal = h?.goal||1;
    const latestNum = numericRef.current;
    const latestChecks = checksRef.current;
    const nNum = {...(latestNum||{})};
    const nc   = {...latestChecks};
    if (val<=0) { delete nNum[k]; delete nc[k]; }
    else { nNum[k]=val; if(val>=goal) nc[k]=true; else delete nc[k]; }
    update({numeric:nNum,checks:nc});
  },[year,monthIdx,habits]);

  const setNote = useCallback((day: number, text: string) => {
    const k = makeNoteKey(year, monthIdx, day);
    const latestNotes = notesRef.current;
    const next = {...(latestNotes||{})};
    if (text.trim()) next[k]=text; else delete next[k];
    update({notes:next});
  },[year,monthIdx]);

  function toggleTheme(): void { update({profile:{...profile,theme:theme==="dark"?"light":"dark"}}); }

  const monthStats: MonthStats = useMemo(()=>{
    if (habits.length===0) return {
      habitPct:[],bestIdx:0,worstIdx:0,daysComplete:0,above80:0,
      generalPct:0,streaks:[],longestStreaks:[],dailyCounts:[],
      dailyPct:Array.from({length:daysInMonth},()=>0),
    };

    const habitPct = habits.map((_: Habit, hi: number)=>{
      let cnt=0;
      for(let d=1;d<=daysInMonth;d++) if(checks[makeKey(year,monthIdx,hi,d)]) cnt++;
      return cnt/daysInMonth;
    });
    const dailyCounts = Array.from({length:daysInMonth},(_: number,i: number)=>
      habits.filter((_: Habit, hi: number)=>checks[makeKey(year,monthIdx,hi,i+1)]).length
    );
    const maxPct   = habitPct.reduce((a, b) => Math.max(a, b), 0);
    const minPct   = habitPct.reduce((a, b) => Math.min(a, b), 1);
    const bestIdx  = habitPct.indexOf(maxPct);
    const worstIdx = habitPct.indexOf(minPct);
    const daysComplete = dailyCounts.filter(c=>c===habits.length).length;
    const above80  = habitPct.filter(p=>p>=0.8).length;
    const generalPct = habitPct.reduce((a,b)=>a+b,0)/habits.length;

    const streaks = habits.map((_: Habit, hi: number)=>{
      let s=0, max=isCurrentMonth?todayDay:daysInMonth;
      for(let d=max;d>=1;d--){ if(checks[makeKey(year,monthIdx,hi,d)]) s++; else break; }
      return s;
    });
    const longestStreaks = habits.map((_: Habit, hi: number)=>{
      let best=0,cur=0;
      for(let d=1;d<=daysInMonth;d++){
        if(checks[makeKey(year,monthIdx,hi,d)]){cur++;best=Math.max(best,cur);}else cur=0;
      }
      return best;
    });
    return {habitPct,bestIdx,worstIdx,daysComplete,above80,generalPct,streaks,
      longestStreaks,dailyCounts,dailyPct:dailyCounts.map(c=>c/habits.length)};
  },[checks,habits,year,monthIdx,daysInMonth,isCurrentMonth,todayDay]);

  useEffect(() => {
    if (!isCurrentMonth) return;
    const api = window.electronAPI;
    if (!api?.updateTrayTooltip) return;
    const done = habits.filter((_, hi) => checks[makeKey(year, monthIdx, hi, todayDay)]).length;
    const total = habits.length;
    const pct = total ? Math.round(done / total * 100) : 0;
    api.updateTrayTooltip(done, total, pct);
  }, [checks, habits, year, monthIdx, todayDay, isCurrentMonth]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.setNotifHour || profile?.notifHour == null) return;
    api.setNotifHour(profile.notifHour);
  }, [profile?.notifHour]);

  const gamResult = useGamificationWorker(checks, habits, data.archivedCheckCount || 0);
  const gamStats: GamStats = gamResult?.gamStats || { totalChecks:0, maxStreak:0, perfectDays:0, perfectWeeks:0, maxCombo:0, activeDaysMonth:0, categoriesUsed:0 };
  const xp = gamResult?.xp || 0;
  const levelData: Level = gamResult?.levelData || { level:1, name:"Iniciado", xpMin:0, xpMax:100 };
  const badges: Badge[] = gamResult?.badges || [];
  const xpPct = gamResult?.xpPct || 0;

  const initials = userName.trim().split(" ").map(w=>w[0]?.toUpperCase()).slice(0,2).join("")||"?";
  const levelNames: string[] = L.gamify?.levelNames||[];

  return {
    data, view, setView, year, setYear, monthIdx, setMonthIdx,
    todayDay, todayMonth, todayYear, isCurrentMonth, monthName, daysInMonth,
    habits, checks, numeric, notes, profile, lang, theme, L,
    monthStats, gamStats, xp, levelData, badges, xpPct,
    initials, levelNames, toast, onboarded,
    update, setData, toggleCheck, setNumeric, setNote, toggleTheme, showToast, undo,
  };
}
