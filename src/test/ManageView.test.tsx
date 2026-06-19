import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ManageView from "../views/ManageView";
import type { Data } from "../types";

const baseData: Data = {
  version: "1.3.1",
  onboarded: true,
  profile: { name: "Test", lang: "es", theme: "dark", accent: "red", notifHour: 21 },
  habits: [
    { name: "Leer", cat: "mente", type: "boolean" },
    { name: "Ejercicio", cat: "salud", type: "boolean" },
  ],
  checks: {},
  numeric: {},
  notes: {},
};

const baseProps = {
  habits: baseData.habits,
  data: baseData,
  update: vi.fn(),
  showToast: vi.fn(),
  lang: "es",
  profile: baseData.profile,
  L: {
    manage: {
      title: "Hábitos", newHabit: "+ Nuevo hábito", save: "Guardar", cancel: "Cancelar",
      name: "Nombre del hábito…", typeNormal: "Normal", typeNeg: "Negativo", typeNum: "Numérico",
      descNormal: "✓ Marcar cuando lo haces", descNeg: "⚠ Marcar cuando FALLAS", descNum: "# Meta por cantidad",
      categories: "Categorías", typesLegend: "Tipos de hábito", data: "Datos",
      exportJSON: "Export JSON", exportCSV: "Export CSV", importJSON: "Import JSON",
      testNotif: "Test notificación", notifDesktopOnly: "Solo disponible en app de escritorio",
      danger: "Zona peligrosa", deleteAll: "Borrar todos los datos", deleteConfirm: "¿Borrar TODOS los datos? Irreversible.",
      backupWarning: "⚠️ Importar sobreescribirá todos los datos actuales. Exporta primero.",
      deleteHabitConfirm: "¿Eliminar este hábito? Se perderán sus datos históricos.",
      toastAdded: "agregado", toastUpdated: "Hábito actualizado", toastDeleted: "Hábito eliminado",
      toastExportJSON: "Backup JSON exportado", toastExportCSV: "CSV exportado", toastImported: "Datos importados",
      toastNotif: "Notificación enviada",
      schedDaily: "Diario", schedWeekdays: "Días de semana", schedInterval: "Cada X días",
      schedDays: "Días", schedEvery: "Cada", schedDays2: "días", schedStartDay: "Empieza día",
    },
    settings: { title: "Configuración", lang: "Idioma", theme: "Tema", accent: "Color de acento", notifTime: "Hora de recordatorio", profile: "Perfil", username: "Tu nombre", save: "Guardar cambios", saved: "¡Guardado!" },
  } as any,
};

describe("ManageView", () => {
  it("renders the habits title", () => {
    render(<ManageView {...baseProps} />);
    expect(screen.getByText(/Hábitos/)).toBeDefined();
  });

  it("renders existing habits", () => {
    render(<ManageView {...baseProps} />);
    expect(screen.getByText("Leer")).toBeDefined();
    expect(screen.getByText("Ejercicio")).toBeDefined();
  });

  it("renders new habit button", () => {
    render(<ManageView {...baseProps} />);
    expect(screen.getByText("+ Nuevo hábito")).toBeDefined();
  });

  it("renders export buttons", () => {
    render(<ManageView {...baseProps} />);
    expect(screen.getByText(/Export JSON/)).toBeDefined();
    expect(screen.getByText(/Export CSV/)).toBeDefined();
  });

  it("renders settings section", () => {
    render(<ManageView {...baseProps} />);
    fireEvent.click(screen.getByText(/⚙️ Config/));
    expect(screen.getByText(/Configuración/)).toBeDefined();
  });

  it("renders danger zone", () => {
    render(<ManageView {...baseProps} />);
    expect(screen.getByText(/Zona peligrosa/)).toBeDefined();
    expect(screen.getByText(/Borrar todos los datos/)).toBeDefined();
  });
});
