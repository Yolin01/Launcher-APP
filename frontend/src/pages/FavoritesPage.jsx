import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import AppGrid from '../components/AppGrid'
import { getMyApps, launchApp, togglePin } from '../services/appService'
import { useAuth } from '../hooks/useAuth'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const appsRef = useRef([])

  useEffect(() => { loadFavorites() }, [])

  const loadFavorites = async () => {
    try {
      const data = await getMyApps()
      // Filtre seulement les apps épinglées
      const pinned = data.filter(a => a.isPinned)
      appsRef.current = pinned
      setFavorites(pinned)
      setFiltered(pinned)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((q) => {
    const current = appsRef.current
    if (!q || !q.trim()) {
      setFiltered(current)
      return
    }
    setFiltered(current.filter(a =>
      a.name.toLowerCase().includes(q.toLowerCase())
    ))
  }, [])

  const handlePin = async (id) => {
    await togglePin(id)
    loadFavorites()
  }

  return (
    <div className="dashboard">
      <Navbar onSearch={handleSearch} />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <h2>Mes favoris ★</h2>
              <p>{filtered.length} application(s) épinglée(s)</p>
            </div>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>Aucun favori pour l'instant</p>
              <p>
                Survolez une application dans le dashboard
                et cliquez sur "★ Épingler"
              </p>
            </div>
          ) : (
            <AppGrid
              apps={filtered}
              onLaunch={launchApp}
              onToggleFav={handlePin}
            />
          )}
        </main>
      </div>
    </div>
  )
}