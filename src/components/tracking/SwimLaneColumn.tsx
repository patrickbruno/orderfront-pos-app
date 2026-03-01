import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { Badge } from '../ui/Badge'
import { TrackingCard } from './TrackingCard'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { Order, TrackingState } from '../../types/order'
import { TRACKING_STATE_LABELS } from '../../types/order'

interface SwimLaneColumnProps {
  state: TrackingState
  orders: Order[]
  onAdvanceOrder: (orderId: string, currentState: TrackingState) => void
  onPressOrder: (orderId: string) => void
}

export function SwimLaneColumn({ state, orders, onAdvanceOrder, onPressOrder }: SwimLaneColumnProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.column, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {TRACKING_STATE_LABELS[state]}
        </Text>
        <Badge label={String(orders.length)} variant={orders.length > 0 ? 'default' : 'muted'} />
      </View>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => (
          <TrackingCard
            key={order.id}
            order={order}
            onAdvance={() => onAdvanceOrder(order.id, state)}
            onPress={() => onPressOrder(order.id)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    width: 240,
    marginRight: spacing.sm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  title: { fontSize: fontSize.base, fontWeight: '700' },
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
})
