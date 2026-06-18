export interface Profile {
  name: string;
  lang: 'es' | 'en' | 'pt';
  theme: 'dark' | 'light';
  accent: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
  notifHour: number;
}

export type HabitType = 'boolean' | 'negative' | 'numeric';

export type CategoryId = 'salud' | 'trabajo' | 'mente' | 'social' | 'habitos' | 'otro';

export interface HabitSchedule {
  type: 'daily' | 'weekdays' | 'interval';
  days?: number[];      // 0=Sun..6=Sat for weekdays type
  interval?: number;    // every N days for interval type
  startDay?: number;    // day of month when interval starts
}

export interface Habit {
  name: string;
  cat: CategoryId;
  type: HabitType;
  goal?: number;
  unit?: string;
  schedule?: HabitSchedule;
}

export interface Data {
  version: string;
  onboarded: boolean;
  profile: Profile;
  habits: Habit[];
  checks: Record<string, true>;
  numeric: Record<string, number>;
  notes: Record<string, string>;
  archivedCheckCount?: number;
  _repaired?: true;
  _issues?: string[];
  exportedAt?: string;
}

export interface MonthStats {
  habitPct: number[];
  bestIdx: number;
  worstIdx: number;
  daysComplete: number;
  above80: number;
  generalPct: number;
  streaks: number[];
  longestStreaks: number[];
  dailyCounts: number[];
  dailyPct: number[];
}

export interface GamStats {
  totalChecks: number;
  maxStreak: number;
  perfectDays: number;
  perfectWeeks: number;
  maxCombo: number;
  activeDaysMonth: number;
  categoriesUsed: number;
}

export interface Level {
  level: number;
  name: string;
  xpMin: number;
  xpMax: number;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

export interface AccentPalette {
  id: string;
  name: string;
  dark: { accent: string; dim: string; glow: string; dark2: string };
  light: { accent: string; dim: string; glow: string; dark2: string };
}

export interface Category {
  id: CategoryId;
  color: string;
}

export interface ElectronAPI {
  notify: (title: string, body: string) => void;
  notifyStreakRisk: (habitName: string, streak: number, lang: string) => void;
  updateTrayTooltip: (done: number, total: number, pct: number) => void;
  onDailyCheck: (cb: () => void) => void;
  onNavigate: (cb: (view: string) => void) => void;
  setNotifHour: (hour: number) => void;
  getNotifHour: () => Promise<number>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
