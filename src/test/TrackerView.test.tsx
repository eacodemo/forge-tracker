import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TrackerView from "../views/TrackerView";
import type { Habit, MonthStats } from "../types";

const baseProps = {
  year: 2026,
  monthIdx: 5,
  daysInMonth: 30,
  todayDay: 15,
  isCurrentMonth: true,
  habits: [
    { name: "Leer", cat: "mente" as const, type: "boolean" as const },
    { name: "Ejercicio", cat: "salud" as const, type: "boolean" as const },
    { name: "Agua", cat: "salud" as const, type: "numeric" as const, goal: 8, unit: "vasos" },
  ],
  checks: {} as Record<string, true>,
  numeric: {} as Record<string, number>,
  notes: {} as Record<string, string>,
  monthStats: {
    habitPct: [0.5, 0.8, 0.3],
    bestIdx: 1, worstIdx: 2, daysComplete: 5, above80: 1, generalPct: 0.53,
    streaks: [3, 5, 0], longestStreaks: [7, 10, 2],
    dailyCounts: Array(30).fill(2), dailyPct: Array(30).fill(0.66),
  } as MonthStats,
  toggleCheck: vi.fn(),
  setNumeric: vi.fn(),
  setNote: vi.fn(),
  update: vi.fn(),
  L: {
    tracker: {
      habit: "Hábito", completedDay: "Completadas / día", notesDay: "Notas del día", search: "Filtrar hábitos…",
      noteTooltip: "Nota", dayLabel: "Día", notePlaceholder: "Nota del día…", reorderHint: "Arrastra para reordenar",
      checkDone: "Completado: {name}", checkPending: "Marcar completado: {name}",
      failDone: "Fallaste: {name} — click para desmarcar", failPending: "¿Fallaste hoy? {name}",
      numHint: "(+1 / clic derecho -1)", failShort: "Fallaste", doneShort: "Completado", failPendingShort: "¿Fallaste hoy?",
    },
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    dow: ["D", "L", "M", "X", "J", "V", "S"],
    dowFull: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    stats: { compliance: "Cumplimiento", habits: "hábitos" },
    manage: {},
    catNames: { salud: "Salud", trabajo: "Trabajo", mente: "Mente", social: "Social", habitos: "Rutina", otro: "Otro" },
  } as any,
};

describe("TrackerView", () => {
  it("renders habit names in the grid", () => {
    render(<TrackerView {...baseProps} />);
    expect(screen.getByText("Leer")).toBeDefined();
    expect(screen.getByText("Ejercicio")).toBeDefined();
    expect(screen.getByText("Agua")).toBeDefined();
  });

  it("renders day numbers", () => {
    render(<TrackerView {...baseProps} />);
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("15")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();
  });

  it("calls toggleCheck when clicking a check button", () => {
    render(<TrackerView {...baseProps} />);
    const buttons = screen.getAllByRole("button");
    const checkBtn = buttons.find(b => b.getAttribute("aria-label")?.includes("Marcar completado: Leer"));
    expect(checkBtn).toBeDefined();
    fireEvent.click(checkBtn!);
    expect(baseProps.toggleCheck).toHaveBeenCalled();
  });

  it("renders filter input", () => {
    const { container } = render(<TrackerView {...baseProps} />);
    const input = container.querySelector("input[type='text']");
    expect(input).toBeDefined();
  });

  it("shows checked state for completed habits", () => {
    const checks: Record<string, true> = { "2026-06-0-15": true };
    render(<TrackerView {...baseProps} checks={checks} />);
    expect(screen.getByText("✓")).toBeDefined();
  });

  it("renders numeric habit with value", () => {
    const numeric = { "2026-06-2-15": 5 };
    render(<TrackerView {...baseProps} numeric={numeric} />);
    expect(screen.getByLabelText("Agua: 5/8 vasos")).toBeDefined();
  });
});
