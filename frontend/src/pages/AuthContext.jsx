import { createContext, useState, useEffect, useRef } from 'react'
import { loginUser, registerUser } from '../services/authService'
import api from '../services/api'  // ← ici

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { user: u, token } = await loginUser({ email, password })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)

    // Crée un thème par défaut si l'utilisateur n'en a pas
    try {
      await api.post('/api/themes', {
        name: 'Violet',
        primaryColor: '#6C63FF',
        secondaryColor: '#FF6584',
        bgColor: '#F7F8FC',
        fontFamily: 'Inter',
        isDark: false,
        isDefault: true
      })
    } catch {
      // Thème déjà existant — on ignore
    }
  }

  const register = async (data) => {
    const { user: u, token } = await registerUser(data)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)

    // Crée aussi un thème par défaut à l'inscription
    try {
      await api.post('/api/themes', {
        name: 'Violet',
        primaryColor: '#6C63FF',
        secondaryColor: '#FF6584',
        bgColor: '#F7F8FC',
        fontFamily: 'Inter',
        isDark: false,
        isDefault: true
      })
    } catch {
      // Thème déjà existant — on ignore
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}