const { app, BrowserWindow, shell, Notification, ipcMain, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let tray       = null;

// ── Window ──────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820,
    minWidth: 600, minHeight: 500,
    title: "Forge",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Hide to tray instead of close
  mainWindow.on("close", e => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
      if (tray) {
        tray.displayBalloon?.({
    title: "Forge",
          content: "La app sigue corriendo en segundo plano",
          iconType: "info",
        });
      }
    }
  });
}

// ── Tray icon ────────────────────────────────────────────────────────────────
function createTray() {
  // Use a simple SVG-based icon (16x16 for tray)
  const iconData = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <rect width="22" height="22" rx="4" fill="#0f0f14"/>
    <rect x="5" y="4" width="3.5" height="14" rx="1.5" fill="#e63946"/>
    <rect x="5" y="4" width="10" height="3" rx="1.5" fill="#e63946"/>
    <rect x="5" y="9.5" width="7" height="2.5" rx="1" fill="#e63946"/>
    <circle cx="16" cy="15" r="2" fill="#f4a030" opacity="0.85"/>
  </svg>`;

  let icon;
  try {
    icon = nativeImage.createFromDataURL(
      "data:image/svg+xml;base64," + Buffer.from(iconData).toString("base64")
    );
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip("Forge");

  function buildMenu() {
    return Menu.buildFromTemplate([
      { label: "Abrir Forge", click: () => { mainWindow?.show(); mainWindow?.focus(); } },
      { type: "separator" },
      { label: "Modo Foco — Hoy",   click: () => { mainWindow?.show(); mainWindow?.webContents.send("navigate", "focus"); } },
      { label: "Ver Tracker",       click: () => { mainWindow?.show(); mainWindow?.webContents.send("navigate", "tracker"); } },
      { label: "Ver Stats",         click: () => { mainWindow?.show(); mainWindow?.webContents.send("navigate", "stats"); } },
      { type: "separator" },
      { label: "Salir", click: () => { app.isQuiting = true; app.quit(); } },
    ]);
  }

  tray.setContextMenu(buildMenu());
  tray.on("click", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow?.show();
    }
  });
  tray.on("double-click", () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ── IPC ──────────────────────────────────────────────────────────────────────
ipcMain.on("notify", (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, urgency: "normal" }).show();
  }
});

ipcMain.on("notify-streak-risk", (_, { habitName, streak, lang }) => {
  if (Notification.isSupported()) {
    const msg = lang === "en"
      ? `⚠️ Your streak on "${habitName}" (${streak} days) is at risk! Don't break it today.`
      : `⚠️ Tu racha en "${habitName}" (${streak} días) está en riesgo. ¡No la rompas hoy!`;
    new Notification({ title: "Forge — Racha en riesgo", body: msg, urgency: "high" }).show();
  }
});

let notifHour = 21;

ipcMain.on("set-notif-hour", (_, hour) => {
  notifHour = hour;
  scheduleDailyReminder(hour);
});

ipcMain.handle("get-notif-hour", () => notifHour);

ipcMain.on("update-tray-tooltip", (_, { done, total, pct }) => {
  if (tray) {
    const msg = total > 0
      ? `Forge — ${done}/${total} (${pct}%)`
      : "Forge";
    tray.setToolTip(msg);
  }
});

// ── Auto-backup ──────────────────────────────────────────────────────────────
const BACKUP_DIR = path.join(app.getPath("userData"), "backups");
const BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function autoBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const data = mainWindow?.webContents.executeJavaScript("localStorage.getItem('forge_v131')");
    if (data) {
      const filename = `forge_backup_${new Date().toISOString().slice(0,10)}.json`;
      fs.writeFileSync(path.join(BACKUP_DIR, filename), data);
      // keep only last 10 backups
      const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith("forge_backup_")).sort();
      while (files.length > 10) { fs.unlinkSync(path.join(BACKUP_DIR, files.shift())); }
    }
  } catch { /* ignore */ }
  setTimeout(autoBackup, BACKUP_INTERVAL_MS);
}

// ── Daily reminder ───────────────────────────────────────────────────────────
function scheduleDailyReminder(hour = 21) {
  notifHour = hour;
  function fire() {
    mainWindow?.webContents.send("daily-check");
    // reschedule 24h later
    const now  = new Date();
    const next = new Date();
    next.setHours(hour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    setTimeout(fire, next - now);
  }
  const now  = new Date();
  const first = new Date();
  first.setHours(hour, 0, 0, 0);
  if (first <= now) first.setDate(first.getDate() + 1);
  setTimeout(fire, first - now);
}

// ── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  scheduleDailyReminder(notifHour);
  setTimeout(autoBackup, 60000); // start auto-backup after 1 minute
});

app.on("window-all-closed", () => {
  // Don't quit — stay in tray
  if (process.platform === "darwin") app.dock?.hide();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow?.show();
});

app.on("before-quit", () => { app.isQuiting = true; });
