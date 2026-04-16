import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../context/authStore'

/** Requires any authenticated user */
export default function ProtectedRoute() {
  const user     = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}
