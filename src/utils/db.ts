import { APP_NAME, VERSION } from "./constants";
import type { Data, Profile } from "../types";

const DB_NAME = APP_NAME;
const STORE   = "data";
const KEY     = "forge_v131";
const PROFILE_KEY = "forge_profile";

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbSave(data: Data): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(data, KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("[Forge:DB] save failed:", e);
    return false;
  }
}

export async function dbLoad(): Promise<Data | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("[Forge:DB] load failed:", e);
    return null;
  }
}

export function saveProfile(profile: Profile): boolean {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error("[Forge:DB] saveProfile failed:", e);
    return false;
  }
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch (e) {
    console.error("[Forge:DB] loadProfile failed:", e);
    return null;
  }
}

export async function migrateLocalStorageToIDB(): Promise<boolean> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    
    const data = JSON.parse(raw) as Data;
    if (!data || !data.habits) return false;
    
    const saved = await dbSave(data);
    if (saved) {
      localStorage.removeItem(KEY);
      console.log("[Forge:DB] Migrated localStorage data to IndexedDB");
    }
    return saved;
  } catch (e) {
    console.error("[Forge:DB] Migration failed:", e);
    return false;
  }
}
