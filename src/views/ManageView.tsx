import { useState, useEffect } from "react";
import { exportJSON, exportCSV, importJSON, CATEGORIES, ACCENT_PALETTES, normalizeHabit } from "../utils/storage";
import { LANGS } from "../i18n/translations";
import Modal from "../components/Modal";
import type { Data, Habit, HabitSchedule, Profile } from "../types";
import type { TranslationSet } from "../i18n/translations";

const KEY_RE = /^(\d{4})-(\d{2})-(\d+)-(\d+)$/;

const TYPES = (L: TranslationSet) => [
  { id:"boolean",  label:L.manage.typeNormal, desc:L.manage.descNormal },
  { id:"negative", label:L.manage.typeNeg,    desc:L.manage.descNeg    },
  { id:"numeric",  label:L.manage.typeNum,    desc:L.manage.descNum    },
];

function HabitForm({ initial, onSave, onCancel, L, lang }:
  { initial?: Partial<Habit>; onSave: (h: Habit) => void; onCancel: () => void; L: TranslationSet; lang: string }) {
  const [name, setName] = useState(initial?.name||"");
  const [cat,  setCat]  = useState<string>(initial?.cat||"habitos");
  const [type, setType] = useState<string>(initial?.type||"boolean");
  const [goal, setGoal] = useState(initial?.goal||8);
  const [unit, setUnit] = useState(initial?.unit||"unidades");
  const [schedType, setSchedType] = useState<string>(initial?.schedule?.type || "daily");
  const [schedInterval, setSchedInterval] = useState(initial?.schedule?.interval || 2);
  const [schedStartDay, setSchedStartDay] = useState(initial?.schedule?.startDay || 1);
  const catNames = L.catNames || {};
  function submit() {
    if (!name.trim()) return;
    const schedule: HabitSchedule | undefined = schedType === "daily" ? undefined : {
      type: schedType as HabitSchedule["type"],
      ...(schedType === "interval" ? { interval: schedInterval, startDay: schedStartDay } : {}),
    };
    onSave({ name:name.trim(), cat, type, schedule, ...(type==="numeric"?{goal:Number(goal),unit}:{}) } as Habit);
  }
  return (
    <div className="habit-form">
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        <input className="manage-input" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={L.manage.name} autoFocus/>
        <div className="habit-form-row">
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} className={`habit-chip${cat===c.id?" active":""}`}
              style={cat===c.id?{borderColor:c.color,color:c.color}:{}}>
              <span className="dot" style={{ background:c.color }}/>
              {catNames[c.id]||c.id}
            </button>
          ))}
        </div>
        <div className="habit-form-row">
          {TYPES(L).map(t=>(
            <button key={t.id} onClick={()=>setType(t.id)} title={t.desc}
              className={`habit-chip${type===t.id?" active":""}`}>{t.label}</button>
          ))}
        </div>
        {type==="numeric"&&(
          <div style={{ display:"flex", gap:8 }}>
            <input className="manage-input" type="number" min={1} max={100} value={goal} onChange={e=>setGoal(Number(e.target.value))} style={{ maxWidth:76 }}/>
            <input className="manage-input" value={unit} onChange={e=>setUnit(e.target.value)} placeholder="Unidad"/>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ fontSize:10, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1 }}>{L.manage.schedDays || "Frecuencia"}</div>
          <div className="habit-form-row">
            {(["daily","weekdays","interval"] as const).map(st => (
              <button key={st} onClick={()=>setSchedType(st)}
                className={`habit-chip${schedType===st?" active":""}`}>
                {st==="daily"?L.manage.schedDaily:st==="weekdays"?L.manage.schedWeekdays:L.manage.schedInterval}
              </button>
            ))}
          </div>
          {schedType==="interval"&&(
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"var(--fg3)" }}>{L.manage.schedEvery || "Cada"}</span>
              <input className="manage-input" type="number" min={2} max={365} value={schedInterval}
                onChange={e=>setSchedInterval(Number(e.target.value))} style={{ width:50 }}/>
              <span style={{ fontSize:11, color:"var(--fg3)" }}>{L.manage.schedDays2 || "días"}</span>
              <span style={{ fontSize:11, color:"var(--fg4)", marginLeft:6 }}>{L.manage.schedStartDay || "Empieza día"}</span>
              <input className="manage-input" type="number" min={1} max={31} value={schedStartDay}
                onChange={e=>setSchedStartDay(Number(e.target.value))} style={{ width:50 }}/>
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <button className="btn btn-primary" onClick={submit}>{L.manage.save}</button>
          <button className="btn btn-ghost"   onClick={onCancel}>{L.manage.cancel}</button>
        </div>
      </div>
    </div>
  );
}

interface ManageViewProps {
  habits: Habit[];
  data: Data;
  update: (patch: Partial<Data>) => void;
  showToast: (msg: string, type?: string) => void;
  L: TranslationSet;
  lang: string;
  profile: Profile;
}

export default function ManageView({ habits, data, update, showToast, L, lang, profile }: ManageViewProps) {
  const [adding,  setAdding]  = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ title: string; message: string; danger: boolean; onConfirm: () => void }>({
    title: "", message: "", danger: false, onConfirm: () => {},
  });

  const [sName,   setSName]   = useState<string>(profile?.name||"");
  const [sLang,   setSLang]   = useState<string>(profile?.lang||"es");
  const [sTheme,  setSTheme]  = useState<string>(profile?.theme||"dark");
  const [sAccent, setSAccent] = useState<string>(profile?.accent||"red");
  const [sNotif,  setSNotif]  = useState<number>(profile?.notifHour??21);

  useEffect(() => {
    setSName(profile?.name||"");
    setSLang(profile?.lang||"es");
    setSTheme(profile?.theme||"dark");
    setSAccent(profile?.accent||"red");
    setSNotif(profile?.notifHour??21);
  }, [profile]);

  function addHabit(h: Habit) { update({ habits:[...habits,h] } as Partial<Data>); setAdding(false); showToast(`"${h.name}" ${L.manage.toastAdded}`); }
  function saveEdit(i: number, h: Habit) { update({ habits:habits.map((o,idx)=>idx===i?h:o) } as Partial<Data>); setEditIdx(null); showToast(L.manage.toastUpdated); }
  function deleteHabit(i: number) {
    setModalConfig({
      title: L.manage.deleteHabitConfirm,
      message: `${L.manage.deleteHabitConfirm} "${habits[i]?.name || ""}"`,
      danger: true,
      onConfirm: () => {
        const next=habits.filter((_,idx)=>idx!==i);
        const nc: Record<string, true> = {};
        Object.keys(data.checks).forEach(k=>{ const m=k.match(KEY_RE); if(!m)return; const hi=parseInt(m[3]); if(hi===i)return; const ni=hi>i?hi-1:hi; nc[`${m[1]}-${m[2]}-${ni}-${m[4]}`]=true; });
        update({ habits:next, checks:nc } as Partial<Data>);
        showToast(L.manage.toastDeleted,"danger");
        setModalOpen(false);
      },
    });
    setModalOpen(true);
  }
  function moveHabit(i: number, dir: number) {
    const j=i+dir; if(j<0||j>=habits.length)return;
    const next=[...habits]; [next[i],next[j]]=[next[j],next[i]];
    const nc: Record<string, true> = {};
    Object.keys(data.checks).forEach(k=>{ const m=k.match(KEY_RE); if(!m){nc[k]=true;return;} const hi=parseInt(m[3]); nc[`${m[1]}-${m[2]}-${hi===i?j:hi===j?i:hi}-${m[4]}`]=true; });
    update({ habits:next, checks:nc } as Partial<Data>);
  }
  function saveSettings() {
    const newProfile: Profile = {
      ...profile,
      name:      sName.trim() || "Usuario",
      lang:      sLang as Profile["lang"],
      theme:     sTheme as Profile["theme"],
      accent:    sAccent as Profile["accent"],
      notifHour: sNotif,
    };
    update({ profile: newProfile } as Partial<Data>);
    showToast(L.settings?.saved || "¡Guardado!");
    setSettingsOpen(false);
  }
  const sSTheme = sTheme;

  const catNames = L.catNames || {};

  return (
    <div style={{ maxWidth:660, display:"flex", flexDirection:"column", gap:20 }}>
      {/* Habits section */}
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:11 }}>
          <h2 className="section-title" style={{ marginBottom:0 }}>{L.manage.title} ({habits.length})</h2>
          <div style={{ display:"flex", gap:7 }}>
            <button className="btn btn-ghost" onClick={()=>setSettingsOpen(!settingsOpen)} style={{ fontSize:12 }}>⚙️ Config</button>
            <button className="btn btn-primary" onClick={()=>{ setAdding(true); setEditIdx(null); }}>{L.manage.newHabit}</button>
          </div>
        </div>

        {settingsOpen && (
          <div className="settings-panel">
            <div className="section-title" style={{ marginBottom:12 }}>{L.settings?.title||"Configuración"}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div className="settings-group">
                <div className="settings-label">{L.settings?.username||"Nombre"}</div>
                <input className="manage-input" value={sName} onChange={e=>setSName(e.target.value)} placeholder="Tu nombre"/>
              </div>
              <div className="settings-group">
                <div className="settings-label">{L.settings?.lang||"Idioma"}</div>
                <div className="settings-row">
                  {Object.values(LANGS).map(l=>(
                    <button key={l.code} onClick={()=>setSLang(l.code)}
                      className={`settings-option${sLang===l.code?" active":""}`}>{l.flag} {l.name}</button>
                  ))}
                </div>
              </div>
              <div className="settings-group">
                <div className="settings-label">{L.settings?.theme||"Tema"}</div>
                <div className="settings-row">
                  {["dark","light"].map(t=>(
                    <button key={t} onClick={()=>setSTheme(t)}
                      className={`settings-option${sSTheme===t?" active":""}`}>{t==="dark"?"🌙 Oscuro":"☀️ Claro"}</button>
                  ))}
                </div>
              </div>
              <div className="settings-group">
                <div className="settings-label">{L.settings?.accent||"Color"}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {ACCENT_PALETTES.map(p=>{
                    const c=sSTheme==="dark"?p.dark.accent:p.light.accent;
                    return <button key={p.id} title={p.name} onClick={()=>setSAccent(p.id)}
                      className="accent-swatch" style={{ background:c, border:`3px solid ${sAccent===p.id?"var(--fg)":"transparent"}`,
                        transform:sAccent===p.id?"scale(1.18)":"scale(1)" }}/>;
                  })}
                </div>
              </div>
              <div className="settings-group">
                <div className="settings-label">{L.settings?.notifTime||"Recordatorio"}</div>
                <div className="settings-row">
                  {[8,12,18,20,21,22].map(h=>(
                    <button key={h} onClick={()=>setSNotif(h)}
                      className={`settings-option${sNotif===h?" active":""}`}
                      style={{ fontFamily:"var(--fm)" }}>{h}:00</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveSettings}>{L.settings?.save||"Guardar"}</button>
            </div>
          </div>
        )}

        {adding && <HabitForm onSave={addHabit} onCancel={()=>setAdding(false)} L={L} lang={lang}/>}

        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {habits.slice(0, showAll ? undefined : MAX_VISIBLE).map((h,i)=>{
            const habit=normalizeHabit(h);
            const cc=CATEGORIES.find(c=>c.id===habit.cat)?.color||"var(--fg3)";
            return (
              <div key={i}>
                {editIdx===i
                  ? <HabitForm initial={habit} onSave={nh=>saveEdit(i,nh)} onCancel={()=>setEditIdx(null)} L={L} lang={lang}/>
                  : (
                    <div className="habit-item">
                      <span style={{ color:"var(--fg4)", fontFamily:"var(--fm)", fontSize:9.5, minWidth:20, textAlign:"right" }}>{String(i+1).padStart(2,"0")}</span>
                      <span className="cat-dot" style={{ background:cc }}/>
                      {habit.type==="negative"&&<span style={{ fontSize:10, color:"var(--gold)" }}>⚠</span>}
                      {habit.type==="numeric" &&<span style={{ fontSize:10, color:"var(--success)" }}>#{habit.goal}</span>}
                      <span style={{ flex:1, fontSize:12.5, color:"var(--fg)" }}>{habit.name}</span>
                      <div style={{ display:"flex", gap:3 }}>
                        <button onClick={()=>moveHabit(i,-1)} disabled={i===0} className="btn btn-ghost" style={{ padding:"3px 7px", opacity:i===0?0.3:1 }}>↑</button>
                        <button onClick={()=>moveHabit(i,1)} disabled={i===habits.length-1} className="btn btn-ghost" style={{ padding:"3px 7px", opacity:i===habits.length-1?0.3:1 }}>↓</button>
                        <button onClick={()=>{ setEditIdx(i); setAdding(false); }} className="btn btn-ghost" style={{ padding:"3px 9px", color:"var(--acc)" }}>✏️</button>
                        <button onClick={()=>deleteHabit(i)} className="btn btn-danger" style={{ padding:"3px 9px" }}>🗑</button>
                      </div>
                    </div>
                  )
                }
              </div>
            );
          })}
          {habits.length > MAX_VISIBLE && !showAll && (
            <button className="btn btn-ghost" onClick={() => setShowAll(true)} style={{ marginTop:6, fontSize:12 }}>
              +{habits.length - MAX_VISIBLE} {L.manage.showMore || "más"}
            </button>
          )}
        </div>
      </div>

      {/* Data section */}
      <div style={{ borderTop:"1px solid var(--bdr)", paddingTop:18 }}>
        <h2 className="section-title">{L.manage.data}</h2>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:11 }}>
          <button className="btn btn-ghost" onClick={()=>{ exportJSON(data); showToast(L.manage.toastExportJSON); }}>💾 {L.manage.exportJSON}</button>
          <button className="btn btn-ghost" onClick={()=>{ exportCSV(data); showToast(L.manage.toastExportCSV); }}>📊 {L.manage.exportCSV}</button>
          <label className="btn btn-ghost" style={{ cursor:"pointer" }}>
            📂 {L.manage.importJSON}
            <input type="file" accept=".json" style={{ display:"none" }} onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; importJSON(f,d=>{update(d as any);showToast(L.manage.toastImported);},err=>showToast(`Error: ${err}`,"danger")); e.target.value=""; }}/>
          </label>
          <button className="btn btn-ghost" onClick={()=>{
            window.electronAPI?.notify("🎯 Forge","Test OK");
            if(!window.electronAPI) showToast(L.manage.notifDesktopOnly,"danger");
            else showToast(L.manage.toastNotif,"gold");
          }}>🔔 {L.manage.testNotif}</button>
        </div>
        <div style={{ padding:"8px 12px", borderRadius:"var(--r-md)", background:"var(--warn-dim)", border:"1px solid var(--warn)", fontSize:12, color:"var(--warn)" }}>{L.manage.backupWarning}</div>
      </div>

      {/* Danger */}
      <div style={{ borderTop:"1px solid var(--bdr)", paddingTop:18 }}>
        <h2 className="section-title" style={{ color:"var(--danger)" }}>{L.manage.danger}</h2>
        <button className="btn btn-ghost" style={{ color:"var(--danger)", borderColor:"var(--danger)" }}
          onClick={()=>{
            setModalConfig({
              title: L.manage.deleteAll,
              message: L.manage.deleteConfirm,
              danger: true,
              onConfirm: () => { localStorage.clear(); window.location.reload(); },
            });
            setModalOpen(true);
          }}>
          🗑 {L.manage.deleteAll}
        </button>
      </div>

      <Modal open={modalOpen} title={modalConfig.title} message={modalConfig.message}
        danger={modalConfig.danger} confirmLabel="Eliminar" cancelLabel="Cancelar"
        onConfirm={modalConfig.onConfirm} onCancel={() => setModalOpen(false)} />
    </div>
  );
}
