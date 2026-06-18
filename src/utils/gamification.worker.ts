import { computeStats, computeXP, getLevel, getEarnedBadges } from "./gamification";

interface WorkerMessage {
  checks: Record<string, true>;
  habits: { length: number; [index: number]: { cat?: string } };
}

interface WorkerResponse {
  gamStats: ReturnType<typeof computeStats>;
  xp: number;
  levelData: ReturnType<typeof getLevel>;
  badges: ReturnType<typeof getEarnedBadges>;
  xpPct: number;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { checks, habits } = e.data;
  const gamStats = computeStats(checks, habits);
  const xp       = computeXP(gamStats);
  const levelData= getLevel(xp);
  const badges   = getEarnedBadges(gamStats);
  const xpPct    = levelData.xpMax === Infinity
    ? 100
    : Math.round((xp - levelData.xpMin) / (levelData.xpMax - levelData.xpMin) * 100);
  const response: WorkerResponse = { gamStats, xp, levelData, badges, xpPct };
  self.postMessage(response);
};
