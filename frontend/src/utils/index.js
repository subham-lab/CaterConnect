// ── Currency ────────────────────────────────────────────────
export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPriceRange = (min, max) => {
  if (!min && !max) return null
  if (!min) return `Up to ${formatINR(max)}`
  if (!max) return `From ${formatINR(min)}`
  return `${formatINR(min)} – ${formatINR(max)}`
}

// ── Date / time ─────────────────────────────────────────────
export const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', ...opts,
  })

export const formatRelativeTime = (date) => {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins  < 1)   return 'Just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  if (days  < 30)  return `${Math.floor(days / 7)}w ago`
  if (days  < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// ── String helpers ───────────────────────────────────────────
export const truncate = (str, len = 80) =>
  str && str.length > len ? str.slice(0, len).trimEnd() + '…' : str

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

// ── Validation ───────────────────────────────────────────────
export const isValidPhone = (phone) =>
  /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isValidGST = (gst) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)

// ── Rating helpers ───────────────────────────────────────────
export const formatRating = (rating) =>
  rating ? Number(rating).toFixed(1) : '—'

export const ratingLabel = (rating) => {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.5) return 'Good'
  if (rating >= 3.0) return 'Average'
  return 'Below Average'
}

// ── File helpers ─────────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1_048_576)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

export const isImageFile = (file) =>
  file?.type?.startsWith('image/')

export const isPDFFile = (file) =>
  file?.type === 'application/pdf'

// ── URL helpers ───────────────────────────────────────────────
export const buildSearchURL = (params) => {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'All') p.set(k, v)
  })
  return `/search?${p.toString()}`
}

// ── Color helpers ─────────────────────────────────────────────
export const serviceColor = (service) => {
  const map = {
    Wedding:          'bg-pink-500/10 text-pink-300 border-pink-500/20',
    Birthday:         'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    Corporate:        'bg-blue-500/10 text-blue-300 border-blue-500/20',
    Pooja:            'bg-orange-500/10 text-orange-300 border-orange-500/20',
    Engagement:       'bg-rose-500/10 text-rose-300 border-rose-500/20',
    Anniversary:      'bg-purple-500/10 text-purple-300 border-purple-500/20',
    'Baby Shower':    'bg-teal-500/10 text-teal-300 border-teal-500/20',
    'Social Gathering':'bg-green-500/10 text-green-300 border-green-500/20',
  }
  return map[service] || 'bg-brand-500/10 text-brand-300 border-brand-500/20'
}

export const verificationColor = (status) => {
  const map = {
    approved: 'text-green-400 bg-green-500/10 border-green-500/20',
    pending:  'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
  }
  return map[status] || 'text-white/40 bg-white/5 border-white/10'
}
