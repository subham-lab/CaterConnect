/**
 * Seed script — creates realistic sample data for development
 * Run: node src/seed.js
 *
 * Creates:
 *   - 1 admin user
 *   - 8 approved caterers across Indian cities
 *   - Menu items for each caterer
 *   - Sample reviews
 */

require('dotenv').config()
const mongoose = require('mongoose')
const { User, Caterer, Review } = require('./models')

const CITIES   = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Surat', 'Jaipur', 'Hyderabad']
const SERVICES = ['Wedding', 'Birthday', 'Corporate', 'Pooja', 'Engagement', 'Anniversary']

const CATERER_DATA = [
  { businessName: 'Sharma Caterers',    city: 'Ahmedabad', description: 'Premium Gujarati & North Indian catering since 1998. Specialising in weddings with authentic flavors.', services: ['Wedding','Pooja','Anniversary'], isVeg: true,  isNonVeg: false, minPrice: 120, maxPrice: 350 },
  { businessName: 'Patel Grand Feast',  city: 'Surat',     description: 'Renowned for elaborate wedding buffets and authentic Surti cuisine. Serving 500+ guests with ease.', services: ['Wedding','Engagement','Birthday'], isVeg: true, isNonVeg: false, minPrice: 150, maxPrice: 450 },
  { businessName: 'Mumbai Spice Co.',   city: 'Mumbai',    description: 'Corporate and social event catering experts. Modern presentation meets classic Mumbai street flavors.', services: ['Corporate','Birthday','Social Gathering'], isVeg: true, isNonVeg: true, minPrice: 180, maxPrice: 600 },
  { businessName: 'Delhi Dawat',        city: 'Delhi',     description: 'North Indian feast specialists. Famous for our live tandoor and biryani stations at large events.', services: ['Wedding','Corporate','Engagement'], isVeg: false, isNonVeg: true, minPrice: 200, maxPrice: 700 },
  { businessName: 'Bangalore Bites',    city: 'Bangalore', description: 'South Indian and multi-cuisine caterers for IT corporate events, weddings, and family functions.', services: ['Corporate','Wedding','Birthday'], isVeg: true, isNonVeg: true, minPrice: 160, maxPrice: 500 },
  { businessName: 'Rajasthani Royal',   city: 'Jaipur',    description: 'Experience royal Rajasthani hospitality. Dal Baati Churma, Ker Sangri, and more traditional delights.', services: ['Wedding','Pooja','Anniversary'], isVeg: true, isNonVeg: false, minPrice: 130, maxPrice: 400 },
  { businessName: 'Hyderabadi Kitchen', city: 'Hyderabad', description: 'Authentic Hyderabadi Dum Biryani and Nawabi cuisine for weddings and large gatherings.', services: ['Wedding','Engagement','Birthday'], isVeg: false, isNonVeg: true, minPrice: 220, maxPrice: 800 },
  { businessName: 'Pune Paragon',       city: 'Pune',      description: 'Maharashtrian and continental fusion caterers. Perfect for corporate seminars and milestone celebrations.', services: ['Corporate','Birthday','Anniversary'], isVeg: true, isNonVeg: true, minPrice: 175, maxPrice: 550 },
]

const MENU_TEMPLATES = {
  veg: [
    { name: 'Paneer Butter Masala', category: 'Main Course', pricePerPlate: 180, isVeg: true },
    { name: 'Dal Makhani',          category: 'Main Course', pricePerPlate: 120, isVeg: true },
    { name: 'Vegetable Biryani',    category: 'Main Course', pricePerPlate: 150, isVeg: true },
    { name: 'Malai Kofta',          category: 'Main Course', pricePerPlate: 190, isVeg: true },
    { name: 'Aloo Tikki',           category: 'Starter',     pricePerPlate: 80,  isVeg: true },
    { name: 'Hara Bhara Kebab',     category: 'Starter',     pricePerPlate: 90,  isVeg: true },
    { name: 'Gulab Jamun',          category: 'Dessert',     pricePerPlate: 60,  isVeg: true },
    { name: 'Rasgulla',             category: 'Dessert',     pricePerPlate: 55,  isVeg: true },
    { name: 'Masala Chai',          category: 'Beverages',   pricePerPlate: 30,  isVeg: true },
    { name: 'Butter Naan',          category: 'Breads',      pricePerPlate: 25,  isVeg: true },
  ],
  nonveg: [
    { name: 'Chicken Biryani',    category: 'Main Course', pricePerPlate: 280, isVeg: false },
    { name: 'Mutton Rogan Josh',  category: 'Main Course', pricePerPlate: 350, isVeg: false },
    { name: 'Butter Chicken',     category: 'Main Course', pricePerPlate: 260, isVeg: false },
    { name: 'Seekh Kebab',        category: 'Starter',     pricePerPlate: 150, isVeg: false },
    { name: 'Fish Tikka',         category: 'Starter',     pricePerPlate: 180, isVeg: false },
  ],
}

const REVIEW_COMMENTS = [
  'Excellent catering service! The food was fresh and delicious. Highly recommend.',
  'We used them for our wedding. 500+ guests and not a single complaint. Outstanding service.',
  'Punctual, professional, and the food quality was top-notch. Will definitely book again.',
  'Great variety of dishes. Everything was well-presented and tasted amazing.',
  'Reasonable pricing for the quality. Our corporate lunch event was a huge hit!',
  'The paneer dishes were outstanding. Guests kept asking for the recipe!',
  'Very accommodating with dietary restrictions. Highly professional team.',
  'Amazing experience from booking to serving. The live counters were a big hit.',
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Clear existing seed data
  await User.deleteMany({ email: { $regex: /seed@caterconnect/ } })
  await Caterer.deleteMany({ businessName: { $in: CATERER_DATA.map((c) => c.businessName) } })
  console.log('🗑️  Cleared old seed data')

  const createdCaterers = []

  for (let i = 0; i < CATERER_DATA.length; i++) {
    const data   = CATERER_DATA[i]

    // Create a dummy user for this caterer
    const uid  = `seed-caterer-${i + 1}`
    const user = await User.create({
      uid,
      email:       `caterer${i + 1}@seed.caterconnect.in`,
      displayName: data.businessName + ' Owner',
      role:        'caterer',
    })

    // Build menu items
    const menuItems = [...MENU_TEMPLATES.veg]
    if (data.isNonVeg) menuItems.push(...MENU_TEMPLATES.nonveg)

    // Randomise ratings upfront
    const avgRating   = parseFloat((3.8 + Math.random() * 1.2).toFixed(1))
    const totalReviews = 10 + Math.floor(Math.random() * 90)

    const caterer = await Caterer.create({
      user:               user._id,
      ...data,
      menuItems,
      verificationStatus: 'approved',
      verifiedAt:         new Date(),
      registrationPaid:   true,
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      avgRating,
      totalReviews,
      totalBookings: Math.floor(Math.random() * 50) + 5,
      profileViews:  Math.floor(Math.random() * 500) + 50,
    })

    createdCaterers.push(caterer)
    console.log(`✅ Created caterer: ${data.businessName} (${data.city})`)
  }

  // Create sample reviews
  for (const caterer of createdCaterers) {
    const reviewCount = 3 + Math.floor(Math.random() * 4)
    for (let r = 0; r < reviewCount; r++) {
      const uid    = `seed-reviewer-${caterer._id}-${r}`
      const rUser  = await User.create({
        uid,
        email:       `reviewer-${caterer._id}-${r}@seed.caterconnect.in`,
        displayName: ['Anita Patel', 'Rohan Mehta', 'Priya Shah', 'Vikram Joshi', 'Neha Gupta', 'Arjun Kumar'][r % 6],
        role:        'customer',
      })

      const rating = [4, 4, 5, 5, 3, 4, 5, 4][r % 8]
      await Review.create({
        caterer: caterer._id,
        user:    rUser._id,
        rating,
        comment: REVIEW_COMMENTS[r % REVIEW_COMMENTS.length],
      })
    }
  }

  console.log('✅ Sample reviews created')
  console.log(`\n🎉 Seed complete! ${createdCaterers.length} caterers ready.\n`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
