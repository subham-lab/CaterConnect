const { admin } = require('../config')
const { User }  = require('../models')

/** Verify Firebase ID token → attach req.user (DB user) */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  const token = header.slice(7)
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const dbUser  = await User.findOne({ uid: decoded.uid })
    if (!dbUser) return res.status(401).json({ message: 'User not found. Please log in again.' })
    if (dbUser.isBanned) return res.status(403).json({ message: 'Your account has been suspended.' })
    req.firebaseUser = decoded
    req.user         = dbUser
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/** Optional auth — doesn't fail if no token */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next()
  const token = header.slice(7)
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const dbUser  = await User.findOne({ uid: decoded.uid })
    req.firebaseUser = decoded
    req.user         = dbUser
  } catch (_) {}
  next()
}

/** Role guard — use after authenticate */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }
  next()
}

module.exports = { authenticate, optionalAuth, requireRole }
