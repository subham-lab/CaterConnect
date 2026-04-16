import { useState } from 'react'
import { FiStar } from 'react-icons/fi'

/**
 * Interactive:   <StarRating value={rating} onChange={setRating} />
 * Display-only:  <StarRating value={4.5} readOnly size="sm" />
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hover, setHover] = useState(0)

  const sizes = { sm: 'text-xs', md: 'text-xl', lg: 'text-2xl' }
  const cls   = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (readOnly ? value : (hover || value))
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`transition-transform ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <FiStar
              className={`${cls} transition-colors ${filled ? 'text-yellow-400' : 'text-white/20'}`}
              style={{ fill: filled ? '#facc15' : 'none' }}
            />
          </button>
        )
      })}
    </div>
  )
}
