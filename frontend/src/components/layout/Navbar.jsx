import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiGrid } from 'react-icons/fi'
import { MdRestaurantMenu } from 'react-icons/md'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [dropOpen,   setDropOpen]   = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const user      = useAuthStore((s) => s.user)
  const dbUser    = useAuthStore((s) => s.dbUser)
  const logout    = useAuthStore((s) => s.logout)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const dashboardPath = () => {
    if (dbUser?.role === 'admin')   return '/admin'
    if (dbUser?.role === 'caterer') return '/caterer/dashboard'
    return '/dashboard'
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(15,15,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
              <MdRestaurantMenu className="text-white text-lg" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Cater<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/search">Find Caterers</NavLink>
            <NavLink to="/become-caterer">List Your Service</NavLink>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/search"
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <FiSearch className="text-lg" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-sm hover:border-brand-500/30 transition-all"
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                    : <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center text-xs text-brand-300 font-semibold">
                        {(user.displayName || user.email)?.[0]?.toUpperCase()}
                      </div>
                  }
                  <span className="text-sm text-white/80 max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass py-2 shadow-2xl"
                      onMouseLeave={() => setDropOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs text-white/40">Signed in as</p>
                        <p className="text-sm text-white truncate">{user.email || user.phoneNumber}</p>
                        {dbUser?.role && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                            {dbUser.role}
                          </span>
                        )}
                      </div>
                      <DropItem to={dashboardPath()} icon={<FiGrid />} onClick={() => setDropOpen(false)}>
                        Dashboard
                      </DropItem>
                      <DropItem to="/profile" icon={<FiUser />} onClick={() => setDropOpen(false)}>
                        Profile
                      </DropItem>
                      <button
                        onClick={() => { setDropOpen(false); handleLogout() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login"  className="btn-ghost py-2 text-sm">Login</Link>
                <Link to="/signup" className="btn-primary py-2 text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <MobileNavLink to="/search">Find Caterers</MobileNavLink>
              <MobileNavLink to="/become-caterer">List Your Service</MobileNavLink>
              {user ? (
                <>
                  <MobileNavLink to={dashboardPath()}>Dashboard</MobileNavLink>
                  <button onClick={handleLogout} className="text-left text-sm text-red-400 py-2">Logout</button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login">Login</MobileNavLink>
                  <MobileNavLink to="/signup">Sign Up</MobileNavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

const NavLink = ({ to, children }) => (
  <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors font-medium">
    {children}
  </Link>
)

const MobileNavLink = ({ to, children }) => (
  <Link to={to} className="text-sm text-white/70 hover:text-white py-2 transition-colors">
    {children}
  </Link>
)

const DropItem = ({ to, icon, children, onClick }) => (
  <Link to={to} onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
    {icon} {children}
  </Link>
)
