const express  = require('express')
const { Caterer, User, Review, Payment } = require('../models')
const { authenticate, requireRole }      = require('../middleware/auth')
const router   = express.Router()

// All admin routes require admin role
router.use(authenticate, requireRole('admin'))

// ── Pending caterers ─────────────────────────────────────
router.get('/caterers/pending', async (req, res) => {
  try {
    const caterers = await Caterer.find({ verificationStatus: 'pending' })
      .populate('user', 'displayName email phoneNumber photoURL')
      .sort({ createdAt: 1 }) // oldest first
      .lean()
    res.json({ caterers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── All caterers (paginated) ─────────────────────────────
router.get('/caterers', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const filter = status ? { verificationStatus: status } : {}

    const [caterers, total] = await Promise.all([
      Caterer.find(filter)
        .populate('user', 'displayName email phoneNumber')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Caterer.countDocuments(filter),
    ])
    res.json({ caterers, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Approve caterer ───────────────────────────────────────
router.patch('/caterers/:id/approve', async (req, res) => {
  try {
    const caterer = await Caterer.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: 'approved',
        verifiedAt:         new Date(),
        $unset: { rejectionReason: '' },
      },
      { new: true },
    ).populate('user', 'displayName email')

    if (!caterer) return res.status(404).json({ message: 'Caterer not found' })

    // Ensure user role is caterer
    await User.findByIdAndUpdate(caterer.user._id, { role: 'caterer' })

    // TODO: send approval email notification here

    res.json({ message: 'Caterer approved', caterer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Reject caterer ────────────────────────────────────────
router.patch('/caterers/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason?.trim()) return res.status(400).json({ message: 'Rejection reason required' })

    const caterer = await Caterer.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected', rejectionReason: reason.trim() },
      { new: true },
    )
    if (!caterer) return res.status(404).json({ message: 'Caterer not found' })

    // TODO: send rejection email notification here

    res.json({ message: 'Caterer rejected', caterer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── All users ─────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 30, role } = req.query
    const filter = role ? { role } : {}
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ])
    res.json({ users, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Ban / unban user ─────────────────────────────────────
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.isBanned = !user.isBanned
    await user.save()
    res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Platform stats ────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCaterers,
      approvedCaterers,
      pendingCaterers,
      totalReviews,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Caterer.countDocuments(),
      Caterer.countDocuments({ verificationStatus: 'approved' }),
      Caterer.countDocuments({ verificationStatus: 'pending' }),
      Review.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    res.json({
      totalUsers,
      totalCaterers,
      approvedCaterers,
      pendingCaterers,
      totalReviews,
      totalRevenue: revenueAgg[0]?.total || 0,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Delete review (moderation) ────────────────────────────
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id)
    res.json({ message: 'Review removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
