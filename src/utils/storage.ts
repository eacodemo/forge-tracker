import { validateAndRepair, safeJsonParse } from "./validate.js";
import { dbSave, dbLoad, saveProfile, loadProfile, migrateLocalStorageToIDB } from "./db.js";
import { VERSION } from "./constants";
import type { Data, Habit, HabitSchedule, AccentPalette, Category, CategoryId, HabitType, Profile } from "../types";

const KEY     = "forge_v131";

export const CATEGORIES: Category[] = [
  { id:"salud",   color:"#3ecf8e" },
  { id:"trabajo", color:"#e63946" },
  { id:"mente",   color:"#8b78ff" },
  { id:"social",  color:"#f4a030" },
  { id:"habitos", color:"#60a5fa" },
  { id:"otro",    color:"#a0a0c0" },
];

export const ACCENT_PALETTES: AccentPalette[] = [
  { id:"red",    name:"Rojo",    dark:{ accent:"#e63946",dim:"rgba(230,57,70,.15)",  glow:"rgba(230,57,70,.30)",  dark2:"#9b1a23" },light:{ accent:"#c0303b",dim:"rgba(192,48,59,.10)",  glow:"rgba(192,48,59,.22)",  dark2:"#8a1a22" }},
  { id:"blue",   name:"Azul",    dark:{ accent:"#3b82f6",dim:"rgba(59,130,246,.15)", glow:"rgba(59,130,246,.30)", dark2:"#1d4ed8" },light:{ accent:"#2563eb",dim:"rgba(37,99,235,.10)",  glow:"rgba(37,99,235,.22)",  dark2:"#1e40af" }},
  { id:"green",  name:"Verde",   dark:{ accent:"#22c55e",dim:"rgba(34,197,94,.15)",  glow:"rgba(34,197,94,.30)",  dark2:"#15803d" },light:{ accent:"#16a34a",dim:"rgba(22,163,74,.10)",  glow:"rgba(22,163,74,.22)",  dark2:"#166534" }},
  { id:"purple", name:"Morado",  dark:{ accent:"#8b5cf6",dim:"rgba(139,92,246,.15)", glow:"rgba(139,92,246,.30)", dark2:"#6d28d9" },light:{ accent:"#7c3aed",dim:"rgba(124,58,237,.10)",glow:"rgba(124,58,237,.22)", dark2:"#5b21b6" }},
  { id:"orange", name:"Naranja", dark:{ accent:"#f97316",dim:"rgba(249,115,22,.15)", glow:"rgba(249,115,22,.30)", dark2:"#c2410c" },light:{ accent:"#ea580c",dim:"rgba(234,88,12,.10)",  glow:"rgba(234,88,12,.22)",  dark2:"#9a3412" }},
  { id:"cyan",   name:"Cian",    dark:{ accent:"#06b6d4",dim:"rgba(6,182,212,.15)",  glow:"rgba(6,182,212,.30)",  dark2:"#0e7490" },light:{ accent:"#0891b2",dim:"rgba(8,145,178,.10)",  glow:"rgba(8,145,178,.22)",  dark2:"#164e63" }},
];

export function makeKey(year: number, month0: number, hi: number, day: number): string {
  return `${year}-${String(month0+1).padStart(2,"0")}-${hi}-${day}`;
}

export function makeNoteKey(year: number, month0: number, day: number): string {
  return `${year}-${String(month0+1).padStart(2,"0")}-note-${day}`;
}

export function parseKey(k: string): { year: number; month0: number; hi: number; day: number } | null {
  const m = k.match(/^(\d{4})-(\d{2})-(\d+)-(\d+)$/);
  if (!m) return null;
  return { year:parseInt(m[1]), month0:parseInt(m[2])-1, hi:parseInt(m[3]), day:parseInt(m[4]) };
}

export interface TemplateHabit {
  name: string;
  cat: CategoryId;
  type: HabitType;
  goal?: number;
  unit?: string;
}

export const TEMPLATES: Record<string, Record<string, TemplateHabit[]>> = {
  prod:{
    es:[
      {name:"Planificar el día (3 tareas clave)",cat:"trabajo",type:"boolean"},
      {name:"Trabajo profundo ≥ 4h",             cat:"trabajo",type:"boolean"},
      {name:"Revisar y cerrar tareas pendientes",cat:"trabajo",type:"boolean"},
      {name:"Aprender algo nuevo (20 min)",      cat:"mente",  type:"boolean"},
      {name:"Sin redes en horario laboral",      cat:"habitos",type:"negative"},
      {name:"Inbox en cero al final del día",    cat:"trabajo",type:"boolean"},
    ],
    en:[
      {name:"Plan the day (3 key tasks)",        cat:"trabajo",type:"boolean"},
      {name:"Deep work ≥ 4h",                    cat:"trabajo",type:"boolean"},
      {name:"Review and close pending tasks",    cat:"trabajo",type:"boolean"},
      {name:"Learn something new (20 min)",      cat:"mente",  type:"boolean"},
      {name:"No social media during work hours", cat:"habitos",type:"negative"},
      {name:"Inbox zero by end of day",          cat:"trabajo",type:"boolean"},
    ],
    pt:[
      {name:"Planejar o dia (3 tarefas chave)",  cat:"trabajo",type:"boolean"},
      {name:"Trabalho profundo ≥ 4h",            cat:"trabajo",type:"boolean"},
      {name:"Revisar e fechar tarefas pendentes",cat:"trabajo",type:"boolean"},
      {name:"Aprender algo novo (20 min)",       cat:"mente",  type:"boolean"},
      {name:"Sem redes no horário de trabalho",  cat:"habitos",type:"negative"},
      {name:"Caixa de entrada zerada",           cat:"trabajo",type:"boolean"},
    ],
  },
  health:{
    es:[
      {name:"Ejercicio 30 minutos",           cat:"salud",type:"boolean"},
      {name:"Tomar agua",                     cat:"salud",type:"numeric",goal:8,unit:"vasos"},
      {name:"Dormir 7–8 horas",               cat:"salud",type:"boolean"},
      {name:"Comer verduras / frutas",        cat:"salud",type:"boolean"},
      {name:"Caminar al aire libre",          cat:"salud",type:"boolean"},
      {name:"Evitar azúcar o comida basura",  cat:"salud",type:"negative"},
    ],
    en:[
      {name:"Exercise 30 minutes",            cat:"salud",type:"boolean"},
      {name:"Drink water",                    cat:"salud",type:"numeric",goal:8,unit:"glasses"},
      {name:"Sleep 7–8 hours",                cat:"salud",type:"boolean"},
      {name:"Eat vegetables / fruits",        cat:"salud",type:"boolean"},
      {name:"Walk outdoors",                  cat:"salud",type:"boolean"},
      {name:"Avoid sugar or junk food",       cat:"salud",type:"negative"},
    ],
    pt:[
      {name:"Exercitar 30 minutos",           cat:"salud",type:"boolean"},
      {name:"Beber água",                     cat:"salud",type:"numeric",goal:8,unit:"copos"},
      {name:"Dormir 7–8 horas",               cat:"salud",type:"boolean"},
      {name:"Comer verduras / frutas",        cat:"salud",type:"boolean"},
      {name:"Caminhar ao ar livre",           cat:"salud",type:"boolean"},
      {name:"Evitar açúcar ou comida ruim",   cat:"salud",type:"negative"},
    ],
  },
  mind:{
    es:[
      {name:"Meditación o respiración (10 min)",cat:"mente",  type:"boolean"},
      {name:"Lectura 30 minutos",               cat:"mente",  type:"boolean"},
      {name:"Escribir / journaling",            cat:"mente",  type:"boolean"},
      {name:"Sin pantallas 1h antes de dormir", cat:"habitos",type:"negative"},
      {name:"Agradecimiento (3 cosas)",         cat:"mente",  type:"boolean"},
      {name:"Aprender idioma 20 min",           cat:"mente",  type:"boolean"},
    ],
    en:[
      {name:"Meditation or breathing (10 min)", cat:"mente",  type:"boolean"},
      {name:"Reading 30 minutes",               cat:"mente",  type:"boolean"},
      {name:"Writing / journaling",             cat:"mente",  type:"boolean"},
      {name:"No screens 1h before bed",         cat:"habitos",type:"negative"},
      {name:"Gratitude (3 things)",             cat:"mente",  type:"boolean"},
      {name:"Learn a language 20 min",          cat:"mente",  type:"boolean"},
    ],
    pt:[
      {name:"Meditação ou respiração (10 min)", cat:"mente",  type:"boolean"},
      {name:"Leitura 30 minutos",               cat:"mente",  type:"boolean"},
      {name:"Escrita / journaling",             cat:"mente",  type:"boolean"},
      {name:"Sem telas 1h antes de dormir",     cat:"habitos",type:"negative"},
      {name:"Gratidão (3 coisas)",              cat:"mente",  type:"boolean"},
      {name:"Aprender idioma 20 min",           cat:"mente",  type:"boolean"},
    ],
  },
};

const OLD_MONTHS: Record<string, string[]> = {
  es:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
  en:["January","February","March","April","May","June","July","August","September","October","November","December"],
  pt:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
};

function migrateChecks(oldChecks: Record<string, unknown> | undefined): Record<string, true> {
  if (!oldChecks || typeof oldChecks!=="object") return {};
  const next: Record<string, true> = {};
  Object.keys(oldChecks).forEach(k => {
    if (/^\d{4}-\d{2}-\d+-\d+$/.test(k)) { next[k]=oldChecks[k] as true; return; }
    const m = k.match(/^(\d{4})-([^-]+)-(\d+)-(\d+)$/);
    if (!m) return;
    const [,yr,monthStr,hi,day] = m;
    let month0=-1;
    for (const names of Object.values(OLD_MONTHS)) {
      const idx=names.findIndex(n=>n.toLowerCase()===monthStr.toLowerCase());
      if (idx>=0){month0=idx;break;}
    }
    if (month0>=0) next[makeKey(parseInt(yr),month0,parseInt(hi),parseInt(day))]=true;
  });
  return next;
}

export function normalizeHabit(h: unknown): Habit {
  if (typeof h === "string") return { name: h, cat: "otro", type: "boolean" };
  if (h && typeof h === "object" && "name" in h) return h as Habit;
  return { name: "Hábito", cat: "otro", type: "boolean" };
}

export function newUserData(): Data {
  return {
    version:VERSION, onboarded:false,
    profile:{name:"",lang:"es",theme:"dark",accent:"red",notifHour:21},
    habits:[], checks:{}, numeric:{}, notes:{},
  };
}

export function loadData(): Data {
  const raw: string | null = localStorage.getItem(KEY);
  if (raw) {
    const parsed = safeJsonParse(raw) as Record<string, unknown> | null;
    if (parsed) {
      parsed.checks  = migrateChecks(parsed.checks  as Record<string, unknown> | undefined) as any;
      parsed.numeric = migrateChecks(parsed.numeric as Record<string, unknown> | undefined) as any;
      return validateAndRepair(parsed);
    }
    console.warn("[Forge] Current storage corrupted, trying v31 migration");
  }

  const old31raw = localStorage.getItem("habitos_v31");
  const old31 = old31raw ? safeJsonParse(old31raw) as Record<string, unknown> | null : null;
  if (old31) {
    old31.checks  = migrateChecks(old31.checks  as Record<string, unknown> | undefined) as any;
    old31.numeric = migrateChecks(old31.numeric as Record<string, unknown> | undefined) as any;
    return validateAndRepair(old31);
  }

  return newUserData();
}

export function saveData(data: Data): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    if (data.profile) saveProfile(data.profile);
    return true;
  } catch(e) {
    console.error("saveData failed:", e);
    return false;
  }
}

export function exportJSON(data: Data): void {
  const blob = new Blob(
    [JSON.stringify({...data, exportedAt:new Date().toISOString(), version:VERSION}, null, 2)],
    {type:"application/json"}
  );
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`forge-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(a.href);
}

export function exportCSV(data: Data): void {
  const {habits,checks}=data;
  const rows=[["Year","Month","Day","Category","Habit","Type","Done"]];
  const entries: (string|number)[][] = [];
  Object.keys(checks).forEach(k=>{
    const p=parseKey(k);
    if (!p) return;
    const h=habits[p.hi];
    if (!h) return;
    entries.push([p.year,p.month0+1,p.day,h.cat||"otro",h.name,h.type||"boolean","TRUE"]);
  });
  entries.sort((a,b)=> (a[0] as number)-(b[0] as number)||(a[1] as number)-(b[1] as number)||(a[2] as number)-(b[2] as number));
  entries.forEach(e=>rows.push(e.map(v=>`"${v}"`)));
  const blob=new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`forge-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
}

export function importJSON(file: File, onSuccess: (d: Data) => void, onError: (msg: string) => void): void {
  importJSONAsync(file).then(onSuccess).catch(e => onError(e.message));
}

export function importJSONAsync(file: File): Promise<Data> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target!.result as string) as Record<string, unknown>;
        if (!d.habits || !d.checks) throw new Error("Formato inválido: faltan habits o checks");
        d.checks = migrateChecks(d.checks as Record<string, unknown> | undefined) as any;
        d.numeric = migrateChecks(d.numeric as Record<string, unknown> | undefined) as any;
        if (!d.notes) d.notes = {};
        const data = d as unknown as Data;
        if (!saveData(data)) throw new Error("No se pudo guardar (localStorage lleno)");
        saveDataAsync(data).catch(() => {});
        resolve(data);
      } catch (e) {
        reject(e as Error);
      }
    };
    r.onerror = () => reject(new Error("Error al leer el archivo"));
    r.readAsText(file);
  });
}

export function saveDataSync(data: Data): boolean {
  return saveData(data);
}

export async function saveDataAsync(data: Data): Promise<boolean> {
  const ls = saveData(data);
  const idb = await dbSave(data);
  return ls || idb;
}

export async function loadDataAsync(): Promise<Data> {
  const fromDB = await dbLoad();
  if (fromDB) {
    fromDB.checks  = migrateChecks(fromDB.checks  as Record<string, unknown> | undefined) as any;
    fromDB.numeric = migrateChecks(fromDB.numeric as Record<string, unknown> | undefined) as any;
    const repaired = validateAndRepair(fromDB);
    localStorage.setItem(KEY, JSON.stringify(repaired));
    if (repaired.profile) saveProfile(repaired.profile);
    return repaired;
  }
  
  const localData = loadData();
  if (localData.habits && localData.habits.length > 0) {
    await migrateLocalStorageToIDB();
  }
  
  return localData;
}

export function archiveOldChecks(data: Data, keepMonths: number = 6): Data {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - keepMonths);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2,"0")}`;
  
  // Archive old data to separate key
  const archivedChecks: Record<string, true> = {};
  const archivedNum: Record<string, number> = {};
  const archivedNotes: Record<string, string> = {};
  
  Object.keys(data.checks).forEach(k => {
    const m = k.match(/^(\d{4}-\d{2})/);
    if (m && m[1] < cutoffStr) archivedChecks[k] = data.checks[k];
  });
  Object.keys(data.numeric||{}).forEach(k => {
    const m = k.match(/^(\d{4}-\d{2})/);
    if (m && m[1] < cutoffStr) archivedNum[k] = (data.numeric||{})[k];
  });
  Object.keys(data.notes||{}).forEach(k => {
    const m = k.match(/^(\d{4}-\d{2})/);
    if (m && m[1] < cutoffStr) archivedNotes[k] = (data.notes||{})[k];
  });
  
  // Save archive if there's data to archive
  if (Object.keys(archivedChecks).length > 0) {
    try {
      const existing = localStorage.getItem(`${KEY}_archive`);
      const prev = existing ? JSON.parse(existing) : { checks:{}, numeric:{}, notes:{} };
      localStorage.setItem(`${KEY}_archive`, JSON.stringify({
        checks: { ...prev.checks, ...archivedChecks },
        numeric: { ...prev.numeric, ...archivedNum },
        notes: { ...prev.notes, ...archivedNotes },
      }));
    } catch { /* ignore quota errors */ }
  }
  
  // Keep only recent data
  const next: Data = { ...data, checks: {}, numeric: {}, notes: {} };
  Object.keys(data.checks).forEach(k => {
    const m = k.match(/^(\d{4}-\d{2})/);
    if (m && m[1] >= cutoffStr) next.checks[k] = data.checks[k];
  });
  Object.keys(data.numeric||{}).forEach(k => {
    const m = k.match(/^(\d{4}-\d{2})/);
    if (m && m[1] >= cutoffStr) next.numeric[k] = (data.numeric||{})[k];
  });
  Object.keys(data.notes||{}).forEach(k => {
    const m = k.match(/^(\d{4}-\d{2})/);
    if (m && m[1] >= cutoffStr) next.notes[k] = (data.notes||{})[k];
  });
  next.archivedCheckCount = (data.archivedCheckCount || 0) + Object.keys(archivedChecks).length;
  return next;
}

export function isHabitScheduledForDay(schedule: HabitSchedule | undefined, year: number, monthIdx: number, day: number): boolean {
  if (!schedule || schedule.type === "daily") return true;
  const date = new Date(year, monthIdx, day);
  if (schedule.type === "weekdays") {
    const dow = date.getDay();
    return dow >= 1 && dow <= 5;
  }
  if (schedule.type === "interval") {
    const interval = schedule.interval || 2;
    const startDay = schedule.startDay || 1;
    const startDate = new Date(year, monthIdx, startDay);
    const diffMs = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % interval === 0;
  }
  return true;
}
