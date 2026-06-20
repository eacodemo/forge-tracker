<div align="center">

# Forge

Your daily habit tracker — offline, private, open source.

![License MIT](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.3.2-blue)
![Platform](https://img.shields.io/badge/platform-Linux-lightgrey)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>

---

## Install

### One line

```bash
curl -sSL https://raw.githubusercontent.com/eacodemo/forge-tracker/main/install.sh | bash
```

The script detects your distro, downloads the right package and installs it.

### By distro

| Distro | Command |
|--------|---------|
| Fedora / RHEL / CentOS | `sudo dnf install ./forge-*.rpm` |
| Ubuntu / Debian / Mint | `sudo apt install ./forge-*.deb` |
| Arch / Manjaro | Download AppImage from [Releases](https://github.com/eacodemo/forge-tracker/releases) |
| openSUSE | `sudo zypper install ./forge-*.rpm` |

Packages (`.rpm`, `.deb`, `.AppImage`) are available on [Releases](https://github.com/eacodemo/forge-tracker/releases).

### Build from source

```bash
git clone https://github.com/eacodemo/forge-tracker.git
cd forge-tracker
./install.sh
```

Requires Node.js 18+ and npm. The script builds and installs everything automatically.

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 📅 | **Monthly Tracker** | Grid view with habits × days, zebra rows, weekly separators |
| 🎯 | **Focus Mode** | Today's habits only, large cards for quick check-in |
| 📊 | **Statistics** | Completion %, best/worst habits, chart with month comparison |
| 🔥 | **Annual Heatmap** | Activity visualization (GitHub contributions style) |
| 📝 | **Daily Notes** | Free text field for each day |
| 🔄 | **Drag & Drop** | Reorder habits by dragging |
| ⚔️ | **XP & Levels** | Earn experience, level up, unlock 10 badges |
| 🌗 | **Dark / Light Theme** | High contrast palette with 6 accent colors |
| 🌐 | **3 Languages** | Español, English, Português |
| 🔔 | **Notifications** | System notifications (KDE / GNOME) |
| 💾 | **Export** | JSON (full backup) or CSV (LibreOffice / Excel) |
| 📴 | **100% Offline** | Local fonts, no server, no tracking |

### Habit types

| Type | Behavior |
|------|----------|
| ✅ **Boolean** | Click → completed (green check) |
| ⚠️ **Negative** | Click → failed (gold ✗). No checks = good |
| 🔢 **Numeric** | Left click +1, right click -1, progress bar with goal |

---

## Development

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Dev server + Electron (hot reload) |
| `npm test` | Run tests |
| `npm run electron:build` | Build AppImage + RPM + DEB |
| `./scripts/build-packages.sh` | Build all packages locally |

---

## Roadmap

- [ ] Weekly view (7 days)
- [ ] Optional self-hosted sync (PocketBase / Supabase)
- [ ] Multiple user profiles
- [ ] PWA (installable without Electron)
- [ ] Import from Habitica CSV
- [ ] KDE Plasma widget

---

## License

MIT — Copyright © 2026 eacodemo

See [LICENSE](LICENSE) for details.
