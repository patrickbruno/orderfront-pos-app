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

function formatDayCode(order: Order): string | null {
  if (!order.dayCounter) return null
  const prefix = order.dayCounterPrefix ?? (order.delivery.method === 'delivery' ? 'L' : 'A')
  return `${prefix}-${order.dayCounter.toString().padStart(3, '0')}`
}

function getPreferredTimeInfo(dt?: string): { label: string; urgent: boolean } | null {
  if (!dt) return null
  const target = new Date(dt)
  const now = new Date()
  const diffMin = Math.round((target.getTime() - now.getTime()) / 60000)

  const timeStr = target.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  if (diffMin < 0) {
    return { label: `${timeStr} (überfällig)`, urgent: true }
  }
  if (diffMin <= 15) {
    return { label: `${timeStr} (${diffMin} Min.)`, urgent: true }
  }
  return { label: timeStr, urgent: false }
}

export function TrackingCard({ order, onAdvance, onPress }: TrackingCardProps) {
  const { colors } = useTheme()
  const currentIdx = TRACKING_STATES.indexOf(order.currentState ?? 'open')
  const nextState = currentIdx < TRACKING_STATES.length - 1 ? TRACKING_STATES[currentIdx + 1] : null
  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ') || 'Gast'

  const dayCode = formatDayCode(order)
  const timeInfo = getPreferredTimeInfo(order.timing.preferredDeliveryDateTime)

  async function handleAdvance() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onAdvance()
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card} padding="sm">
        {/* Header: day code + total */}
        <View style={styles.header}>
          <View style={styles.codeRow}>
            {dayCode ? (
              <View style={[styles.dayCodePill, { backgroundColor: colors.primary }]}>
                <Text style={[styles.dayCodeText, { color: colors.primaryForeground }]}>
                  {dayCode}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.orderNum, { color: colors.muted }]}>
              #{order.orderNumber ?? '—'}
            </Text>
          </View>
          <Text style={[styles.total, { color: colors.foreground }]}>
            {centsToEuros(order.pricingCents.totalCents)}
          </Text>
        </View>

        {/* Customer + delivery method */}
        <Text style={[styles.customer, { color: colors.foreground }]}>{customerName}</Text>
        <Text style={[styles.metaText, { color: colors.muted }]}>
          {DELIVERY_METHOD_LABELS[order.delivery.method]} · {order.timing.orderTime}
        </Text>

        {/* Preferred time */}
        {timeInfo && (
          <View style={[styles.timeRow, { backgroundColor: timeInfo.urgent ? colors.destructive + '18' : colors.amber + '18' }]}>
            <Ionicons name="alarm-outline" size={13} color={timeInfo.urgent ? colors.destructive : colors.amber} />
            <Text style={[styles.timeText, { color: timeInfo.urgent ? colors.destructive : colors.amber }]}>
              {timeInfo.label}
            </Text>
          </View>
        )}

        {/* Line items preview */}
        {order.items.length > 0 && (
          <View style={[styles.itemsPreview, { borderTopColor: colors.border }]}>
            {order.items.slice(0, 4).map((item, i) => (
              <Text
                key={item.id ?? i}
                style={[styles.itemText, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.quantity}x {item.name}
              </Text>
            ))}
            {order.items.length > 4 && (
              <Text style={[styles.itemText, { color: colors.muted }]}>
                +{order.items.length - 4} weitere
              </Text>
            )}
          </View>
        )}

        {/* Advance button */}
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
  card: { marginBottom: spacing.sm, width: 230 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dayCodePill: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  dayCodeText: { fontSize: fontSize.sm, fontWeight: '800' },
  orderNum: { fontSize: fontSize.sm - 1 },
  total: { fontSize: fontSize.sm, fontWeight: '600' },
  customer: { fontSize: fontSize.sm, fontWeight: '500', marginTop: 3 },
  metaText: { fontSize: fontSize.sm - 1, marginTop: 1 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  timeText: { fontSize: fontSize.sm - 1, fontWeight: '600' },
  itemsPreview: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  itemText: { fontSize: fontSize.sm - 1, marginBottom: 1 },
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
