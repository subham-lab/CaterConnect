const express  = require('express')
const { Caterer } = require('../models')
const router   = express.Router()

// ── Main search ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      q, location, event, sort = 'rating',
      minPrice, maxPrice, veg, minRating = 0,
      page = 1, limit = 20,
    } = req.query

    // Base filter — only show approved caterers
    const filter = { verificationStatus: 'approved' }

    // Text search
    if (q) {
      filter.$text = { $search: q }
    }

    // Location (case-insensitive city match)
    if (location) {
      filter.city = { $regex: location, $options: 'i' }
    }

    // Event type
    if (event && event !== 'All') {
      filter.services = event
    }

    // Price range (per plate)
    if (minPrice || maxPrice) {
      filter.minPrice = {}
      if (minPrice) filter.minPrice.$gte = Number(minPrice)
      if (maxPrice) filter.minPrice.$lte = Number(maxPrice)
    }

    // Veg only
    if (veg === 'true') {
      filter.isVeg = true
    }

    // Minimum rating
    if (Number(minRating) > 0) {
      filter.avgRating = { $gte: Number(minRating) }
    }

    // Sort
    const sortMap = {
      rating:     { avgRating: -1, totalReviews: -1 },
      price_asc:  { minPrice: 1 },
      price_desc: { minPrice: -1 },
      reviews:    { totalReviews: -1 },
      newest:     { createdAt: -1 },
    }
    const sortObj = sortMap[sort] || sortMap.rating

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Caterer.countDocuments(filter)

    const caterers = await Caterer.find(filter)
      .populate('user', 'displayName photoURL')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean()

    res.json({
      caterers,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Featured caterers (top 6 by rating) ─────────────────
router.get('/featured', async (req, res) => {
  try {
    const caterers = await Caterer.find({ verificationStatus: 'approved', totalReviews: { $gte: 0 } })
      .populate('user', 'displayName photoURL')
      .sort({ avgRating: -1, totalReviews: -1 })
      .limit(6)
      .lean()
    res.json({ caterers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Search by location (for autocomplete / location page) ─
router.get('/location/:location', async (req, res) => {
  try {
    const { location } = req.params
    const { sort = 'rating', limit = 12 } = req.query

    const caterers = await Caterer.find({
      verificationStatus: 'approved',
      city: { $regex: location, $options: 'i' },
    })
      .populate('user', 'displayName photoURL')
      .sort({ avgRating: -1 })
      .limit(Number(limit))
      .lean()

    res.json({ caterers, location })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
