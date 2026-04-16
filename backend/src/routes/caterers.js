const express  = require('express')
const { Caterer, User } = require('../models')
const { authenticate, requireRole } = require('../middleware/auth')
const { uploadDocs, uploadImages }  = require('../config')
const router = express.Router()

// ── Register as caterer (with doc uploads + payment flag) ──
const docUpload = uploadDocs.fields([
  { name: 'gst',         maxCount: 1 },
  { name: 'aadhaar',     maxCount: 1 },
  { name: 'foodLicense', maxCount: 1 },
])

router.post('/register', authenticate, (req, res, next) => {
  docUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message })
    next()
  })
}, async (req, res) => {
  try {
    const existing = await Caterer.findOne({ user: req.user._id })
    if (existing) return res.status(409).json({ message: 'Caterer profile already exists' })

    const { businessName, description, city, phone, email, services, isVeg, isNonVeg } = req.body

    const documents = {}
    if (req.files?.gst?.[0])          documents.gst         = req.files.gst[0].path
    if (req.files?.aadhaar?.[0])      documents.aadhaar     = req.files.aadhaar[0].path
    if (req.files?.foodLicense?.[0])  documents.foodLicense = req.files.foodLicense[0].path

    const caterer = await Caterer.create({
      user:        req.user._id,
      businessName,
      description,
      city,
      phone,
      email,
      services:    JSON.parse(services || '[]'),
      isVeg:       isVeg === 'true'    || isVeg === true,
      isNonVeg:    isNonVeg === 'true' || isNonVeg === true,
      documents,
      registrationPaid: true, // payment verified before this call
    })

    // Update user role to caterer
    await User.findByIdAndUpdate(req.user._id, { role: 'caterer' })

    res.status(201).json({ message: 'Registration submitted for verification', caterer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Get my caterer profile ──────────────────────────────
router.get('/me', authenticate, requireRole('caterer', 'admin'), async (req, res) => {
  try {
    const caterer = await Caterer.findOne({ user: req.user._id }).populate('user', 'displayName email phoneNumber photoURL')
    if (!caterer) return res.status(404).json({ message: 'Caterer profile not found' })
    res.json({ caterer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Update caterer profile ──────────────────────────────
router.patch('/me', authenticate, requireRole('caterer', 'admin'), async (req, res) => {
  try {
    const allowed = ['description', 'phone', 'email', 'instagramHandle', 'minPrice', 'maxPrice', 'isVeg', 'isNonVeg', 'services']
    const updates = {}
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

    const caterer = await Caterer.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true },
    )
    res.json({ caterer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Dashboard stats ─────────────────────────────────────
router.get('/me/dashboard', authenticate, requireRole('caterer', 'admin'), async (req, res) => {
  try {
    const caterer = await Caterer.findOne({ user: req.user._id })
    if (!caterer) return res.status(404).json({ message: 'Not found' })
    res.json({
      profileViews: caterer.profileViews,
      totalReviews: caterer.totalReviews,
      avgRating:    caterer.avgRating,
      menuCount:    caterer.menuItems?.length || 0,
      totalBookings: caterer.totalBookings,
      verificationStatus: caterer.verificationStatus,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Add menu item ───────────────────────────────────────
router.post('/me/menu', authenticate, requireRole('caterer', 'admin'), async (req, res) => {
  try {
    const caterer = await Caterer.findOne({ user: req.user._id })
    if (!caterer) return res.status(404).json({ message: 'Caterer not found' })

    caterer.menuItems.push(req.body)
    await caterer.save()
    res.status(201).json({ menuItem: caterer.menuItems[caterer.menuItems.length - 1] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Update menu item ────────────────────────────────────
router.patch('/me/menu/:itemId', authenticate, requireRole('caterer', 'admin'), async (req, res) => {
  try {
    const caterer = await Caterer.findOne({ user: req.user._id })
    const item    = caterer?.menuItems?.id(req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Menu item not found' })

    Object.assign(item, req.body)
    await caterer.save()
    res.json({ menuItem: item })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Delete menu item ────────────────────────────────────
router.delete('/me/menu/:itemId', authenticate, requireRole('caterer', 'admin'), async (req, res) => {
  try {
    const caterer = await Caterer.findOne({ user: req.user._id })
    caterer?.menuItems?.pull({ _id: req.params.itemId })
    await caterer?.save()
    res.json({ message: 'Removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Upload gallery images / cover image ──────────────────
const galleryUpload = uploadImages.array('images', 10)

router.post('/me/media', authenticate, requireRole('caterer', 'admin'), (req, res, next) => {
  galleryUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message })
    next()
  })
}, async (req, res) => {
  try {
    const urls     = req.files?.map((f) => f.path) || []
    const isCover  = req.body.isCover === 'true'

    let updateOp
    if (isCover && urls.length > 0) {
      // Set first image as cover photo
      updateOp = {
        $set:  { coverImage: urls[0] },
        $push: urls.length > 1 ? { gallery: { $each: urls.slice(1) } } : {},
      }
    } else {
      updateOp = { $push: { gallery: { $each: urls } } }
    }

    const caterer = await Caterer.findOneAndUpdate(
      { user: req.user._id },
      updateOp,
      { new: true },
    )
    res.json({ gallery: caterer.gallery, coverImage: caterer.coverImage })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Get public caterer profile by ID ─────────────────────
router.get('/:id', async (req, res) => {
  try {
    const caterer = await Caterer.findById(req.params.id)
      .populate('user', 'displayName photoURL')

    if (!caterer || caterer.verificationStatus !== 'approved') {
      return res.status(404).json({ message: 'Caterer not found' })
    }

    // Increment profile views (fire-and-forget)
    Caterer.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } }).exec()

    res.json({ caterer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
