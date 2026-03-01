import { authService } from './auth.service'
import type { MenuItem, MenuCategory, UpdateMenuItemInput } from '../types/menu'

export const menuService = {
  async fetchItems(restaurantId: string, includeInactive = true): Promise<MenuItem[]> {
    const api = authService.getApiClient()
    const query = includeInactive ? '?includeInactive=true' : ''
    const res = await api.get<{ items: MenuItem[] }>(
      `/api/restaurants/${restaurantId}/menu/items${query}`
    )
    return res.items
  },

  async fetchCategories(restaurantId: string, includeInactive = true): Promise<MenuCategory[]> {
    const api = authService.getApiClient()
    const query = includeInactive ? '?includeInactive=true' : ''
    const res = await api.get<{ categories: MenuCategory[] }>(
      `/api/restaurants/${restaurantId}/menu/categories${query}`
    )
    return res.categories
  },

  async updateItem(
    restaurantId: string,
    itemId: string,
    data: UpdateMenuItemInput
  ): Promise<MenuItem> {
    const api = authService.getApiClient()
    const res = await api.patch<{ item: MenuItem }>(
      `/api/restaurants/${restaurantId}/menu/items/${itemId}`,
      data
    )
    return res.item
  },

  async toggleStock(
    restaurantId: string,
    itemId: string,
    isOutOfStock: boolean,
    reason?: string | null
  ): Promise<MenuItem> {
    const api = authService.getApiClient()
    const res = await api.patch<{ item: MenuItem }>(
      `/api/restaurants/${restaurantId}/menu/items/${itemId}/stock`,
      { isOutOfStock, reason: reason ?? null }
    )
    return res.item
  },

  async toggleActive(
    restaurantId: string,
    itemId: string,
    isActive: boolean
  ): Promise<MenuItem> {
    return this.updateItem(restaurantId, itemId, { isActive })
  },
}
