const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  scanApps:    () => ipcRenderer.invoke('scan-apps'),
  launchExe:   (exePath) => ipcRenderer.invoke('launch-exe', exePath),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  pickFile:    () => ipcRenderer.invoke('pick-file'),
  isElectron:  true,
})