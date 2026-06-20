import { describe, it, expect, beforeEach } from "vitest";
import { makeKey, makeNoteKey, parseKey, newUserData, saveData, loadData, archiveOldChecks, saveDataSync, saveDataAsync, loadDataAsync } from "../utils/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("makeKey", () => {
  it("formats key correctly", () => {
    expect(makeKey(2026, 0, 0, 1)).toBe("2026-01-0-1");
  });

  it("pads month to 2 digits", () => {
    expect(makeKey(2026, 11, 2, 5)).toBe("2026-12-2-5");
  });
});

describe("makeNoteKey", () => {
  it("formats note key correctly", () => {
    expect(makeNoteKey(2026, 0, 15)).toBe("2026-01-note-15");
  });
});

describe("parseKey", () => {
  it("parses valid key", () => {
    const p = parseKey("2026-03-2-15");
    expect(p).toEqual({ year: 2026, month0: 2, hi: 2, day: 15 });
  });

  it("returns null for invalid key", () => {
    expect(parseKey("invalid")).toBeNull();
  });

  it("returns null for non-matching key", () => {
    expect(parseKey("not-a-key")).toBeNull();
  });
});

describe("newUserData", () => {
  it("creates fresh data with onboarded=false", () => {
    const d = newUserData();
    expect(d.onboarded).toBe(false);
    expect(d.version).toBe("1.3.2");
    expect(d.habits).toEqual([]);
    expect(d.checks).toEqual({});
    expect(d.profile.name).toBe("");
  });
});

describe("saveData / loadData", () => {
  it("round-trips data through localStorage", () => {
    const d = newUserData();
    d.onboarded = true;
    d.profile = { name: "Test", lang: "en", theme: "light", accent: "blue", notifHour: 20 };
    d.habits = [{ name: "Read", cat: "mente", type: "boolean" }];
    d.checks = { [makeKey(2026, 0, 0, 1)]: true as const };

    const saved = saveData(d);
    expect(saved).toBe(true);

    const loaded = loadData();
    expect(loaded.profile.name).toBe("Test");
    expect(loaded.habits[0].name).toBe("Read");
    expect(loaded.checks[makeKey(2026, 0, 0, 1)]).toBe(true);
  });

  it("loadData returns fresh data when storage is empty", () => {
    const d = loadData();
    expect(d.onboarded).toBe(false);
    expect(d.habits).toEqual([]);
  });

  it("archiveOldChecks removes checks older than 6 months", () => {
    const d = newUserData();
    const oldKey = "2025-01-0-1";
    const newKey = "2026-06-0-15";
    d.checks = { [oldKey]: true as const, [newKey]: true as const };
    d.habits = [{ name: "Test", cat: "otro", type: "boolean" }];
    const archived = archiveOldChecks(d, 6);
    expect(archived.checks[oldKey]).toBeUndefined();
    expect(archived.checks[newKey]).toBe(true);
  });

  it("archiveOldChecks keeps current month checks", () => {
    const d = newUserData();
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-0-1`;
    d.checks = { [key]: true as const };
    d.habits = [{ name: "Test", cat: "otro", type: "boolean" }];
    const archived = archiveOldChecks(d, 6);
    expect(archived.checks[key]).toBe(true);
  });

  it("saveDataSync wraps saveData", () => {
    const d = newUserData();
    expect(saveDataSync(d)).toBe(true);
  });

  it("loadDataAsync returns valid data from localStorage", async () => {
    const d = newUserData();
    d.onboarded = true;
    d.profile.name = "AsyncTest";
    saveData(d);
    const loaded = await loadDataAsync();
    expect(loaded.profile.name).toBe("AsyncTest");
  });

  it("saveDataAsync writes and can be read back", async () => {
    const d = newUserData();
    d.onboarded = true;
    d.profile.name = "AsyncWrite";
    const ok = await saveDataAsync(d);
    expect(ok).toBe(true);
    const loaded = await loadDataAsync();
    expect(loaded.profile.name).toBe("AsyncWrite");
  });

  it("saveData handles quota errors gracefully", () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error("QuotaExceededError"); };
    try {
      const r = saveData(newUserData());
      expect(r).toBe(false);
    } finally {
      Storage.prototype.setItem = orig;
    }
  });
});
