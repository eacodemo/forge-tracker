import { useEffect } from "react";
import { ACCENT_PALETTES } from "./storage.js";

export function useAccent(accentId: string, theme: string): void {
  useEffect(() => {
    const palette = ACCENT_PALETTES.find(p => p.id === accentId) || ACCENT_PALETTES[0];
    const v = theme === "dark" ? palette.dark : palette.light;
    const r = document.documentElement;
    r.style.setProperty("--acc",      v.accent);
    r.style.setProperty("--acc-dim",  v.dim);
    r.style.setProperty("--acc-glow", v.glow);
    r.style.setProperty("--acc-dark", v.dark2);
    r.style.setProperty("--acc-1", v.dim.replace(/[\d.]+\)$/, "0.45)"));
    r.style.setProperty("--acc-2", v.dim.replace(/[\d.]+\)$/, "0.72)"));
  }, [accentId, theme]);
}
