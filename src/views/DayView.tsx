import { makeKey, isHabitScheduledForDay, normalizeHabit, CATEGORIES } from "../utils/storage";
import { pctColor } from "../utils/colors";
import type { Habit, MonthStats, Profile } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface DayViewProps {
  year: number;
  monthIdx: number;
  todayDay: number;
  habits: Habit[];
  checks: Record<string, true>;
  numeric: Record<string, number>;
  monthStats: MonthStats;
  toggleCheck: (hi: number, day: number) => void;
  L: TranslationSet;
  profile: Profile;
  xp: number;
}

export default function DayView({ year, monthIdx, todayDay, habits, checks, numeric, monthStats, toggleCheck, L, profile, xp }: DayViewProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? L.greeting.morning : hour < 19 ? L.greeting.afternoon : L.greeting.evening;
  const name = profile?.name || "";
  const scheduled = habits.map((h, hi) => ({ h, hi })).filter(({ h }) => isHabitScheduledForDay(normalizeHabit(h).schedule, year, monthIdx, todayDay));
  const done = scheduled.filter(({ hi }) => checks[makeKey(year, monthIdx, hi, todayDay)]).length;
  const total = scheduled.length;
  const pct = total ? done / total : 0;
  const color = pctColor(pct);

  const bestStreak = monthStats.streaks.reduce((a, b) => Math.max(a, b), 0);
  const daysComplete = monthStats.daysComplete;
  const monthName = L.months[monthIdx];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ textAlign: "center", padding: "28px 0 12px" }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>
          {greeting}{name ? `, ${name}` : ""} 👋
        </div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          {todayDay} de {monthName} {year}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="day-stat-card">
          <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 4 }}>{L.stats.compliance}</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color }}>{Math.round(pct * 100)}%</div>
          <div style={{ fontSize: 10, color: "var(--fg4)" }}>{done}/{total} {L.stats.habits}</div>
        </div>
        <div className="day-stat-card">
          <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 4 }}>🔥 {L.stats.maxStreak}</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color: bestStreak > 0 ? "var(--gold)" : "var(--fg3)" }}>{bestStreak}</div>
          <div style={{ fontSize: 10, color: "var(--fg4)" }}>{L.focus.consecutive}</div>
        </div>
        <div className="day-stat-card">
          <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 4 }}>⚔️ {L.gamify.totalXP}</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>{xp.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "var(--fg4)" }}>{L.gamify.totalXP}</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
          {scheduled.length > 0 ? `${done}/${total} ${L.stats.habits}` : L.stats.noHabits}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {scheduled.map(({ h, hi }) => {
            const habit = normalizeHabit(h);
            const checked = !!checks[makeKey(year, monthIdx, hi, todayDay)];
            const catColor = CATEGORIES.find(c => c.id === habit.cat)?.color || "var(--fg3)";
            const numVal = (numeric || {})[makeKey(year, monthIdx, hi, todayDay)];
            const streak = monthStats.streaks[hi];
            return (
              <div key={hi} className={`day-habit-card${checked ? " done" : ""}`}
                onClick={() => toggleCheck(hi, todayDay)}
                role="button" tabIndex={0}
                aria-label={`${habit.name}: ${checked ? "completado" : "pendiente"}`}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCheck(hi, todayDay); } }}>
                <span className="cat-dot" style={{ background: catColor, width: 10, height: 10 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
                    {habit.type === "negative" && <span style={{ fontSize: 10, color: "var(--gold)", marginRight: 3 }}>⚠</span>}
                    {habit.name}
                  </div>
                  {streak > 1 && <div style={{ fontSize: 10, color: "var(--fg3)" }}>{streak} {L.focus.consecutive} 🔥</div>}
                </div>
                {habit.type === "numeric" && habit.goal && (
                  <div style={{ fontSize: 11, color: "var(--fg3)", fontFamily: "var(--fm)" }}>
                    {numVal || 0}/{habit.goal}
                  </div>
                )}
                <div className="check-big" style={{ width: 28, height: 28, fontSize: 14 }}>
                  {checked ? (habit.type === "negative" ? "✗" : "✓") : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {daysComplete > 0 && (
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--fg4)", padding: "8px 0" }}>
          📅 {daysComplete} {L.stats.activeDays} {L.stats.vsPrev}
        </div>
      )}
    </div>
  );
}
