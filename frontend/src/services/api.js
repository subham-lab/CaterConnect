import axios from 'axios'
import { getIdToken } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (_) {}
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  },
)

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  syncUser:  (data) => api.post('/auth/sync', data),
  getMe:     ()     => api.get('/auth/me'),
  updateRole:(role) => api.patch('/auth/role', { role }),
}

// ─── Caterers ─────────────────────────────────────────
export const catererAPI = {
  register:    (formData) => api.post('/caterers/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getProfile:  (id)       => api.get(`/caterers/${id}`),
  updateProfile:(data)    => api.patch('/caterers/me', data),
  addService:  (data)     => api.post('/caterers/me/services', data),
  addMenu:     (data)     => api.post('/caterers/me/menu', data),
  updateMenu:  (id, data) => api.patch(`/caterers/me/menu/${id}`, data),
  deleteMenu:  (id)       => api.delete(`/caterers/me/menu/${id}`),
  uploadMedia: (formData) => api.post('/caterers/me/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard:()         => api.get('/caterers/me/dashboard'),
  getMyProfile:()         => api.get('/caterers/me'),
}

// ─── Search ───────────────────────────────────────────
export const searchAPI = {
  search:       (params) => api.get('/search', { params }),
  getFeatured:  ()       => api.get('/search/featured'),
  getByLocation:(location, params) => api.get(`/search/location/${encodeURIComponent(location)}`, { params }),
}

// ─── Reviews ──────────────────────────────────────────
export const reviewAPI = {
  addReview:    (catererId, data) => api.post(`/reviews/${catererId}`, data),
  getReviews:   (catererId)       => api.get(`/reviews/${catererId}`),
  deleteReview: (reviewId)        => api.delete(`/reviews/${reviewId}`),
}

// ─── Payments ─────────────────────────────────────────
export const paymentAPI = {
  createOrder:  (data)    => api.post('/payments/create-order', data),
  verifyPayment:(data)    => api.post('/payments/verify', data),
  getHistory:   ()        => api.get('/payments/history'),
}

// ─── Admin ────────────────────────────────────────────
export const adminAPI = {
  getPendingCaterers: ()         => api.get('/admin/caterers/pending'),
  getAllCaterers:      (params)  => api.get('/admin/caterers', { params }),
  approveCaterer:     (id)       => api.patch(`/admin/caterers/${id}/approve`),
  rejectCaterer:      (id, reason) => api.patch(`/admin/caterers/${id}/reject`, { reason }),
  getStats:           ()         => api.get('/admin/stats'),
  getAllUsers:         (params)  => api.get('/admin/users', { params }),
  banUser:            (id)       => api.patch(`/admin/users/${id}/ban`),
}

export default api
