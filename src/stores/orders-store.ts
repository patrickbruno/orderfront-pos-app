import { create } from 'zustand'
import { ordersService } from '../services/orders.service'
import type { Order, TrackingState, TseTransaction } from '../types/order'

interface OrderFilters {
  status?: string
  deliveryMethod?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  confirmedOnly?: boolean
}

interface OrdersState {
  orders: Order[]
  selectedOrder: Order | null
  selectedTse: TseTransaction | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  page: number
  hasMore: boolean
  filters: OrderFilters

  fetchOrders: (reset?: boolean) => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchOrder: (id: string) => Promise<void>
  updateTrackingState: (orderId: string, state: TrackingState) => Promise<void>
  setFilters: (filters: OrderFilters) => void
  refresh: () => Promise<void>
}

const PAGE_SIZE = 20

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  selectedTse: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
  filters: { confirmedOnly: true },

  fetchOrders: async (reset = false) => {
    const { filters } = get()
    const page = reset ? 1 : get().page
    set(reset ? { isLoading: true, error: null } : { error: null })

    try {
      const res = await ordersService.fetchOrders({ ...filters, page, pageSize: PAGE_SIZE })
      const fetched = res.orders ?? []
      set({
        orders: reset ? fetched : [...get().orders, ...fetched],
        page,
        hasMore: fetched.length === PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false, isRefreshing: false })
    }
  },

  fetchNextPage: async () => {
    if (!get().hasMore || get().isLoading) return
    set({ page: get().page + 1 })
    await get().fetchOrders()
  },

  fetchOrder: async (id) => {
    try {
      const { order, tse } = await ordersService.fetchOrder(id)
      set({ selectedOrder: order, selectedTse: tse ?? null })
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  updateTrackingState: async (orderId, state) => {
    await ordersService.updateTrackingState(orderId, state)
    // Update local state
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, currentState: state } : o
      ),
      selectedOrder:
        get().selectedOrder?.id === orderId
          ? { ...get().selectedOrder!, currentState: state }
          : get().selectedOrder,
    })
  },

  setFilters: (filters) => {
    set({ filters, page: 1, hasMore: true })
    get().fetchOrders(true)
  },

  refresh: async () => {
    set({ isRefreshing: true })
    await get().fetchOrders(true)
  },
}))
