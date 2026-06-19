import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHabitData } from "../hooks/useHabitData";

class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  constructor() {}
  postMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data: { gamStats: { totalChecks: 0, streak: 0, bestStreak: 0, completions: {} }, xp: 0, levelData: { level: 1, xpForNext: 100, xpInLevel: 0 }, badges: [], xpPct: 0 } }));
    }
  }
  terminate() {}
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(() => ({
    onupgradeneeded: null as any,
    onsuccess: null as any,
    onerror: null as any,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(() => ({ oncomplete: null, onerror: null })),
          get: vi.fn(() => ({ onsuccess: null, onerror: null })),
          delete: vi.fn(() => ({ oncomplete: null, onerror: null })),
        })),
        oncomplete: null,
        onerror: null,
      })),
    },
  })),
};

describe("useHabitData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });
    Object.defineProperty(window, "indexedDB", { value: indexedDBMock, writable: true });
    (globalThis as any).Worker = MockWorker;
    localStorageMock.clear();
  });

  afterEach(() => {
    delete (globalThis as any).Worker;
  });

  it("initializes with default data when localStorage is empty", () => {
    const { result } = renderHook(() => useHabitData());
    expect(result.current.data).toBeDefined();
    expect(result.current.data.version).toBe("1.3.1");
    expect(result.current.data.onboarded).toBe(false);
  });

  it("returns view state and setter", () => {
    const { result } = renderHook(() => useHabitData());
    expect(result.current.view).toBe("tracker");
    expect(typeof result.current.setView).toBe("function");
  });

  it("returns month navigation state", () => {
    const { result } = renderHook(() => useHabitData());
    expect(typeof result.current.monthIdx).toBe("number");
    expect(typeof result.current.year).toBe("number");
    expect(typeof result.current.setMonthIdx).toBe("function");
    expect(typeof result.current.setYear).toBe("function");
  });

  it("returns habits array", () => {
    const { result } = renderHook(() => useHabitData());
    expect(Array.isArray(result.current.habits)).toBe(true);
  });

  it("returns theme and lang", () => {
    const { result } = renderHook(() => useHabitData());
    expect(["dark", "light"]).toContain(result.current.theme);
    expect(["es", "en", "pt"]).toContain(result.current.lang);
  });

  it("returns gamification data", () => {
    const { result } = renderHook(() => useHabitData());
    expect(typeof result.current.xp).toBe("number");
    expect(result.current.levelData).toBeDefined();
    expect(Array.isArray(result.current.badges)).toBe(true);
  });

  it("returns update function", () => {
    const { result } = renderHook(() => useHabitData());
    expect(typeof result.current.update).toBe("function");
  });

  it("returns toggleCheck function", () => {
    const { result } = renderHook(() => useHabitData());
    expect(typeof result.current.toggleCheck).toBe("function");
  });
});
