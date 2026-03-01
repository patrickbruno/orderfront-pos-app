import { supabase } from './supabase'
import { ApiClient } from './api-client'
import { API_BASE_URL } from '../config/constants'
import type { Restaurant } from '../types/restaurant'

const api = new ApiClient(API_BASE_URL)

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session) {
      api.setAccessToken(data.session.access_token)
    }
    return data
  },

  async signOut() {
    api.clearAccessToken()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (data.session) {
      api.setAccessToken(data.session.access_token)
    }
    return data.session
  },

  async fetchUserRestaurants(): Promise<Restaurant[]> {
    const res = await api.get<{ success: boolean; data: Restaurant[] }>('/api/profile/restaurants')
    return res.data
  },

  getApiClient() {
    return api
  },
}
