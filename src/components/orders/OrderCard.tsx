import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '../ui/Card'
import { TrackingStateBadge } from './OrderStatusBadge'
import { useTheme } from '../../stores/theme-store'
import { spacing, fontSize } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'
import type { Order } from '../../types/order'
import { DELIVERY_METHOD_LABELS } from '../../types/order'

interface OrderCardProps {
  order: Order
  onPress: () => void
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const { colors } = useTheme()

  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ') || 'Gast'

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={[styles.orderNumber, { color: colors.foreground }]}>
              #{order.orderNumber ?? '—'}
            </Text>
            <Text style={[styles.customer, { color: colors.muted }]}>{customerName}</Text>
          </View>
          <View style={styles.right}>
            <Text style={[styles.total, { color: colors.foreground }]}>
              {centsToEuros(order.pricingCents.totalCents)}
            </Text>
            {order.currentState && <TrackingStateBadge state={order.currentState} />}
          </View>
        </View>

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
              {order.items.length} {order.items.length === 1 ? 'Artikel' : 'Artikel'}
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
  orderNumber: { fontSize: fontSize.lg, fontWeight: '700' },
  customer: { fontSize: fontSize.sm, marginTop: 2 },
  total: { fontSize: fontSize.base, fontWeight: '600' },
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
