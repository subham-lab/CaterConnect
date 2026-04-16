# CaterConnect — Verified Catering Marketplace

India's #1 verified catering marketplace. Customers find trusted caterers.
Caterers grow their business. Built with React + Node.js + MongoDB + Firebase.

---

## Project Structure

```
CaterConnect_Project/
├── frontend/                        ← React + Vite app (deploy to Vercel)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json
│   ├── .env.example                 ← copy to .env and fill values
│   └── src/
│       ├── App.jsx                  ← Main router + Error boundary
│       ├── main.jsx                 ← React entry point
│       ├── index.css                ← Global styles + design tokens
│       ├── components/
│       │   ├── caterer/
│       │   │   ├── CatererCard.jsx
│       │   │   ├── CatererCardSkeleton.jsx
│       │   │   └── ContactCatererModal.jsx
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── Footer.jsx
│       │   └── ui/
│       │       ├── ErrorBoundary.jsx
│       │       ├── HeroCanvas.jsx   ← Three.js 3D scene
│       │       ├── Modal.jsx
│       │       ├── PageMeta.jsx
│       │       ├── ProtectedRoute.jsx
│       │       ├── RoleRoute.jsx
│       │       ├── Spinner.jsx
│       │       └── StarRating.jsx
│       ├── context/
│       │   └── authStore.js         ← Zustand auth state
│       ├── hooks/
│       │   └── index.js             ← Custom React hooks
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── SearchPage.jsx
│       │   ├── CatererProfilePage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── NotFound.jsx
│       │   ├── auth/
│       │   │   ├── LoginPage.jsx
│       │   │   └── SignupPage.jsx
│       │   ├── caterer/
│       │   │   ├── CatererRegister.jsx
│       │   │   ├── CatererOnboarding.jsx
│       │   │   └── SubscriptionPage.jsx
│       │   └── dashboard/
│       │       ├── CustomerDashboard.jsx
│       │       ├── CatererDashboard.jsx
│       │       └── AdminDashboard.jsx
│       ├── services/
│       │   ├── firebase.js          ← Firebase auth config
│       │   └── api.js               ← Axios API client
│       └── utils/
│           ├── index.js             ← Helper functions
│           └── notify.js            ← Toast notifications
│
└── backend/                         ← Node.js + Express (deploy to Render)
    ├── package.json
    ├── render.yaml
    ├── .env.example                 ← copy to .env and fill values
    └── src/
        ├── server.js                ← Express entry point
        ├── seed.js                  ← Test data seeder
        ├── config/
        │   └── index.js             ← Firebase Admin + Cloudinary + Razorpay
        ├── middleware/
        │   ├── auth.js              ← Firebase token verification
        │   ├── errorHandler.js      ← Global error handler
        │   └── validate.js          ← Input validation
        ├── models/
        │   └── index.js             ← MongoDB schemas
        └── routes/
            ├── auth.js
            ├── caterers.js
            ├── search.js
            ├── reviews.js
            ├── payments.js
            └── admin.js
```

---

## Quick Start (Local Development)

### 1. Get Your API Keys First

You need accounts at:
- https://console.firebase.google.com  (Google + Phone OTP auth — FREE)
- https://mongodb.com/atlas             (Database — FREE)
- https://cloudinary.com               (File uploads — FREE)
- https://razorpay.com                 (Payments — TEST mode)

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Open .env and fill in all values (see .env.example for guidance)
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Open .env and fill in all values (see .env.example for guidance)
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Seed Test Data (Optional but Recommended)

```bash
cd backend
node src/seed.js
# Creates 8 verified caterers + menus + reviews instantly
```

### 5. Get Admin Access

1. Sign up at http://localhost:5173
2. Firebase Console → Authentication → Users → copy your UID
3. Add UID to ADMIN_UIDS in backend/.env
4. Restart backend → sign in again → visit /admin

---

## Environment Variables

### backend/.env

```
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/caterconnect

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Admin user UIDs (comma separated Firebase UIDs)
ADMIN_UIDS=firebase_uid_1,firebase_uid_2
```

### frontend/.env

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Local development
VITE_API_URL=http://localhost:5000/api
# Production (replace with your Render URL after deploying)
# VITE_API_URL=https://your-app.onrender.com/api
```

---

## Where to Get Each Key

### Firebase (console.firebase.google.com)

1. Create project → Build → Authentication → Enable Google + Phone
2. Project Settings → Your Apps → Add Web App → copy the config object (for frontend .env)
3. Project Settings → Service Accounts → Generate New Private Key → download JSON
   - `project_id`   → FIREBASE_PROJECT_ID
   - `private_key`  → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL

### MongoDB Atlas (mongodb.com/atlas)

1. Create free M0 cluster → choose Mumbai region
2. Security → Database Access → Add User (set username + password)
3. Security → Network Access → Allow Access from Anywhere (0.0.0.0/0)
4. Connect → Drivers → copy URI → replace `<password>` → add `/caterconnect` before `?`

### Cloudinary (cloudinary.com)

1. Sign up → Dashboard → copy Cloud Name, API Key, API Secret

### Razorpay (razorpay.com)

1. Sign up → Settings → API Keys → Generate Test Key
2. Copy Key ID and Key Secret

---

## Deploy to Internet (Free)

### Backend → Render.com

1. Push code to GitHub
2. Render.com → New → Web Service → connect your repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all backend .env variables in Environment tab
7. Deploy → copy your URL (e.g. https://caterconnect-api.onrender.com)

### Frontend → Vercel.com

1. Vercel.com → New Project → import your GitHub repo
2. Root directory: `frontend`
3. Add all frontend .env variables
4. Set VITE_API_URL to your Render URL + `/api`
5. Deploy → your app is live!

### After Deploying

- Firebase Console → Authentication → Authorized Domains → add your Vercel domain
- Add Razorpay checkout script in `frontend/index.html` inside `<head>`:
  `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS    |
| Animations  | Framer Motion                     |
| 3D Hero     | Three.js (landing page only)      |
| State       | Zustand + TanStack Query          |
| Auth        | Firebase (Google + Phone + Email) |
| Backend     | Node.js + Express.js              |
| Database    | MongoDB Atlas                     |
| File Upload | Cloudinary                        |
| Payments    | Razorpay (₹99 reg + ₹3000/yr)    |
| Frontend Host | Vercel (free)                   |
| Backend Host | Render (free)                    |

---

## User Roles

| Role     | Access                                          |
|----------|-------------------------------------------------|
| Customer | Search, view profiles, contact, leave reviews   |
| Caterer  | Register, manage menu/gallery, view dashboard   |
| Admin    | Verify caterers, manage users, view stats       |

## Payment Flow

- ₹99 one-time registration fee (test card: 4111 1111 1111 1111)
- ₹3000 yearly subscription to keep listing active
- Both via Razorpay with backend signature verification

---

Built with ♥ in India — CaterConnect 2024
