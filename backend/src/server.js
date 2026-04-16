require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const mongoose     = require('mongoose')

const authRoutes    = require('./routes/auth')
const catererRoutes = require('./routes/caterers')
const searchRoutes  = require('./routes/search')
const reviewRoutes  = require('./routes/reviews')
const paymentRoutes = require('./routes/payments')
const adminRoutes   = require('./routes/admin')
const { globalErrorHandler } = require('./middleware/errorHandler')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Connect MongoDB ─────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => { console.error('❌ MongoDB error:', err); process.exit(1) })

// ── Middleware ──────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://caterconnect.vercel.app', process.env.FRONTEND_URL]
    : true,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { message: 'Too many requests. Please try again later.' },
}))

// Auth endpoints get tighter limits
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
}))

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/caterers', catererRoutes)
app.use('/api/search',   searchRoutes)
app.use('/api/reviews',  reviewRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin',    adminRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ── Global error handler ────────────────────────────────
app.use(globalErrorHandler)

app.listen(PORT, () => console.log(`🚀 CaterConnect backend running on port ${PORT}`))
