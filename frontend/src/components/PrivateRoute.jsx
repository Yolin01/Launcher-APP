import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
// Redirige vers /login si l'utilisateur n'est pas connecté
export default function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Chargement...</div>
  return user
    ? <Outlet />
    : <Navigate to="/login" replace />
}