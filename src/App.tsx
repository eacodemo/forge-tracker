import { lazy, Suspense, useEffect } from "react";
import Onboarding  from "./components/Onboarding";
import ErrorBoundary from "./components/ErrorBoundary";
import { useHabitData } from "./hooks/useHabitData";
import { VERSION } from "./utils/constants";
import "./styles/global.css";

const TrackerView = lazy(() => import("./views/TrackerView"));
const StatsView   = lazy(() => import("./views/StatsView"));
const HeatmapView = lazy(() => import("./views/HeatmapView"));
const FocusView   = lazy(() => import("./views/FocusView"));
const ManageView  = lazy(() => import("./views/ManageView"));
const GamifyView  = lazy(() => import("./views/GamifyView"));
const DayView     = lazy(() => import("./views/DayView"));

export default function App() {
  const {
    data, view, setView, year, setYear, monthIdx, setMonthIdx,
    todayDay, todayMonth, todayYear, isCurrentMonth, monthName, daysInMonth,
    habits, checks, numeric, notes, profile, lang, theme, L,
    monthStats, gamStats, xp, levelData, badges, xpPct,
    initials, levelNames, toast, onboarded,
    update, setData, toggleCheck, setNumeric, setNote, toggleTheme, showToast, undo,
  } = useHabitData();

  const userName = profile?.name || "";
  const navItems = [
    {id:"day",    icon:"☀️", label:"Hoy"  },
    {id:"tracker",icon:"📅",label:L.nav.tracker},
    {id:"focus",  icon:"🎯",label:L.nav.today  },
    {id:"stats",  icon:"📊",label:L.nav.stats  },
    {id:"heatmap",icon:"🔥",label:L.nav.heatmap},
    {id:"gamify", icon:"⚔️", label:L.nav.xp     },
    {id:"manage", icon:"⚙️", label:L.nav.habits },
  ];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); }
      const viewMap: Record<string, string> = { "1":"day", "2":"tracker", "3":"focus", "4":"stats", "5":"heatmap", "6":"gamify", "7":"manage" };
      if (e.ctrlKey && viewMap[e.key]) { e.preventDefault(); setView(viewMap[e.key]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, setView]);

  if (!onboarded) {
    return (
      <div className={`app ${theme}`}>
        <Onboarding onComplete={d=>setData(d)}/>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <div className="header-brand">
          <span className="brand-name">Forge</span>
        </div>
        <nav className="nav" role="navigation" aria-label="Main navigation">
          {navItems.map(n=>(
            <button key={n.id} className={`nav-btn${view===n.id?" active":""}`} onClick={()=>setView(n.id)}
              aria-label={n.label} aria-current={view===n.id?"page":undefined}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="header-right">
          <div className="xp-mini">⚔️ {xp.toLocaleString()} XP</div>
          <div className="avatar-pill" onClick={()=>setView("manage")} title={userName}>
            <div className="avatar-circle">{initials}</div>
            <div className="avatar-info">
              <span className="avatar-name">{userName}</span>
              <span className="avatar-level">{(L.gamify&&L.gamify.lv)||"Nv."}{levelData.level} {levelNames[levelData.level-1]||""}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={toggleTheme}
            aria-label={theme==="dark"?"Switch to light theme":"Switch to dark theme"}>
            {theme==="dark"?"☀️":"🌙"}
          </button>
        </div>
      </header>

      <div className="main">
        <div className="view-scroll">
          {(view==="tracker"||view==="stats")&&(
            <div className="month-nav">
              <button className="nav-arrow" aria-label="Previous month"
                onClick={()=>{if(monthIdx===0){setMonthIdx(11);setYear(y=>y-1);}else setMonthIdx(m=>m-1);}}>‹</button>
              <h1 className="month-title">{monthName} {year}</h1>
              <button className="nav-arrow" aria-label="Next month"
                onClick={()=>{if(monthIdx===11){setMonthIdx(0);setYear(y=>y+1);}else setMonthIdx(m=>m+1);}}>›</button>
            </div>
          )}
          <Suspense fallback={<div className="view-loading">···</div>}>
            <ErrorBoundary name="DayView">{view==="day"&&<DayView year={year} monthIdx={monthIdx} todayDay={todayDay} habits={habits} checks={checks} numeric={numeric||{}} monthStats={monthStats} toggleCheck={toggleCheck} L={L} profile={profile}/>}</ErrorBoundary>
            <ErrorBoundary name="TrackerView">{view==="tracker"&&<TrackerView year={year} monthIdx={monthIdx} daysInMonth={daysInMonth} todayDay={todayDay} isCurrentMonth={isCurrentMonth} habits={habits} checks={checks} numeric={numeric||{}} notes={notes||{}} monthStats={monthStats} toggleCheck={toggleCheck} setNumeric={setNumeric} setNote={setNote} update={update} L={L}/>}</ErrorBoundary>
            <ErrorBoundary name="FocusView">{view==="focus"&&<FocusView year={year} monthIdx={monthIdx} todayDay={todayDay} isCurrentMonth={isCurrentMonth} habits={habits} checks={checks} monthStats={monthStats} toggleCheck={toggleCheck} L={L}/>}</ErrorBoundary>
            <ErrorBoundary name="StatsView">{view==="stats"&&<StatsView monthIdx={monthIdx} year={year} monthName={monthName} daysInMonth={daysInMonth} habits={habits} checks={checks} monthStats={monthStats} L={L} theme={theme}/>}</ErrorBoundary>
            <ErrorBoundary name="HeatmapView">{view==="heatmap"&&<HeatmapView checks={checks} habits={habits} year={year} L={L} setYear={setYear} setMonthIdx={setMonthIdx} setView={setView}/>}</ErrorBoundary>
            <ErrorBoundary name="GamifyView">{view==="gamify"&&<GamifyView xp={xp} levelData={levelData} xpPct={xpPct} badges={badges} earnedCount={badges.filter(b=>b.earned).length} gamStats={gamStats} L={L}/>}</ErrorBoundary>
            <ErrorBoundary name="ManageView">{view==="manage"&&<ManageView habits={habits} data={data} update={update} showToast={showToast} L={L} lang={lang} profile={profile}/>}</ErrorBoundary>
          </Suspense>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-brand">
          <span>Forge — {L.footer.createdBy} <span>eacodemo</span></span>
        </div>
        <div className="footer-right">
          <span>{todayYear}</span>
          <span className="footer-version">v{VERSION}</span>
          <span style={{color:"var(--fg4)"}}>{L.footer.license}</span>
        </div>
      </footer>

      {toast&&(
        <div className="toast" role="alert" aria-live="polite" style={{
          background:toast.type==="danger"?"var(--dang-dim)":toast.type==="gold"?"var(--gold-dim)":"var(--succ-dim)",
          color:     toast.type==="danger"?"var(--danger)":  toast.type==="gold"?"var(--gold)":    "var(--success)",
          border:`1px solid ${toast.type==="danger"?"var(--danger)":toast.type==="gold"?"var(--gold)":"var(--success)"}`,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
