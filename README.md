# Forge

**App de escritorio open source para Linux**

> Construido con React + Electron. Sin servidor, sin cuenta, sin tracking. Tus datos son tuyos.

---

## Características

| Feature | Descripción |
|---|---|
| Tracker mensual | Grilla hábitos × días con zebra rows y separadores semanales |
| Modo Focus | Solo los hábitos de hoy, con cards grandes |
| Stats | Cumplimiento, ranking, categorías, gráfica con comparativa vs mes anterior |
| Heatmap anual | Actividad estilo GitHub contributions |
| Gamificación | XP, 7 niveles, 10 badges |
| Notas por día | Campo libre por cada día del mes |
| Drag & drop | Reordena hábitos arrastrando |
| Categorías | Salud, Trabajo, Mente, Social, Rutina |
| Hábitos negativos | Marca cuando fallaste (ej: redes sociales) |
| Hábitos numéricos | Meta por cantidad (ej: 8 vasos de agua) |
| Tema oscuro/claro | Alto contraste, paleta rojo+negro+dorado |
| 6 colores de acento | Rojo, Azul, Verde, Morado, Naranja, Cian |
| 3 idiomas | Español, English, Português |
| Onboarding | Wizard de 4 pasos con plantillas de hábitos |
| Notificaciones | Recordatorio diario vía sistema (KDE/GNOME) |
| Tray icon | Corre en segundo plano, accesible desde la barra |
| Offline total | Fuentes locales, sin internet requerido |
| Export JSON/CSV | Backup completo compatible con LibreOffice |

---

## Instalación rápida en Fedora

```bash
git clone https://github.com/eacodemo/forge.git
cd forge
./install.sh
```

El script instala todo automáticamente y agrega Forge al menú de KDE.

### Prerrequisitos

```bash
sudo dnf install nodejs npm rpm-build
```

### Modo desarrollo

```bash
npm install
npm run electron:dev    # abre la app con hot reload
```

---

## Estructura del proyecto

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para documentación completa.

---

## Datos y privacidad

- Todos los datos en `localStorage` — solo en tu máquina
- Export JSON para backup, CSV para LibreOffice
- Sin telemetría, sin analytics, sin cuenta

---

## Contribuir

1. Fork → `git checkout -b feat/mi-feature`
2. Lee [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. Commit con prefijos: `feat:`, `fix:`, `docs:`
4. Pull Request

---

## Licencia

MIT — Copyright © 2026 eacodemo
