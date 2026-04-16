import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheck, FiLock, FiArrowRight, FiCalendar } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import toast from 'react-hot-toast'
import { paymentAPI } from '../../services/api'
import useAuthStore from '../../context/authStore'
import { useQuery } from '@tanstack/react-query'
import { catererAPI } from '../../services/api'

const FEATURES = [
  'Unlimited profile visibility',
  'Appear in all search results',
  'Unlimited menu items',
  'Unlimited gallery photos',
  'Priority listing in search',
  'Verified badge on profile',
  'Customer reviews & ratings',
  'Direct contact from customers',
]

export default function SubscriptionPage() {
  const navigate  = useNavigate()
  const dbUser    = useAuthStore((s) => s.dbUser)
  const [loading, setLoading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['caterer-me'],
    queryFn:  () => catererAPI.getMyProfile().then((r) => r.data.caterer),
  })

  const expiry = profile?.subscriptionExpiry
    ? new Date(profile.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const { data: order } = await paymentAPI.createOrder({ amount: 300000, type: 'subscription' })

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    'INR',
        name:        'CaterConnect',
        description: 'Annual Subscription',
        order_id:    order.id,
        prefill: {
          name:    dbUser?.displayName || '',
          email:   profile?.email || '',
          contact: profile?.phone  || '',
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          await paymentAPI.verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            type: 'subscription',
          })
          toast.success('Subscription activated! Valid for 1 year.')
          navigate('/caterer/dashboard')
        },
        modal: {
          ondismiss: () => { setLoading(false); toast('Payment cancelled') },
        },
      }

      new window.Razorpay(options).open()
    } catch (err) {
      toast.error(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Annual <span className="gradient-text">Subscription</span>
          </h1>
          <p className="text-white/40">Keep your CaterConnect listing active for another year</p>
        </motion.div>

        {/* Current status */}
        {expiry && (
          <div className="glass p-4 mb-6 flex items-center gap-3 border-yellow-500/20 bg-yellow-500/5">
            <FiCalendar className="text-yellow-400 text-xl flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-medium text-sm">Current subscription expires</p>
              <p className="text-white/50 text-xs">{expiry}</p>
            </div>
          </div>
        )}

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 mb-6"
        >
          {/* Price header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs mb-4 border border-brand-500/20">
              <MdVerified /> Verified Caterer Plan
            </div>
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-white/40 text-lg">₹</span>
              <span className="font-display text-6xl font-bold gradient-text">3,000</span>
              <span className="text-white/40 text-lg mb-2">/yr</span>
            </div>
            <p className="text-white/30 text-sm">Just ₹250/month — less than a single booking profit</p>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 gap-2 mb-8">
            {FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="text-green-400 text-xs" />
                </div>
                <span className="text-white/60 text-sm">{feat}</span>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-white/25 mb-6">
            <FiLock className="text-green-400 flex-shrink-0" />
            Secured by Razorpay · 256-bit encryption · Auto-renew disabled
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50"
          >
            {loading ? 'Opening payment…' : (
              <>Pay ₹3,000 &amp; Renew <FiArrowRight /></>
            )}
          </button>
        </motion.div>

        <p className="text-center text-white/25 text-xs">
          By subscribing you agree to our Terms of Service. Subscription is non-refundable after activation.
        </p>
      </div>
    </div>
  )
}
