import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { useTheme } from '../../stores/theme-store'
import { useOrdersStore } from '../../stores/orders-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { TrackingStateBadge, PaymentStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderActions } from '../../components/orders/OrderActions'
import { spacing, fontSize } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'
import { DELIVERY_METHOD_LABELS } from '../../types/order'
import { ordersService } from '../../services/orders.service'
import type { OrdersStackParamList } from '../../navigation/OrdersStack'

type RouteParams = RouteProp<OrdersStackParamList, 'OrderDetail'>

export function OrderDetailScreen() {
  const { colors } = useTheme()
  const route = useRoute<RouteParams>()
  const nav = useNavigation()
  const { selectedOrder: order, fetchOrder } = useOrdersStore()

  useEffect(() => {
    fetchOrder(route.params.orderId)
  }, [route.params.orderId])

  if (!order) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Header title="Bestellung" showBack onBack={() => nav.goBack()} />
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    )
  }

  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ') || 'Gast'

  async function handleResendEmail() {
    try {
      await ordersService.resendEmail(order!.id)
      Alert.alert('Erfolg', 'E-Mail wurde erneut gesendet.')
    } catch (err: any) {
      Alert.alert('Fehler', err.message)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={`#${order.orderNumber ?? '—'}`}
        subtitle={`${order.timing.orderDate} · ${order.timing.orderTime}`}
        showBack
        onBack={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <Card>
          <View style={styles.statusRow}>
            {order.currentState && <TrackingStateBadge state={order.currentState} />}
            {order.payment && <PaymentStatusBadge status={order.payment.status} />}
          </View>
          {order.currentState && (
            <OrderActions orderId={order.id} currentState={order.currentState} />
          )}
        </Card>

        {/* Customer */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kunde</Text>
          <Text style={[styles.text, { color: colors.foreground }]}>{customerName}</Text>
          {order.customer.email && (
            <Text style={[styles.textMuted, { color: colors.muted }]}>{order.customer.email}</Text>
          )}
          {order.customer.phone && (
            <Text style={[styles.textMuted, { color: colors.muted }]}>{order.customer.phone}</Text>
          )}
        </Card>

        {/* Delivery */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {DELIVERY_METHOD_LABELS[order.delivery.method]}
          </Text>
          {order.delivery.address && (
            <Text style={[styles.text, { color: colors.foreground }]}>
              {order.delivery.address.street} {order.delivery.address.houseNumber}
              {'\n'}{order.delivery.address.postalCode} {order.delivery.address.city}
            </Text>
          )}
          {order.delivery.instructions && (
            <Text style={[styles.textMuted, { color: colors.muted }]}>
              {order.delivery.instructions}
            </Text>
          )}
        </Card>

        {/* Items */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Artikel</Text>
          {order.items.map((item, i) => (
            <View key={item.id ?? i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemQty, { color: colors.muted }]}>{item.quantity}×</Text>
                <View>
                  <Text style={[styles.text, { color: colors.foreground }]}>{item.name}</Text>
                  {item.extras.length > 0 && (
                    <Text style={[styles.textMuted, { color: colors.muted }]}>
                      {item.extras.map((e) => e.name).join(', ')}
                    </Text>
                  )}
                  {item.comment && (
                    <Text style={[styles.textMuted, { color: colors.amber }]}>
                      {item.comment}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.text, { color: colors.foreground }]}>
                {centsToEuros(item.itemTotalCents)}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.muted }]}>Zwischensumme</Text>
            <Text style={[styles.text, { color: colors.foreground }]}>
              {centsToEuros(order.pricingCents.subtotalCents)}
            </Text>
          </View>
          {order.pricingCents.deliveryFeeCents > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.muted }]}>Liefergebühr</Text>
              <Text style={[styles.text, { color: colors.foreground }]}>
                {centsToEuros(order.pricingCents.deliveryFeeCents)}
              </Text>
            </View>
          )}
          {order.pricingCents.serviceFeeCents > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.muted }]}>Servicegebühr</Text>
              <Text style={[styles.text, { color: colors.foreground }]}>
                {centsToEuros(order.pricingCents.serviceFeeCents)}
              </Text>
            </View>
          )}
          {order.pricingCents.tipCents > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.muted }]}>Trinkgeld</Text>
              <Text style={[styles.text, { color: colors.foreground }]}>
                {centsToEuros(order.pricingCents.tipCents)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.totalBold, { color: colors.foreground }]}>Gesamt</Text>
            <Text style={[styles.totalBold, { color: colors.foreground }]}>
              {centsToEuros(order.pricingCents.totalCents)}
            </Text>
          </View>
        </Card>

        {/* Comment */}
        {order.orderComment && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kommentar</Text>
            <Text style={[styles.text, { color: colors.foreground }]}>{order.orderComment}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
  text: { fontSize: fontSize.base },
  textMuted: { fontSize: fontSize.sm, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  itemLeft: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  itemQty: { fontSize: fontSize.base, fontWeight: '600', minWidth: 28 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  totalLabel: { fontSize: fontSize.base },
  totalBold: { fontSize: fontSize.base, fontWeight: '700' },
})
