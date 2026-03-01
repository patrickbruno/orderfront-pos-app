import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '../ui/Card'
import { TrackingStateBadge } from './OrderStatusBadge'
import { useTheme } from '../../stores/theme-store'
import { spacing, fontSize, radii } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'
import type { Order } from '../../types/order'
import { DELIVERY_METHOD_LABELS } from '../../types/order'

interface OrderCardProps {
  order: Order
  onPress: () => void
}

function formatDayCode(order: Order): string | null {
  if (!order.dayCounter) return null
  const prefix = order.dayCounterPrefix ?? (order.delivery.method === 'delivery' ? 'L' : 'A')
  return `${prefix}-${order.dayCounter.toString().padStart(3, '0')}`
}

function formatPreferredTime(dt?: string): string | null {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const { colors } = useTheme()

  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ') || 'Gast'

  const dayCode = formatDayCode(order)
  const preferredTime = formatPreferredTime(order.timing.preferredDeliveryDateTime)

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={styles.codeRow}>
              {dayCode ? (
                <View style={[styles.dayCodePill, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.dayCodeText, { color: colors.primaryForeground }]}>
                    {dayCode}
                  </Text>
                </View>
              ) : null}
              <Text style={[styles.orderNumber, { color: colors.muted }]}>
                #{order.orderNumber ?? '—'}
              </Text>
            </View>
            <Text style={[styles.customer, { color: colors.foreground }]}>{customerName}</Text>
          </View>
          <View style={styles.right}>
            <Text style={[styles.total, { color: colors.foreground }]}>
              {centsToEuros(order.pricingCents.totalCents)}
            </Text>
            {order.currentState && <TrackingStateBadge state={order.currentState} />}
          </View>
        </View>

        {preferredTime && (
          <View style={[styles.preferredRow, { backgroundColor: colors.amber + '18' }]}>
            <Ionicons name="alarm-outline" size={14} color={colors.amber} />
            <Text style={[styles.preferredText, { color: colors.amber }]}>
              Gewünscht: {preferredTime}
            </Text>
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.footerItem}>
            <Ionicons name="bicycle-outline" size={14} color={colors.muted} />
            <Text style={[styles.footerText, { color: colors.muted }]}>
              {DELIVERY_METHOD_LABELS[order.delivery.method]}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="cart-outline" size={14} color={colors.muted} />
            <Text style={[styles.footerText, { color: colors.muted }]}>
              {order.items.length} Artikel
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={[styles.footerText, { color: colors.muted }]}>
              {order.timing.orderTime}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayCodePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  dayCodeText: { fontSize: fontSize.base, fontWeight: '800' },
  orderNumber: { fontSize: fontSize.sm },
  customer: { fontSize: fontSize.sm, marginTop: 4 },
  total: { fontSize: fontSize.base, fontWeight: '600' },
  preferredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  preferredText: { fontSize: fontSize.sm, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: fontSize.sm },
})
