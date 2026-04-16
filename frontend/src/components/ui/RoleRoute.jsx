import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../context/authStore'

/** Requires authenticated user with a specific role */
export default function RoleRoute({ roles }) {
  const user     = useAuthStore((s) => s.user)
  const dbUser   = useAuthStore((s) => s.dbUser)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (dbUser && !roles.includes(dbUser.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
