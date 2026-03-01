import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '../../stores/theme-store'
import { useOrdersStore } from '../../stores/orders-store'
import { Header } from '../../components/ui/Header'
import { EmptyState } from '../../components/ui/EmptyState'
import { OrderCard } from '../../components/orders/OrderCard'
import { Badge } from '../../components/ui/Badge'
import { spacing, radii, fontSize } from '../../theme/tokens'
import type { OrdersStackParamList } from '../../navigation/OrdersStack'

type Nav = NativeStackNavigationProp<OrdersStackParamList, 'OrderList'>

export function OrderListScreen() {
  const nav = useNavigation<Nav>()
  const { colors } = useTheme()
  const {
    orders,
    isLoading,
    isRefreshing,
    hasMore,
    fetchOrders,
    fetchNextPage,
    refresh,
    setFilters,
    filters,
  } = useOrdersStore()

  useEffect(() => {
    fetchOrders(true)
  }, [])

  const confirmedOnly = filters.confirmedOnly !== false

  const handleSearch = useCallback(
    (text: string) => {
      setFilters({ ...filters, search: text || undefined })
    },
    [filters],
  )

  const toggleConfirmedOnly = useCallback(() => {
    setFilters({ ...filters, confirmedOnly: !confirmedOnly })
  }, [filters, confirmedOnly])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Bestellungen" />
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder="Suche nach Name, Nummer..."
          placeholderTextColor={colors.mutedLight}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={toggleConfirmedOnly}>
            <Badge
              label={confirmedOnly ? 'Nur bestätigt' : 'Alle'}
              variant={confirmedOnly ? 'success' : 'muted'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => nav.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (
            <EmptyState
              icon="receipt-outline"
              title="Keine Bestellungen"
              message="Es sind noch keine Bestellungen vorhanden."
            />
          )
        }
        ListFooterComponent={
          hasMore && orders.length > 0 ? (
            <ActivityIndicator style={styles.footer} color={colors.muted} />
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.xs },
  searchInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.base,
  },
  list: { padding: spacing.md, paddingTop: 0 },
  loader: { marginTop: spacing.xxl },
  footer: { paddingVertical: spacing.md },
})
