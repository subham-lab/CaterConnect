import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiFilter, FiX, FiMapPin, FiSliders, FiChevronDown } from 'react-icons/fi'
import { searchAPI } from '../services/api'
import CatererCard from '../components/caterer/CatererCard'
import CatererCardSkeleton from '../components/caterer/CatererCardSkeleton'

const EVENT_TYPES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Pooja', 'Engagement', 'Anniversary', 'Baby Shower']
const SORT_OPTIONS = [
  { value: 'rating',   label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'reviews',  label: 'Most Reviewed' },
  { value: 'newest',   label: 'Newest First' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters]   = useState(false)

  // Filter state
  const [query,    setQuery]    = useState(searchParams.get('q')        || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [event,    setEvent]    = useState(searchParams.get('event')    || 'All')
  const [sort,     setSort]     = useState(searchParams.get('sort')     || 'rating')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [vegOnly,  setVegOnly]  = useState(searchParams.get('veg') === 'true')
  const [minRating,setMinRating]= useState(searchParams.get('minRating') || '0')

  // Build query params
  const buildParams = () => ({
    q:         query    || undefined,
    location:  location || undefined,
    event:     event !== 'All' ? event : undefined,
    sort,
    minPrice:  minPrice  || undefined,
    maxPrice:  maxPrice  || undefined,
    veg:       vegOnly   || undefined,
    minRating: minRating !== '0' ? minRating : undefined,
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query, location, event, sort, minPrice, maxPrice, vegOnly, minRating],
    queryFn: () => searchAPI.search(buildParams()).then((r) => r.data),
    keepPreviousData: true,
  })

  // Sync URL
  useEffect(() => {
    const p = {}
    if (query)    p.q        = query
    if (location) p.location = location
    if (event !== 'All') p.event = event
    if (sort !== 'rating')    p.sort  = sort
    if (minPrice) p.minPrice = minPrice
    if (maxPrice) p.maxPrice = maxPrice
    if (vegOnly)  p.veg      = 'true'
    if (minRating !== '0') p.minRating = minRating
    setSearchParams(p)
  }, [query, location, event, sort, minPrice, maxPrice, vegOnly, minRating])

  const caterers    = data?.caterers || []
  const totalCount  = data?.total    || 0
  const activeFilters = [
    event !== 'All' && event,
    vegOnly && 'Veg only',
    minRating !== '0' && `${minRating}★+`,
    (minPrice || maxPrice) && `₹${minPrice||'0'}–₹${maxPrice||'∞'}`,
  ].filter(Boolean)

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Search bar ─────────────────────────────── */}
        <div className="glass p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 flex items-center gap-3">
            <FiSearch className="text-white/30 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search caterers, cuisines, events…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          <div className="w-px h-6 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FiMapPin className="text-white/30 flex-shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or area…"
              className="flex-1 sm:w-44 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0 ${
              showFilters || activeFilters.length > 0
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'btn-ghost'
            }`}
          >
            <FiSliders />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Active filter pills ─────────────────────── */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f) => (
              <span key={f} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs border border-brand-500/20">
                {f}
                <button onClick={() => {
                  if (f === 'Veg only') setVegOnly(false)
                  else if (f.endsWith('★+')) setMinRating('0')
                  else if (f.startsWith('₹')) { setMinPrice(''); setMaxPrice('') }
                  else setEvent('All')
                }}><FiX className="text-xs" /></button>
              </span>
            ))}
            <button onClick={() => { setEvent('All'); setVegOnly(false); setMinRating('0'); setMinPrice(''); setMaxPrice('') }}
              className="text-xs text-white/30 hover:text-white transition-colors px-2">
              Clear all
            </button>
          </div>
        )}

        {/* ── Expanded filters panel ──────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Price range */}
                <div>
                  <label className="input-label">Price Range (₹ per plate)</label>
                  <div className="flex gap-2">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min" className="input-field" />
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max" className="input-field" />
                  </div>
                </div>

                {/* Min rating */}
                <div>
                  <label className="input-label">Minimum Rating</label>
                  <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
                    className="input-field">
                    <option value="0">Any rating</option>
                    <option value="3">3★ and above</option>
                    <option value="4">4★ and above</option>
                    <option value="4.5">4.5★ and above</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="input-label">Sort By</label>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="input-field">
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Veg toggle */}
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setVegOnly(!vegOnly)}
                      className={`relative w-11 h-6 rounded-full transition-all ${vegOnly ? 'bg-green-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${vegOnly ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm text-white/60">Veg only</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Event type pills ────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {EVENT_TYPES.map((e) => (
            <button key={e}
              onClick={() => setEvent(e)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                event === e
                  ? 'bg-brand-500 text-white'
                  : 'glass-sm text-white/50 hover:text-white'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* ── Results header ──────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-semibold text-lg">
              {isLoading ? 'Searching…' : `${totalCount} caterers found`}
            </h1>
            {location && (
              <p className="text-white/40 text-sm flex items-center gap-1">
                <FiMapPin className="text-xs" /> {location}
              </p>
            )}
          </div>

          {/* Sort dropdown (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/30 text-xs">Sort:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm text-white/60 outline-none border border-white/10 rounded-lg px-3 py-1.5 cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Grid ──────────────────────────────────── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CatererCardSkeleton key={i} />)}
          </div>
        ) : caterers.length === 0 ? (
          <EmptyState query={query} location={location} onClear={() => { setQuery(''); setLocation(''); setEvent('All') }} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {caterers.map((caterer, i) => (
              <motion.div key={caterer._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <CatererCard caterer={caterer} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ query, location, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4 opacity-30">🔍</div>
      <h3 className="text-white font-semibold text-lg mb-2">No caterers found</h3>
      <p className="text-white/40 text-sm max-w-xs mb-6">
        {query || location
          ? `No results for "${[query, location].filter(Boolean).join(' in ')}". Try different keywords or location.`
          : 'No caterers match your current filters.'}
      </p>
      <button onClick={onClear} className="btn-ghost text-sm">Clear filters</button>
    </div>
  )
}
