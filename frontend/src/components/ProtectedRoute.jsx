import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenLoader } from './ui/Spinner'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }
  return children
}
