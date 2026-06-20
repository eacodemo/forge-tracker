import { LEVELS } from "../utils/gamification";
import { loadChallengeStore, getChallengeXP } from "../utils/challenges";
import type { Level, Badge, GamStats } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface GamifyViewProps {
  xp: number;
  levelData: Level;
  xpPct: number;
  badges: Badge[];
  earnedCount: number;
  gamStats: GamStats;
  L: TranslationSet;
}

export default function GamifyView({ xp, levelData, xpPct, badges, earnedCount, gamStats, L }: GamifyViewProps) {
  const G = L.gamify || {};
  const nextLevel = LEVELS.find(l=>l.level===levelData.level+1);
  const xpToNext  = nextLevel?nextLevel.xpMin-xp:0;
  const levelNames = G.levelNames || [];
  const challengeStore = loadChallengeStore();
  const challengeXP = getChallengeXP(challengeStore);
  const completedChallenges = challengeStore.challenges.filter(c => c.status === "completed").length;
  return (
    <div style={{ maxWidth:700 }}>
      <div className="card" style={{ marginBottom:14, borderColor:"var(--gold)", background:"linear-gradient(135deg,var(--sf) 60%,var(--gold-dim))" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:46, lineHeight:1, color:"var(--gold)" }}>{levelData.level}</div>
          <div>
            <div style={{ fontSize:10, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{G.level||"Nivel"}</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:21, fontWeight:700, color:"var(--fg)" }}>{levelNames[levelData.level-1]||levelData.name}</div>
            <div style={{ fontSize:11, color:"var(--fg3)", marginTop:1 }}>{xp.toLocaleString()} {G.totalXP||"XP total"}</div>
          </div>
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:10, color:"var(--fg3)", marginBottom:2 }}>{G.badges||"Badges"}</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:21, fontWeight:700, color:"var(--gold)" }}>{earnedCount}/{badges.length}</div>
          </div>
        </div>
        {nextLevel&&(
          <>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--fg3)", marginBottom:4, fontFamily:"var(--fm)" }}>
              <span>{levelNames[levelData.level-1]||levelData.name}</span>
              <span>{xpToNext.toLocaleString()} {G.nextLevel||"XP para"} Nv.{nextLevel.level}</span>
            </div>
            <div className="xp-bar-wrap"><div className="xp-bar-fill" style={{ width:`${xpPct}%` }}/></div>
          </>
        )}
        {!nextLevel&&<div style={{ textAlign:"center", color:"var(--gold)", fontFamily:"var(--fd)", fontSize:15, fontWeight:700 }}>👑 {G.maxLevel}</div>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(118px,1fr))", gap:9, marginBottom:14 }}>
        {[
          { label:G.totalChecks||"Checks", value:gamStats.totalChecks.toLocaleString(), icon:"✅" },
          { label:G.maxStreak||"Racha máx", value:`${gamStats.maxStreak}d`, icon:"🔥" },
          { label:G.perfectDaysG||"Días perfectos", value:gamStats.perfectDays, icon:"🌟" },
          { label:G.perfectWeeks||"Semanas perf.", value:gamStats.perfectWeeks, icon:"🏆" },
          { label:G.activeDaysG||"Días activos", value:gamStats.activeDaysMonth, icon:"📅" },
          { label:L.challenges?.completed || "Desafíos", value:completedChallenges, icon:"🎯" },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:20 }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize:19, color:"var(--gold)", marginTop:3 }}>{s.value}</div>
            <div className="stat-label" style={{ marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <div className="section-title">{G.badges||"Badges"}</div>
        <div className="badge-grid">
          {badges.map(b=>(
            <div key={b.id} className={`badge-item${b.earned?" earned":" locked"}`} title={b.desc}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              {b.earned&&<div style={{ fontSize:8.5, color:"var(--gold)", fontWeight:700, fontFamily:"var(--fm)" }}>✓ {G.earned||"EARNED"}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="section-title">{G.roadmap||"Mapa de niveles"}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {LEVELS.map(l=>{
            const isNow=l.level===levelData.level, isPast=l.level<levelData.level;
            return (
              <div key={l.level} style={{ display:"flex", alignItems:"center", gap:11, padding:"7px 11px", borderRadius:"var(--r-md)", background:isNow?"var(--gold-dim)":isPast?"var(--sf2)":"transparent", border:isNow?"1px solid var(--gold)":"1px solid transparent" }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:18, fontWeight:700, minWidth:26, color:isNow?"var(--gold)":isPast?"var(--success)":"var(--fg3)" }}>{isPast?"✓":l.level}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:isNow?"var(--gold)":isPast?"var(--fg2)":"var(--fg3)" }}>{levelNames[l.level-1]||l.name}</div>
                  <div style={{ fontSize:10, color:"var(--fg3)", fontFamily:"var(--fm)" }}>{l.xpMax===Infinity?`${l.xpMin.toLocaleString()}+ XP`:`${l.xpMin.toLocaleString()} – ${l.xpMax.toLocaleString()} XP`}</div>
                </div>
                {isNow&&<div style={{ fontSize:11, color:"var(--gold)", fontWeight:600 }}>{G.youAreHere||"← TÚ"}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
