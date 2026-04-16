// ═══════════════════════════════════════════════
// routes/auth.js
// ═══════════════════════════════════════════════
const express = require('express')
const { admin }   = require('../config')
const { User }    = require('../models')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

// Sync Firebase user with MongoDB
router.post('/sync', async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = await admin.auth().verifyIdToken(header.slice(7))
    const { uid, email, name: displayName, picture: photoURL, phone_number: phoneNumber } = decoded

    // Auto-assign admin role
    const adminUids = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim())
    const role = adminUids.includes(uid) ? 'admin' : undefined

    let user = await User.findOne({ uid })
    if (!user) {
      user = await User.create({
        uid, email, displayName: displayName || req.body.displayName,
        photoURL: photoURL || req.body.photoURL,
        phoneNumber: phoneNumber || req.body.phoneNumber,
        role: role || 'customer',
      })
    } else {
      // Update display info
      user.email       = email       || user.email
      user.displayName = req.body.displayName || user.displayName
      user.photoURL    = req.body.photoURL    || user.photoURL
      user.phoneNumber = phoneNumber || req.body.phoneNumber || user.phoneNumber
      if (role) user.role = role
      await user.save()
    }
    res.json({ user })
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }))

router.patch('/role', authenticate, async (req, res) => {
  const { role } = req.body
  if (!['customer', 'caterer'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
  req.user.role = role
  await req.user.save()
  res.json({ user: req.user })
})

module.exports = router
