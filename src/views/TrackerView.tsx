import { useState, type DragEvent } from "react";
import { CATEGORIES, makeKey, makeNoteKey, normalizeHabit, isHabitScheduledForDay } from "../utils/storage";
import { pctColor } from "../utils/colors";
import type { Habit, MonthStats } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface CheckButtonProps {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
  numVal?: number;
  onNumeric: (val: number) => void;
  L: TranslationSet;
}

function CheckButton({ habit, checked, onToggle, numVal, onNumeric, L }: CheckButtonProps) {
  if (habit.type === "numeric") {
    const goal = habit.goal || 1;
    const val  = numVal || 0;
    const pct  = Math.min(val / goal, 1);
    return (
      <button className={`check-cell num${checked?" checked":""}`}
        style={{
          background: val > 0
            ? `linear-gradient(to top,var(--success) ${pct*100}%,var(--check-bg) ${pct*100}%)`
            : "var(--check-bg)",
          border: `2px solid ${val>0?"var(--success)":"var(--check-bdr)"}`,
          color: val > 0 ? "#fff" : "var(--fg3)",
        }}
        onClick={() => onNumeric(Math.min((val||0)+1, goal))}
        onContextMenu={e => { e.preventDefault(); onNumeric(Math.max((val||0)-1,0)); }}
        aria-label={`${habit.name}: ${val}/${goal}${habit.unit?" "+habit.unit:""}`}
        title={`${val}/${goal}${habit.unit?" "+habit.unit:""}  ${L.tracker.numHint}`}>
        {val > 0 ? val : ""}
      </button>
    );
  }
  const isNeg = habit.type === "negative";
  return (
    <button className={`check-cell${checked?" checked":""}${isNeg?" neg":""}`}
      onClick={onToggle}
      aria-label={isNeg ? (checked?L.tracker.failDone.replace("{name}",habit.name):L.tracker.failPending.replace("{name}",habit.name)) : (checked?L.tracker.checkDone.replace("{name}",habit.name):L.tracker.checkPending.replace("{name}",habit.name))}
      title={isNeg ? (checked?L.tracker.failShort:"¿Fallaste hoy?") : (checked?L.tracker.doneShort:L.tracker.checkPending)}>
      {checked ? (isNeg ? "✗" : "✓") : ""}
    </button>
  );
}

interface TrackerViewProps {
  year: number;
  monthIdx: number;
  daysInMonth: number;
  todayDay: number;
  isCurrentMonth: boolean;
  habits: Habit[];
  checks: Record<string, true>;
  numeric: Record<string, number>;
  notes: Record<string, string>;
  monthStats: MonthStats;
  toggleCheck: (hi: number, day: number) => void;
  setNumeric: (hi: number, day: number, val: number) => void;
  setNote: (day: number, text: string) => void;
  update: (patch: Partial<{ habits: Habit[]; checks: Record<string, true>; numeric: Record<string, number> }>) => void;
  L: TranslationSet;
}

export default function TrackerView({
  year, monthIdx, daysInMonth, todayDay, isCurrentMonth,
  habits, checks, numeric, notes, monthStats,
  toggleCheck, setNumeric, setNote, update, L,
}: TrackerViewProps) {
  const [openNoteDay, setOpenNoteDay] = useState<number | null>(null);
  const [dragIdx,     setDragIdx]     = useState<number | null>(null);
  const [overIdx,     setOverIdx]     = useState<number | null>(null);
  const [filter,      setFilter]      = useState("");
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const filteredHabits = habits
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => !filter || normalizeHabit(h).name.toLowerCase().includes(filter.toLowerCase()));
  const filteredIndices = filteredHabits.map(({ i }) => i);

  if (habits.length === 0) {
    return (
      <div style={{ padding:48, textAlign:"center", color:"var(--fg3)" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>📅</div>
        <div style={{ fontFamily:"var(--fd)", fontSize:18, fontWeight:700, color:"var(--fg)", marginBottom:8 }}>
          {L.tracker.empty}
        </div>
        <p style={{ fontSize:13, lineHeight:1.7, maxWidth:300, margin:"0 auto 20px" }}>
          {L.tracker.emptyHint.replace("{settings}", "⚙️ " + L.nav.habits)}
        </p>
      </div>
    );
  }

  function onDragStart(e: DragEvent, i: number) {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: DragEvent, i: number) {
    e.preventDefault();
    if (i !== dragIdx) setOverIdx(i);
  }
  function onDrop(e: DragEvent, i: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
    const next = [...habits];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);

    const oldToNew = Array.from({ length: habits.length }, (_, k) => k);
    oldToNew.splice(dragIdx, 1);
    oldToNew.splice(i, 0, dragIdx);
    const hiMap = new Map<number, number>();
    oldToNew.forEach((oldHi, newHi) => hiMap.set(oldHi, newHi));

    const nc: Record<string, true> = {};
    const nn: Record<string, number> = {};
    Object.keys(checks).forEach(k => {
      const m = k.match(/^(\d{4})-(\d{2})-(\d+)-(\d+)$/);
      if (!m) return;
      const oldHi = parseInt(m[3]);
      const newHi = hiMap.get(oldHi);
      if (newHi !== undefined) nc[makeKey(parseInt(m[1]),parseInt(m[2])-1,newHi,parseInt(m[4]))] = true;
    });
    Object.keys(numeric||{}).forEach(k => {
      const m = k.match(/^(\d{4})-(\d{2})-(\d+)-(\d+)$/);
      if (!m) return;
      const oldHi = parseInt(m[3]);
      const newHi = hiMap.get(oldHi);
      if (newHi !== undefined) nn[makeKey(parseInt(m[1]),parseInt(m[2])-1,newHi,parseInt(m[4]))] = (numeric||{})[k];
    });
    update({ habits: next, checks: nc, numeric: nn });
    setDragIdx(null); setOverIdx(null);
  }
  function onDragEnd() { setDragIdx(null); setOverIdx(null); }

  const thBase = { background:"var(--sf3)", borderBottom:"2px solid var(--bdr2)", padding:"7px 6px", fontSize:9.5, fontFamily:"var(--fm)", color:"var(--fg3)", textTransform:"uppercase", letterSpacing:1, textAlign:"center" as const, whiteSpace:"nowrap" };
  const isWeekSep = (d: number) => new Date(year, monthIdx, d).getDay() === 1;

  return (
    <div className="tracker-outer">
      {habits.length > 3 && (
        <div style={{ padding:"8px 12px", borderBottom:"1px solid var(--bdr)" }}>
          <input className="manage-input" value={filter} onChange={e=>setFilter(e.target.value)}
            placeholder={L.tracker.search || "Filtrar hábitos…"}
            style={{ maxWidth:260, fontSize:11.5 }} />
        </div>
      )}
      <table className="tracker-table">
        <thead>
          <tr>
            <th className="habit-name-th" title={L.tracker.reorderHint}>{L.tracker.habit} ↕</th>
            {days.map(d => (
              <th key={d} className={`day-th${isCurrentMonth&&d===todayDay?" t-col":""}${isWeekSep(d)?" wsep":""}`}>{d}</th>
            ))}
            <th style={{ ...thBase, minWidth:42 }}>%</th>
            <th style={{ ...thBase, minWidth:42 }}>🔥</th>
            <th style={{ ...thBase, minWidth:36 }}>📝</th>
          </tr>
        </thead>
        <tbody>
          {filteredHabits.map(({ h, i: hi }) => {
            const habit    = normalizeHabit(h);
            const pct      = monthStats.habitPct[hi];
            const streak   = monthStats.streaks[hi];
            const catColor = CATEGORIES.find(c=>c.id===habit.cat)?.color || "var(--fg3)";
            const rowClass = hi%2===0 ? "row-even" : "row-odd";
            const isDragging = dragIdx === hi;
            const isDragOver = overIdx === hi;

            return (
              <tr key={hi}
                className={`tracker-row ${rowClass}${isDragging?" dragging":""}${isDragOver?" drag-over":""}`}
                draggable
                onDragStart={e => onDragStart(e, hi)}
                onDragOver={e  => onDragOver(e, hi)}
                onDrop={e      => onDrop(e, hi)}
                onDragEnd={onDragEnd}
              >
                <td className="habit-name-cell" title={`${habit.name} — ${L.tracker.reorderHint}`}>
                  <span style={{ color:"var(--fg4)", fontSize:9, marginRight:5, fontFamily:"var(--fm)" }}>
                    {String(hi+1).padStart(2,"0")}
                  </span>
                  <span className="cat-dot" style={{ background:catColor }} />
                  {habit.type==="negative" && <span style={{ fontSize:10, color:"var(--gold)", marginRight:3 }}>⚠</span>}
                  {habit.name}
                </td>

                {days.map(d => {
                  const isToday = isCurrentMonth && d === todayDay;
                  const scheduled = isHabitScheduledForDay(habit.schedule, year, monthIdx, d);
                  const k       = makeKey(year, monthIdx, hi, d);
                  const checked = !!checks[k];
                  const numVal  = (numeric||{})[k];
                  if (!scheduled) {
                    return (
                      <td key={d} className={`check-td${isToday?" t-col":""}${isWeekSep(d)?" wsep":""}`}
                        style={{ color:"var(--fg4)", fontSize:10, textAlign:"center" }}>—</td>
                    );
                  }
                  return (
                    <td key={d} className={`check-td${isToday?" t-col":""}${isWeekSep(d)?" wsep":""}`}>
                      <CheckButton habit={habit} checked={checked}
                        onToggle={() => toggleCheck(hi, d)}
                        numVal={numVal} onNumeric={v => setNumeric(hi, d, v)} L={L} />
                    </td>
                  );
                })}

                <td className="pct-cell" style={{ color:pctColor(pct) }}>{Math.round(pct*100)}%</td>
                <td className="streak-cell">
                  {streak>0 ? `${streak}🔥` : <span style={{ color:"var(--fg4)" }}>—</span>}
                </td>
                <td style={{ padding:"2px 3px", textAlign:"center", borderBottom:"1px solid var(--bdr)", position:"relative", verticalAlign:"middle" }} />
              </tr>
            );
          })}

          <tr className="totals-row">
            <td className="habit-name-cell totals-label" style={{ background:"var(--sf3)" }}>
              {L.tracker.completedDay}
            </td>
            {days.map(d => {
              const cnt = habits.filter((h,hi) => isHabitScheduledForDay(normalizeHabit(h).schedule, year, monthIdx, d) && checks[makeKey(year,monthIdx,hi,d)]).length;
              const scheduledCount = habits.filter(h => isHabitScheduledForDay(normalizeHabit(h).schedule, year, monthIdx, d)).length;
              const pct = scheduledCount ? cnt/scheduledCount : 0;
              return (
                <td key={d} style={{
                  padding:"5px 1px", textAlign:"center", fontSize:10,
                  fontFamily:"var(--fm)", fontWeight:700,
                  color: pct>=0.8?"var(--success)":pct>=0.5?"var(--warn)":cnt>0?"var(--acc)":"var(--fg4)",
                  background: isCurrentMonth&&d===todayDay?"var(--acc-dim)":undefined,
                  borderLeft: isWeekSep(d)?"1px solid var(--week-sep)":undefined,
                }}>
                  {cnt>0?cnt:"·"}
                </td>
              );
            })}
            <td style={{ padding:"5px 7px", textAlign:"center", fontFamily:"var(--fm)", fontSize:11, fontWeight:700, color:"var(--acc)" }}>
              {Math.round(monthStats.generalPct*100)}%
            </td>
            <td colSpan={2} />
          </tr>

          {/* Notes */}
          <tr style={{ background:"var(--sf3)" }}>
            <td className="habit-name-cell totals-label" style={{ background:"var(--sf3)" }}>
              {L.tracker.notesDay}
            </td>
            {days.map(d => {
              const noteKey = makeNoteKey(year, monthIdx, d);
              const hasNote = !!(notes[noteKey]);
              const isOpen  = openNoteDay === d;
              return (
                <td key={d} style={{ padding:"3px 1px", textAlign:"center", position:"relative", borderLeft:isWeekSep(d)?"1px solid var(--week-sep)":undefined }}>
                  <button onClick={() => setOpenNoteDay(isOpen?null:d)} title={hasNote?notes[noteKey]:L.tracker.dayLabel} style={{
                    width:24, height:24, borderRadius:"var(--r-sm)",
                    border: hasNote?"1.5px solid var(--acc)":"1px solid var(--bdr2)",
                    background: hasNote?"var(--acc-dim)":"transparent",
                    color: hasNote?"var(--acc)":"var(--fg4)", cursor:"pointer", fontSize:11,
                  }}>
                    {hasNote?"📝":"·"}
                  </button>
                  {isOpen && (
                    <div style={{ position:"absolute", top:"110%", left:"50%", transform:"translateX(-50%)", zIndex:60, background:"var(--sf2)", border:"1px solid var(--bdr2)", borderRadius:"var(--r-md)", padding:10, width:178, boxShadow:"0 8px 32px rgba(0,0,0,.45)" }}>
                      <div style={{ fontSize:10, color:"var(--fg3)", marginBottom:5, fontFamily:"var(--fm)" }}>{L.tracker.dayLabel} {d}</div>
                      <textarea autoFocus className="note-input" rows={3}
                        defaultValue={notes[noteKey]||""}
                        placeholder={L.tracker.notePlaceholder}
                        onBlur={e => { setNote(d, e.target.value); setOpenNoteDay(null); }}
                        onKeyDown={e => { if(e.key==="Escape") setOpenNoteDay(null); }}
                      />
                    </div>
                  )}
                </td>
              );
            })}
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
