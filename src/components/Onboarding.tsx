import { useState, useEffect } from "react";
import { ACCENT_PALETTES, TEMPLATES, saveData, saveDataAsync } from "../utils/storage";
import { LANGS } from "../i18n/translations";
import { VERSION } from "../utils/constants";
import Logo from "./Logo";
import type { Data } from "../types";
import type { TemplateHabit } from "../utils/storage";

export default function Onboarding({ onComplete }: { onComplete: (d: Data) => void }) {
  const [step,      setStep]      = useState(1);
  const [name,      setName]      = useState("");
  const [lang,      setLang]      = useState("es");
  const [theme,     setTheme]     = useState("dark");
  const [accent,    setAccent]    = useState("red");
  const [notifHour, setNotifHour] = useState(21);
  const [templates, setTemplates] = useState<string[]>([]);

  useEffect(() => {
    document.querySelector(".app")?.classList.toggle("dark",  theme === "dark");
    document.querySelector(".app")?.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    const p = ACCENT_PALETTES.find(a => a.id === accent) || ACCENT_PALETTES[0];
    const v = theme === "dark" ? p.dark : p.light;
    const r = document.documentElement;
    r.style.setProperty("--acc",      v.accent);
    r.style.setProperty("--acc-dim",  v.dim);
    r.style.setProperty("--acc-glow", v.glow);
    r.style.setProperty("--acc-dark", v.dark2);
  }, [accent, theme]);

  const L  = LANGS[lang]?.onboarding || LANGS.es.onboarding;
  const Lm = LANGS[lang] || LANGS.es;

  function next() { if (step < 4) setStep(s => s + 1); }
  function back() { if (step > 1) setStep(s => s - 1); }

  function toggleTemplate(id: string) {
    setTemplates(ts => ts.includes(id) ? ts.filter(t => t !== id) : [...ts, id]);
  }

  function finish(empty: boolean = false) {
    let habits: TemplateHabit[] = [];
    if (!empty) {
      templates.forEach(tid => {
        const tpl = TEMPLATES[tid]?.[lang] || TEMPLATES[tid]?.es || [];
        tpl.forEach(h => { if (!habits.find(x => x.name === h.name)) habits.push(h); });
      });
    }
    const data: Data = {
      version: VERSION, onboarded: true,
      profile: { name: name.trim() || Lm.manage.defaultUser, lang: lang as Data["profile"]["lang"], theme: theme as Data["profile"]["theme"], accent: accent as Data["profile"]["accent"], notifHour },
      habits, checks: {}, numeric: {}, notes: {},
    };
    saveData(data);
    saveDataAsync(data).catch(() => {});
    onComplete(data);
  }

  const templateCards = [
    { id:"prod",   emoji:"💼", label: L.templateProd   },
    { id:"health", emoji:"💪", label: L.templateHealth  },
    { id:"mind",   emoji:"🧠", label: L.templateMind    },
  ];

  const previewHabits = templates.flatMap(tid =>
    TEMPLATES[tid]?.[lang] || TEMPLATES[tid]?.es || []
  );

  return (
    <div className="onboard-overlay">
      <div className="onboard-card">
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
          <Logo size={38} />
          <div style={{ fontFamily:"var(--fd)", fontSize:21, fontWeight:800, marginTop:9, letterSpacing:"-.4px" }}>
            Forge
          </div>
        </div>

        <div className="onboard-dots">
          {[1,2,3,4].map(i => (
            <div key={i} className={`onboard-dot${step===i?" active":""}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="onboard-title">{L.welcome}</div>
            <div className="onboard-sub">{L.sub}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--fg2)", marginBottom:8 }}>{L.step1}</div>
            <input autoFocus className="onboard-input" placeholder={L.step1ph}
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key==="Enter" && name.trim() && next()} />
          </>
        )}

        {step === 2 && (
          <>
            <div className="onboard-title">{L.step2}</div>
            <div className="lang-grid">
              {Object.values(LANGS).map(l => (
                <button key={l.code} className={`lang-btn${lang===l.code?" active":""}`}
                  onClick={() => setLang(l.code)}>
                  <div style={{ fontSize:26, marginBottom:4 }}>{l.flag}</div>
                  <div>{l.name}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="onboard-title">{L.step3}</div>

            <div style={{ fontSize:11, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{L.theme}</div>
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              {[{id:"dark",icon:"🌙",label:L.themeDark},{id:"light",icon:"☀️",label:L.themeLight}].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} style={{
                  flex:1, padding:"10px 14px", borderRadius:"var(--r-md)",
                  border:`2px solid ${theme===t.id?"var(--acc)":"var(--bdr)"}`,
                  background: theme===t.id?"var(--acc-dim)":"var(--sf2)",
                  color: theme===t.id?"var(--acc)":"var(--fg2)",
                  cursor:"pointer", fontFamily:"var(--fb)", fontSize:13, fontWeight:600, transition:"all .13s",
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize:11, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{L.accentLabel}</div>
            <div className="accent-grid" style={{ marginBottom:18 }}>
              {ACCENT_PALETTES.map(p => {
                const c = theme==="dark" ? p.dark.accent : p.light.accent;
                return (
                  <button key={p.id} className={`accent-swatch${accent===p.id?" active":""}`}
                    style={{ background:c }} title={p.name} onClick={() => setAccent(p.id)} />
                );
              })}
            </div>

            <div style={{ fontSize:11, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{L.notifLabel}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[8,12,18,20,21,22].map(h => (
                <button key={h} onClick={() => setNotifHour(h)} style={{
                  padding:"5px 11px", borderRadius:99,
                  border:`1.5px solid ${notifHour===h?"var(--acc)":"var(--bdr)"}`,
                  background: notifHour===h?"var(--acc-dim)":"transparent",
                  color: notifHour===h?"var(--acc)":"var(--fg3)",
                  cursor:"pointer", fontFamily:"var(--fm)", fontSize:12, fontWeight:600, transition:"all .13s",
                }}>
                  {h}:00
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="onboard-title">{L.step4}</div>
            <div className="onboard-sub">{L.templateTitle}</div>

            <div className="template-grid" style={{ marginBottom:14 }}>
              {templateCards.map(tc => (
                <button key={tc.id} className={`template-btn${templates.includes(tc.id)?" active":""}`}
                  onClick={() => toggleTemplate(tc.id)}>
                  <div style={{ fontSize:26, marginBottom:7 }}>{tc.emoji}</div>
                  <div style={{ fontSize:12.5, fontWeight:600 }}>{tc.label}</div>
                  {templates.includes(tc.id) && (
                    <div style={{ fontSize:10, marginTop:4, color:"var(--acc)" }}>✓</div>
                  )}
                </button>
              ))}
            </div>

            {previewHabits.length > 0 && (
              <div style={{ background:"var(--sf2)", borderRadius:"var(--r-md)", padding:"9px 12px", marginBottom:12, maxHeight:150, overflowY:"auto" }}>
                <div style={{ fontSize:9.5, color:"var(--fg3)", fontFamily:"var(--fm)", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>
                  {L.previewLabel.replace("{n}", String(previewHabits.length))}
                </div>
                {previewHabits.map((h: TemplateHabit, i: number) => (
                  <div key={i} style={{ fontSize:12, color:"var(--fg2)", padding:"2px 0" }}>
                    <span style={{ color:"var(--fg4)", fontSize:9, marginRight:5, fontFamily:"var(--fm)" }}>{String(i+1).padStart(2,"0")}</span>
                    {h.type==="negative" && <span style={{ color:"var(--gold)", fontSize:10, marginRight:3 }}>⚠</span>}
                    {h.type==="numeric"  && <span style={{ color:"var(--success)", fontSize:10, marginRight:3 }}>#{h.goal}</span>}
                    {h.name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ display:"flex", gap:8, marginTop:22 }}>
          {step > 1 && <button className="btn btn-ghost" onClick={back}>{L.back}</button>}
          <div style={{ flex:1 }} />
          {step < 4 ? (
            <button className="btn btn-primary" onClick={next}
              disabled={step===1 && !name.trim()}>
              {L.next} →
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => finish(true)}>{L.templateSkip}</button>
              <button className="btn btn-primary" onClick={() => finish(false)}
                disabled={templates.length === 0}>
                {L.finish} 🚀
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
