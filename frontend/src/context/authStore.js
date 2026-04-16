import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '../services/firebase'
import { authAPI } from '../services/api'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      dbUser:      null,
      loading:     true,
      initialized: false,

      setUser: (user) => set({ user }),
      setDbUser: (dbUser) => set({ dbUser }),

      // Sync Firebase user with our MongoDB backend
      syncWithBackend: async (firebaseUser) => {
        try {
          const { data } = await authAPI.syncUser({
            uid:         firebaseUser.uid,
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL:    firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
          })
          set({ dbUser: data.user })
          return data.user
        } catch (err) {
          console.error('Backend sync failed:', err)
          return null
        }
      },

      // Called once on app mount
      initAuth: () => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            set({ user: firebaseUser, loading: true })
            await get().syncWithBackend(firebaseUser)
          } else {
            set({ user: null, dbUser: null })
          }
          set({ loading: false, initialized: true })
        })
        return unsub
      },

      logout: async () => {
        await signOut(auth)
        set({ user: null, dbUser: null })
      },

      // Helpers
      isCustomer: () => get().dbUser?.role === 'customer',
      isCaterer:  () => get().dbUser?.role === 'caterer',
      isAdmin:    () => get().dbUser?.role === 'admin',
      isVerified: () => get().dbUser?.catererProfile?.verificationStatus === 'approved',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ dbUser: state.dbUser }),
    },
  ),
)

export default useAuthStore
