# Forge

![License MIT](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.3.1-blue)
![Platform](https://img.shields.io/badge/platform-Linux-lightgrey)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

> Your daily habit tracker — offline, private, open source.

---

## Why Forge?

- 🔒 **100% Offline** — Your data never leaves your machine
- 🎮 **Gamification** — XP, levels, and badges keep you motivated
- 🌍 **3 Languages** — Español, English, Português
- 🎨 **6 Accent Colors** — Customize the look to your taste
- ⚡ **Fast & Lightweight** — Built with Vite + React + Electron
- 📱 **System Integration** — Notifications, tray icon, keyboard shortcuts

---

## Features

### Core

| | Feature | Description |
|---|---------|-------------|
| 📅 | **Monthly Tracker** | Grid view with habits × days, zebra rows, weekly separators |
| 🎯 | **Focus Mode** | Today's habits only, large cards for quick check-in |
| 📊 | **Statistics** | Completion %, best/worst habits, chart with month comparison |
| 🔥 | **Annual Heatmap** | Activity visualization (GitHub contributions style) |
| 📝 | **Daily Notes** | Free text field for each day of the month |
| 🔄 | **Drag & Drop** | Reorder habits by dragging |

### Habit Types

| | Type | Behavior |
|---|------|----------|
| ✅ | **Boolean** | Click → completed (green check) |
| ⚠️ | **Negative** | Click → failed (gold ✗). No checks = good |
| 🔢 | **Numeric** | Left click +1, right click -1, progress bar with goal |

### Gamification

| | Feature | Description |
|---|---------|-------------|
| ⚔️ | **XP System** | Earn experience points for completing habits |
| 📈 | **7 Levels** | Progressive level names as you advance |
| 🏆 | **10 Badges** | Achievement unlocks for milestones |

### Customization

| | Feature | Description |
|---|---------|-------------|
| 🌗 | **Dark / Light Theme** | High contrast, red + black + gold palette |
| 🎨 | **6 Accent Colors** | Red, Blue, Green, Purple, Orange, Cyan |
| 🌐 | **3 Languages** | Español, English, Português |
| 📂 | **5 Categories** | Health, Work, Mind, Social, Routine |
| 🚀 | **Onboarding Wizard** | 4-step setup with habit templates |

### System & Privacy

| | Feature | Description |
|---|---------|-------------|
| 🔔 | **Daily Notifications** | System notifications (KDE / GNOME) |
| 🖥️ | **Tray Icon** | Runs in background, accessible from taskbar |
| 📴 | **100% Offline** | Local fonts, no internet required |
| 💾 | **Export JSON / CSV** | Full backup, compatible with LibreOffice |

---

## Supported Platforms

### Primary: Linux

| Distribution | Status | Package Format |
|--------------|--------|----------------|
| 🟣 Fedora / KDE | ✅ Fully supported | RPM + AppImage |
| 🟠 Ubuntu / Debian | ✅ Fully supported | DEB + AppImage |
| 🔵 Arch / Manjaro | ✅ Compatible | AppImage |
| 🟢 Linux Mint | ✅ Fully supported | DEB + AppImage |
| 🟡 openSUSE | ✅ Compatible | RPM + AppImage |

> **Note:** Pre-built packages (RPM, DEB, AppImage) run on any Linux distribution.
> Requirements above apply only when building from source.

### Experimental: macOS / Windows

Forge uses Electron and can theoretically run on other platforms, but the build scripts are Linux-only and there is no system integration (notifications, tray icon). To try building manually:

```bash
npm run build
npx electron-builder --mac    # or --win
```

---

## Quick Start

### 🚀 Instalación rápida (una línea)

```bash
curl -sSL https://raw.githubusercontent.com/eacodemo/forge-tracker/main/install.sh | bash
```

El script detecta tu distro automáticamente, descarga el paquete correcto y lo instala.

### 📦 Por distro

| Distro | Comando |
|--------|---------|
| Fedora / RHEL / CentOS | `sudo dnf install ./forge-*.rpm` |
| Ubuntu / Debian / Mint | `sudo apt install ./forge-*.deb` |
| Arch / Manjaro | Descargar AppImage de [Releases](https://github.com/eacodemo/forge-tracker/releases) |
| openSUSE | `sudo zypper install ./forge-*.rpm` |

Los paquetes `.rpm`, `.deb` y `.AppImage` están disponibles en [Releases](https://github.com/eacodemo/forge-tracker/releases).

### 🔧 Build from source

**Prerequisites:** Node.js 18+, npm

```bash
# Fedora
sudo dnf install nodejs npm

# Ubuntu / Debian
sudo apt install nodejs npm

# Arch
sudo pacman -S nodejs npm
```

Then:

```bash
git clone https://github.com/eacodemo/forge-tracker.git
cd forge-tracker
./install.sh
```

The script builds the app and installs it to your system automatically.

---

## Development

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run electron:dev` | Start dev server + Electron (hot reload) |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run electron:build` | Build package (AppImage + RPM + DEB) |
| `./scripts/build-packages.sh` | Build all packages locally |

---

## Architecture

| Layer | Technology | Why |
|-------|------------|-----|
| 🖼️ **UI** | React 18 (functional + hooks) | Reactive, no classes, easy to contribute |
| ⚡ **Bundler** | Vite 5 | Instant HMR, fast builds |
| 🖥️ **Desktop** | Electron 32 | System access (notifications, tray) |
| 📦 **Packaging** | electron-builder | AppImage + RPM + DEB for Linux |
| 🎨 **Styling** | CSS with custom properties | No runtime CSS-in-JS, theming via `--var` |
| 🔤 **Fonts** | Self-hosted in `/public/fonts/` | 100% offline |
| 📈 **Charts** | Chart.js 4 (npm, offline) | Works offline |
| 💾 **Persistence** | localStorage | Simple, offline, no server |
| 🌐 **i18n** | Custom JSON in `src/i18n/` | No external library, easy to extend |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full documentation.

---

## Data & Privacy

- 🔒 **All data in localStorage** — only on your machine
- 📴 **No server** — no internet connection required
- 🚫 **No tracking** — no analytics, no telemetry, no accounts
- 💾 **Export options:**
  - **JSON**: Full backup (reimportable)
  - **CSV**: Compatible with LibreOffice / Excel

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Read** the [Architecture Guide](docs/ARCHITECTURE.md)
4. **Make** your changes following the code conventions
5. **Test** your changes: `npm test`
6. **Commit** with conventional prefixes (see table below)
7. **Push** and open a **Pull Request**

### Commit Prefixes

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feat:` | New feature | `feat: add weekly view` |
| `fix:` | Bug fix | `fix: resolve streak calculation` |
| `docs:` | Documentation only | `docs: update README` |
| `style:` | Code style (formatting, no logic change) | `style: fix indentation` |
| `refactor:` | Code restructuring (no feature/fix) | `refactor: extract gamification utils` |
| `test:` | Adding or updating tests | `test: add StatsView tests` |
| `chore:` | Maintenance tasks | `chore: update dependencies` |

---

## Roadmap

- [ ] 📅 Weekly view (7 days)
- [ ] 🔄 Optional self-hosted sync (PocketBase / Supabase)
- [ ] 👥 Multiple user profiles
- [ ] 📱 PWA (installable without Electron)
- [ ] 📥 Import from Habitica CSV
- [ ] 🖥️ KDE Plasma widget
- [ ] 🧪 Tests with Vitest

---

## License

MIT — Copyright © 2026 eacodemo

See [LICENSE](LICENSE) for details.
