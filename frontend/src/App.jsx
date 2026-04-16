import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './context/authStore'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Pages
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/auth/LoginPage'
import SignupPage         from './pages/auth/SignupPage'
import SearchPage         from './pages/SearchPage'
import CatererProfilePage from './pages/CatererProfilePage'
import CustomerDashboard  from './pages/dashboard/CustomerDashboard'
import CatererDashboard   from './pages/dashboard/CatererDashboard'
import AdminDashboard     from './pages/dashboard/AdminDashboard'
import CatererRegister    from './pages/caterer/CatererRegister'
import CatererOnboarding  from './pages/caterer/CatererOnboarding'
import SubscriptionPage   from './pages/caterer/SubscriptionPage'
import ProfilePage        from './pages/ProfilePage'
import NotFound           from './pages/NotFound'

// Route guards
import ProtectedRoute from './components/ui/ProtectedRoute'
import RoleRoute      from './components/ui/RoleRoute'

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth)
  const loading  = useAuthStore((s) => s.loading)

  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading CaterConnect…</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public */}
              <Route path="/"           element={<LandingPage />} />
              <Route path="/login"      element={<LoginPage />} />
              <Route path="/signup"     element={<SignupPage />} />
              <Route path="/search"     element={<SearchPage />} />
              <Route path="/caterer/:id" element={<CatererProfilePage />} />

              {/* Protected — any logged-in user */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/profile"   element={<ProfilePage />} />
                <Route path="/become-caterer" element={<CatererRegister />} />
              </Route>

              {/* Caterer routes */}
              <Route element={<RoleRoute roles={['caterer', 'admin']} />}>
                <Route path="/caterer/dashboard"  element={<CatererDashboard />} />
                <Route path="/caterer/onboarding" element={<CatererOnboarding />} />
                <Route path="/caterer/subscribe"  element={<SubscriptionPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<RoleRoute roles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
