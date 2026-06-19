import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsView from "../views/StatsView";
import type { Habit, MonthStats } from "../types";

const baseProps = {
  monthIdx: 5,
  year: 2026,
  monthName: "Junio",
  daysInMonth: 30,
  habits: [
    { name: "Leer", cat: "mente" as const, type: "boolean" as const },
    { name: "Ejercicio", cat: "salud" as const, type: "boolean" as const },
  ] as Habit[],
  checks: {} as Record<string, true>,
  monthStats: {
    habitPct: [0.6, 0.8],
    bestIdx: 1, worstIdx: 0, daysComplete: 10, above80: 1, generalPct: 0.7,
    streaks: [3, 5], longestStreaks: [7, 10],
    dailyCounts: Array(30).fill(1), dailyPct: Array(30).fill(0.5),
  } as MonthStats,
  L: {
    stats: {
      compliance: "Cumplimiento", perfectDays: "Días perfectos", activeDays: "Días activos",
      habitsAbove: "Hábitos ≥ 80%", avgDay: "Prom / día", bestHabit: "Mejor hábito",
      improve: "A mejorar", ranking: "Ranking del mes", byCategory: "Por categoría",
      dailyProgress: "Progreso diario", habits: "hábitos",
      noHabits: "Agrega hábitos para ver estadísticas.", vsPrev: "vs mes anterior",
      weeklyBreakdown: "Resumen semanal", days: "días",
      period: "Período", periodMonth: "Mensual", periodQuarter: "Trimestral", periodSemester: "Semestral",
    },
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    catNames: { salud: "Salud", mente: "Mente" },
  } as any,
  theme: "dark",
};

describe("StatsView", () => {
  it("renders compliance percentage", () => {
    render(<StatsView {...baseProps} />);
    expect(screen.getByText("70%")).toBeDefined();
  });

  it("renders perfect days count", () => {
    render(<StatsView {...baseProps} />);
    expect(screen.getByText("10")).toBeDefined();
  });

  it("renders habit ranking", () => {
    render(<StatsView {...baseProps} />);
    const rankingNames = screen.getAllByText(/Ejercicio|Leer/);
    expect(rankingNames.length).toBeGreaterThanOrEqual(2);
  });

  it("renders period selector", () => {
    render(<StatsView {...baseProps} />);
    expect(screen.getByText("Mensual")).toBeDefined();
    expect(screen.getByText("Trimestral")).toBeDefined();
    expect(screen.getByText("Semestral")).toBeDefined();
  });

  it("shows no habits message when empty", () => {
    render(<StatsView {...baseProps} habits={[]} monthStats={{ habitPct: [], bestIdx: 0, worstIdx: 0, daysComplete: 0, above80: 0, generalPct: 0, streaks: [], longestStreaks: [], dailyCounts: [], dailyPct: [] } as MonthStats} />);
    expect(screen.getByText(/Agrega hábitos/)).toBeDefined();
  });

  it("renders the chart canvas", () => {
    const { container } = render(<StatsView {...baseProps} />);
    expect(container.querySelector("canvas")).toBeDefined();
  });
});
