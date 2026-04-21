import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import AppGrid from '../components/AppGrid'
import AddAppModal from '../components/AddAppModal'
import { getMyApps, launchApp, togglePin, hideApp } from '../services/appService'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const isElectron = window?.electronAPI?.isElectron === true

export default function DashboardPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const hasScanned = useRef(false)
  const appsRef = useRef([])

  useEffect(() => { loadApps() }, [])

  const loadApps = async () => {
    try {
      const data = await getMyApps()
      appsRef.current = data
      setApps(data)
      setFiltered(data)
    } finally {
      setLoading(false)
    }
  }

  const handleScanApps = async () => {
    if (!isElectron || hasScanned.current || scanning) return
    setScanning(true)
    hasScanned.current = true
    try {
      const localApps = await window.electronAPI.scanApps()
      if (localApps.length === 0) {
        alert('Aucune application connue détectée sur ce PC')
        return
      }
      const response = await api.post('/api/apps/user/scan', { apps: localApps })
      alert(response.message)
      await loadApps()
    } catch (err) {
      console.error('Erreur scan :', err)
      hasScanned.current = false
    } finally {
      setScanning(false)
    }
  }

  const handleRescan = () => {
    hasScanned.current = false
    handleScanApps()
  }

  const handleSearch = useCallback((q) => {
    const current = appsRef.current
    if (!q || !q.trim()) { setFiltered(current); return }
    setFiltered(current.filter(a =>
      a.name.toLowerCase().includes(q.toLowerCase())
    ))
  }, [])

  const handlePin = async (id) => {
    try { await togglePin(id); await loadApps() }
    catch (err) { console.error('Erreur pin :', err) }
  }

  const handleHide = async (id) => {
  try {
    await hideApp(id)
    // Retire immédiatement du state sans recharger
    const updated = apps.filter(a => a._id !== id)
    appsRef.current = updated
    setApps(updated)
    setFiltered(updated)
  } catch (err) {
    console.error('Erreur suppression :', err)
  }
  }

  return (
    <div className="dashboard">
      <Navbar onSearch={handleSearch} />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <h2>Bonjour, {user?.displayName} </h2>
              <p>{filtered.length} application(s)</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isElectron && (
                <button
                  className="btn-secondary"
                  onClick={handleRescan}
                  disabled={scanning}
                >
                  {scanning ? ' Scan...' : ' Scanner mon PC'}
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => setShowModal(true)}
              >
                + Ajouter une app
              </button>
            </div>
          </div>

          {loading
            ? <p>Chargement...</p>
            : <AppGrid
                apps={filtered}
                onLaunch={launchApp}
                onToggleFav={handlePin}
                onHide={handleHide}
              />
          }
        </main>
      </div>

      {showModal && (
        <AddAppModal
          onClose={() => setShowModal(false)}
          onAdded={loadApps}
        />
      )}
    </div>
  )
}