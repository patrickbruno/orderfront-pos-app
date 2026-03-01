import { create } from 'zustand'
import { ordersService } from '../services/orders.service'
import type { Order, TrackingState } from '../types/order'
import { TRACKING_STATES } from '../types/order'

interface TrackingState_ {
  orders: Order[]
  isLoading: boolean
  error: string | null

  fetchKanban: () => Promise<void>
  advanceOrder: (orderId: string, currentState: TrackingState) => Promise<void>
  refresh: () => Promise<void>
}

function getNextState(current: TrackingState): TrackingState | null {
  const idx = TRACKING_STATES.indexOf(current)
  if (idx < 0 || idx >= TRACKING_STATES.length - 1) return null
  return TRACKING_STATES[idx + 1]
}

export const useTrackingStore = create<TrackingState_>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchKanban: async () => {
    set({ isLoading: true, error: null })
    try {
      const orders = await ordersService.fetchKanban()
      set({ orders, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  advanceOrder: async (orderId, currentState) => {
    const nextState = getNextState(currentState)
    if (!nextState) return

    // Optimistic update
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, currentState: nextState } : o
      ),
    })

    try {
      await ordersService.updateTrackingState(orderId, nextState)
    } catch {
      // Revert on failure
      set({
        orders: get().orders.map((o) =>
          o.id === orderId ? { ...o, currentState } : o
        ),
      })
    }
  },

  refresh: async () => {
    await get().fetchKanban()
  },
}))

export { getNextState }
