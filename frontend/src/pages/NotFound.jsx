import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="font-display text-8xl font-bold gradient-text mb-4 leading-none">404</div>
        <h2 className="text-xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-white/40 text-sm mb-8">
          Looks like this page got lost in the kitchen. Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
