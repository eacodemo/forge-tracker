import { useEffect, useRef, useMemo, useState } from "react";
import { Chart, registerables } from "chart.js";
import { CATEGORIES, makeKey, normalizeHabit } from "../utils/storage";
import { DAYS_IN_MONTH } from "../i18n/translations";
import { pctColor } from "../utils/colors";
import type { Habit, MonthStats } from "../types";
import type { TranslationSet } from "../i18n/translations";

Chart.register(...registerables);

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || "var(--fg)" }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function DualLineChart({ currentPct, prevPct, daysInMonth, monthName, prevMonthName, theme, L }:
  { currentPct: number[]; prevPct: number[]; daysInMonth: number; monthName: string; prevMonthName: string; theme: string; L: TranslationSet }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef  = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const isDark = theme === "dark";
    const grid   = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const lbl    = isDark ? "#60607a" : "#9896b2";
    const acc    = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || "#e63946";

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        datasets: [
          {
            label: monthName,
            data: currentPct.map(v => Math.round(v * 100)),
            borderColor: acc,
            backgroundColor: acc + "22",
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: acc,
            fill: true,
            tension: 0.35,
          },
          {
            label: prevMonthName,
            data: prevPct.slice(0, daysInMonth).map(v => Math.round(v * 100)),
            borderColor: isDark ? "#555570" : "#c0bce0",
            backgroundColor: "transparent",
            borderWidth: 1.5,
            pointRadius: 2,
            borderDash: [4, 3],
            fill: false,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: lbl, font: { size: 10, family: "JetBrainsMono" }, boxWidth: 12, padding: 14 },
          },
          tooltip: { callbacks: { label: (c: any) => ` ${c.dataset.label}: ${c.parsed.y}%` } },
        },
        scales: {
          x: { ticks: { color: lbl, font: { size: 10, family: "JetBrainsMono" }, maxRotation: 0 }, grid: { color: grid } },
          y: { min: 0, max: 100, ticks: { color: lbl, font: { size: 10, family: "JetBrainsMono" }, callback: (v: any) => `${v}%` }, grid: { color: grid } },
        },
      },
    });

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [currentPct, prevPct, daysInMonth, monthName, prevMonthName, theme]);

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>{L.stats.dailyProgress}</div>
        <div style={{ fontSize: 10, color: "var(--fg3)", fontFamily: "var(--fm)" }}>
          — — {prevMonthName}
        </div>
      </div>
      <div className="chart-wrap" style={{ height: 200 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

interface StatsViewProps {
  monthIdx: number;
  year: number;
  monthName: string;
  daysInMonth: number;
  habits: Habit[];
  checks: Record<string, true>;
  monthStats: MonthStats;
  L: TranslationSet;
  theme: string;
}

export default function StatsView({
  monthIdx, year, monthName, daysInMonth,
  habits, checks, monthStats, L, theme,
}: StatsViewProps) {
  const [period, setPeriod] = useState<"month"|"quarter"|"semester">("month");
  const prevMonth0    = monthIdx === 0 ? 11 : monthIdx - 1;
  const prevYear      = monthIdx === 0 ? year - 1 : year;
  const prevMonthName = L.months[prevMonth0];
  const prevDays      = DAYS_IN_MONTH(prevYear, prevMonth0);

  const prevPct = useMemo(() => {
    if (!habits.length) return [];
    return Array.from({ length: prevDays }, (_, i) => {
      const d   = i + 1;
      const cnt = habits.filter((_, hi) => checks[makeKey(prevYear, prevMonth0, hi, d)]).length;
      return cnt / habits.length;
    });
  }, [checks, habits, prevYear, prevMonth0, prevDays]);

  const weeklyData = useMemo(() => {
    if (!habits.length) return [];
    const weeks: { label: string; pct: number; range: string }[] = [];
    for (let w = 0; w < 4; w++) {
      const startDay = w * 7 + 1;
      const endDay   = Math.min(startDay + 6, daysInMonth);
      if (startDay > daysInMonth) break;
      let total = 0, possible = 0;
      for (let d = startDay; d <= endDay; d++) {
        habits.forEach((_, hi) => {
          possible++;
          if (checks[makeKey(year, monthIdx, hi, d)]) total++;
        });
      }
      weeks.push({ label: `S${w + 1}`, pct: possible > 0 ? total / possible : 0, range: `${startDay}–${endDay}` });
    }
    return weeks;
  }, [checks, habits, year, monthIdx, daysInMonth]);

  const periodMonths = period === "month" ? 1 : period === "quarter" ? 3 : 6;
  const periodStats = useMemo(() => {
    if (!habits.length || period === "month") return null;
    let totalChecks = 0, totalPossible = 0, totalPerfect = 0, totalDays = 0;
    for (let offset = 0; offset < periodMonths; offset++) {
      const mi = (monthIdx - offset + 12) % 12;
      const yi = monthIdx - offset < 0 ? year - 1 : year;
      const dim = DAYS_IN_MONTH(yi, mi);
      for (let d = 1; d <= dim; d++) {
        let dayDone = 0;
        habits.forEach((_, hi) => {
          if (checks[makeKey(yi, mi, hi, d)]) { totalChecks++; dayDone++; }
          totalPossible++;
        });
        totalDays++;
        if (dayDone === habits.length && habits.length > 0) totalPerfect++;
      }
    }
    return {
      compliance: totalPossible > 0 ? totalChecks / totalPossible : 0,
      perfectDays: totalPerfect,
      totalDays,
      checks: totalChecks,
    };
  }, [checks, habits, year, monthIdx, period, periodMonths]);

  if (!habits.length) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--fg3)" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>📊</div>
        <p style={{ fontSize: 14 }}>{L.stats.noHabits||"Agrega hábitos para ver estadísticas."}</p>
      </div>
    );
  }

  const {
    habitPct = [], bestIdx = 0, worstIdx = 0,
    daysComplete = 0, above80 = 0, generalPct = 0,
    streaks = [], longestStreaks = [],
    dailyPct = [], dailyCounts = [],
  } = monthStats;

  const pc = pctColor;

  const activeDays = dailyCounts.filter(c => c > 0).length;
  const avgPerDay  = activeDays > 0
    ? (dailyCounts.reduce((a, b) => a + b, 0) / activeDays).toFixed(1)
    : "0";

  const prevGeneral = prevPct.length > 0 ? prevPct.reduce((a, b) => a + b, 0) / prevPct.length : 0;
  const delta       = Math.round((generalPct - prevGeneral) * 100);
  const deltaLabel  = L.stats.vsPrev||"vs mes anterior";

  const habitName = (idx: number): string => {
    if (idx < 0 || idx >= habits.length) return "—";
    const h = normalizeHabit(habits[idx]);
    const n = h.name || "—";
    return n.length > 16 ? n.slice(0, 15) + "…" : n;
  };

  const catNames = L.catNames || {};
  const catStats = CATEGORIES.map(cat => {
    const ch = habits.map((h, hi) => ({ h: normalizeHabit(h), hi }))
      .filter(({ h }) => h.cat === cat.id);
    if (!ch.length) return null;
    const pct = ch.reduce((s, { hi }) => s + (habitPct[hi] || 0), 0) / ch.length;
    return { ...cat, label: catNames[cat.id] || cat.id, pct, count: ch.length };
  }).filter((x): x is NonNullable<typeof x> => x !== null).sort((a, b) => b.pct - a.pct);

  const sorted = habits.map((h, hi) => {
    const habit = normalizeHabit(h);
    return {
      hi,
      name:    habit.name,
      type:    habit.type,
      pct:     habitPct[hi] || 0,
      streak:  streaks[hi]  || 0,
      longest: longestStreaks[hi] || 0,
    };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <span style={{ fontSize:11, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1 }}>{L.stats.period || "Período"}</span>
        <div style={{ display:"flex", gap:4 }}>
          {(["month","quarter","semester"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`habit-chip${period===p ? " active" : ""}`}
              style={{ fontSize:11 }}>
              {p==="month"?L.stats.periodMonth:p==="quarter"?L.stats.periodQuarter:L.stats.periodSemester}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label={L.stats.compliance}
          value={`${Math.round(generalPct * 100)}%`}
          color={pc(generalPct)}
          sub={`${daysInMonth} ${L.stats.habits}`} />
        <StatCard label={deltaLabel}
          value={`${delta >= 0 ? "+" : ""}${delta}pp`}
          color={delta >= 0 ? "var(--success)" : "var(--danger)"}
          sub={`${Math.round(prevGeneral * 100)}% → ${Math.round(generalPct * 100)}%`} />
        <StatCard label={L.stats.perfectDays} value={daysComplete}
          color="var(--success)" sub="100% ✓" />
        <StatCard label={L.stats.activeDays}  value={activeDays} color="var(--acc)" />
        <StatCard label={L.stats.habitsAbove} value={above80}
          color="var(--gold)" sub={`/ ${habits.length}`} />
        <StatCard label={L.stats.avgDay}      value={avgPerDay} sub={L.stats.habits} />
        <StatCard label={L.stats.bestHabit}   value={habitName(bestIdx)}
          color="var(--success)"
          sub={`${Math.round((habitPct[bestIdx] || 0) * 100)}%`} />
        <StatCard label={L.stats.improve}     value={habitName(worstIdx)}
          color="var(--danger)"
          sub={`${Math.round((habitPct[worstIdx] || 0) * 100)}%`} />
      </div>

      {period !== "month" && periodStats && (
        <div className="card" style={{ marginBottom:14 }}>
          <div className="section-title" style={{ marginBottom:10 }}>
            {period==="quarter"?L.stats.periodQuarter:L.stats.periodSemester} — {periodStats.totalDays} {L.stats.days||"días"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--fg3)", marginBottom:3 }}>{L.stats.compliance}</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700, color:pc(periodStats.compliance) }}>{Math.round(periodStats.compliance*100)}%</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--fg3)", marginBottom:3 }}>{L.stats.perfectDays}</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700, color:"var(--success)" }}>{periodStats.perfectDays}</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--fg3)", marginBottom:3 }}>{L.stats.habits} ✓</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700, color:"var(--acc)" }}>{periodStats.checks}</div>
            </div>
          </div>
        </div>
      )}

      <DualLineChart
        currentPct={dailyPct}
        prevPct={prevPct}
        daysInMonth={daysInMonth}
        monthName={monthName}
        prevMonthName={prevMonthName}
        theme={theme}
        L={L}
      />

      {weeklyData.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>
            {L.stats.weeklyBreakdown||"Resumen semanal"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {weeklyData.map(w => (
              <div key={w.label} className="week-card">
                <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--fg3)", marginBottom: 6 }}>
                  {w.label}
                </div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 700, color: pc(w.pct) }}>
                  {Math.round(w.pct * 100)}%
                </div>
                <div style={{ fontSize: 10, color: "var(--fg4)", marginTop: 4 }}>
                  {L.stats.days||"días"} {w.range}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {catStats.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-title">{L.stats.byCategory}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {catStats.map(cat => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="cat-dot" style={{ background: cat.color, width: 9, height: 9, flexShrink: 0 }} />
                <span style={{ fontSize: 12, minWidth: 64, color: "var(--fg2)" }}>{cat.label}</span>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${cat.pct * 100}%`, background: cat.color }} />
                  </div>
                </div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 11, fontWeight: 700, minWidth: 34, textAlign: "right", color: cat.color }}>
                  {Math.round(cat.pct * 100)}%
                </span>
                <span style={{ fontSize: 10, color: "var(--fg3)", minWidth: 40 }}>
                  {cat.count} {L.stats.habits||"hábitos"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">{L.stats.ranking}</div>
        {sorted.map(({ hi, name, type, pct, streak, longest }, rank) => (
          <div key={`${hi}-${name}`} className="ranking-item">
            <span className="ranking-pos">
              {rank < 3
                ? ["🥇", "🥈", "🥉"][rank]
                : <span style={{ fontFamily: "var(--fm)", fontSize: 10.5, color: "var(--fg3)" }}>{rank + 1}</span>
              }
            </span>
            {type === "negative" && (
              <span style={{ fontSize: 10, color: "var(--gold)" }}>⚠</span>
            )}
            <span className="ranking-name">{name}</span>
            <div className="ranking-bar-wrap">
              <div className="ranking-bar-fill" style={{ width: `${pct * 100}%`, background: pc(pct) }} />
            </div>
            <span className="ranking-pct" style={{ color: pc(pct) }}>{Math.round(pct * 100)}%</span>
            <span style={{ fontSize: 10.5, color: "var(--streak)", minWidth: 34, textAlign: "right" }}>
              {streak > 0 ? `${streak}🔥` : ""}
            </span>
            <span style={{ fontSize: 10, color: "var(--fg4)", minWidth: 44, textAlign: "right" }}>
              {longest > 1 ? `max ${longest}d` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
