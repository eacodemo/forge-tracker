import type { ChallengeConfig } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface ChallengeConfigProps {
  config: ChallengeConfig;
  onChange: (config: ChallengeConfig) => void;
  L: TranslationSet;
}

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export default function ChallengeConfigPanel({ config, onChange, L }: ChallengeConfigProps) {
  const C = L.challenges;

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "var(--fg3)", fontFamily: "var(--fm)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        {C.config}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 6 }}>{C.difficulty}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => onChange({ ...config, difficulty: d })}
                className={`habit-chip${config.difficulty === d ? " active" : ""}`}
                style={{ flex: 1, fontSize: 11 }}>
                {d === "easy" ? C.easy : d === "medium" ? C.medium : C.hard}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--fg2)", cursor: "pointer" }}>
            <input type="checkbox" checked={config.dailyEnabled}
              onChange={e => onChange({ ...config, dailyEnabled: e.target.checked })} />
            {C.daily}
          </label>
        </div>
      </div>
    </div>
  );
}
