import toast from 'react-hot-toast'
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'

// Consistent branded toasts used throughout the app
const base = {
  style: {
    background:   '#1a1a2e',
    color:        '#fff',
    border:       '1px solid rgba(124,58,237,0.2)',
    borderRadius: '12px',
    fontSize:     '14px',
    maxWidth:     '380px',
  },
  duration: 3500,
}

export const notify = {
  success: (msg, opts = {}) =>
    toast.success(msg, {
      ...base,
      iconTheme: { primary: '#34d399', secondary: '#1a1a2e' },
      ...opts,
    }),

  error: (msg, opts = {}) =>
    toast.error(msg, {
      ...base,
      iconTheme: { primary: '#f87171', secondary: '#1a1a2e' },
      duration: 4500,
      ...opts,
    }),

  loading: (msg) =>
    toast.loading(msg, {
      ...base,
      iconTheme: { primary: '#7c3aed', secondary: '#1a1a2e' },
    }),

  dismiss: (id) => toast.dismiss(id),

  promise: (promise, msgs) =>
    toast.promise(promise, msgs, {
      ...base,
      success: { ...base, iconTheme: { primary: '#34d399', secondary: '#1a1a2e' } },
      error:   { ...base, iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
    }),

  // Wrap async fn with auto loading/success/error toasts
  async wrap(fn, { loading = 'Loading…', success = 'Done!', error = 'Something went wrong' } = {}) {
    const id = notify.loading(loading)
    try {
      const result = await fn()
      notify.dismiss(id)
      notify.success(success)
      return result
    } catch (err) {
      notify.dismiss(id)
      notify.error(err?.message || error)
      throw err
    }
  },
}

export default notify
