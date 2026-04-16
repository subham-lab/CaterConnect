const express  = require('express')
const crypto   = require('crypto')
const { razorpay } = require('../config')
const { Payment, Caterer, User } = require('../models')
const { authenticate } = require('../middleware/auth')
const router   = express.Router()

// ── Create Razorpay order ────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
  console.log("Creating Razorpay order...")
  console.log("BODY:", req.body)
  console.log("USER:", req.user)
  try {
    const { amount, type } = req.body

    // Validate amounts
    const validAmounts = { registration: 9900, subscription: 300000 } // paise
    if (!validAmounts[type]) {
      return res.status(400).json({ message: 'Invalid payment type' })
    }
    if (amount !== validAmounts[type]) {
      return res.status(400).json({ message: 'Amount tampered' })
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `cc_${type}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        type,
      },
    }) 

    // Record payment attempt
    await Payment.create({
      user:            req.user._id,
      type,
      amount:          amount / 100, // store in rupees
      razorpayOrderId: order.id,
      status:          'created',
    })

    res.json(order)
  } catch (err) {
    console.log("RAZORPAY ERROR:", err)
    res.status(500).json({ message: err.message })
  }
})

// ── Verify payment signature ─────────────────────────────
router.post('/verify', authenticate, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
    } = req.body

    // Verify HMAC signature
    const body      = razorpay_order_id + '|' + razorpay_payment_id
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' })
    }

    // Mark payment as paid
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'paid', razorpayPaymentId: razorpay_payment_id },
    )

    // Apply effects
    if (type === 'registration') {
      await Caterer.findOneAndUpdate(
        { user: req.user._id },
        { registrationPaid: true },
      )
    }

    if (type === 'subscription') {
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1)
      await Caterer.findOneAndUpdate(
        { user: req.user._id },
        { subscriptionExpiry: expiry },
      )
    }

    res.json({ success: true, message: 'Payment verified successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Payment history ──────────────────────────────────────
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    res.json({ payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
