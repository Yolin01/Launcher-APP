const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

function startBackend() {
  try {
    const backendPath = path.join(__dirname, '../backend')
    require('dotenv').config({ path: path.join(backendPath, '.env') })
    require('../backend/server')
    console.log('Backend démarré')
  } catch (err) {
    console.error('Erreur démarrage :', err.message)
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 900, minHeight: 600,
    title: 'AppLauncher',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  })
  win.setMenuBarVisibility(false)
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../frontend/dist/index.html'))
  }
}

// ── Canaux IPC ───────────────────────────────────────────
ipcMain.handle('scan-apps', async () => {
  const { getAppsFromFolders } = require('./scanApps')
  return getAppsFromFolders()
})

ipcMain.handle('launch-exe', async (event, exePath) => {
  const { launchWindowsApp } = require('./scanApps')
  launchWindowsApp(exePath)
  return { success: true }
})

ipcMain.handle('get-platform', () => process.platform)

ipcMain.handle('pick-file', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Sélectionner une application',
    filters: [
      { name: 'Applications', extensions: ['exe', 'lnk'] },
      { name: 'Tous les fichiers', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  const name = path.basename(filePath).replace(/\.(exe|lnk)$/i, '')
  return { name, exePath: filePath, launchUrl: '', iconUrl: '', isLocalApp: true }
})

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on('window-all-closed', () => app.quit())