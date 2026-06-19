import { makeKey, isHabitScheduledForDay, CATEGORIES, normalizeHabit } from "../utils/storage";
import { pctColor } from "../utils/colors";
import { DAYS_IN_MONTH } from "../i18n/translations";
import type { Habit, MonthStats } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface FocusViewProps {
  year: number;
  monthIdx: number;
  todayDay: number;
  isCurrentMonth: boolean;
  habits: Habit[];
  checks: Record<string, true>;
  monthStats: MonthStats;
  toggleCheck: (hi: number, day: number) => void;
  L: TranslationSet;
}

export default function FocusView({ year, monthIdx, todayDay, isCurrentMonth, habits, checks, monthStats, toggleCheck, L }: FocusViewProps) {
  const displayDay = isCurrentMonth ? todayDay : Math.min(todayDay, DAYS_IN_MONTH(year, monthIdx));
  const scheduled = habits.map((h, hi) => ({ h, hi })).filter(({ h }) => isHabitScheduledForDay(normalizeHabit(h).schedule, year, monthIdx, displayDay));
  const done  = scheduled.filter(({ hi }) => checks[makeKey(year,monthIdx,hi,displayDay)]).length;
  const total = scheduled.length;
  const pct   = total ? done/total : 0;
  const monthName = L.months[monthIdx];
  const dateStr = `${displayDay} de ${monthName} ${year}`;
  const color = pctColor(pct);

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div className="focus-header">
        <div className="today-pill">🎯 {L.focus.mode}</div>
        <h2 style={{ fontFamily:"var(--fd)", fontSize:19, fontWeight:700, marginBottom:10 }}>{dateStr}</h2>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1 }}>
            <div className="progress-bar" style={{ height:10 }}>
              <div className="progress-fill" style={{ width:`${pct*100}%`, background:color }} />
            </div>
          </div>
          <span style={{ fontFamily:"var(--fm)", fontSize:13, fontWeight:700, color }}>{done}/{total}</span>
          <span style={{ fontFamily:"var(--fm)", fontSize:11, color:"var(--fg3)" }}>{Math.round(pct*100)}%</span>
        </div>
        {pct===1 && (
          <div style={{ marginTop:10, padding:"9px 13px", borderRadius:"var(--r-md)", background:"var(--gold-dim)", color:"var(--gold)", fontSize:13, fontWeight:600 }}>
            🏆 {L.focus.perfectDay}
          </div>
        )}
      </div>
      <div className="focus-grid">
        {habits.map((h,hi) => {
          const habit    = normalizeHabit(h);
          if (!isHabitScheduledForDay(habit.schedule, year, monthIdx, displayDay)) return null;
          const checked  = !!checks[makeKey(year,monthIdx,hi,displayDay)];
          const streak   = monthStats.streaks[hi];
          const catColor = CATEGORIES.find(c=>c.id===habit.cat)?.color||"var(--fg3)";
          return (
            <div key={hi} className={`focus-card${checked?" done":""}${habit.type==="negative"?" negative":""}`}
              onClick={() => toggleCheck(hi, displayDay)}
              role="button" tabIndex={0}
              aria-label={`${habit.name}: ${checked?"completado":"pendiente"}`}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCheck(hi, displayDay); } }}>
              <span className="cat-dot" style={{ background:catColor, width:9, height:9 }} />
              <div style={{ flex:1 }}>
                <div className="focus-habit-name">
                  {habit.type==="negative" && <span style={{ fontSize:11, color:"var(--gold)", marginRight:3 }}>⚠</span>}
                  {habit.name}
                </div>
                {streak>1 && <div className="focus-streak">{streak} {L.focus.consecutive} 🔥</div>}
              </div>
              <div className="check-big">{checked?(habit.type==="negative"?"✗":"✓"):""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
