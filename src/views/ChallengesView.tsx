import { useState, useEffect, useCallback } from "react";
import type { Challenge, ChallengeStore, ChallengeConfig, Habit } from "../types";
import type { TranslationSet } from "../i18n/translations";
import ChallengeCard from "../components/ChallengeCard";
import ChallengeConfigPanel from "../components/ChallengeConfig";
import { loadChallengeStore, saveChallengeStore, cleanExpiredChallenges, generateDailyChallenges, updateChallengeProgress, getCompletedToday, getChallengeXP, DEFAULT_CONFIG } from "../utils/challenges";

interface ChallengesViewProps {
  habits: Habit[];
  checks: Record<string, true>;
  year: number;
  monthIdx: number;
  todayDay: number;
  L: TranslationSet;
  onChallengeCompleted?: (xp: number) => void;
}

export default function ChallengesView({ habits, checks, year, monthIdx, todayDay, L, onChallengeCompleted }: ChallengesViewProps) {
  const C = L.challenges;
  const [store, setStore] = useState<ChallengeStore>(() => cleanExpiredChallenges(loadChallengeStore()));
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const cleaned = cleanExpiredChallenges(store);
    if (cleaned.challenges !== store.challenges) {
      setStore(cleaned);
      saveChallengeStore(cleaned);
    }
  }, []);

  const generateNew = useCallback(() => {
    const newChallenges = generateDailyChallenges(habits, checks, year, monthIdx, todayDay, store.config, L);
    if (newChallenges.length > 0) {
      const updated = {
        ...store,
        challenges: [...store.challenges, ...newChallenges],
        lastGenerated: new Date().toISOString(),
      };
      setStore(updated);
      saveChallengeStore(updated);
    }
  }, [habits, checks, year, monthIdx, todayDay, store.config]);

  useEffect(() => {
    if (store.challenges.filter(c => c.status === "active").length === 0 && habits.length > 0) {
      generateNew();
    }
  }, []);

  useEffect(() => {
    const { updated, completed } = updateChallengeProgress(
      store.challenges, checks, habits, year, monthIdx, todayDay
    );
    if (completed.length > 0) {
      const xpGained = completed.reduce((sum, ch) => sum + ch.xpReward, 0);
      onChallengeCompleted?.(xpGained);
    }
    const hasChanges = updated.some((ch, i) => ch !== store.challenges[i]);
    if (hasChanges) {
      const newStore = { ...store, challenges: updated, completedTotal: store.completedTotal + completed.length };
      setStore(newStore);
      saveChallengeStore(newStore);
    }
  }, [checks]);

  const active = store.challenges.filter(c => c.status === "active");
  const completedToday = getCompletedToday(store);
  const totalXP = getChallengeXP(store);

  const handleConfigChange = (config: ChallengeConfig) => {
    const updated = { ...store, config };
    setStore(updated);
    saveChallengeStore(updated);
  };

  const handleClearExpired = () => {
    const updated = {
      ...store,
      challenges: store.challenges.filter(c => c.status !== "expired"),
    };
    setStore(updated);
    saveChallengeStore(updated);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 className="month-title" style={{ marginBottom: 0 }}>🎯 {C.title}</h1>
        <div style={{ display: "flex", gap: 7 }}>
          <button className="btn btn-ghost" onClick={() => setShowConfig(!showConfig)} style={{ fontSize: 12 }}>
            ⚙️ {C.config}
          </button>
          <button className="btn btn-primary" onClick={generateNew} style={{ fontSize: 12 }}>
            ✨ {C.generate}
          </button>
        </div>
      </div>

      {showConfig && (
        <ChallengeConfigPanel config={store.config} onChange={handleConfigChange} L={L} />
      )}

      {completedToday.length > 0 && (
        <div className="card" style={{
          marginBottom: 14,
          borderColor: "var(--gold)",
          background: "linear-gradient(135deg, var(--sf) 60%, var(--gold-dim))",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>
                {C.completedToday}: {completedToday.length}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg3)" }}>
                {C.totalXP}: {totalXP} XP
              </div>
            </div>
          </div>
          {completedToday.map(ch => (
            <div key={ch.id} style={{ fontSize: 11, color: "var(--fg2)", padding: "3px 0" }}>
              ✅ {ch.title} <span style={{ color: "var(--gold)" }}>+{ch.xpReward} XP</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "var(--fg3)", fontFamily: "var(--fm)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          {C.active} ({active.length})
        </div>
        {active.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--fg3)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 13 }}>{C.noActive}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.map(ch => (
              <ChallengeCard key={ch.id} challenge={ch} L={L} />
            ))}
          </div>
        )}
      </div>

      {store.challenges.filter(c => c.status === "expired").length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "var(--fg3)", fontFamily: "var(--fm)", textTransform: "uppercase", letterSpacing: 1 }}>
              {C.expired}
            </div>
            <button className="btn btn-ghost" onClick={handleClearExpired} style={{ fontSize: 10, padding: "3px 8px" }}>
              🗑
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {store.challenges.filter(c => c.status === "expired").slice(-3).reverse().map(ch => (
              <ChallengeCard key={ch.id} challenge={ch} L={L} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
