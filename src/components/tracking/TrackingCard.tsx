import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../stores/theme-store'
import { Card } from '../ui/Card'
import { spacing, fontSize, radii } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'
import { DELIVERY_METHOD_LABELS, TRACKING_STATES, TRACKING_STATE_LABELS } from '../../types/order'
import type { Order, TrackingState } from '../../types/order'

interface TrackingCardProps {
  order: Order
  onAdvance: () => void
  onPress: () => void
}

export function TrackingCard({ order, onAdvance, onPress }: TrackingCardProps) {
  const { colors } = useTheme()
  const currentIdx = TRACKING_STATES.indexOf(order.currentState ?? 'open')
  const nextState = currentIdx < TRACKING_STATES.length - 1 ? TRACKING_STATES[currentIdx + 1] : null
  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ') || 'Gast'

  async function handleAdvance() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onAdvance()
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card} padding="sm">
        <View style={styles.header}>
          <Text style={[styles.orderNum, { color: colors.foreground }]}>
            #{order.orderNumber ?? '—'}
          </Text>
          <Text style={[styles.total, { color: colors.foreground }]}>
            {centsToEuros(order.pricingCents.totalCents)}
          </Text>
        </View>
        <Text style={[styles.customer, { color: colors.muted }]}>{customerName}</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {DELIVERY_METHOD_LABELS[order.delivery.method]}
          </Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {order.timing.orderTime}
          </Text>
        </View>
        {nextState && (
          <TouchableOpacity
            onPress={handleAdvance}
            style={[styles.advanceBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-forward" size={14} color={colors.primaryForeground} />
            <Text style={[styles.advanceTxt, { color: colors.primaryForeground }]}>
              {TRACKING_STATE_LABELS[nextState]}
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm, width: 220 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: fontSize.base, fontWeight: '700' },
  total: { fontSize: fontSize.sm, fontWeight: '600' },
  customer: { fontSize: fontSize.sm, marginTop: 2 },
  meta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  metaText: { fontSize: fontSize.sm - 1 },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
  },
  advanceTxt: { fontSize: fontSize.sm, fontWeight: '600' },
})
