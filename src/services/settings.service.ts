import { authService } from './auth.service'

export const settingsService = {
  async fetchRestaurantSettings(restaurantId: string) {
    const api = authService.getApiClient()
    return api.get<{ success: boolean; data: any }>(`/api/restaurants/${restaurantId}/settings`)
  },

  async updateRestaurantCore(restaurantId: string, data: any) {
    const api = authService.getApiClient()
    return api.patch<{ success: boolean }>(`/api/restaurants/${restaurantId}/settings/core`, data)
  },

  async fetchHours(restaurantId: string) {
    const api = authService.getApiClient()
    return api.get<{ success: boolean; data: any }>(`/api/restaurants/${restaurantId}/settings/hours`)
  },

  async updateHours(restaurantId: string, type: string, data: any) {
    const api = authService.getApiClient()
    return api.put<{ success: boolean }>(`/api/restaurants/${restaurantId}/settings/hours/${type}`, data)
  },

  async fetchChannels(restaurantId: string) {
    const api = authService.getApiClient()
    return api.get<{ success: boolean; data: any }>(`/api/restaurants/${restaurantId}/settings/channels`)
  },

  async updateChannel(restaurantId: string, source: string, fulfillment: string, data: any) {
    const api = authService.getApiClient()
    return api.patch<{ success: boolean }>(
      `/api/restaurants/${restaurantId}/settings/channels/${source}/${fulfillment}`,
      data
    )
  },

  async fetchRestaurant(restaurantId: string) {
    const api = authService.getApiClient()
    return api.get<{ success: boolean; data: any }>(`/api/restaurants/${restaurantId}`)
  },

  async updateRestaurant(restaurantId: string, data: any) {
    const api = authService.getApiClient()
    return api.patch<{ success: boolean }>(`/api/restaurants/${restaurantId}`, data)
  },
}
