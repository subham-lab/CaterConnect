import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiPhone, FiMail, FiCalendar, FiUsers } from 'react-icons/fi'
import { MdWhatsapp } from 'react-icons/md'
import toast from 'react-hot-toast'
import useAuthStore from '../../context/authStore'
import { Link } from 'react-router-dom'

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Pooja', 'Engagement', 'Anniversary', 'Baby Shower', 'Other']

export default function ContactCatererModal({ open, onClose, caterer }) {
  const user   = useAuthStore((s) => s.user)
  const dbUser = useAuthStore((s) => s.dbUser)

  const [form, setForm] = useState({
    name:      dbUser?.displayName || '',
    phone:     '',
    eventType: 'Wedding',
    eventDate: '',
    guests:    '',
    message:   '',
  })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    setLoading(true)

    // In production: POST /api/inquiries with this data
    // For now we simulate and open WhatsApp / phone call
    await new Promise((r) => setTimeout(r, 800))

    setSent(true)
    setLoading(false)
    toast.success('Inquiry sent!')
  }

  const whatsappMsg = encodeURIComponent(
    `Hi ${caterer?.businessName}, I found you on CaterConnect.\n\nEvent: ${form.eventType}\nDate: ${form.eventDate || 'TBD'}\nGuests: ${form.guests || 'TBD'}\n\n${form.message || 'I am interested in your catering services.'}\n\nMy name: ${form.name}\nPhone: ${form.phone}`,
  )

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="glass w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/6">
              <div>
                <h3 className="font-semibold text-white">Contact Caterer</h3>
                <p className="text-white/40 text-xs mt-0.5">{caterer?.businessName}</p>
              </div>
              <button onClick={onClose}
                className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="p-6">
              {!user ? (
                /* Not logged in */
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🔒</div>
                  <p className="text-white/60 text-sm mb-5">Sign in to contact this caterer</p>
                  <Link to="/login" className="btn-primary text-sm" onClick={onClose}>
                    Sign In / Sign Up
                  </Link>
                </div>
              ) : sent ? (
                /* Success state */
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
                    <FiSend className="text-white text-xl" />
                  </motion.div>
                  <h4 className="font-semibold text-white mb-2">Inquiry Sent!</h4>
                  <p className="text-white/50 text-sm mb-5">
                    {caterer?.businessName} will contact you shortly on the details you provided.
                  </p>

                  {/* Direct contact buttons */}
                  <div className="space-y-2">
                    {caterer?.phone && (
                      <a href={`https://wa.me/91${caterer.phone.replace(/\D/g, '')}?text=${whatsappMsg}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/25 transition-colors">
                        <MdWhatsapp className="text-xl" /> WhatsApp {caterer.businessName}
                      </a>
                    )}
                    {caterer?.phone && (
                      <a href={`tel:${caterer.phone}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/15 transition-colors">
                        <FiPhone /> Call Now
                      </a>
                    )}
                  </div>
                  <button onClick={onClose} className="w-full mt-3 text-xs text-white/30 hover:text-white/60 transition-colors py-2">
                    Close
                  </button>
                </div>
              ) : (
                /* Inquiry form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Your Name *</label>
                      <input value={form.name} onChange={update('name')}
                        placeholder="Rahul Sharma" className="input-field" required />
                    </div>
                    <div>
                      <label className="input-label">Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={update('phone')}
                        placeholder="9876543210" className="input-field" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label flex items-center gap-1">
                        <FiCalendar className="text-xs" /> Event Type
                      </label>
                      <select value={form.eventType} onChange={update('eventType')} className="input-field">
                        {EVENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="input-label flex items-center gap-1">
                        <FiUsers className="text-xs" /> Guests
                      </label>
                      <input type="number" value={form.guests} onChange={update('guests')}
                        placeholder="200" className="input-field" />
                    </div>
                  </div>

                  <div>
                    <label className="input-label flex items-center gap-1">
                      <FiCalendar className="text-xs" /> Event Date
                    </label>
                    <input type="date" value={form.eventDate} onChange={update('eventDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field" />
                  </div>

                  <div>
                    <label className="input-label">Message (optional)</label>
                    <textarea value={form.message} onChange={update('message')}
                      placeholder="Tell the caterer about your event, cuisine preferences, budget…"
                      rows={3} className="input-field resize-none" />
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? 'Sending…' : <><FiSend /> Send Inquiry</>}
                  </button>

                  {/* Direct WhatsApp shortcut */}
                  {caterer?.phone && (
                    <a href={`https://wa.me/91${caterer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${caterer.businessName}, I found you on CaterConnect. I'm interested in your catering services.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/10 border border-green-500/15 text-green-400 text-sm hover:bg-green-500/15 transition-colors">
                      <MdWhatsapp className="text-lg" /> Or message on WhatsApp
                    </a>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
