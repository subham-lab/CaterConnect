import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiCheck, FiX, FiEye, FiUsers, FiShield, FiAlertCircle, FiDownload } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const TABS = ['Pending Verification', 'All Caterers', 'Users', 'Stats']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Pending Verification')

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <FiShield className="text-brand-400 text-xl" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">Manage CaterConnect platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass-sm p-1 w-fit mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'
              }`}>{t}</button>
          ))}
        </div>

        {tab === 'Pending Verification' && <PendingTab />}
        {tab === 'All Caterers'         && <AllCaterersTab />}
        {tab === 'Users'                && <UsersTab />}
        {tab === 'Stats'                && <StatsTab />}
      </div>
    </div>
  )
}

// ─── Pending tab ──────────────────────────────────────────
function PendingTab() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectModal, setRejectModal] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending'],
    queryFn:  () => adminAPI.getPendingCaterers().then(r => r.data.caterers),
    refetchInterval: 30_000,
  })

  const approveMutation = useMutation({
    mutationFn: adminAPI.approveCaterer,
    onSuccess: () => { toast.success('Caterer approved! 🎉'); qc.invalidateQueries(['admin-pending']) },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.rejectCaterer(id, reason),
    onSuccess: () => { toast.success('Caterer rejected'); setRejectModal(null); setRejectReason(''); qc.invalidateQueries(['admin-pending']) },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <div className="text-white/40 text-sm">Loading…</div>

  const caterers = data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
          {caterers.length}
        </span>
        <span className="text-white/60 text-sm">awaiting verification</span>
      </div>

      {caterers.length === 0 ? (
        <div className="glass p-10 text-center">
          <FiCheck className="text-4xl text-green-400 mx-auto mb-3" />
          <p className="text-white/40">All caught up! No pending verifications.</p>
        </div>
      ) : (
        caterers.map((c) => (
          <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{c.businessName}</h3>
                  <span className="badge badge-pending">Pending</span>
                </div>
                <div className="text-white/40 text-sm space-x-4">
                  <span>{c.city}</span>
                  <span>{c.user?.email || c.user?.phoneNumber}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(c.services || []).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">{s}</span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="flex gap-2">
                {[
                  { key: 'gst',         label: 'GST' },
                  { key: 'aadhaar',     label: 'Aadhaar' },
                  { key: 'foodLicense', label: 'FSSAI' },
                ].map(({ key, label }) => (
                  c.documents?.[key] ? (
                    <a key={key} href={c.documents[key]} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500/20 transition-colors">
                      <FiDownload className="text-xs" /> {label}
                    </a>
                  ) : (
                    <span key={key} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 flex items-center gap-1">
                      <FiAlertCircle className="text-xs" /> {label}
                    </span>
                  )
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => approveMutation.mutate(c._id)}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-all text-sm font-medium"
                >
                  <FiCheck /> Approve
                </button>
                <button
                  onClick={() => setRejectModal(c._id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                  <FiX /> Reject
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass p-6 w-full max-w-md">
            <h3 className="font-semibold text-white mb-4">Reason for Rejection</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why the application is rejected (shown to caterer)…"
              rows={4} className="input-field resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal, reason: rejectReason })}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="btn-danger flex-1 text-sm disabled:opacity-40"
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── All caterers tab ─────────────────────────────────────
function AllCaterersTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-caterers'],
    queryFn:  () => adminAPI.getAllCaterers().then(r => r.data.caterers),
  })
  if (isLoading) return <div className="text-white/40 text-sm">Loading…</div>

  return (
    <div className="space-y-2">
      {(data || []).map((c) => (
        <div key={c._id} className="glass-sm p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{c.businessName}</span>
              <span className={`badge ${c.verificationStatus === 'approved' ? 'badge-verified' : c.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                {c.verificationStatus}
              </span>
            </div>
            <div className="text-white/40 text-xs">{c.city} · {c.user?.email}</div>
          </div>
          <div className="text-white/40 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Users tab ────────────────────────────────────────────
function UsersTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn:  () => adminAPI.getAllUsers().then(r => r.data.users),
  })
  if (isLoading) return <div className="text-white/40 text-sm">Loading…</div>

  return (
    <div className="space-y-2">
      {(data || []).map((u) => (
        <div key={u._id} className="glass-sm p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-300 flex-shrink-0">
            {u.displayName?.[0] || u.email?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white">{u.displayName || '—'}</div>
            <div className="text-white/40 text-xs">{u.email || u.phoneNumber}</div>
          </div>
          <span className="badge badge-pending capitalize text-xs">{u.role}</span>
          <div className="text-white/30 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Stats tab ────────────────────────────────────────────
function StatsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => adminAPI.getStats().then(r => r.data),
  })
  if (isLoading) return <div className="text-white/40 text-sm">Loading…</div>
  if (!data) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Users',         value: data.totalUsers     || 0 },
        { label: 'Total Caterers',       value: data.totalCaterers  || 0 },
        { label: 'Verified Caterers',    value: data.approvedCaterers || 0 },
        { label: 'Pending Verifications',value: data.pendingCaterers || 0 },
        { label: 'Total Reviews',        value: data.totalReviews   || 0 },
        { label: 'Revenue (₹)',          value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}` },
      ].map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="stat-card"
        >
          <div className="text-white/40 text-xs mb-2">{s.label}</div>
          <div className="font-display text-2xl font-bold gradient-text">{s.value}</div>
        </motion.div>
      ))}
    </div>
  )
}
