import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchAPI } from '../services/api'

// ── useDebounce ─────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ── useLocalStorage ────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const val = value instanceof Function ? value(stored) : value
      setStored(val)
      window.localStorage.setItem(key, JSON.stringify(val))
    } catch (err) {
      console.error('useLocalStorage error:', err)
    }
  }, [key, stored])

  return [stored, setValue]
}

// ── useMediaQuery ───────────────────────────────────────────
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql      = window.matchMedia(query)
    const handler  = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

export const useIsMobile  = () => useMediaQuery('(max-width: 640px)')
export const useIsTablet  = () => useMediaQuery('(max-width: 1024px)')

// ── useScrollPosition ───────────────────────────────────────
export function useScrollPosition() {
  const [pos, setPos] = useState(0)
  useEffect(() => {
    const handler = () => setPos(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return pos
}

// ── useCatererSearch ────────────────────────────────────────
export function useCatererSearch(params) {
  const debouncedQ    = useDebounce(params.q, 350)
  const debouncedLoc  = useDebounce(params.location, 350)

  return useQuery({
    queryKey: ['search', debouncedQ, debouncedLoc, params.event, params.sort,
      params.minPrice, params.maxPrice, params.veg, params.minRating],
    queryFn:  () => searchAPI.search({
      ...params,
      q:        debouncedQ,
      location: debouncedLoc,
    }).then((r) => r.data),
    keepPreviousData: true,
    staleTime: 30_000,
  })
}

// ── usePrevious ─────────────────────────────────────────────
export function usePrevious(value) {
  const ref = useRef(undefined)
  useEffect(() => { ref.current = value })
  return ref.current
}

// ── useClickOutside ─────────────────────────────────────────
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, callback])
}

// ── useCountUp ──────────────────────────────────────────────
export function useCountUp(target, duration = 1800, trigger = true) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const step  = target / (duration / 16)
    let current = 0
    const id    = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(Math.floor(current))
      if (current >= target) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [target, duration, trigger])
  return count
}

// ── usePageTitle ────────────────────────────────────────────
export function usePageTitle(title) {
  useEffect(() => {
    const prev           = document.title
    document.title       = title ? `${title} | CaterConnect` : 'CaterConnect'
    return () => { document.title = prev }
  }, [title])
}

// ── useRazorpay ─────────────────────────────────────────────
export function useRazorpay() {
  const [loaded, setLoaded] = useState(typeof window.Razorpay !== 'undefined')

  useEffect(() => {
    if (loaded) return
    const script    = document.createElement('script')
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async    = true
    script.onload   = () => setLoaded(true)
    script.onerror  = () => console.error('Razorpay failed to load')
    document.head.appendChild(script)
  }, [loaded])

  const openCheckout = useCallback((options) => {
    if (!loaded || !window.Razorpay) {
      console.error('Razorpay not loaded')
      return
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
    return rzp
  }, [loaded])

  return { loaded, openCheckout }
}
