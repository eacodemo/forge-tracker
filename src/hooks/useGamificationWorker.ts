import { useRef, useEffect, useState } from "react";
import type { GamStats, Level, Badge } from "../types";

interface GamResult {
  gamStats: GamStats;
  xp: number;
  levelData: Level;
  badges: Badge[];
  xpPct: number;
}

export function useGamificationWorker(
  checks: Record<string, true>,
  habits: { length: number; [index: number]: { cat?: string } },
): GamResult | null {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<GamResult | null>(null);
  const checksStr = JSON.stringify(checks);
  const habitCount = habits.length;

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../utils/gamification.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current.onmessage = (e) => setResult(e.data);
    return () => { workerRef.current?.terminate(); };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ checks, habits });
    }
  }, [checksStr, habitCount]);

  return result;
}
