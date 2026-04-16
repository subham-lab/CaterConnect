import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import {
  FiCheck, FiArrowRight, FiArrowLeft,
  FiUploadCloud, FiCamera, FiStar,
} from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import toast from 'react-hot-toast'
import { catererAPI } from '../../services/api'

const STEPS = ['Welcome', 'Cover Photo', 'Add Menu', 'Set Pricing', "You're Live!"]

const SUGGESTIONS = [
  { name: 'Paneer Butter Masala', category: 'Main Course', isVeg: true,  pricePerPlate: 180 },
  { name: 'Dal Makhani',          category: 'Main Course', isVeg: true,  pricePerPlate: 120 },
  { name: 'Vegetable Biryani',    category: 'Main Course', isVeg: true,  pricePerPlate: 160 },
  { name: 'Aloo Tikki',           category: 'Starter',     isVeg: true,  pricePerPlate: 80  },
  { name: 'Gulab Jamun',          category: 'Dessert',     isVeg: true,  pricePerPlate: 60  },
  { name: 'Masala Chai',          category: 'Beverages',   isVeg: true,  pricePerPlate: 30  },
  { name: 'Butter Chicken',       category: 'Main Course', isVeg: false, pricePerPlate: 260 },
  { name: 'Seekh Kebab',          category: 'Starter',     isVeg: false, pricePerPlate: 150 },
]

export default function CatererOnboarding() {
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const [step,     setStep]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [coverFile, setCoverFile]         = useState(null)
  const [coverPreview, setCoverPreview]   = useState(null)
  const [menuItems, setMenuItems]         = useState([])
  const [newItem,   setNewItem]           = useState({ name: '', pricePerPlate: '', category: 'Main Course', isVeg: true })
  const [pricing,   setPricing]           = useState({ minPrice: '', maxPrice: '', description: '' })

  const onDrop = useCallback((accepted) => {
    const file = accepted[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1, maxSize: 8_000_000,
  })

  const addSuggestion = (item) => {
    if (menuItems.find((m) => m.name === item.name)) return
    setMenuItems((p) => [...p, item])
    toast.success(`${item.name} added!`)
  }

  const addCustom = () => {
    if (!newItem.name || !newItem.pricePerPlate) return toast.error('Fill name and price')
    setMenuItems((p) => [...p, { ...newItem, pricePerPlate: Number(newItem.pricePerPlate) }])
    setNewItem({ name: '', pricePerPlate: '', category: 'Main Course', isVeg: true })
  }

  const uploadCover = async () => {
    if (!coverFile) return setStep(2)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('images', coverFile)
      await catererAPI.uploadMedia(fd)
      qc.invalidateQueries(['caterer-me'])
      toast.success('Cover photo uploaded!')
      setStep(2)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const saveMenu = async () => {
    if (menuItems.length === 0) return setStep(3)
    setLoading(true)
    try {
      await Promise.all(menuItems.map((item) => catererAPI.addMenu(item)))
      qc.invalidateQueries(['caterer-me'])
      toast.success(`${menuItems.length} items saved!`)
      setStep(3)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const savePricing = async () => {
    setLoading(true)
    try {
      const u = {}
      if (pricing.minPrice)    u.minPrice    = Number(pricing.minPrice)
      if (pricing.maxPrice)    u.maxPrice    = Number(pricing.maxPrice)
      if (pricing.description) u.description = pricing.description
      if (Object.keys(u).length) {
        await catererAPI.updateProfile(u)
        qc.invalidateQueries(['caterer-me'])
      }
      setStep(4)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-white/40 text-xs">{STEPS[step]}</span>
              <span className="text-white/40 text-xs">Step {step + 1} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #0ea5e9)' }}
                animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Welcome ── */}
          {step === 0 && (
            <motion.div key="s0"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="glass p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <div className="inline-flex items-center gap-1.5 badge badge-verified mb-4">
                  <MdVerified /> Verified Caterer
                </div>
                <h1 className="font-display text-2xl font-bold text-white mb-3">Welcome to CaterConnect!</h1>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Your account is approved and live. Complete your profile in 3 quick steps to start receiving bookings.
                </p>
                <div className="glass-sm p-4 text-left mb-6 space-y-2.5">
                  {[
                    { icon: <FiCamera />, text: 'Add a cover photo' },
                    { icon: '🍽️',        text: 'List your menu & prices' },
                    { icon: '💰',         text: 'Set your price range' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-white/60">
                      <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs">{icon}</div>
                      {text}
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                  Start Setup <FiArrowRight />
                </button>
                <button onClick={() => navigate('/caterer/dashboard')}
                  className="w-full mt-3 text-xs text-white/25 hover:text-white/50 transition-colors py-1">
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Cover photo ── */}
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass p-6">
                <h2 className="font-display text-xl font-bold text-white mb-1">📸 Cover Photo</h2>
                <p className="text-white/40 text-sm mb-5">A great cover photo increases bookings by 3×.</p>

                {coverPreview ? (
                  <div className="relative mb-4">
                    <img src={coverPreview} alt="Cover" className="w-full h-52 object-cover rounded-xl" />
                    <button onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white/70 hover:text-white flex items-center justify-center text-sm">✕</button>
                  </div>
                ) : (
                  <div {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4 ${
                      isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-brand-500/40'
                    }`}>
                    <input {...getInputProps()} />
                    <FiUploadCloud className="text-4xl text-white/20 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">{isDragActive ? 'Drop here…' : 'Drag & drop or click'}</p>
                    <p className="text-white/25 text-xs mt-1">JPG / PNG · Max 8MB</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-ghost px-4"><FiArrowLeft /></button>
                  <button onClick={uploadCover} disabled={loading} className="btn-primary flex-1 text-sm disabled:opacity-50">
                    {loading ? 'Uploading…' : coverFile ? 'Upload & Continue' : 'Skip'} <FiArrowRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Menu items ── */}
          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass p-6">
                <h2 className="font-display text-xl font-bold text-white mb-1">🍽️ Menu Items</h2>
                <p className="text-white/40 text-sm mb-4">Add your dishes with pricing.</p>

                <p className="text-white/40 text-xs mb-2">Quick-add popular items:</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {SUGGESTIONS.map((s) => {
                    const added = !!menuItems.find((m) => m.name === s.name)
                    return (
                      <button key={s.name} onClick={() => addSuggestion(s)} disabled={added}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          added ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'border-white/10 text-white/40 hover:border-brand-500/40 hover:text-white'
                        }`}>
                        {added && <FiCheck className="inline mr-1 text-xs" />}{s.name}
                      </button>
                    )
                  })}
                </div>

                <div className="glass-sm p-3 mb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newItem.name} onChange={(e) => setNewItem((i) => ({ ...i, name: e.target.value }))}
                      placeholder="Dish name" className="input-field text-sm py-2" />
                    <input type="number" value={newItem.pricePerPlate}
                      onChange={(e) => setNewItem((i) => ({ ...i, pricePerPlate: e.target.value }))}
                      placeholder="₹ / plate" className="input-field text-sm py-2" />
                  </div>
                  <div className="flex gap-2">
                    <select value={newItem.category} onChange={(e) => setNewItem((i) => ({ ...i, category: e.target.value }))}
                      className="input-field text-sm py-2 flex-1">
                      {['Starter','Main Course','Dessert','Beverages','Snacks','Breads'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <button onClick={() => setNewItem((i) => ({ ...i, isVeg: !i.isVeg }))}
                      className={`px-3 rounded-xl text-xs border flex-shrink-0 ${newItem.isVeg ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {newItem.isVeg ? '🌿 Veg' : '🍖 NV'}
                    </button>
                    <button onClick={addCustom}
                      className="px-3 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs flex-shrink-0 hover:bg-brand-500/30 transition-colors">
                      + Add
                    </button>
                  </div>
                </div>

                {menuItems.length > 0 && (
                  <div className="space-y-1 mb-4 max-h-36 overflow-y-auto">
                    {menuItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 text-sm">
                        <div className={`w-2 h-2 rounded-sm flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white flex-1 truncate">{item.name}</span>
                        <span className="text-brand-300 text-xs">₹{item.pricePerPlate}</span>
                        <button onClick={() => setMenuItems((p) => p.filter((_, j) => j !== i))}
                          className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost px-4"><FiArrowLeft /></button>
                  <button onClick={saveMenu} disabled={loading} className="btn-primary flex-1 text-sm disabled:opacity-50">
                    {loading ? 'Saving…' : menuItems.length > 0 ? `Save ${menuItems.length} items` : 'Skip'} <FiArrowRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Pricing ── */}
          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass p-6">
                <h2 className="font-display text-xl font-bold text-white mb-1">💰 Set Pricing</h2>
                <p className="text-white/40 text-sm mb-5">Customers see your price range in search results.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Min Price / Plate (₹)</label>
                      <input type="number" value={pricing.minPrice}
                        onChange={(e) => setPricing((p) => ({ ...p, minPrice: e.target.value }))}
                        placeholder="150" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Max Price / Plate (₹)</label>
                      <input type="number" value={pricing.maxPrice}
                        onChange={(e) => setPricing((p) => ({ ...p, maxPrice: e.target.value }))}
                        placeholder="500" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">About Your Business</label>
                    <textarea value={pricing.description}
                      onChange={(e) => setPricing((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Describe your experience, specialties, and what makes you unique…"
                      rows={3} className="input-field resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(2)} className="btn-ghost px-4"><FiArrowLeft /></button>
                  <button onClick={savePricing} disabled={loading} className="btn-primary flex-1 text-sm disabled:opacity-50">
                    {loading ? 'Saving…' : 'Save & Finish'} <FiArrowRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Complete ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="glass p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
                  <FiCheck className="text-white text-3xl" />
                </motion.div>
                <h1 className="font-display text-2xl font-bold text-white mb-2">Your Profile is Live! 🚀</h1>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Customers can now find and contact you. Keep your profile fresh to get more bookings.
                </p>
                <div className="glass-sm p-4 text-left mb-6 space-y-2.5">
                  {[
                    { icon: '📸', tip: 'Upload 5+ event photos to the gallery' },
                    { icon: '💬', tip: 'Respond to customer inquiries within 2 hours' },
                    { icon: '⭐', tip: 'Ask your first customers for a review' },
                    { icon: '🔄', tip: 'Keep your menu and prices updated' },
                  ].map(({ icon, tip }) => (
                    <div key={tip} className="flex items-start gap-2.5">
                      <span className="text-base">{icon}</span>
                      <p className="text-sm text-white/50">{tip}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => navigate('/caterer/dashboard')}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                    <FiStar /> Go to My Dashboard
                  </button>
                  <button onClick={() => navigate('/caterer/subscribe')} className="btn-ghost w-full text-sm">
                    Subscribe ₹3,000/yr to stay active
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
