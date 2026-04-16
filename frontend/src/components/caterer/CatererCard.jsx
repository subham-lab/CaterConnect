import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiStar, FiMapPin, FiUsers } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'

const EVENT_COLORS = {
  Wedding:   'bg-pink-500/10 text-pink-300 border-pink-500/20',
  Birthday:  'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  Corporate: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Pooja:     'bg-orange-500/10 text-orange-300 border-orange-500/20',
  default:   'bg-brand-500/10 text-brand-300 border-brand-500/20',
}

export default function CatererCard({ caterer }) {
  const {
    _id,
    businessName,
    coverImage,
    city,
    avgRating = 0,
    totalReviews = 0,
    services = [],
    minPrice,
    maxPrice,
    isVeg,
    isNonVeg,
    user,
  } = caterer

  const rating     = Number(avgRating).toFixed(1)
  const hasRatings = totalReviews > 0

  return (
    <Link to={`/caterer/${_id}`}>
      <motion.div
        className="caterer-card group"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Cover image */}
        <div className="relative h-44 overflow-hidden rounded-t-2xl bg-surface-50">
          {coverImage ? (
            <img
              src={coverImage}
              alt={businessName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(14,165,233,0.1))' }}>
              <span className="text-5xl opacity-30">🍽️</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Veg/Non-veg badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {isVeg    && <span className="badge badge-veg text-xs">🌿 Veg</span>}
            {isNonVeg && <span className="badge badge-nonveg text-xs">🍖 Non-Veg</span>}
          </div>

          {/* Rating badge */}
          {hasRatings && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
              <FiStar className="text-yellow-400 text-xs" />
              <span className="text-white text-xs font-semibold">{rating}</span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-semibold text-white text-sm truncate">{businessName}</h3>
                <MdVerified className="text-green-400 text-sm flex-shrink-0" title="Verified" />
              </div>
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <FiMapPin className="text-xs" />
                <span className="truncate">{city || 'India'}</span>
              </div>
            </div>

            {/* Price range */}
            {(minPrice || maxPrice) && (
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-white/40">Starting</div>
                <div className="text-sm font-semibold text-brand-300">
                  ₹{minPrice?.toLocaleString('en-IN') || '—'}
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {services.slice(0, 3).map((svc) => (
                <span key={svc}
                  className={`text-xs px-2 py-0.5 rounded-full border ${EVENT_COLORS[svc] || EVENT_COLORS.default}`}>
                  {svc}
                </span>
              ))}
              {services.length > 3 && (
                <span className="text-xs text-white/30">+{services.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-xs ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}`}
                  style={{ fill: star <= Math.round(avgRating) ? '#facc15' : 'none' }}
                />
              ))}
              {hasRatings && (
                <span className="text-white/30 text-xs ml-1">({totalReviews})</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <FiUsers className="text-xs" />
              <span>{caterer.totalBookings || 0} bookings</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
