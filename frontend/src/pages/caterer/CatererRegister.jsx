import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { FiUploadCloud, FiCheck, FiFile, FiX, FiLock, FiArrowRight } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import toast from 'react-hot-toast'
import { catererAPI, paymentAPI } from '../../services/api'
import useAuthStore from '../../context/authStore'

const STEPS = ['Business Info', 'Documents', 'Payment']

const DOC_FIELDS = [
  { key: 'gst',       label: 'GST Certificate',    hint: 'Upload your GST registration certificate (PDF/Image)' },
  { key: 'aadhaar',   label: 'Aadhaar Card',        hint: 'Upload owner Aadhaar card (PDF/Image)' },
  { key: 'foodLicense', label: 'FSSAI Food License', hint: 'Upload your FSSAI food safety license (PDF/Image)' },
]

function FileDropzone({ label, hint, onFile, file, onRemove }) {
  const onDrop = useCallback((accepted) => { if (accepted[0]) onFile(accepted[0]) }, [onFile])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxFiles: 1, maxSize: 5_000_000,
  })

  return (
    <div>
      <label className="input-label">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-green-500/30 bg-green-500/5">
          <FiFile className="text-green-400 text-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{file.name}</p>
            <p className="text-xs text-white/30">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={onRemove} className="text-white/30 hover:text-white transition-colors">
            <FiX />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-white/10 hover:border-brand-500/40 hover:bg-brand-500/5'
          }`}
        >
          <input {...getInputProps()} />
          <FiUploadCloud className="text-3xl text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/50">{isDragActive ? 'Drop here…' : 'Drag & drop or click to upload'}</p>
          <p className="text-xs text-white/25 mt-1">{hint}</p>
          <p className="text-xs text-white/20 mt-1">Max 5MB · PDF or Image</p>
        </div>
      )}
    </div>
  )
}

export default function CatererRegister() {
  const navigate  = useNavigate()
  const dbUser    = useAuthStore((s) => s.dbUser)
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)

  const [info, setInfo] = useState({
    businessName: '',
    description:  '',
    city:         '',
    phone:        '',
    email:        dbUser?.email || '',
    isVeg:        true,
    isNonVeg:     false,
    services:     [],
  })

  const [docs, setDocs] = useState({ gst: null, aadhaar: null, foodLicense: null })

  const serviceOptions = ['Wedding', 'Birthday', 'Corporate', 'Pooja', 'Engagement', 'Anniversary', 'Baby Shower', 'Social Gathering']

  const toggleService = (svc) => setInfo((i) => ({
    ...i,
    services: i.services.includes(svc)
      ? i.services.filter((s) => s !== svc)
      : [...i.services, svc],
  }))

  const allDocsUploaded = Object.values(docs).every(Boolean)

  // ── Razorpay payment flow ───────────────────────────
  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1) Create Razorpay order on backend
      const { data: order } = await paymentAPI.createOrder({ amount: 9900, type: 'registration' }) // 9900 paise = ₹99
      console.log("KEY:", import.meta.env.VITE_RAZORPAY_KEY_ID)

      // 2) Open Razorpay checkout
      const options = {
        key:          import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:       order.amount,
        currency:     'INR',
        name:         'CaterConnect',
        description:  'Caterer Registration Fee',
        order_id:     order.id,
        prefill: {
          name:  dbUser?.displayName || '',
          email: info.email,
          contact: info.phone,
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          // 3) Verify on backend
          await paymentAPI.verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            type: 'registration',
          })

          // 4) Submit registration
          await submitRegistration()
        },
        modal: {
          ondismiss: () => { setLoading(false); toast.error('Payment cancelled') },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  const submitRegistration = async () => {
    try {
      const fd = new FormData()
      Object.entries(info).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
        else fd.append(k, v)
      })
      if (docs.gst)         fd.append('gst',         docs.gst)
      if (docs.aadhaar)     fd.append('aadhaar',     docs.aadhaar)
      if (docs.foodLicense) fd.append('foodLicense', docs.foodLicense)

      await catererAPI.register(fd)
      toast.success('Registration submitted! Awaiting verification (up to 48 hours).')
      navigate('/caterer/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            List Your <span className="gradient-text">Catering Service</span>
          </h1>
          <p className="text-white/40">Complete 3 simple steps to start receiving bookings</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-white' : 'text-white/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step  ? 'bg-green-500' :
                  i === step ? 'bg-brand-500' :
                  'bg-white/8'
                }`}>
                  {i < step ? <FiCheck /> : i + 1}
                </div>
                <span className="hidden sm:block text-sm">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 sm:w-16 h-px mx-2 transition-all ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 0: Business info ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Business Name *</label>
                    <input value={info.businessName} onChange={(e) => setInfo(i => ({ ...i, businessName: e.target.value }))}
                      placeholder="e.g. Sharma Caterers" className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">City *</label>
                    <input value={info.city} onChange={(e) => setInfo(i => ({ ...i, city: e.target.value }))}
                      placeholder="e.g. Ahmedabad" className="input-field" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Phone Number *</label>
                    <input type="tel" value={info.phone} onChange={(e) => setInfo(i => ({ ...i, phone: e.target.value }))}
                      placeholder="+91 98765 43210" className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Business Email</label>
                    <input type="email" value={info.email} onChange={(e) => setInfo(i => ({ ...i, email: e.target.value }))}
                      placeholder="business@example.com" className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="input-label">Description</label>
                  <textarea value={info.description} onChange={(e) => setInfo(i => ({ ...i, description: e.target.value }))}
                    placeholder="Tell customers about your catering experience, specialties, and what makes you unique…"
                    rows={3} className="input-field resize-none" />
                </div>

                <div>
                  <label className="input-label mb-3 block">Services Offered *</label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((svc) => (
                      <button key={svc} type="button" onClick={() => toggleService(svc)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          info.services.includes(svc)
                            ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                            : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
                        }`}>
                        {info.services.includes(svc) && <FiCheck className="inline mr-1 text-xs" />}
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label mb-3 block">Food Type</label>
                  <div className="flex gap-4">
                    {[['isVeg', '🌿 Vegetarian'], ['isNonVeg', '🍖 Non-Vegetarian']].map(([k, l]) => (
                      <label key={k} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={info[k]}
                          onChange={(e) => setInfo(i => ({ ...i, [k]: e.target.checked }))}
                          className="w-4 h-4 accent-brand-500" />
                        <span className="text-sm text-white/70">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!info.businessName || !info.city || !info.phone || info.services.length === 0)
                      return toast.error('Please fill all required fields and select at least one service')
                    setStep(1)
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Next: Upload Documents <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Documents ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass p-6 space-y-5">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                  ℹ️ All documents are securely stored and only reviewed by our verification team.
                </div>
                {DOC_FIELDS.map(({ key, label, hint }) => (
                  <FileDropzone key={key} label={label} hint={hint}
                    file={docs[key]}
                    onFile={(f) => setDocs((d) => ({ ...d, [key]: f }))}
                    onRemove={() => setDocs((d) => ({ ...d, [key]: null }))}
                  />
                ))}
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                  <button
                    onClick={() => { if (!allDocsUploaded) return toast.error('Upload all 3 documents'); setStep(2) }}
                    disabled={!allDocsUploaded}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    Next: Payment <FiArrowRight />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass p-6 space-y-5">
                <h3 className="font-semibold text-white">Registration Summary</h3>

                {/* Order summary */}
                <div className="glass-sm p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Business</span>
                    <span className="text-white font-medium">{info.businessName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">City</span>
                    <span className="text-white">{info.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Services</span>
                    <span className="text-white text-right max-w-[60%]">{info.services.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Documents</span>
                    <span className="text-green-400 flex items-center gap-1"><FiCheck /> All uploaded</span>
                  </div>
                  <div className="border-t border-white/8 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Registration Fee</span>
                    <span className="text-2xl font-bold gradient-text">₹99</span>
                  </div>
                  <div className="text-xs text-white/30">
                    One-time fee. Annual subscription ₹3,000 billed after 1st year.
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <FiLock className="text-green-400 flex-shrink-0" />
                  Powered by Razorpay — 256-bit encrypted secure payment
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : 'Pay ₹99 & Register'}
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
