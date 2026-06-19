const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  notify:         (title, body) => ipcRenderer.send("notify", { title, body }),
  notifyStreakRisk: (habitName, streak, lang) => ipcRenderer.send("notify-streak-risk", { habitName, streak, lang }),
  updateTrayTooltip: (done, total, pct) => ipcRenderer.send("update-tray-tooltip", { done, total, pct }),
  onDailyCheck:   (cb) => {
    const handler = (_, view) => cb(view);
    ipcRenderer.on("daily-check", handler);
    return () => ipcRenderer.removeListener("daily-check", handler);
  },
  onNavigate:     (cb) => {
    const handler = (_, view) => cb(view);
    ipcRenderer.on("navigate", handler);
    return () => ipcRenderer.removeListener("navigate", handler);
  },
  setNotifHour:   (hour) => ipcRenderer.send("set-notif-hour", hour),
  getNotifHour:   () => ipcRenderer.invoke("get-notif-hour"),
});
