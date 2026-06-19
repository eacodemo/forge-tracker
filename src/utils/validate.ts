import type { Data, Habit } from "../types";
import { newUserData } from "./storage";

export function validateAndRepair(raw: unknown): Data {
  const issues: string[] = [];

  if (!raw || typeof raw !== "object") {
    issues.push("root object invalid — full reset");
    const d = newUserData();
    d._repaired = true;
    d._issues = issues;
    return d;
  }

  const d = { ...raw } as Data;

  if (!d.profile || typeof d.profile !== "object") {
    d.profile = { name:"", lang:"es", theme:"dark", accent:"red", notifHour:21 };
    issues.push("profile missing — reset to defaults");
  } else {
    const p = d.profile;
    if (typeof p.name !== "string")                                  { p.name = "";       issues.push("profile.name invalid"); }
    if (!["es","en","pt"].includes(p.lang))                          { p.lang = "es";     issues.push(`profile.lang "${p.lang}" unknown`); }
    if (!["dark","light"].includes(p.theme))                         { p.theme = "dark";  issues.push(`profile.theme "${p.theme}" unknown`); }
    if (!["red","blue","green","purple","orange","cyan"].includes(p.accent)) { p.accent = "red"; issues.push(`profile.accent "${p.accent}" unknown`); }
    if (typeof p.notifHour !== "number" || p.notifHour < 0 || p.notifHour > 23) { p.notifHour = 21; issues.push("profile.notifHour out of range"); }
  }

  if (typeof d.onboarded !== "boolean") {
    d.onboarded = Array.isArray(d.habits) && d.habits.length > 0;
    issues.push("onboarded coerced");
  }

  const VALID_TYPES = ["boolean","negative","numeric"] as const;
  const VALID_CATS  = ["salud","trabajo","mente","social","habitos","otro"] as const;

  if (!Array.isArray(d.habits)) {
    d.habits = [];
    issues.push("habits not array — reset to []");
  } else {
    d.habits = d.habits.map((h: unknown, i: number) => {
      if (typeof h === "string") return { name: h, cat: "otro" as const, type: "boolean" as const };
      if (!h || typeof h !== "object") { issues.push(`habits[${i}] invalid — removed`); return null; }
      const fixed = { ...h } as Record<string, unknown>;
      if (!fixed.name || typeof fixed.name !== "string") { fixed.name = `Hábito ${i+1}`; issues.push(`habits[${i}].name invalid`); }
      if (!VALID_CATS.includes(fixed.cat as any))        { fixed.cat  = "otro";           issues.push(`habits[${i}].cat invalid`); }
      if (!VALID_TYPES.includes(fixed.type as any))      { fixed.type = "boolean";        issues.push(`habits[${i}].type invalid`); }
      if (fixed.type === "numeric") {
        if (typeof fixed.goal !== "number" || (fixed.goal as number) < 1) { fixed.goal = 1; issues.push(`habits[${i}].goal invalid`); }
        if (typeof fixed.unit !== "string") { fixed.unit = ""; }
      }
      return fixed as unknown as Habit;
    }).filter(Boolean) as Data["habits"];
  }

  const KEY_RE = /^\d{4}-\d{2}-\d+-\d+$/;
  if (!d.checks || typeof d.checks !== "object" || Array.isArray(d.checks)) {
    d.checks = {};
    issues.push("checks invalid — reset to {}");
  } else {
    const maxHi = d.habits.length - 1;
    let removed = 0;
    d.checks = Object.fromEntries(
      Object.entries(d.checks).filter(([k]) => {
        if (!KEY_RE.test(k)) { removed++; return false; }
        const hi = parseInt(k.split("-")[2]);
        if (hi > maxHi) { removed++; return false; }
        return true;
      })
    ) as Data["checks"];
    if (removed > 0) issues.push(`${removed} orphaned check keys removed`);
  }

  if (!d.numeric || typeof d.numeric !== "object" || Array.isArray(d.numeric)) {
    d.numeric = {};
    issues.push("numeric invalid — reset to {}");
  } else {
    const maxHi = d.habits.length - 1;
    let removed = 0;
    d.numeric = Object.fromEntries(
      Object.entries(d.numeric).filter(([k, v]) => {
        if (!KEY_RE.test(k)) { removed++; return false; }
        const hi = parseInt(k.split("-")[2]);
        if (hi > maxHi || typeof v !== "number" || (v as number) < 0) { removed++; return false; }
        return true;
      })
    ) as Data["numeric"];
    if (removed > 0) issues.push(`${removed} orphaned numeric keys removed`);
  }

  if (!d.notes || typeof d.notes !== "object" || Array.isArray(d.notes)) {
    d.notes = {};
    issues.push("notes invalid — reset to {}");
  } else {
    d.notes = Object.fromEntries(
      Object.entries(d.notes).filter(([, v]) => typeof v === "string")
    ) as Data["notes"];
  }

  if (issues.length > 0) {
    console.warn("[Forge] Data repaired:", issues);
    d._repaired = true;
    d._issues   = issues;
  }

  return d;
}

export function safeJsonParse(str: string): unknown | null {
  try { return JSON.parse(str); } catch { return null; }
}
