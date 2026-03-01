import React, { useEffect } from 'react'
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '../../stores/theme-store'
import { useAnalyticsStore } from '../../stores/analytics-store'
import { Header } from '../../components/ui/Header'
import { Button } from '../../components/ui/Button'
import { KPICard } from '../../components/analytics/KPICard'
import { DateRangePicker } from '../../components/analytics/DateRangePicker'
import { MiniChart } from '../../components/analytics/MiniChart'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'
import type { DateRangePreset } from '../../types/analytics'
import type { AnalyticsStackParamList } from '../../navigation/AnalyticsStack'

type Nav = NativeStackNavigationProp<AnalyticsStackParamList, 'Dashboard'>

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getPresetRange(preset: DateRangePreset): { from: string; to: string } {
  const to = todayStr()
  const d = new Date()
  if (preset === 'today') return { from: to, to }
  if (preset === 'week') {
    d.setDate(d.getDate() - 7)
    return { from: d.toISOString().split('T')[0], to }
  }
  // month
  d.setMonth(d.getMonth() - 1)
  return { from: d.toISOString().split('T')[0], to }
}

export function DashboardScreen() {
  const nav = useNavigation<Nav>()
  const { colors } = useTheme()
  const {
    kpis,
    revenueSeries,
    ordersSeries,
    trendingItems,
    dateRange,
    isLoading,
    setDateRange,
    fetchAll,
  } = useAnalyticsStore()

  useEffect(() => {
    fetchAll()
  }, [])

  function handlePreset(preset: DateRangePreset) {
    const range = getPresetRange(preset)
    setDateRange({ ...range, preset })
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Statistik"
        rightAction={
          <Button title="Artikel" variant="ghost" size="sm" onPress={() => nav.navigate('ItemAnalytics')} />
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <DateRangePicker activePreset={dateRange.preset} onSelect={handlePreset} />

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : (
          <>
            {/* KPI Grid */}
            <View style={styles.kpiRow}>
              <KPICard
                title="Umsatz"
                value={kpis ? centsToEuros(kpis.totalRevenue) : '—'}
              />
              <KPICard
                title="Bestellungen"
                value={kpis ? String(kpis.totalOrders) : '—'}
              />
            </View>
            <View style={styles.kpiRow}>
              <KPICard
                title="Kunden"
                value={kpis ? String(kpis.totalCustomers) : '—'}
              />
              <KPICard
                title="Trinkgeld"
                value={kpis ? centsToEuros(kpis.totalTips) : '—'}
              />
            </View>

            {/* Charts */}
            <MiniChart title="Umsatz" data={revenueSeries} color={colors.success} />
            <MiniChart title="Bestellungen" data={ordersSeries} />

            {/* Trending items */}
            {trendingItems.length > 0 && (
              <Card>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Beliebteste Artikel
                </Text>
                {trendingItems.slice(0, 5).map((item, i) => (
                  <View key={i} style={[styles.trendRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <View style={styles.trendLeft}>
                      <Text style={[styles.trendRank, { color: colors.muted }]}>{i + 1}</Text>
                      <Text style={[styles.trendName, { color: colors.foreground }]}>{item.name}</Text>
                    </View>
                    <View style={styles.trendRight}>
                      <Text style={[styles.trendQty, { color: colors.muted }]}>{item.quantity}×</Text>
                      <Text style={[styles.trendRev, { color: colors.foreground }]}>
                        {centsToEuros(item.revenue)}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  loader: { marginTop: spacing.xxl },
  kpiRow: { flexDirection: 'row', gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  trendLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  trendRank: { fontSize: fontSize.sm, fontWeight: '600', width: 20 },
  trendName: { fontSize: fontSize.base },
  trendRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  trendQty: { fontSize: fontSize.sm },
  trendRev: { fontSize: fontSize.sm, fontWeight: '600' },
})
