import { create } from 'zustand'
import { analyticsService } from '../services/analytics.service'
import type { KPIData, TimeseriesPoint, DateRange } from '../types/analytics'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function weekAgoStr() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

interface AnalyticsState {
  kpis: KPIData | null
  revenueSeries: TimeseriesPoint[]
  ordersSeries: TimeseriesPoint[]
  trendingItems: { name: string; quantity: number; revenue: number }[]
  dateRange: DateRange
  isLoading: boolean
  error: string | null

  setDateRange: (range: DateRange) => void
  fetchAll: () => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  kpis: null,
  revenueSeries: [],
  ordersSeries: [],
  trendingItems: [],
  dateRange: { from: weekAgoStr(), to: todayStr(), preset: 'week' },
  isLoading: false,
  error: null,

  setDateRange: (range) => {
    set({ dateRange: range })
    get().fetchAll()
  },

  fetchAll: async () => {
    const { dateRange } = get()
    set({ isLoading: true, error: null })
    try {
      const [kpis, timeseries, trends] = await Promise.all([
        analyticsService.fetchKPIs(dateRange.from, dateRange.to),
        analyticsService.fetchTimeseries(dateRange.from, dateRange.to),
        analyticsService.fetchTrends(dateRange.from, dateRange.to),
      ])
      set({
        kpis,
        revenueSeries: timeseries.revenue,
        ordersSeries: timeseries.orders,
        trendingItems: trends.trendingItems ?? [],
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },
}))
