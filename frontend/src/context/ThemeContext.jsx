import { createContext, useState, useEffect, useContext, useRef } from 'react'
import { getThemes, activateTheme } from '../services/themeService'
import { AuthContext } from './AuthContext'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [themes, setThemes] = useState([])
  const [activeTheme, setActiveTheme] = useState(null)
  const loadedRef = useRef(false) // ← empêche les rechargements en boucle

  useEffect(() => {
    if (user?._id && !loadedRef.current) {
      loadedRef.current = true
      refreshThemes()
    }
    if (!user?._id) {
      loadedRef.current = false
      setThemes([])
      setActiveTheme(null)
    }
  }, [user?._id])

  // ── N'applique le thème QUE si _id change vraiment ──
  useEffect(() => {
    if (activeTheme?._id) {
      applyToDom(activeTheme)
    }
  }, [activeTheme?._id])

  const refreshThemes = async () => {
    try {
      const data = await getThemes()
      // ── Ne met à jour QUE si on a des données ──────
      if (!data || data.length === 0) return
      setThemes(data)
      const def = data.find(t => t.isDefault) ?? data[0]
      setActiveTheme(prev => {
        if (prev?._id === def._id) return prev
        return def
      })
    } catch (err) {
      console.error('Erreur thèmes :', err)
    }
  }

  const applyToDom = (t) => {
    const r = document.documentElement
    r.style.setProperty('--color-primary',   t.primaryColor)
    r.style.setProperty('--color-secondary', t.secondaryColor)
    r.style.setProperty('--color-bg',        t.bgColor)
    r.style.setProperty('--font-main',       t.fontFamily)
    r.setAttribute('data-theme', t.isDark ? 'dark' : 'light')
  }

  const applyTheme = async (theme) => {
    await activateTheme(theme._id)
    setActiveTheme(theme)
  }

  return (
    <ThemeContext.Provider value={{ themes, activeTheme, applyTheme, refreshThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}