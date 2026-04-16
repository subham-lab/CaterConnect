import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiSearch, FiStar, FiShield, FiArrowRight, FiCheck, FiMapPin } from 'react-icons/fi'
import { MdVerified, MdRestaurantMenu } from 'react-icons/md'
import { useQuery } from '@tanstack/react-query'
import { searchAPI } from '../services/api'
import CatererCard from '../components/caterer/CatererCard'
import HeroCanvas from '../components/ui/HeroCanvas'

const STATS = [
  { label: 'Verified Caterers', value: 1200, suffix: '+' },
  { label: 'Events Catered',    value: 15000, suffix: '+' },
  { label: 'Cities Covered',    value: 48, suffix: '' },
  { label: 'Happy Customers',   value: 50000, suffix: '+' },
]

const FEATURES = [
  {
    icon: <MdVerified className="text-2xl text-green-400" />,
    title: 'Verified Caterers',
    desc: 'Every caterer is verified with GST, Aadhaar, and FSSAI food license checks.',
  },
  {
    icon: <FiShield className="text-2xl text-blue-400" />,
    title: 'Secure Payments',
    desc: 'Payments powered by Razorpay — bank-grade security for every transaction.',
  },
  {
    icon: <FiStar className="text-2xl text-yellow-400" />,
    title: 'Genuine Reviews',
    desc: 'Only customers who booked can leave reviews. Authentic feedback you can trust.',
  },
  {
    icon: <MdRestaurantMenu className="text-2xl text-brand-400" />,
    title: 'Transparent Menus',
    desc: 'Browse full menus with itemized pricing. No hidden charges, ever.',
  },
]

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Engagement', 'Baby Shower', 'Pooja', 'Anniversary', 'Social Gathering']

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

export default function LandingPage() {
  const navigate  = useNavigate()
  const [query, setQuery]       = useState('')
  const [location, setLocation] = useState('')

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn:  () => searchAPI.getFeatured().then((r) => r.data.caterers),
    staleTime: 5 * 60_000,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query)    params.set('q', query)
    if (location) params.set('location', location)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* 3D canvas background */}
        <div className="absolute inset-0 z-0">
          <HeroCanvas />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-1"
          style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 z-1"
          style={{ background: 'linear-gradient(to top, #0f0f1a, transparent)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-sm mb-6 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70">India's #1 Verified Catering Marketplace</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your Perfect
              <br />
              <span className="gradient-text">Catering Partner</span>
            </h1>

            <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with verified, professional caterers for weddings, corporate events,
              birthdays, and more — with transparent pricing and genuine reviews.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch}
              className="glass flex flex-col sm:flex-row items-center gap-3 p-3 max-w-2xl mx-auto mb-8">
              <div className="flex-1 flex items-center gap-3 w-full">
                <FiSearch className="text-white/30 text-lg ml-2 flex-shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Wedding, birthday, corporate..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex-1 flex items-center gap-3 w-full">
                <FiMapPin className="text-white/30 text-lg ml-2 flex-shrink-0 sm:ml-0" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or area..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto px-8 py-2.5 flex-shrink-0">
                Search
              </button>
            </form>

            {/* Quick event types */}
            <div className="flex flex-wrap justify-center gap-2">
              {EVENT_TYPES.map((type) => (
                <button key={type}
                  onClick={() => navigate(`/search?q=${type}`)}
                  className="px-3 py-1 text-xs rounded-full glass-sm text-white/50 hover:text-white hover:border-brand-500/30 transition-all">
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-sm p-6 text-center"
              >
                <div className="font-display text-3xl font-bold gradient-text">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/40 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-4">
              Why <span className="gradient-text">CaterConnect</span>?
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              We solve the trust problem in catering. Every caterer is background-checked and verified before listing.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="glass p-6 group hover:border-brand-500/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl glass-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Caterers ─────────────────────────── */}
      {featured?.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <h2 className="section-title mb-2">
                  Featured <span className="gradient-text">Caterers</span>
                </h2>
                <p className="text-white/40">Top-rated caterers on our platform</p>
              </div>
              <Link to="/search" className="hidden sm:flex items-center gap-2 text-brand-400 text-sm hover:text-brand-300 transition-colors">
                View all <FiArrowRight />
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 6).map((caterer, i) => (
                <motion.div key={caterer._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <CatererCard caterer={caterer} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-4">How It <span className="gradient-text">Works</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

            {[
              { step: '01', title: 'Search', desc: 'Find caterers by location, event type, and budget.' },
              { step: '02', title: 'Review', desc: 'View menus, photos, and verified customer reviews.' },
              { step: '03', title: 'Book', desc: 'Contact the caterer and book directly via the platform.' },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass p-8 text-center relative"
              >
                <div className="font-display text-5xl font-bold gradient-text mb-4 opacity-40">{item.step}</div>
                <h3 className="font-semibold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — Caterers ────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10"
              style={{ background: 'radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="section-title mb-4">
                Are you a <span className="gradient-text">Caterer</span>?
              </h2>
              <p className="text-white/50 max-w-xl mx-auto mb-8">
                Join 1,200+ verified caterers on CaterConnect. List your services, showcase your menus,
                and grow your catering business online.
              </p>
              <ul className="flex flex-wrap justify-center gap-4 mb-8">
                {['₹99 one-time registration', '₹3000/yr subscription', 'Unlimited bookings', '24hr verification'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                    <FiCheck className="text-green-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/become-caterer" className="btn-primary inline-flex items-center gap-2">
                Start Listing Today <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
