import { authService } from './auth.service'
import type { ChannelConfig, UpdateChannelConfigRequest } from '../types/channel'

export const channelsService = {
  async fetchChannels(restaurantId: string): Promise<ChannelConfig[]> {
    const api = authService.getApiClient()
    const res = await api.get<{ success: boolean; data: ChannelConfig[] }>(
      `/api/restaurants/${restaurantId}/settings/channels`
    )
    return res.data
  },

  async fetchChannel(
    restaurantId: string,
    source: string,
    fulfillment: string
  ): Promise<ChannelConfig> {
    const api = authService.getApiClient()
    const res = await api.get<{ success: boolean; data: ChannelConfig }>(
      `/api/restaurants/${restaurantId}/settings/channels/${source}/${fulfillment}`
    )
    return res.data
  },

  async updateChannel(
    restaurantId: string,
    source: string,
    fulfillment: string,
    data: UpdateChannelConfigRequest
  ): Promise<void> {
    const api = authService.getApiClient()
    await api.patch(
      `/api/restaurants/${restaurantId}/settings/channels/${source}/${fulfillment}`,
      data
    )
  },
}
