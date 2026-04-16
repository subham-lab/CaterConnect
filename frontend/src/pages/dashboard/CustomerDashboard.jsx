import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiStar, FiCalendar, FiHeart } from 'react-icons/fi'
import useAuthStore from '../../context/authStore'
import { searchAPI } from '../../services/api'

export default function CustomerDashboard() {
  const user   = useAuthStore((s) => s.user)
  const dbUser = useAuthStore((s) => s.dbUser)
  const name   = user?.displayName?.split(' ')[0] || 'there'

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn:  () => searchAPI.getFeatured().then((r) => r.data.caterers),
    staleTime: 5 * 60_000,
  })

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Hi, {name} 👋
          </h1>
          <p className="text-white/40">Find your perfect catering partner today</p>
        </motion.div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: <FiSearch className="text-2xl text-brand-400" />, label: 'Find Caterers',    desc: 'Search by location & event',   to: '/search' },
            { icon: <FiStar   className="text-2xl text-yellow-400" />, label: 'Top Rated',       desc: 'Browse highest rated caterers', to: '/search?sort=rating' },
            { icon: <FiCalendar className="text-2xl text-blue-400" />, label: 'Wedding Special', desc: 'Premium wedding caterers',      to: '/search?event=Wedding' },
          ].map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={item.to} className="glass p-5 flex items-center gap-4 hover:border-brand-500/20 transition-all group block">
                <div className="w-12 h-12 rounded-xl glass-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{item.label}</div>
                  <div className="text-white/40 text-xs">{item.desc}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured caterers */}
        {featured?.length > 0 && (
          <div>
            <h2 className="font-semibold text-white text-lg mb-4">Recommended for you</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((c) => (
                <Link key={c._id} to={`/caterer/${c._id}`}
                  className="glass p-4 flex items-center gap-3 hover:border-brand-500/20 transition-all">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-50">
                    {c.coverImage
                      ? <img src={c.coverImage} alt={c.businessName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{c.businessName}</div>
                    <div className="text-xs text-white/40">{c.city}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <FiStar className="text-yellow-400 text-xs" style={{ fill: '#facc15' }} />
                    <span className="text-white">{Number(c.avgRating || 0).toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
