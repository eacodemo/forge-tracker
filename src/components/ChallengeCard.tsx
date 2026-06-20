import type { Challenge } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface ChallengeCardProps {
  challenge: Challenge;
  L: TranslationSet;
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "0h";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const TYPE_ICONS: Record<string, string> = {
  racha: "🔥",
  consistencia: "📊",
  variedad: "🎨",
  superacion: "⚔️",
  recuperacion: "🔄",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "var(--success)",
  medium: "var(--gold)",
  hard: "var(--danger)",
};

export default function ChallengeCard({ challenge, L }: ChallengeCardProps) {
  const C = L.challenges;
  const pct = challenge.target > 0 ? Math.min((challenge.current / challenge.target) * 100, 100) : 0;
  const icon = TYPE_ICONS[challenge.type] || "🎯";
  const diffColor = DIFF_COLORS[challenge.difficulty] || "var(--fg3)";
  const isActive = challenge.status === "active";
  const isCompleted = challenge.status === "completed";

  return (
    <div className="card" style={{
      opacity: isActive ? 1 : 0.6,
      borderColor: isCompleted ? "var(--gold)" : isActive ? "var(--bdr)" : "var(--bdr2)",
      background: isCompleted ? "linear-gradient(135deg, var(--sf) 60%, var(--gold-dim))" : "var(--sf)",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{challenge.title}</div>
          <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{challenge.description}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: diffColor }}>
            {challenge.xpReward} XP
          </div>
          {isActive && (
            <div style={{ fontSize: 9, color: "var(--fg3)", marginTop: 2 }}>
              ⏰ {C.expiresIn} {timeLeft(challenge.expiresAt)}
            </div>
          )}
          {isCompleted && (
            <div style={{ fontSize: 9, color: "var(--gold)", marginTop: 2 }}>
              ✅ {C.completed}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--sf3)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: isCompleted ? "var(--gold)" : diffColor,
            transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: 10, fontFamily: "var(--fm)", fontWeight: 700, color: "var(--fg3)", minWidth: 40, textAlign: "right" }}>
          {challenge.current}/{challenge.target}
        </span>
      </div>
    </div>
  );
}
