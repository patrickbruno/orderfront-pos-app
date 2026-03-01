import React, { useEffect, useCallback } from 'react'
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '../../stores/theme-store'
import { useTrackingStore } from '../../stores/tracking-store'
import { Header } from '../../components/ui/Header'
import { EmptyState } from '../../components/ui/EmptyState'
import { SwimLaneColumn } from '../../components/tracking/SwimLaneColumn'
import { spacing } from '../../theme/tokens'
import { TRACKING_STATES } from '../../types/order'
import type { TrackingState } from '../../types/order'

export function TrackingScreen() {
  const { colors } = useTheme()
  const { orders, isLoading, fetchKanban, advanceOrder, refresh } = useTrackingStore()
  const nav = useNavigation<any>()

  useEffect(() => {
    fetchKanban()
  }, [])

  const ordersByState = useCallback(
    (state: TrackingState) => orders.filter((o) => o.currentState === state),
    [orders],
  )

  const handlePressOrder = (orderId: string) => {
    nav.navigate('OrdersTab', {
      screen: 'OrderDetail',
      params: { orderId },
    })
  }

  const isRefreshing = false

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Tracking" />
      {isLoading && orders.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="swap-horizontal-outline"
          title="Keine aktiven Bestellungen"
          message="Neue Bestellungen erscheinen hier automatisch."
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.columns}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
        >
          {TRACKING_STATES.map((state) => (
            <SwimLaneColumn
              key={state}
              state={state}
              orders={ordersByState(state)}
              onAdvanceOrder={advanceOrder}
              onPressOrder={handlePressOrder}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  columns: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
})
