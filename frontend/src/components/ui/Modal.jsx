import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

/**
 * Usage:
 * <Modal open={open} onClose={() => setOpen(false)} title="Confirm Action">
 *   <p>Are you sure?</p>
 * </Modal>
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className={`glass w-full ${maxWidth} relative`}
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.93, y: 16  }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/6">
                <h3 className="font-semibold text-white text-base">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
