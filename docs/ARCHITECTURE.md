# Forge — Arquitectura y guía para contribuidores

## Visión general

Forge es una app de escritorio para Linux construida con **React + Electron**. Los datos se guardan localmente en `localStorage` — sin servidor, sin cuenta, sin tracking.

---

## Stack tecnológico

| Capa            | Tecnología                          | Por qué                                      |
|-----------------|-------------------------------------|----------------------------------------------|
| UI              | React 18 (functional + hooks)       | Reactivo, sin clases, fácil de contribuir    |
| Bundler         | Vite 5                              | HMR instantáneo, builds rápidos              |
| Desktop         | Electron 32                         | Acceso al sistema (notificaciones, tray)     |
| Empaquetado     | electron-builder                    | AppImage + RPM para Linux                    |
| Estilos         | CSS puro con variables              | Sin runtime CSS-in-JS, theming via `--var`   |
| Fuentes         | Autohosteadas en `/public/fonts/`   | Funciona 100% offline                        |
| Gráficas        | Chart.js 4 (npm, offline)           | Dependencia npm, funciona offline           |
| Persistencia    | localStorage                        | Simple, offline, sin servidor                |
| i18n            | JSON propio en `src/i18n/`          | Sin librería externa, fácil de extender      |

---

## Estructura de carpetas

```
forge/
├── electron/
│   ├── main.js        # Proceso principal: ventana, tray, notificaciones, IPC
│   └── preload.js     # Puente seguro renderer ↔ main (contextBridge)
│
├── src/
│   ├── App.jsx        # Raíz: estado global, navegación, mes activo
│   ├── main.jsx       # Entry point React
│   │
│   ├── components/
│   │   ├── Logo.jsx       # SVG del logo (usa --acc y --gold CSS vars)
│   │   └── Onboarding.jsx # Wizard de primera instalación (4 pasos)
│   │
│   ├── views/             # Una vista = una pantalla completa
│   │   ├── TrackerView.jsx    # Grilla mensual con drag & drop
│   │   ├── FocusView.jsx      # Modo hoy — cards grandes
│   │   ├── StatsView.jsx      # Estadísticas + gráfica comparativa
│   │   ├── HeatmapView.jsx    # Mapa de calor anual
│   │   ├── GamifyView.jsx     # XP, niveles, badges
│   │   └── ManageView.jsx     # Gestión de hábitos + settings + export
│   │
│   ├── utils/
│   │   ├── storage.js     # loadData, saveData, makeKey, export/import
│   │   ├── gamification.js# XP, niveles, badges — lógica pura
│   │   ├── useAccent.js   # Hook: inyecta paleta de color en CSS vars
│   │   └── sound.js       # Web Audio API — sonido al completar
│   │
│   ├── i18n/
│   │   └── translations.js # ES + EN + PT — sin librería externa
│   │
│   └── styles/
│       └── global.css     # Variables CSS, temas, todos los componentes
│
├── public/
│   └── fonts/         # Fuentes WOFF2 (generadas con npm run download-fonts)
│
├── scripts/
│   └── download-fonts.js  # Descarga fuentes para uso offline
│
├── docs/
│   └── ARCHITECTURE.md    # Este archivo
│
├── install.sh         # Instalador para Fedora/KDE (AppImage → .desktop)
├── package.json
├── vite.config.js
├── LICENSE            # MIT
└── README.md
```

---

## Modelo de datos

### Formato de clave (KEY FORMAT)

**IMPORTANTE**: Las claves de checks usan formato numérico independiente del idioma:

```
"YYYY-MM-HI-DD"
  YYYY = año (ej: 2026)
  MM   = mes 01-12 (NO el nombre del mes)
  HI   = índice del hábito 0-based
  DD   = día del mes
```

**Por qué**: Versiones anteriores usaban el nombre del mes en el idioma activo (`"2026-Enero-0-5"`). Al cambiar el idioma, todas las claves se rompían. La función `makeKey(year, month0, hi, day)` en `storage.js` genera el formato correcto.

### Estructura del localStorage (`forge_v131`)

```typescript
{
  version:   string,       // "1.3.1"
  onboarded: boolean,      // false = mostrar onboarding
  profile: {
    name:      string,     // nombre del usuario
    lang:      "es"|"en"|"pt",
    theme:     "dark"|"light",
    accent:    string,     // id de ACCENT_PALETTES
    notifHour: number,     // 0-23
  },
  habits: Array<{
    name:  string,
    cat:   "salud"|"trabajo"|"mente"|"social"|"habitos"|"otro",
    type:  "boolean"|"negative"|"numeric",
    goal?: number,         // solo para type:"numeric"
    unit?: string,         // solo para type:"numeric"
  }>,
  checks:  Record<string, true>,   // "2026-06-3-15" → true
  numeric: Record<string, number>, // "2026-06-13-5" → 6  (vasos de agua)
  notes:   Record<string, string>, // "2026-06-15"   → "nota del día"
}
```

### Tipos de hábito

| Tipo       | Comportamiento                                           |
|------------|----------------------------------------------------------|
| `boolean`  | Click → completado (check verde)                         |
| `negative` | Click → fallaste (check dorado con ✗). 0 checks = bien  |
| `numeric`  | Click izquierdo +1, clic derecho -1. Barra de progreso   |

---

## Flujo de datos

```
localStorage
    │
    ▼
loadData() ──→ App.jsx (useState)
                   │
                   ├── monthStats (useMemo) ──→ TrackerView, StatsView
                   ├── gamStats   (useMemo) ──→ GamifyView
                   ├── xp/level   (useMemo) ──→ Header, GamifyView
                   │
                   └── update(patch) ──→ saveData() ──→ localStorage
```

---

## Sistema de temas y colores

Los colores se inyectan en `document.documentElement` via el hook `useAccent`:

```css
--acc       /* color principal del acento */
--acc-dim   /* versión con 15% opacidad */
--acc-glow  /* versión con 30% opacidad (para glow en checks) */
--acc-dark  /* versión oscura del acento */
--acc-1     /* para heatmap nivel 1 */
--acc-2     /* para heatmap nivel 2 */
```

El tema oscuro/claro se controla con la clase `.app.dark` / `.app.light` en el div raíz.

---

## Comunicación Electron ↔ React

```
React                          Electron main
  │                                │
  ├── window.electronAPI.notify()  ──→ ipcMain.on("notify") ──→ Notification
  │
  ├── window.electronAPI.onDailyCheck(cb) ──← ipcMain: setInterval 24h
  │
  └── window.electronAPI.onNavigate(cb)  ──← Tray menu click
```

El `preload.js` expone solo las funciones necesarias via `contextBridge` — nunca `nodeIntegration: true`.

---

## Gamificación

El sistema es **stateless**: se recalcula desde los checks en cada render.

```
computeStats(checks, habits)  →  { totalChecks, maxStreak, perfectDays, ... }
computeXP(stats)              →  número de XP
getLevel(xp)                  →  { level, name, xpMin, xpMax }
getEarnedBadges(stats)        →  Badge[] con .earned boolean
```

Para agregar un badge: edita el array `BADGES` en `utils/gamification.js`.  
Para agregar un nivel: edita el array `LEVELS`.

---

## i18n

Agregar un idioma nuevo:

1. Copia el objeto `es` en `src/i18n/translations.js`
2. Traduce todos los strings
3. Agrega el code (`"fr"`) y el flag emoji
4. El onboarding lo mostrará automáticamente

---

## Cómo agregar una vista nueva

1. Crea `src/views/MiVista.jsx`
2. Agrégala al array `navItems` en `App.jsx`
3. Agrega `{view==="mi-vista" && <MiVista {...shared}/>}` en el JSX
4. Agrega las traducciones en `src/i18n/translations.js` bajo cada idioma

---

## Convenciones de código

- **Componentes**: functional + hooks, sin clases
- **Estilos**: clases CSS en `global.css`, inline solo para valores dinámicos
- **Estado global**: en `App.jsx` via `useState` + `update(patch)`
- **Estado local**: `useState` dentro del componente que lo necesita
- **Claves de checks**: siempre usar `makeKey(year, month0, hi, day)`
- **Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

---

## Roadmap sugerido

- [ ] Vista semanal (7 días)
- [ ] Sincronización opcional self-hosted (PocketBase / Supabase)
- [ ] Múltiples perfiles de usuario
- [ ] PWA instalable (sin Electron)
- [ ] Importar desde Habitica CSV
- [ ] Widget en el escritorio (KDE Plasma widget)
- [ ] Tests con Vitest

---

## Changelog de correcciones (v1.3.1)

### Bugs críticos corregidos

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| 1 | `gamification.js` | Usaba claves `"2026-Enero-0-5"` en lugar del formato numérico | Migrado a `"2026-01-0-5"` via regex `KEY_RE` |
| 2 | `gamification.js` | Regex de streak no agrupaba por mes correctamente | Reescrito con `Map<hi, Map<monthKey, days[]>>` |
| 3 | `App.jsx` | `today` era `const` fijo en módulo — se desactualizaba tras medianoche | `useState(getToday)` + `setInterval` cada 60s |
| 4 | `App.jsx` | `onDailyCheck` registraba un nuevo listener en cada cambio de `habits`/`checks` | Movido a `useEffect(()=>{},[])` con `dataRef` para leer datos frescos |
| 5 | `App.jsx` | `Math.max(...[])` = `-Infinity` con 0 hábitos → crash | Guard `if (habits.length===0)` antes del spread |
| 6 | `TrackerView.jsx` | Drag remap con `indexOf` era O(n²); `newToOld` se construía pero nunca se usaba | Reemplazado por `Map` para O(n) |
| 7 | `ManageView.jsx` | Settings locales no se sincronizaban al importar JSON | `useEffect` que sincroniza cuando `profile` cambia |
| 8 | `storage.js` | `saveData` fallaba silenciosamente en `QuotaExceededError` | Retorna `boolean`; App muestra toast de error |
| 9 | `storage.js` | CSV sin orden garantizado (`Object.keys` no ordenado) | `entries.sort((a,b) => año, mes, día)` antes de escribir |
| 10 | `FocusView.jsx` | Usaba `today.getMonth()` en lugar de `monthIdx` de props | Prop `monthIdx` agregada y usada en `makeKey` |
| 11 | `App.jsx` + `storage.js` | `notes` usaban formato ad-hoc, no `makeKey` | `makeNoteKey(year, month0, day)` centraliza el formato |
| 12 | `TrackerView.jsx` | `useRef` importado pero nunca usado → warning en consola | Import eliminado |
