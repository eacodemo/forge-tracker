const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  notify:         (title, body) => ipcRenderer.send("notify", { title, body }),
  notifyStreakRisk: (habitName, streak, lang) => ipcRenderer.send("notify-streak-risk", { habitName, streak, lang }),
  updateTrayTooltip: (done, total, pct) => ipcRenderer.send("update-tray-tooltip", { done, total, pct }),
  onDailyCheck:   (cb) => ipcRenderer.on("daily-check", cb),
  onNavigate:     (cb) => ipcRenderer.on("navigate", (_, view) => cb(view)),
  setNotifHour:   (hour) => ipcRenderer.send("set-notif-hour", hour),
  getNotifHour:   () => ipcRenderer.invoke("get-notif-hour"),
});
