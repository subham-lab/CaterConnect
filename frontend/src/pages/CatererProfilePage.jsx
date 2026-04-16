import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiStar, FiMapPin, FiPhone, FiMail, FiInstagram,
  FiCheck, FiCamera, FiMessageSquare, FiShare2,
} from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import toast from 'react-hot-toast'
import { catererAPI, reviewAPI } from '../services/api'
import useAuthStore from '../context/authStore'
import ContactCatererModal from '../components/caterer/ContactCatererModal'

const TABS = ['Overview', 'Menu', 'Gallery', 'Reviews']

export default function CatererProfilePage() {
  const { id }          = useParams()
  const user            = useAuthStore((s) => s.user)
  const [tab, setTab]   = useState('Overview')
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [contactOpen, setContactOpen] = useState(false)
  const qc              = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['caterer', id],
    queryFn:  () => catererAPI.getProfile(id).then((r) => r.data.caterer),
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn:  () => reviewAPI.getReviews(id).then((r) => r.data.reviews),
  })

  const addReviewMutation = useMutation({
    mutationFn: (data) => reviewAPI.addReview(id, data),
    onSuccess: () => {
      toast.success('Review posted!')
      setReview({ rating: 5, comment: '' })
      qc.invalidateQueries(['reviews', id])
      qc.invalidateQueries(['caterer', id])
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <ProfileSkeleton />
  if (!data)     return <div className="pt-24 text-center text-white/40">Caterer not found</div>

  const {
    businessName, description, city, phone, email, instagramHandle,
    coverImage, profileImage, services = [], menuItems = [],
    gallery = [], avgRating = 0, totalReviews = 0,
    isVeg, isNonVeg, minPrice, maxPrice,
    verificationStatus,
  } = data

  return (
    <div className="pt-16 min-h-screen">
      {/* ── Cover ─────────────────────────────────── */}
      <div className="relative h-72 sm:h-96">
        {coverImage ? (
          <img src={coverImage} alt={businessName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(14,165,233,0.2))' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        {/* ── Profile header ────────────────────── */}
        <div className="glass p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-brand-500/30">
              {profileImage ? (
                <img src={profileImage} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed22, #0ea5e922)' }}>
                  🍽️
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-white">{businessName}</h1>
                {verificationStatus === 'approved' && (
                  <span className="badge badge-verified"><MdVerified /> Verified</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 mb-3">
                <span className="flex items-center gap-1.5"><FiMapPin className="text-xs" /> {city}</span>
                {totalReviews > 0 && (
                  <span className="flex items-center gap-1">
                    <FiStar className="text-yellow-400 text-xs" />
                    <span className="text-white font-medium">{Number(avgRating).toFixed(1)}</span>
                    <span>({totalReviews} reviews)</span>
                  </span>
                )}
                {isVeg    && <span className="badge badge-veg">🌿 Veg</span>}
                {isNonVeg && <span className="badge badge-nonveg">🍖 Non-Veg</span>}
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5">
                {services.map((svc) => (
                  <span key={svc}
                    className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact actions */}
            <div className="flex flex-col gap-2 sm:items-end w-full sm:w-auto">
              <button
                onClick={() => setContactOpen(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiMessageSquare /> Contact Caterer
              </button>
              {phone && (
                <a href={`tel:${phone}`}
                  className="btn-ghost flex items-center gap-2 text-sm">
                  <FiPhone /> Call Now
                </a>
              )}
              {(minPrice || maxPrice) && (
                <div className="text-center">
                  <div className="text-xs text-white/30">Price range</div>
                  <div className="text-brand-300 font-semibold">
                    ₹{minPrice?.toLocaleString('en-IN') || '—'} – ₹{maxPrice?.toLocaleString('en-IN') || '—'}
                    <span className="text-white/30 font-normal text-xs"> /plate</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => navigator.share?.({ title: businessName, url: window.location.href })}
                className="btn-ghost text-sm flex items-center gap-2"
              >
                <FiShare2 /> Share
              </button>
            </div>

            {/* Contact modal */}
            <ContactCatererModal
              open={contactOpen}
              onClose={() => setContactOpen(false)}
              caterer={data}
            />
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────── */}
        <div className="flex gap-1 glass-sm p-1 mb-6 w-fit">
          {TABS.map((t) => (
            <button key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* ── Overview ── */}
            {tab === 'Overview' && (
              <div className="space-y-5">
                {description && (
                  <div className="glass p-5">
                    <h3 className="font-semibold text-white mb-3">About</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                  </div>
                )}
                <div className="glass p-5">
                  <h3 className="font-semibold text-white mb-4">Contact Info</h3>
                  <div className="space-y-3">
                    {phone && (
                      <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                        <FiPhone className="text-brand-400" /> {phone}
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                        <FiMail className="text-brand-400" /> {email}
                      </a>
                    )}
                    {instagramHandle && (
                      <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                        <FiInstagram className="text-pink-400" /> @{instagramHandle}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Menu ── */}
            {tab === 'Menu' && (
              <div className="space-y-4">
                {menuItems.length === 0 ? (
                  <div className="glass p-10 text-center text-white/30">No menu items added yet.</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {menuItems.map((item) => (
                      <div key={item._id} className="glass-sm p-4 flex items-start gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                            <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                              item.isVeg ? 'border-green-500' : 'border-red-500'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-white/40 text-xs line-clamp-2 mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-brand-300 font-semibold text-sm">
                              ₹{item.pricePerPlate?.toLocaleString('en-IN')}<span className="text-white/30 font-normal">/plate</span>
                            </span>
                            <span className="text-xs text-white/30 capitalize">{item.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Gallery ── */}
            {tab === 'Gallery' && (
              <div>
                {gallery.length === 0 ? (
                  <div className="glass p-10 text-center text-white/30">
                    <FiCamera className="text-4xl mx-auto mb-3 opacity-30" />
                    No photos uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((img, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="aspect-square rounded-xl overflow-hidden group cursor-pointer"
                      >
                        <img src={img} alt={`Gallery ${i+1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Reviews ── */}
            {tab === 'Reviews' && (
              <div className="space-y-5">
                {/* Write review */}
                {user && (
                  <div className="glass p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <FiMessageSquare className="text-brand-400" /> Write a Review
                    </h3>
                    <div className="flex gap-2 mb-4">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setReview(r => ({ ...r, rating: s }))}>
                          <FiStar className={`text-2xl transition-colors ${
                            s <= review.rating ? 'text-yellow-400' : 'text-white/20'
                          }`}
                          style={{ fill: s <= review.rating ? '#facc15' : 'none' }}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))}
                      placeholder="Share your experience with this caterer…"
                      rows={3}
                      className="input-field resize-none mb-3"
                    />
                    <button
                      onClick={() => addReviewMutation.mutate(review)}
                      disabled={!review.comment.trim() || addReviewMutation.isPending}
                      className="btn-primary text-sm disabled:opacity-40"
                    >
                      {addReviewMutation.isPending ? 'Posting…' : 'Post Review'}
                    </button>
                  </div>
                )}

                {/* Review list */}
                {reviews.length === 0 ? (
                  <div className="glass p-10 text-center text-white/30">No reviews yet. Be the first!</div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r._id} className="glass-sm p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-300 flex-shrink-0">
                            {r.user?.displayName?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">{r.user?.displayName || 'Customer'}</span>
                              <span className="text-white/30 text-xs">
                                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex mb-2">
                              {[1,2,3,4,5].map((s) => (
                                <FiStar key={s} className={`text-xs ${s <= r.rating ? 'text-yellow-400' : 'text-white/20'}`}
                                  style={{ fill: s <= r.rating ? '#facc15' : 'none' }} />
                              ))}
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">{r.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="h-72 shimmer" />
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        <div className="glass p-6 mb-6">
          <div className="flex gap-5">
            <div className="w-20 h-20 rounded-2xl shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 rounded shimmer" />
              <div className="h-4 w-32 rounded shimmer" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full shimmer" />
                <div className="h-6 w-24 rounded-full shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
