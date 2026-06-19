import { useMemo } from "react";
import { DAYS_IN_MONTH } from "../i18n/translations";
import { makeKey } from "../utils/storage";
import { pctColor } from "../utils/colors";
import type { Habit } from "../types";
import type { TranslationSet } from "../i18n/translations";

interface HeatmapViewProps {
  checks: Record<string, true>;
  habits: Habit[];
  year: number;
  L: TranslationSet;
  setYear: (fn: (y: number) => number) => void;
  setMonthIdx: (m: number) => void;
  setView: (v: string) => void;
}

export default function HeatmapView({ checks, habits, year, L, setYear, setMonthIdx, setView }: HeatmapViewProps) {
  const cells = useMemo(() => {
    const out: { m: number; d: number; pct: number }[] = [];
    for (let m=0;m<12;m++) {
      const days = DAYS_IN_MONTH(year,m);
      for (let d=1;d<=days;d++) {
        let count=0;
        habits.forEach((_,hi)=>{ if(checks[makeKey(year,m,hi,d)]) count++; });
        out.push({m,d,pct:habits.length?count/habits.length:0});
      }
    }
    return out;
  },[checks,habits,year]);

  const startDow=new Date(year,0,1).getDay(),COLS=53,ROWS=7;
  const grid:(typeof cells[number]|null)[]=Array(COLS*ROWS).fill(null);
  cells.forEach((c,i)=>{ const s=startDow+i; if(s<COLS*ROWS) grid[s]=c; });
  function hc(p: number){ return p===0?"heat-0":p<0.3?"heat-1":p<0.6?"heat-2":p<0.9?"heat-3":"heat-4"; }

  const monthlyStats = useMemo(() => L.months.map((_: string, m: number)=>{
    const days=DAYS_IN_MONTH(year,m); let tot=0,pos=0;
    for(let d=1;d<=days;d++) habits.forEach((_,hi)=>{ pos++; if(checks[makeKey(year,m,hi,d)]) tot++; });
    return pos>0?tot/pos:0;
  }),[checks,habits,year,L.months]);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
        <button className="nav-arrow" aria-label="Previous year" onClick={()=>setYear(y=>y-1)}>‹</button>
        <h1 className="month-title" style={{ minWidth:80 }}>{year}</h1>
        <button className="nav-arrow" aria-label="Next year" onClick={()=>setYear(y=>y+1)}>›</button>
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <div className="section-title" style={{ marginBottom:3 }}>{L.heatmap.annualActivity} {year}</div>
        <p style={{ color:"var(--fg3)",fontSize:12,marginBottom:14 }}>{L.heatmap.cellInfo}</p>
        {habits.length === 0 ? (
          <div style={{ padding:24, textAlign:"center", color:"var(--fg3)" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📅</div>
            <div style={{ fontSize:13 }}>{L.heatmap.empty}</div>
          </div>
        ) : (
        <div style={{ display:"flex",gap:8 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:2,paddingTop:18,flexShrink:0 }}>
            {L.dow.map((d: string,i: number)=>(
              <div key={d} style={{ height:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--fg3)",fontFamily:"var(--fm)",width:10 }}>
                {i%2===1?d:""}
              </div>
            ))}
          </div>
          <div style={{ overflow:"auto" }}>
            <div style={{ display:"flex",gap:2,marginBottom:3 }}>
              {Array.from({length:COLS}).map((_,col)=>{
                const cell=grid[col*ROWS+1]||grid[col*ROWS];
                const show=cell&&(col===0||grid[(col-1)*ROWS+1]?.m!==cell.m);
                return <div key={col} style={{ width:12,fontSize:9,color:"var(--fg3)",fontFamily:"var(--fm)",overflow:"hidden",whiteSpace:"nowrap" }}>{show?(L.monthsShort||L.months.map((m: string)=>m.slice(0,3)))[cell.m]:""}</div>;
              })}
            </div>
            <div className="heatmap-wrap">
              {Array.from({length:COLS}).map((_,col)=>(
                <div key={col} className="heatmap-col">
                  {Array.from({length:ROWS}).map((_,row)=>{
                    const cell=grid[col*ROWS+row];
                    if(!cell) return <div key={row} style={{ width:12,height:12 }}/>;
                    return <div key={row} className={`heatmap-cell ${hc(cell.pct)}`}
                      title={`${L.months[cell.m]} ${cell.d}: ${Math.round(cell.pct*100)}%`}
                      aria-label={`${L.months[cell.m]} ${cell.d}: ${Math.round(cell.pct*100)}%`}
                      role="button" tabIndex={0}
                      onClick={()=>{ setMonthIdx(cell.m); setView("tracker"); }}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMonthIdx(cell.m); setView("tracker"); } }}/>;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
        <div style={{ display:"flex",gap:5,alignItems:"center",marginTop:10,fontSize:11,color:"var(--fg3)" }}>
          <span>{L.heatmap.less}</span>
          {["heat-0","heat-1","heat-2","heat-3","heat-4"].map(c=><div key={c} className={`heatmap-cell ${c}`} style={{ flexShrink:0,cursor:"default" }}/>)}
          <span>{L.heatmap.more}</span>
        </div>
      </div>
      <div className="card">
        <div className="section-title" style={{ marginBottom:11 }}>{L.heatmap.monthly}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {L.months.map((m: string,i: number)=>{
            const p=monthlyStats[i];
            const c=pctColor(p);
            return (
              <div key={m} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}
                onClick={()=>{ setMonthIdx(i); setView("tracker"); }}>
                <span style={{ fontFamily:"var(--fm)",fontSize:10,color:"var(--fg3)",minWidth:32 }}>{(L.monthsShort||[])[i]||m.slice(0,3)}</span>
                <div style={{ flex:1 }}><div className="progress-bar"><div className="progress-fill" style={{ width:`${p*100}%`,background:c }}/></div></div>
                <span style={{ fontFamily:"var(--fm)",fontSize:10.5,fontWeight:700,minWidth:34,textAlign:"right",color:c }}>{p>0?`${Math.round(p*100)}%`:"—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
