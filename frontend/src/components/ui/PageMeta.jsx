import { useEffect } from 'react'

/**
 * Sets document title and meta description for each page.
 *
 * Usage:
 *   <PageMeta title="Search Caterers" description="Find verified caterers near you" />
 */
export default function PageMeta({ title, description, image }) {
  useEffect(() => {
    // Title
    document.title = title
      ? `${title} | CaterConnect`
      : 'CaterConnect — Verified Catering Marketplace'

    // Description
    const setMeta = (name, content, prop = false) => {
      const selector = prop
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, true)
    }

    if (title) {
      setMeta('og:title', `${title} | CaterConnect`, true)
    }

    if (image) {
      setMeta('og:image', image, true)
    }

    setMeta('og:type', 'website', true)
    setMeta('og:site_name', 'CaterConnect', true)

    return () => {
      document.title = 'CaterConnect — Verified Catering Marketplace'
    }
  }, [title, description, image])

  return null
}
