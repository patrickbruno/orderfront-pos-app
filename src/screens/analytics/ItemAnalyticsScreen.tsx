import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../stores/theme-store'
import { useAnalyticsStore } from '../../stores/analytics-store'
import { analyticsService } from '../../services/analytics.service'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'

interface ItemData {
  itemName: string
  menuItemId: string | null
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

export function ItemAnalyticsScreen() {
  const { colors } = useTheme()
  const nav = useNavigation()
  const { dateRange } = useAnalyticsStore()
  const [items, setItems] = useState<ItemData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [dateRange])

  async function loadItems() {
    setLoading(true)
    try {
      const data = await analyticsService.fetchItemAnalytics(dateRange.from, dateRange.to)
      setItems(data.items ?? data ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Artikelanalyse" showBack onBack={() => nav.goBack()} />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => item.menuItemId ?? String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={[styles.rank, { color: colors.muted }]}>{index + 1}</Text>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{item.itemName}</Text>
                  <Text style={[styles.meta, { color: colors.muted }]}>
                    {item.totalQuantity}× bestellt · {item.orderCount} Bestellungen
                  </Text>
                </View>
                <Text style={[styles.revenue, { color: colors.foreground }]}>
                  {centsToEuros(item.totalRevenue)}
                </Text>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  list: { padding: spacing.md },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rank: { fontSize: fontSize.lg, fontWeight: '700', width: 28, textAlign: 'center' },
  info: { flex: 1 },
  name: { fontSize: fontSize.base, fontWeight: '600' },
  meta: { fontSize: fontSize.sm, marginTop: 2 },
  revenue: { fontSize: fontSize.base, fontWeight: '600' },
})
