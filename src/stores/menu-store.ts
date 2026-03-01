import { create } from 'zustand'
import { menuService } from '../services/menu.service'
import type { MenuItem, MenuCategory, UpdateMenuItemInput } from '../types/menu'

interface MenuState {
  items: MenuItem[]
  categories: MenuCategory[]
  isLoading: boolean
  error: string | null

  fetchMenu: (restaurantId: string) => Promise<void>
  updateItem: (restaurantId: string, itemId: string, data: UpdateMenuItemInput) => Promise<void>
  toggleStock: (restaurantId: string, itemId: string, isOutOfStock: boolean) => Promise<void>
  toggleActive: (restaurantId: string, itemId: string, isActive: boolean) => Promise<void>
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchMenu: async (restaurantId) => {
    set({ isLoading: true, error: null })
    try {
      const [items, categories] = await Promise.all([
        menuService.fetchItems(restaurantId),
        menuService.fetchCategories(restaurantId),
      ])
      set({ items, categories, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  updateItem: async (restaurantId, itemId, data) => {
    const updated = await menuService.updateItem(restaurantId, itemId, data)
    set({
      items: get().items.map((item) => (item.id === itemId ? updated : item)),
    })
  },

  toggleStock: async (restaurantId, itemId, isOutOfStock) => {
    // Optimistic update
    set({
      items: get().items.map((item) =>
        item.id === itemId ? { ...item, isOutOfStock } : item
      ),
    })
    try {
      const updated = await menuService.toggleStock(restaurantId, itemId, isOutOfStock)
      set({
        items: get().items.map((item) => (item.id === itemId ? updated : item)),
      })
    } catch (err: any) {
      // Revert on failure
      set({
        items: get().items.map((item) =>
          item.id === itemId ? { ...item, isOutOfStock: !isOutOfStock } : item
        ),
      })
      throw err
    }
  },

  toggleActive: async (restaurantId, itemId, isActive) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId ? { ...item, isActive } : item
      ),
    })
    try {
      const updated = await menuService.toggleActive(restaurantId, itemId, isActive)
      set({
        items: get().items.map((item) => (item.id === itemId ? updated : item)),
      })
    } catch (err: any) {
      set({
        items: get().items.map((item) =>
          item.id === itemId ? { ...item, isActive: !isActive } : item
        ),
      })
      throw err
    }
  },
}))
