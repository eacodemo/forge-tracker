import { useRef, useEffect, useState } from "react";
import { computeStats, computeXP, getLevel, getEarnedBadges } from "../utils/gamification";
import type { GamStats, Level, Badge } from "../types";

interface GamResult {
  gamStats: GamStats;
  xp: number;
  levelData: Level;
  badges: Badge[];
  xpPct: number;
}

function computeSync(checks: Record<string, true>, habits: { length: number; [index: number]: { cat?: string } }, archivedCheckCount: number): GamResult {
  const gamStats = computeStats(checks, habits, archivedCheckCount);
  const xp = computeXP(gamStats);
  const levelData = getLevel(xp);
  const badges = getEarnedBadges(gamStats);
  const xpPct = levelData.xpMax === Infinity
    ? 100
    : Math.round((xp - levelData.xpMin) / (levelData.xpMax - levelData.xpMin) * 100);
  return { gamStats, xp, levelData, badges, xpPct };
}

export function useGamificationWorker(
  checks: Record<string, true>,
  habits: { length: number; [index: number]: { cat?: string } },
  archivedCheckCount: number = 0,
): GamResult | null {
  const workerRef = useRef<Worker | null>(null);
  const failedRef = useRef(false);
  const [result, setResult] = useState<GamResult | null>(null);
  const checksStr = JSON.stringify(checks);
  const habitCount = habits.length;

  useEffect(() => {
    try {
      const w = new Worker(
        new URL("../utils/gamification.worker.ts", import.meta.url),
        { type: "module" },
      );
      w.onmessage = (e) => setResult(e.data);
      w.onerror = () => {
        failedRef.current = true;
        w.terminate();
        workerRef.current = null;
        setResult(computeSync(checks, habits, archivedCheckCount));
      };
      workerRef.current = w;
      return () => { w.terminate(); workerRef.current = null; };
    } catch {
      failedRef.current = true;
      setResult(computeSync(checks, habits, archivedCheckCount));
    }
  }, []);

  useEffect(() => {
    if (failedRef.current) {
      setResult(computeSync(checks, habits, archivedCheckCount));
      return;
    }
    if (workerRef.current) {
      workerRef.current.postMessage({ checks, habits, archivedCheckCount });
    }
  }, [checksStr, habitCount, archivedCheckCount]);

  return result;
}
