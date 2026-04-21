const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function generateId(name) {
  return crypto
    .createHash('md5')
    .update(name.toLowerCase())
    .digest('hex')
    .slice(0, 24)
}

// ── Tous les dossiers à scanner ───────────────────────
const INSTALL_FOLDERS = [
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  path.join(process.env.LOCALAPPDATA  || '', 'Programs'),
  path.join(process.env.LOCALAPPDATA  || '', 'Microsoft\\WindowsApps'),
  path.join(process.env.APPDATA       || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
]

// ── Mots à ignorer dans les noms de dossiers ─────────
const IGNORE = [
  'uninstall', 'setup', 'update', 'crash', 'windows',
  'microsoft', 'common files', 'internet explorer',
  'reference assemblies', 'msbuild', 'dotnet'
]

function scanFolder(folderPath) {
  const apps = []
  if (!fs.existsSync(folderPath)) return apps

  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true })
    entries.forEach(entry => {
      if (!entry.isDirectory()) return

      // Ignore les dossiers système
      if (IGNORE.some(i => entry.name.toLowerCase().includes(i))) return

      const appDir = path.join(folderPath, entry.name)
      try {
        const files = fs.readdirSync(appDir)

        // Cherche le .exe principal — même nom que le dossier
        const mainExe = files.find(f =>
          f.toLowerCase() === entry.name.toLowerCase() + '.exe'
        )

        // Sinon prend le premier .exe utile
        const anyExe = files.find(f =>
          f.toLowerCase().endsWith('.exe') &&
          !f.toLowerCase().includes('uninstall') &&
          !f.toLowerCase().includes('setup') &&
          !f.toLowerCase().includes('update') &&
          !f.toLowerCase().includes('crash')
        )

        const exeFile = mainExe || anyExe
        if (!exeFile) return

        apps.push({
          _id:        generateId(entry.name),
          name:       entry.name,
          exePath:    path.join(appDir, exeFile),
          iconUrl:    '',
          isLocalApp: true,
          launchUrl:  '',
          isPinned:   false,
        })
      } catch (e) {}
    })
  } catch (e) {}

  return apps
}

// ── Scan du menu Démarrer (.lnk) ─────────────────────
function scanStartMenu() {
  const apps = []
  const startMenuPaths = [
    path.join(process.env.APPDATA || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs',
  ]

  startMenuPaths.forEach(menuPath => {
    if (!fs.existsSync(menuPath)) return
    try {
      const scanDir = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        entries.forEach(entry => {
          if (entry.isDirectory()) {
            scanDir(path.join(dir, entry.name))
          } else if (entry.name.toLowerCase().endsWith('.lnk')) {
            const name = entry.name.replace(/\.lnk$/i, '')
            if (name.length < 2) return
            if (IGNORE.some(i => name.toLowerCase().includes(i))) return

            apps.push({
              _id:        generateId('lnk_' + name),
              name,
              exePath:    path.join(dir, entry.name),
              iconUrl:    '',
              isLocalApp: true,
              launchUrl:  '',
              isPinned:   false,
            })
          }
        })
      }
      scanDir(menuPath)
    } catch (e) {}
  })

  return apps
}

function getAppsFromFolders() {
  const allApps = []
  const seen = new Set()

  // Scan des dossiers d'installation
  INSTALL_FOLDERS.forEach(folder => {
    scanFolder(folder).forEach(app => {
      if (!seen.has(app._id)) {
        seen.add(app._id)
        allApps.push(app)
      }
    })
  })

  // Scan du menu Démarrer
  scanStartMenu().forEach(app => {
    if (!seen.has(app._id)) {
      seen.add(app._id)
      allApps.push(app)
    }
  })

  // Limite à 300 apps max pour éviter les requêtes trop lourdes
  return allApps
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
    .slice(0, 300)
}

function launchWindowsApp(exePath) {
  const { exec } = require('child_process')
  if (exePath.toLowerCase().endsWith('.lnk')) {
    exec(`start "" "${exePath}"`, (err) => {
      if (err) console.error('Erreur lancement :', err.message)
    })
  } else {
    exec(`"${exePath}"`, (err) => {
      if (err) console.error('Erreur lancement :', exePath, err.message)
    })
  }
}

module.exports = { getAppsFromFolders, launchWindowsApp }