const mongoose = require('mongoose')
const { Schema } = mongoose

// ── User ─────────────────────────────────────────────────
const userSchema = new Schema({
  uid:         { type: String, required: true, unique: true },
  email:       { type: String, sparse: true },
  phoneNumber: { type: String, sparse: true },
  displayName: String,
  photoURL:    String,
  role:        { type: String, enum: ['customer', 'caterer', 'admin'], default: 'customer' },
  isBanned:    { type: Boolean, default: false },
}, { timestamps: true })

// ── Caterer profile ───────────────────────────────────────
const menuItemSchema = new Schema({
  name:          { type: String, required: true },
  description:   String,
  pricePerPlate: { type: Number, required: true },
  category:      { type: String, enum: ['Starter','Main Course','Dessert','Beverages','Snacks','Breads','Rice'], default: 'Main Course' },
  isVeg:         { type: Boolean, default: true },
  image:         String,
}, { timestamps: true })

const catererSchema = new Schema({
  user:            { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName:    { type: String, required: true },
  description:     String,
  city:            { type: String, required: true },
  phone:           String,
  email:           String,
  instagramHandle: String,

  services:        [{ type: String, enum: ['Wedding','Birthday','Corporate','Pooja','Engagement','Anniversary','Baby Shower','Social Gathering'] }],
  isVeg:           { type: Boolean, default: true },
  isNonVeg:        { type: Boolean, default: false },
  minPrice:        Number,
  maxPrice:        Number,

  coverImage:      String,
  profileImage:    String,
  gallery:         [String],
  menuItems:       [menuItemSchema],

  documents: {
    gst:          String,
    aadhaar:      String,
    foodLicense:  String,
  },

  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,
  verifiedAt:      Date,

  avgRating:     { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  profileViews:  { type: Number, default: 0 },

  subscriptionExpiry: Date,
  registrationPaid:   { type: Boolean, default: false },
}, { timestamps: true })

// Text search index
catererSchema.index({ businessName: 'text', city: 'text', description: 'text' })
catererSchema.index({ city: 1, services: 1 })
catererSchema.index({ verificationStatus: 1 })
catererSchema.index({ avgRating: -1 })

// ── Review ────────────────────────────────────────────────
const reviewSchema = new Schema({
  caterer: { type: Schema.Types.ObjectId, ref: 'Caterer', required: true },
  user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true })

reviewSchema.index({ caterer: 1, user: 1 }, { unique: true }) // one review per user per caterer

// Recalculate caterer avg rating after save/delete
const recalcRating = async function (catererId) {
  const agg = await Review.aggregate([
    { $match: { caterer: catererId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const avg   = agg[0]?.avg   || 0
  const count = agg[0]?.count || 0
  await Caterer.findByIdAndUpdate(catererId, { avgRating: Math.round(avg * 10) / 10, totalReviews: count })
}

reviewSchema.post('save',   async function () { await recalcRating(this.caterer) })
reviewSchema.post('deleteOne', { document: true }, async function () { await recalcRating(this.caterer) })

// ── Payment ───────────────────────────────────────────────
const paymentSchema = new Schema({
  user:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caterer:         { type: Schema.Types.ObjectId, ref: 'Caterer' },
  type:            { type: String, enum: ['registration', 'subscription'], required: true },
  amount:          { type: Number, required: true },
  currency:        { type: String, default: 'INR' },
  razorpayOrderId:   String,
  razorpayPaymentId: String,
  status:          { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
}, { timestamps: true })

const User    = mongoose.model('User',    userSchema)
const Caterer = mongoose.model('Caterer', catererSchema)
const Review  = mongoose.model('Review',  reviewSchema)
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = { User, Caterer, Review, Payment }
