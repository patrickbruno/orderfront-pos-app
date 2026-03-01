export interface KPIData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalTips: number
  avgOrderValue: number
}

export interface TimeseriesPoint {
  date: string
  value: number
}

export interface AnalyticsData {
  kpis: KPIData
  revenueSeries: TimeseriesPoint[]
  ordersSeries: TimeseriesPoint[]
  deliveryBreakdown: { method: string; count: number }[]
  paymentBreakdown: { provider: string; count: number }[]
  trendingItems: { name: string; quantity: number; revenue: number }[]
}

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom'

export interface DateRange {
  from: string
  to: string
  preset: DateRangePreset
}
