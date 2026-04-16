import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiStar, FiEye, FiCheck } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import toast from 'react-hot-toast'
import { catererAPI } from '../../services/api'
import useAuthStore from '../../context/authStore'

const TABS = ['Overview', 'Menu', 'Gallery', 'Settings']
const CATEGORIES = ['Starter', 'Main Course', 'Dessert', 'Beverages', 'Snacks', 'Breads', 'Rice']

export default function CatererDashboard() {
  const [tab, setTab]   = useState('Overview')
  const qc              = useQueryClient()
  const user            = useAuthStore((s) => s.user)

  const { data: dash }    = useQuery({ queryKey: ['caterer-dash'], queryFn: () => catererAPI.getDashboard().then(r => r.data) })
  const { data: profile } = useQuery({ queryKey: ['caterer-me'],   queryFn: () => catererAPI.getMyProfile().then(r => r.data.caterer) })

  const status = profile?.verificationStatus

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Status banner */}
        {status === 'pending' && (
          <div className="glass p-4 mb-6 border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3">
            <span className="text-yellow-400 text-xl">⏳</span>
            <div>
              <div className="text-yellow-300 font-semibold text-sm">Verification Pending</div>
              <div className="text-white/40 text-xs">Our team is reviewing your documents. This takes up to 48 hours.</div>
            </div>
          </div>
        )}
        {status === 'rejected' && (
          <div className="glass p-4 mb-6 border-red-500/20 bg-red-500/5 flex items-center gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <div>
              <div className="text-red-300 font-semibold text-sm">Verification Rejected</div>
              <div className="text-white/40 text-xs">{profile?.rejectionReason || 'Please re-upload your documents and try again.'}</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              {profile?.businessName || 'Your Dashboard'}
              {status === 'approved' && <MdVerified className="text-green-400" />}
            </h1>
            <p className="text-white/40 text-sm">{profile?.city}</p>
          </div>
        </div>

        {/* Stats */}
        {dash && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Profile Views',  value: dash.profileViews || 0, icon: <FiEye /> },
              { label: 'Total Reviews',  value: dash.totalReviews || 0, icon: <FiStar /> },
              { label: 'Avg Rating',     value: Number(dash.avgRating || 0).toFixed(1), icon: '⭐' },
              { label: 'Menu Items',     value: dash.menuCount || 0, icon: <FiCheck /> },
            ].map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="stat-card"
              >
                <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                  <span>{stat.icon}</span> {stat.label}
                </div>
                <div className="font-display text-2xl font-bold gradient-text">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 glass-sm p-1 w-fit mb-6">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'
              }`}
            >{t}</button>
          ))}
        </div>

        {tab === 'Overview'  && <OverviewTab profile={profile} />}
        {tab === 'Menu'      && <MenuTab profile={profile} qc={qc} />}
        {tab === 'Gallery'   && <GalleryTab profile={profile} qc={qc} />}
        {tab === 'Settings'  && <SettingsTab profile={profile} qc={qc} />}
      </div>
    </div>
  )
}

// ─── Overview tab ──────────────────────────────────────────
function OverviewTab({ profile }) {
  if (!profile) return null
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <div className="glass p-5">
        <h3 className="font-semibold text-white mb-3">Business Info</h3>
        <div className="space-y-2 text-sm">
          {[
            ['City',        profile.city],
            ['Phone',       profile.phone],
            ['Email',       profile.email],
            ['Food Type',   [profile.isVeg && 'Veg', profile.isNonVeg && 'Non-Veg'].filter(Boolean).join(', ')],
          ].map(([k, v]) => v ? (
            <div key={k} className="flex justify-between">
              <span className="text-white/40">{k}</span>
              <span className="text-white">{v}</span>
            </div>
          ) : null)}
        </div>
      </div>
      <div className="glass p-5">
        <h3 className="font-semibold text-white mb-3">Services</h3>
        <div className="flex flex-wrap gap-2">
          {(profile.services || []).map((s) => (
            <span key={s} className="badge badge-verified">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Menu tab ──────────────────────────────────────────────
function MenuTab({ profile, qc }) {
  const [form,    setForm]    = useState({ name: '', description: '', pricePerPlate: '', category: 'Main Course', isVeg: true })
  const [editing, setEditing] = useState(null)
  const [show,    setShow]    = useState(false)

  const addMutation = useMutation({
    mutationFn: (data) => editing ? catererAPI.updateMenu(editing, data) : catererAPI.addMenu(data),
    onSuccess: () => {
      toast.success(editing ? 'Menu item updated!' : 'Menu item added!')
      qc.invalidateQueries(['caterer-me'])
      setForm({ name: '', description: '', pricePerPlate: '', category: 'Main Course', isVeg: true })
      setEditing(null)
      setShow(false)
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: catererAPI.deleteMenu,
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries(['caterer-me']) },
  })

  const startEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', pricePerPlate: item.pricePerPlate, category: item.category, isVeg: item.isVeg })
    setEditing(item._id)
    setShow(true)
  }

  const items = profile?.menuItems || []

  return (
    <div className="space-y-4">
      <button onClick={() => { setShow(true); setEditing(null); setForm({ name: '', description: '', pricePerPlate: '', category: 'Main Course', isVeg: true }) }}
        className="btn-primary flex items-center gap-2 text-sm">
        <FiPlus /> Add Menu Item
      </button>

      {show && (
        <div className="glass p-5 space-y-4">
          <h3 className="font-semibold text-white">{editing ? 'Edit' : 'New'} Menu Item</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Item Name *</label>
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Paneer Butter Masala" className="input-field" />
            </div>
            <div>
              <label className="input-label">Price per Plate (₹) *</label>
              <input type="number" value={form.pricePerPlate} onChange={(e) => setForm(f => ({ ...f, pricePerPlate: e.target.value }))}
                placeholder="150" className="input-field" />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, isVeg: !f.isVeg }))}
                  className={`relative w-11 h-6 rounded-full transition-all ${form.isVeg ? 'bg-green-500' : 'bg-red-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isVeg ? '' : 'translate-x-5'}`} />
                </div>
                <span className="text-sm text-white/60">{form.isVeg ? '🌿 Veg' : '🍖 Non-Veg'}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe this dish…" rows={2} className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShow(false); setEditing(null) }} className="btn-ghost text-sm">Cancel</button>
            <button onClick={() => addMutation.mutate(form)} disabled={!form.name || !form.pricePerPlate || addMutation.isPending}
              className="btn-primary text-sm disabled:opacity-40">
              {addMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Add Item'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass p-10 text-center text-white/30">No menu items yet. Add your first item!</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item._id} className="glass-sm p-4 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full m-auto mt-0.5 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{item.name}</div>
                <div className="text-xs text-white/40">{item.category}</div>
              </div>
              <div className="text-brand-300 font-semibold text-sm flex-shrink-0">₹{item.pricePerPlate}</div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="text-white/30 hover:text-white transition-colors"><FiEdit2 className="text-sm" /></button>
                <button onClick={() => deleteMutation.mutate(item._id)} className="text-white/30 hover:text-red-400 transition-colors"><FiTrash2 className="text-sm" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Gallery tab ──────────────────────────────────────────
function GalleryTab({ profile, qc }) {
  const [uploading, setUploading] = useState(false)

  const onDrop = async (files) => {
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('images', f))
      await catererAPI.uploadMedia(fd)
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded!`)
      qc.invalidateQueries(['caterer-me'])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 10, maxSize: 8_000_000,
  })

  const gallery = profile?.gallery || []

  return (
    <div className="space-y-4">
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-brand-500/40'
        }`}>
        <input {...getInputProps()} />
        <FiUploadCloud className="text-4xl text-white/20 mx-auto mb-2" />
        <p className="text-white/50 text-sm">{uploading ? 'Uploading…' : isDragActive ? 'Drop photos here…' : 'Upload event photos'}</p>
        <p className="text-white/25 text-xs mt-1">Up to 10 photos · Max 8MB each</p>
      </div>
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {gallery.map((img, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Settings tab ─────────────────────────────────────────
function SettingsTab({ profile, qc }) {
  const [form, setForm] = useState({
    description:   profile?.description   || '',
    minPrice:      profile?.minPrice      || '',
    maxPrice:      profile?.maxPrice      || '',
    instagramHandle: profile?.instagramHandle || '',
  })

  const mutation = useMutation({
    mutationFn: catererAPI.updateProfile,
    onSuccess: () => { toast.success('Profile updated!'); qc.invalidateQueries(['caterer-me']) },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="glass p-6 space-y-5 max-w-lg">
      <h3 className="font-semibold text-white">Profile Settings</h3>
      <div>
        <label className="input-label">About Your Business</label>
        <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4} className="input-field resize-none" placeholder="Tell customers about your catering experience…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Min Price/Plate (₹)</label>
          <input type="number" value={form.minPrice} onChange={(e) => setForm(f => ({ ...f, minPrice: e.target.value }))}
            placeholder="100" className="input-field" />
        </div>
        <div>
          <label className="input-label">Max Price/Plate (₹)</label>
          <input type="number" value={form.maxPrice} onChange={(e) => setForm(f => ({ ...f, maxPrice: e.target.value }))}
            placeholder="500" className="input-field" />
        </div>
      </div>
      <div>
        <label className="input-label">Instagram Handle</label>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-sm">@</span>
          <input value={form.instagramHandle} onChange={(e) => setForm(f => ({ ...f, instagramHandle: e.target.value }))}
            placeholder="your_business" className="input-field" />
        </div>
      </div>
      <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary text-sm disabled:opacity-40">
        {mutation.isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
