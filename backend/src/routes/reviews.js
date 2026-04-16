const express  = require('express')
const { Review, Caterer } = require('../models')
const { authenticate, optionalAuth } = require('../middleware/auth')
const router   = express.Router()

// ── Get reviews for a caterer ────────────────────────────
router.get('/:catererId', optionalAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ caterer: req.params.catererId })
      .populate('user', 'displayName photoURL')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    res.json({ reviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Add a review ─────────────────────────────────────────
router.post('/:catererId', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }
    if (!comment?.trim()) {
      return res.status(400).json({ message: 'Comment is required' })
    }

    const caterer = await Caterer.findById(req.params.catererId)
    if (!caterer) return res.status(404).json({ message: 'Caterer not found' })

    // Check for duplicate (one per user per caterer — enforced by unique index)
    const review = await Review.create({
      caterer: req.params.catererId,
      user:    req.user._id,
      rating:  Number(rating),
      comment: comment.trim(),
    })

    await review.populate('user', 'displayName photoURL')
    res.status(201).json({ review })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this caterer' })
    }
    res.status(500).json({ message: err.message })
  }
})

// ── Delete own review ────────────────────────────────────
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
    if (!review) return res.status(404).json({ message: 'Review not found' })

    // Only the author or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' })
    }

    await review.deleteOne()
    res.json({ message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
