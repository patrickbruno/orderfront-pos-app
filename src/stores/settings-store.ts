import { create } from 'zustand'
import { settingsService } from '../services/settings.service'
import { channelsService } from '../services/channels.service'
import type { ChannelConfig, UpdateChannelConfigRequest } from '../types/channel'

interface SettingsState {
  restaurantData: any | null
  settings: any | null
  hours: any | null
  channelConfigs: ChannelConfig[]
  isLoading: boolean
  error: string | null

  fetchSettings: (restaurantId: string) => Promise<void>
  fetchHours: (restaurantId: string) => Promise<void>
  fetchChannels: (restaurantId: string) => Promise<void>
  updateChannel: (
    restaurantId: string,
    source: string,
    fulfillment: string,
    data: UpdateChannelConfigRequest
  ) => Promise<void>
  updateCore: (restaurantId: string, data: any) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  restaurantData: null,
  settings: null,
  hours: null,
  channelConfigs: [],
  isLoading: false,
  error: null,

  fetchSettings: async (restaurantId) => {
    set({ isLoading: true, error: null })
    try {
      const [settingsRes, restaurantRes] = await Promise.all([
        settingsService.fetchRestaurantSettings(restaurantId),
        settingsService.fetchRestaurant(restaurantId),
      ])
      set({
        settings: settingsRes.data,
        restaurantData: restaurantRes.data,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchHours: async (restaurantId) => {
    set({ isLoading: true })
    try {
      const res = await settingsService.fetchHours(restaurantId)
      set({ hours: res.data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchChannels: async (restaurantId) => {
    set({ isLoading: true })
    try {
      const configs = await channelsService.fetchChannels(restaurantId)
      set({ channelConfigs: configs, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  updateChannel: async (restaurantId, source, fulfillment, data) => {
    await channelsService.updateChannel(restaurantId, source, fulfillment, data)
    // Update local state optimistically
    const configs = get().channelConfigs.map((ch) =>
      ch.orderSource === source && ch.fulfillmentCode === fulfillment
        ? { ...ch, ...data }
        : ch
    )
    set({ channelConfigs: configs as ChannelConfig[] })
  },

  updateCore: async (restaurantId, data) => {
    await settingsService.updateRestaurantCore(restaurantId, data)
  },
}))
