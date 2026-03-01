import { authService } from './auth.service'
import type { Order, TrackingState } from '../types/order'

interface OrdersResponse {
  success: boolean
  orders: Order[]
  total: number
  page: number
  sumCents?: number
}

interface OrderResponse {
  success: boolean
  data: Order
}

export const ordersService = {
  async fetchOrders(params: {
    page?: number
    pageSize?: number
    status?: string
    deliveryMethod?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<OrdersResponse> {
    const api = authService.getApiClient()
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set('page', String(params.page))
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params.status) searchParams.set('status', params.status)
    if (params.deliveryMethod) searchParams.set('deliveryMethod', params.deliveryMethod)
    if (params.search) searchParams.set('search', params.search)
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom)
    if (params.dateTo) searchParams.set('dateTo', params.dateTo)

    const qs = searchParams.toString()
    return api.get<OrdersResponse>(`/api/orders${qs ? `?${qs}` : ''}`)
  },

  async fetchOrder(orderId: string): Promise<Order> {
    const api = authService.getApiClient()
    const res = await api.get<OrderResponse>(`/api/orders/${orderId}`)
    return res.data
  },

  async updateTrackingState(orderId: string, state: TrackingState): Promise<void> {
    const api = authService.getApiClient()
    await api.patch(`/api/orders/${orderId}/state`, { state })
  },

  async fetchKanban(): Promise<Order[]> {
    const api = authService.getApiClient()
    const res = await api.get<{
      success: boolean
      orders: Record<string, Order[]>
      stats: Record<string, number>
    }>('/api/orders/kanban')
    // API returns orders grouped by state — flatten into a single array
    return Object.values(res.orders).flat()
  },

  async resendEmail(orderId: string): Promise<void> {
    const api = authService.getApiClient()
    await api.post(`/api/orders/${orderId}/send-email`)
  },
}
