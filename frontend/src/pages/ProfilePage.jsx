import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiEdit2, FiCheck, FiX, FiCreditCard, FiUser, FiShield } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { updateProfile } from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth } from '../services/firebase'
import { authAPI, paymentAPI } from '../services/api'
import useAuthStore from '../context/authStore'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const user        = useAuthStore((s) => s.user)
  const dbUser      = useAuthStore((s) => s.dbUser)
  const setDbUser   = useAuthStore((s) => s.setDbUser)
  const qc          = useQueryClient()

  const [editName,  setEditName]  = useState(false)
  const [nameVal,   setNameVal]   = useState(user?.displayName || '')

  const { data: payments = [] } = useQuery({
    queryKey: ['payment-history'],
    queryFn:  () => paymentAPI.getHistory().then((r) => r.data.payments),
  })

  const saveName = async () => {
    if (!nameVal.trim()) return toast.error('Name cannot be empty')
    try {
      await updateProfile(auth.currentUser, { displayName: nameVal.trim() })
      toast.success('Name updated!')
      setEditName(false)
    } catch (err) {
      toast.error('Failed to update name')
    }
  }

  const statusColor = {
    pending:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    paid:     'text-green-400 bg-green-400/10 border-green-400/20',
    failed:   'text-red-400 bg-red-400/10 border-red-400/20',
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold text-white mb-8"
        >
          My Profile
        </motion.h1>

        {/* ── Account info ─────────────────────────── */}
        <div className="glass p-6 mb-5">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <FiUser className="text-brand-400" /> Account Details
          </h2>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-500/20 flex items-center justify-center">
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-brand-300">
                    {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                  </span>
              }
            </div>

            <div className="flex-1 space-y-3">
              {/* Display name */}
              <div>
                <label className="input-label">Display Name</label>
                {editName ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      value={nameVal}
                      onChange={(e) => setNameVal(e.target.value)}
                      className="input-field flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && saveName()}
                      autoFocus
                    />
                    <button onClick={saveName} className="btn-primary px-3 py-2">
                      <FiCheck />
                    </button>
                    <button onClick={() => { setEditName(false); setNameVal(user?.displayName || '') }}
                      className="btn-ghost px-3 py-2">
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white">{user?.displayName || '—'}</span>
                    <button onClick={() => setEditName(true)}
                      className="text-white/30 hover:text-white transition-colors p-1">
                      <FiEdit2 className="text-sm" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email / Phone */}
              {user?.email && (
                <div>
                  <label className="input-label">Email</label>
                  <p className="text-white/70 text-sm">{user.email}</p>
                </div>
              )}
              {user?.phoneNumber && (
                <div>
                  <label className="input-label">Phone</label>
                  <p className="text-white/70 text-sm">{user.phoneNumber}</p>
                </div>
              )}

              {/* Role badge */}
              <div>
                <label className="input-label">Account Type</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${
                    dbUser?.role === 'admin'   ? 'badge-verified' :
                    dbUser?.role === 'caterer' ? 'badge-pending'  : 'badge-verified'
                  } capitalize`}>
                    {dbUser?.role === 'admin' && <FiShield />}
                    {dbUser?.role === 'caterer' && <MdVerified />}
                    {dbUser?.role || 'customer'}
                  </span>

                  {dbUser?.role === 'customer' && (
                    <Link to="/become-caterer"
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      Become a Caterer →
                    </Link>
                  )}
                  {dbUser?.role === 'caterer' && (
                    <Link to="/caterer/dashboard"
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      Go to Dashboard →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment history ───────────────────────── */}
        <div className="glass p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <FiCreditCard className="text-brand-400" /> Payment History
          </h2>

          {payments.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <FiCreditCard className="text-3xl mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((pay) => (
                <motion.div
                  key={pay._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-sm p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white capitalize">
                        {pay.type === 'registration' ? 'Caterer Registration' : 'Annual Subscription'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor[pay.status] || ''}`}>
                        {pay.status}
                      </span>
                    </div>
                    <div className="text-white/30 text-xs">
                      {new Date(pay.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                      {pay.razorpayPaymentId && (
                        <span className="ml-2 font-mono">{pay.razorpayPaymentId}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-white">
                      ₹{pay.amount?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-white/30 text-xs">{pay.currency}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
