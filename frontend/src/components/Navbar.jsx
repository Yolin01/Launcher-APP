import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { debounce } from '../utils/helpers'
import ThemeSwitcher from './ThemeSwitcher'


export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth()
  const { activeTheme, applyTheme, themes } = useTheme()
  const [query, setQuery] = useState('')

  const debouncedSearch = useMemo(
    () => debounce(onSearch, 300),
    []
  )

  const handleInput = (e) => {
    setQuery(e.target.value)
    debouncedSearch(e.target.value)
  }

  // ── Bascule mode sombre / clair ───────────────────────
  const toggleDarkMode = async (isDark) => {
    // Cherche un thème existant du bon mode
    const existing = themes.find(t => t.isDark === isDark)
    if (existing) {
      await applyTheme(existing)
      return
    }
    // Sinon applique juste les variables CSS directement
    const r = document.documentElement
    if (isDark) {
      r.style.setProperty('--color-bg',      '#0F0F1A')
      r.style.setProperty('--color-surface', '#1A1A2E')
      r.style.setProperty('--color-text',    '#E2E8F0')
      r.setAttribute('data-theme', 'dark')
    } else {
      r.style.setProperty('--color-bg',      '#F7F8FC')
      r.style.setProperty('--color-surface', '#FFFFFF')
      r.style.setProperty('--color-text',    '#1A1A2E')
      r.setAttribute('data-theme', 'light')
    }
  }

  const isDark = activeTheme?.isDark ||
    document.documentElement.getAttribute('data-theme') === 'dark'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">A</span>
        <span className="navbar-title">AppLauncher</span>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Rechercher une application..."
          value={query}
          onChange={handleInput}
        />
      </div>

      <div className="navbar-actions">

        {/* ── Boutons mode sombre / clair ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-bg)',
          border: '1.5px solid var(--color-border)',
          borderRadius: '20px',
          padding: '3px',
          gap: '2px'
        }}>
          <button
            onClick={() => toggleDarkMode(false)}
            title="Mode clair"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: !isDark
                ? 'var(--color-primary)'
                : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            ☀️
          </button>
          <button
            onClick={() => toggleDarkMode(true)}
            title="Mode sombre"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark
                ? 'var(--color-primary)'
                : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            🌙
          </button>
        </div>

        {/* ── Sélecteur de thème ── */}
        <ThemeSwitcher />

        <div className="avatar" title={user?.displayName}>
          {user?.displayName?.[0]?.toUpperCase() || '?'}
        </div>
        <button className="btn-logout" onClick={logout}>
          Déconnexion
        </button>
      </div>
    </nav>
  )
}