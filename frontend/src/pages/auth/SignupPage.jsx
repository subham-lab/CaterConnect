import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPhone, FiArrowRight, FiCheck } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { MdRestaurantMenu } from 'react-icons/md'
import { HiOutlineUserGroup } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { signInWithGoogle, sendPhoneOTP, auth } from '../../services/firebase'
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import { authAPI } from '../../services/api'
import useAuthStore from '../../context/authStore'

export default function SignupPage() {
  const navigate        = useNavigate()
  const syncWithBackend = useAuthStore((s) => s.syncWithBackend)

  const [step,    setStep]    = useState(1)   // 1 = role, 2 = auth
  const [role,    setRole]    = useState('')  // 'customer' | 'caterer'
  const [method,  setMethod]  = useState('')  // 'google' | 'phone'
  const [phone,   setPhone]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      const dbUser = await syncWithBackend(result.user)

      // Set role if not yet assigned
      if (!dbUser?.role || dbUser.role === 'customer') {
        await authAPI.updateRole(role || 'customer')
      }

      toast.success('Account created!')
      navigate(role === 'caterer' ? '/become-caterer' : '/')
    } catch (err) {
      toast.error(err.message || 'Sign-up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (phone.length < 10) return toast.error('Enter a valid 10-digit number')
    setLoading(true)
    try {
      const result = await sendPhoneOTP(`+91${phone}`)
      setConfirm(result)
      setOtpSent(true)
      toast.success('OTP sent to +91' + phone)
    } catch (err) {
      toast.error('Failed to send OTP: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP')
    setLoading(true)
    try {
      const credential = PhoneAuthProvider.credential(confirm.verificationId, otp)
      const result     = await signInWithCredential(auth, credential)
      const dbUser     = await syncWithBackend(result.user)

      await authAPI.updateRole(role || 'customer')

      toast.success('Account created successfully!')
      navigate(role === 'caterer' ? '/become-caterer' : '/')
    } catch (err) {
      toast.error('Invalid OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-white/40 text-sm">Join thousands on CaterConnect</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  s < step  ? 'bg-green-500 text-white' :
                  s === step ? 'bg-brand-500 text-white' :
                  'bg-white/5 text-white/30'
                }`}>
                  {s < step ? <FiCheck className="text-sm" /> : s}
                </div>
                {s < 2 && <div className={`w-12 h-px transition-all ${step > s ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Role selection ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-white/60 text-sm text-center mb-5">I want to join as a…</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    {
                      id:    'customer',
                      label: 'Customer',
                      desc:  'Find & book caterers',
                      icon:  <HiOutlineUserGroup className="text-3xl text-blue-400" />,
                    },
                    {
                      id:    'caterer',
                      label: 'Caterer',
                      desc:  'List my catering services',
                      icon:  <MdRestaurantMenu className="text-3xl text-brand-400" />,
                    },
                  ].map((r) => (
                    <button key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-5 rounded-xl border transition-all text-left ${
                        role === r.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/8 bg-white/3 hover:border-white/15'
                      }`}
                    >
                      <div className="mb-3">{r.icon}</div>
                      <div className="font-semibold text-white text-sm">{r.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{r.desc}</div>
                      {role === r.id && (
                        <div className="mt-2">
                          <FiCheck className="text-brand-400 text-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!role}
                  onClick={() => setStep(2)}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Continue <FiArrowRight />
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Auth method ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-white/60 text-sm text-center mb-4">
                  Signing up as a <span className="text-white capitalize font-medium">{role}</span>
                </p>

                {/* Google */}
                {(!method || method === 'google') && (
                  <button
                    onClick={() => { setMethod('google'); handleGoogle() }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white disabled:opacity-50"
                  >
                    <FcGoogle className="text-xl" />
                    {loading && method === 'google' ? 'Creating account…' : 'Sign up with Google'}
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/20 text-xs">or use phone</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Phone OTP */}
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-3">
                    <div>
                      <label className="input-label">Phone Number</label>
                      <div className="flex gap-2">
                        <span className="input-field w-16 text-center text-white/50 text-sm">+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          className="input-field flex-1"
                          required
                        />
                      </div>
                    </div>
                    <div id="phone-otp-btn" />
                    <button
                      type="submit"
                      disabled={loading || phone.length < 10}
                      className="btn-ghost w-full flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <FiPhone />
                      {loading ? 'Sending OTP…' : 'Send OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-3">
                    <p className="text-center text-white/50 text-sm">OTP sent to +91{phone}</p>
                    <div>
                      <label className="input-label">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="• • • • • •"
                        className="input-field text-center text-xl tracking-[0.6em] font-mono"
                        maxLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="btn-primary w-full disabled:opacity-40"
                    >
                      {loading ? 'Verifying…' : 'Create Account'}
                    </button>
                  </form>
                )}

                <button onClick={() => setStep(1)}
                  className="w-full text-white/30 text-xs hover:text-white/60 transition-colors py-2">
                  ← Back to role selection
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-white/30 text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
