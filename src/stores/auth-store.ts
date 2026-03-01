import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { authService } from '../services/auth.service'
import type { Restaurant } from '../types/restaurant'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  availableRestaurants: Restaurant[]
  currentRestaurantId: string | null

  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  restoreSession: () => Promise<void>
  fetchRestaurants: () => Promise<void>
  selectRestaurant: (id: string) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  availableRestaurants: [],
  currentRestaurantId: null,

  signIn: async (email, password) => {
    const { session, user } = await authService.signIn(email, password)
    set({ user: user ?? null, session })
  },

  signOut: async () => {
    await authService.signOut()
    set({
      user: null,
      session: null,
      availableRestaurants: [],
      currentRestaurantId: null,
    })
  },

  restoreSession: async () => {
    set({ isLoading: true })
    try {
      const session = await authService.getSession()
      if (session) {
        set({ user: session.user, session })
      }
    } catch {
      // No valid session
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRestaurants: async () => {
    try {
      const restaurants = await authService.fetchUserRestaurants()
      set({ availableRestaurants: restaurants })
      // Auto-select first if none selected
      if (!get().currentRestaurantId && restaurants.length > 0) {
        const api = authService.getApiClient()
        api.setRestaurantId(restaurants[0].id)
        set({ currentRestaurantId: restaurants[0].id })
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err)
    }
  },

  selectRestaurant: (id) => {
    const api = authService.getApiClient()
    api.setRestaurantId(id)
    set({ currentRestaurantId: id })
  },
}))
