import { describe, it, expect } from "vitest";
import { validateAndRepair, safeJsonParse } from "../utils/validate";

describe("validateAndRepair", () => {
  it("returns a full reset for non-object input", () => {
    const d = validateAndRepair(null);
    expect(d._repaired).toBe(true);
    expect(d._issues).toBeDefined();
  });

  it("fixes missing profile", () => {
    const d = validateAndRepair({ habits: [] });
    expect(d.profile.name).toBe("");
    expect(d.profile.lang).toBe("es");
    expect(d._issues?.some(i => i.includes("profile missing"))).toBe(true);
  });

  it("fixes invalid lang", () => {
    const d = validateAndRepair({
      profile: { name: "test", lang: "fr", theme: "dark", accent: "red", notifHour: 21 },
      habits: [],
    });
    expect(d.profile.lang).toBe("es");
    expect(d._repaired).toBe(true);
  });

  it("fixes invalid theme", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "neon", accent: "red", notifHour: 21 },
      habits: [],
    });
    expect(d.profile.theme).toBe("dark");
  });

  it("fixes invalid accent", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "pink", notifHour: 21 },
      habits: [],
    });
    expect(d.profile.accent).toBe("red");
  });

  it("coerces notifHour out of range", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "red", notifHour: 99 },
      habits: [],
    });
    expect(d.profile.notifHour).toBe(21);
  });

  it("converts string habits to objects", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "red", notifHour: 21 },
      habits: ["Leer"],
    });
    expect(d.habits[0].name).toBe("Leer");
    expect(d.habits[0].type).toBe("boolean");
    expect(d.habits[0].cat).toBe("otro");
  });

  it("removes orphaned check keys", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "red", notifHour: 21 },
      habits: [{ name: "Test", cat: "otro", type: "boolean" }],
      checks: { "2026-01-0-1": true as const, "2026-01-5-1": true as const },
    });
    expect(d.checks["2026-01-0-1"]).toBe(true);
    expect(d.checks["2026-01-5-1"]).toBeUndefined();
    expect(d._issues?.some(i => i.includes("orphaned"))).toBe(true);
  });

  it("resets checks to {} if invalid type", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "red", notifHour: 21 },
      habits: [],
      checks: "invalid",
    });
    expect(d.checks).toEqual({});
    expect(d._repaired).toBe(true);
  });

  it("filters out non-numeric numeric entries", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "red", notifHour: 21 },
      habits: [{ name: "Agua", cat: "salud", type: "numeric" }],
      numeric: { "2026-01-0-1": 5, "2026-01-0-2": "bad" as any, "2026-01-5-1": 3 },
    });
    expect(d.numeric["2026-01-0-1"]).toBe(5);
    expect(d.numeric["2026-01-0-2"]).toBeUndefined();
    expect(d.numeric["2026-01-5-1"]).toBeUndefined();
  });

  it("filters notes with non-string values", () => {
    const d = validateAndRepair({
      profile: { name: "", lang: "es", theme: "dark", accent: "red", notifHour: 21 },
      habits: [],
      notes: { "key1": "valid", "key2": 123 as any, "key3": true as any },
    });
    expect(d.notes).toEqual({ key1: "valid" });
  });

  it("does not repair valid data", () => {
    const d = validateAndRepair({
      profile: { name: "Test", lang: "en", theme: "light", accent: "blue", notifHour: 20 },
      habits: [{ name: "Exercise", cat: "salud", type: "boolean" }],
      checks: { "2026-01-0-1": true as const },
      numeric: {},
      notes: {},
      onboarded: true,
    });
    expect(d._repaired).toBeUndefined();
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
  });

  it("returns null for invalid JSON", () => {
    expect(safeJsonParse("not json")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(safeJsonParse("")).toBeNull();
  });
});
