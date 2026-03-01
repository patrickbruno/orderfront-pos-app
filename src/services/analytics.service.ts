import { authService } from './auth.service'
import type { AnalyticsData, KPIData, TimeseriesPoint } from '../types/analytics'

export const analyticsService = {
  async fetchKPIs(dateFrom: string, dateTo: string): Promise<KPIData> {
    const api = authService.getApiClient()
    const res = await api.get<{ success: boolean; data: KPIData }>(
      `/api/analytics?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
    return res.data
  },

  async fetchTimeseries(dateFrom: string, dateTo: string): Promise<{
    revenue: TimeseriesPoint[]
    orders: TimeseriesPoint[]
  }> {
    const api = authService.getApiClient()
    const res = await api.get<{ success: boolean; data: { revenue: TimeseriesPoint[]; orders: TimeseriesPoint[] } }>(
      `/api/analytics/timeseries?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
    return res.data
  },

  async fetchTrends(dateFrom: string, dateTo: string) {
    const api = authService.getApiClient()
    const res = await api.get<{ success: boolean; data: any }>(
      `/api/analytics/trends?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
    return res.data
  },

  async fetchItemAnalytics(dateFrom: string, dateTo: string) {
    const api = authService.getApiClient()
    const res = await api.get<{ success: boolean; data: any }>(
      `/api/analytics/items?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
    return res.data
  },
}
