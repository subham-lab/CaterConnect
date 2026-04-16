import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth'

// ⚠️  Replace with your Firebase project credentials
// Get them from: https://console.firebase.google.com → Project Settings → Web App
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })

/** Sign in with Google popup */
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

/** Set up invisible reCAPTCHA for phone auth */
export const setupRecaptcha = (buttonId) => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {},
  })
  return window.recaptchaVerifier
}

/** Send OTP to phone number  (+91XXXXXXXXXX) */
export const sendPhoneOTP = async (phoneNumber) => {
  const verifier = setupRecaptcha('phone-otp-btn')
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

/** Get Firebase ID token for backend verification */
export const getIdToken = () => auth.currentUser?.getIdToken(true)

export default app
