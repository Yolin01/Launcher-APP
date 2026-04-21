import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { registerUser } from '../services/authService'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isRegister) {
        const { token, user } = await registerUser({ email, password, displayName })
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        navigate('/')
      } else {
        await login(email, password)
        navigate('/')
      }
    } catch {
      setError(isRegister
        ? 'Erreur lors de la création du compte'
        : 'Email ou mot de passe incorrect'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">A</div>
        <h1>AppLauncher</h1>
        <h2>{isRegister ? 'Créer un compte' : 'Connexion'}</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Votre prénom"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? 'Chargement...'
              : isRegister ? 'Créer mon compte' : 'Se connecter'
            }
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '13px', textAlign: 'center' }}>
          {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null) }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: '500',
              marginLeft: '6px'
            }}
          >
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>

      </div>
    </div>
  )
}