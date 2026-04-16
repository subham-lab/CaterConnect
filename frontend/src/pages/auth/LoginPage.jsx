import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'
import {
  signInWithGoogle,
  sendPhoneOTP,
  auth,
} from '../../services/firebase'
import {
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import useAuthStore from '../../context/authStore'

const TABS = ['google', 'phone', 'email']

export default function LoginPage() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const syncWithBackend = useAuthStore((s) => s.syncWithBackend)
  const from        = location.state?.from?.pathname || '/'

  const [tab,         setTab]         = useState('google')
  const [phone,       setPhone]       = useState('')
  const [otp,         setOtp]         = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [otpSent,     setOtpSent]     = useState(false)
  const [confirmResult, setConfirmResult] = useState(null)

  // ── Google ──────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      await syncWithBackend(result.user)
      toast.success(`Welcome back, ${result.user.displayName?.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Phone OTP ───────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phone.match(/^\+?[0-9]{10,13}$/)) {
      return toast.error('Enter a valid phone number')
    }
    setLoading(true)
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
      const result = await sendPhoneOTP(formattedPhone)
      setConfirmResult(result)
      setOtpSent(true)
      toast.success('OTP sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP')
      window.recaptchaVerifier?.clear?.()
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const credential = PhoneAuthProvider.credential(confirmResult.verificationId, otp)
      const result     = await signInWithCredential(auth, credential)
      await syncWithBackend(result.user)
      toast.success('Logged in successfully!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Email / Password ────────────────────────────────────
  const [isNewAccount, setIsNewAccount] = useState(false)
  const [showReset,    setShowReset]    = useState(false)

  const handleEmail = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter email and password')
    setLoading(true)
    try {
      let result
      if (isNewAccount) {
        result = await createUserWithEmailAndPassword(auth, email, password)
      } else {
        result = await signInWithEmailAndPassword(auth, email, password)
      }
      await syncWithBackend(result.user)
      toast.success(isNewAccount ? 'Account created!' : 'Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = {
        'auth/user-not-found':    'No account found. Create one below.',
        'auth/wrong-password':    'Incorrect password.',
        'auth/email-already-in-use': 'Email already registered. Sign in instead.',
        'auth/weak-password':     'Password must be at least 6 characters.',
        'auth/invalid-email':     'Enter a valid email address.',
        'auth/invalid-credential': 'Incorrect email or password.',
      }[err.code] || err.message
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) return toast.error('Enter your email address first')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent!')
      setShowReset(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
              <span className="text-xl">🍽️</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-white/40 text-sm">Sign in to your CaterConnect account</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl glass-sm p-1 mb-6">
            {[
              { id: 'google', label: 'Google', icon: <FcGoogle className="text-base" /> },
              { id: 'phone',  label: 'Phone',  icon: <FiPhone className="text-base" /> },
              { id: 'email',  label: 'Email',  icon: <FiMail className="text-base" /> },
            ].map((t) => (
              <button key={t.id}
                onClick={() => { setTab(t.id); setOtpSent(false) }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id
                    ? 'bg-brand-500 text-white shadow-lg'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── Google tab ── */}
          {tab === 'google' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white disabled:opacity-50"
              >
                <FcGoogle className="text-xl" />
                {loading ? 'Signing in…' : 'Continue with Google'}
              </button>
              <div id="phone-otp-btn" />
            </motion.div>
          )}

          {/* ── Phone tab ── */}
          {tab === 'phone' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="input-label">Mobile Number</label>
                    <div className="flex gap-2">
                      <span className="input-field w-16 text-center text-white/60">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="input-field flex-1"
                        required
                      />
                    </div>
                  </div>
                  <div id="phone-otp-btn" />
                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Sending OTP…' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-white/50 text-sm">OTP sent to +91{phone}</p>
                    <button type="button" onClick={() => setOtpSent(false)}
                      className="text-brand-400 text-xs mt-1 flex items-center gap-1 mx-auto">
                      <FiArrowLeft className="text-xs" /> Change number
                    </button>
                  </div>
                  <div>
                    <label className="input-label">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Verifying…' : 'Verify & Login'}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* ── Email tab ── */}
          {tab === 'email' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <label className="input-label">Email address</label>
                  <input type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field" required />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="input-label mb-0">Password</label>
                    <button type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <input type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" minLength={6}
                    className="input-field" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (isNewAccount ? 'Creating…' : 'Signing in…')
                           : (isNewAccount ? 'Create Account' : 'Sign In')}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsNewAccount((v) => !v)}
                className="w-full mt-3 text-center text-xs text-white/30 hover:text-white/60 transition-colors py-1"
              >
                {isNewAccount
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Create one"}
              </button>
            </motion.div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <p className="text-center text-white/40 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
