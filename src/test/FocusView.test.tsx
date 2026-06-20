import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FocusView from "../views/FocusView";
import type { Habit, MonthStats } from "../types";

const baseProps = {
  year: 2026,
  monthIdx: 5,
  todayDay: 15,
  isCurrentMonth: true,
  habits: [
    { name: "Leer", cat: "mente" as const, type: "boolean" as const },
    { name: "Ejercicio", cat: "salud" as const, type: "boolean" as const },
    { name: "Azúcar", cat: "salud" as const, type: "negative" as const },
  ],
  checks: {} as Record<string, true>,
  monthStats: {
    habitPct: [0.5, 0.8, 0.3],
    bestIdx: 0, worstIdx: 0, daysComplete: 0, above80: 0, generalPct: 0,
    streaks: [3, 5, 0], longestStreaks: [7, 10, 2],
    dailyCounts: [], dailyPct: [],
  } as MonthStats,
  toggleCheck: () => {},
  L: {
    focus: { mode: "Focus", perfectDay: "¡Día perfecto!", consecutive: "días" },
    dayView: { completed: "completado", pending: "pendiente" },
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    dow: ["D", "L", "M", "X", "J", "V", "S"],
    dowFull: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  } as any,
  lang: "es",
};

describe("FocusView", () => {
  it("renders the focus header", () => {
    render(<FocusView {...baseProps} />);
    expect(screen.getByText(t => t.includes("Focus"))).toBeDefined();
  });

  it("renders each habit name", () => {
    render(<FocusView {...baseProps} />);
    expect(screen.getByText("Leer")).toBeDefined();
    expect(screen.getByText("Ejercicio")).toBeDefined();
    expect(screen.getByText("Azúcar")).toBeDefined();
  });

  it("shows streak for habits with streak > 1", () => {
    render(<FocusView {...baseProps} />);
    expect(screen.getByText("3 días 🔥")).toBeDefined();
    expect(screen.getByText("5 días 🔥")).toBeDefined();
  });

  it("renders for non-current month using selected day", () => {
    render(<FocusView {...baseProps} isCurrentMonth={false} />);
    expect(screen.getByText(t => t.includes("Focus"))).toBeDefined();
    expect(screen.getByText("Leer")).toBeDefined();
  });

  it("shows perfect day banner when 100%", () => {
    const allDone: Record<string, true> = {};
    baseProps.habits.forEach((_, hi) => {
      allDone[`2026-06-${hi}-15`] = true;
    });
    render(<FocusView {...baseProps} checks={allDone} />);
    expect(screen.getByText(/día perfecto/i)).toBeDefined();
  });
});
