// ── Firebase Admin ───────────────────────────────────────
const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  })
}

// ── Cloudinary ────────────────────────────────────────────
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME)
const cloudinary   = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer       = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const docStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'caterconnect/documents', allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], resource_type: 'auto' },
})

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'caterconnect/gallery', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1200, quality: 'auto' }] },
})

const menuImageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'caterconnect/menu', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 600, quality: 'auto' }] },
})

const uploadDocs   = multer({ storage: docStorage,   limits: { fileSize: 5 * 1024 * 1024 } })
const uploadImages = multer({ storage: imageStorage, limits: { fileSize: 8 * 1024 * 1024 } })
const uploadMenu   = multer({ storage: menuImageStorage, limits: { fileSize: 5 * 1024 * 1024 } })

// ── Razorpay ─────────────────────────────────────────────
const Razorpay = require('razorpay')
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID)
console.log("RAZORPAY SECRET:", process.env.RAZORPAY_KEY_SECRET)

module.exports = { admin, cloudinary, uploadDocs, uploadImages, uploadMenu, razorpay }
