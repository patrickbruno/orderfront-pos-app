import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../stores/theme-store'
import { useOrdersStore } from '../../stores/orders-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { TrackingStateBadge, PaymentStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderActions } from '../../components/orders/OrderActions'
import { spacing, fontSize, radii } from '../../theme/tokens'
import { centsToEuros } from '../../utils/cents'
import { DELIVERY_METHOD_LABELS } from '../../types/order'
import { ordersService } from '../../services/orders.service'
import type { OrdersStackParamList } from '../../navigation/OrdersStack'

type RouteParams = RouteProp<OrdersStackParamList, 'OrderDetail'>

function formatUnixTimestamp(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function InfoRow({
  label,
  value,
  onPress,
  linkColor,
  muted,
}: {
  label: string
  value: string
  onPress?: () => void
  linkColor?: string
  muted?: string
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: muted }]}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.infoValue, { color: linkColor }]} numberOfLines={1}>
            {value}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.infoValue, { color: muted }]} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  )
}

const PROVIDER_LABELS: Record<string, string> = {
  stripe: 'Stripe (Online)',
  cash: 'Bar',
  stripe_terminal: 'Kartenzahlung',
}

export function OrderDetailScreen() {
  const { colors } = useTheme()
  const route = useRoute<RouteParams>()
  const nav = useNavigation()
  const { selectedOrder: order, selectedTse: tse, fetchOrder } = useOrdersStore()

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

  function openStripePayment() {
    if (!order?.payment?.stripePaymentIntentId) return
    const url = `https://dashboard.stripe.com/payments/${order.payment.stripePaymentIntentId}`
    Linking.openURL(url)
  }

  function openEReceipt() {
    if (!tse?.ereceipt_url) return
    Linking.openURL(tse.ereceipt_url)
  }

  function openEReceiptPdf() {
    if (!tse?.ereceipt_pdf_url) return
    Linking.openURL(tse.ereceipt_pdf_url)
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={order.dayCounter
          ? `${order.dayCounterPrefix ?? (order.delivery.method === 'delivery' ? 'L' : 'A')}-${order.dayCounter.toString().padStart(3, '0')}`
          : `#${order.orderNumber ?? '—'}`}
        subtitle={`#${order.orderNumber ?? '—'} · ${order.timing.orderDate} · ${order.timing.orderTime}`}
        showBack
        onBack={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <Card>
          <View style={styles.statusRow}>
            {order.currentState && <TrackingStateBadge state={order.currentState} />}
            {order.payment && <PaymentStatusBadge status={order.payment.status} />}
            {order.orderSource && (
              <Badge
                label={order.orderSource === 'kiosk' ? 'Kiosk' : order.orderSource === 'online' ? 'Online' : order.orderSource}
                variant="default"
              />
            )}
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
            <View style={[styles.instructionBox, { backgroundColor: colors.amber + '18' }]}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.amber} />
              <Text style={[styles.instructionText, { color: colors.foreground }]}>
                {order.delivery.instructions}
              </Text>
            </View>
          )}
        </Card>

        {/* Items */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Artikel</Text>
          {order.items.map((item, i) => (
            <View key={item.id ?? i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemQty, { color: colors.muted }]}>{item.quantity}x</Text>
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

        {/* Payment */}
        {order.payment && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Zahlung</Text>
            <InfoRow
              label="Methode"
              value={PROVIDER_LABELS[order.payment.provider] ?? order.payment.provider}
              muted={colors.muted}
            />
            <InfoRow
              label="Betrag"
              value={centsToEuros(order.payment.amountCents)}
              muted={colors.muted}
            />
            {order.payment.platformFeeCents != null && order.payment.platformFeeCents > 0 && (
              <InfoRow
                label="Plattformgebühr"
                value={centsToEuros(order.payment.platformFeeCents)}
                muted={colors.muted}
              />
            )}
            {order.payment.stripePaymentIntentId && (
              <InfoRow
                label="Payment Intent"
                value={order.payment.stripePaymentIntentId}
                onPress={openStripePayment}
                linkColor={colors.success}
                muted={colors.muted}
              />
            )}
          </Card>
        )}

        {/* TSE / Kassenbon */}
        {tse && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>TSE / Kassenbon</Text>
            <InfoRow label="Beleg-Nr." value={String(tse.beleg_nr)} muted={colors.muted} />
            <InfoRow label="Kassen-ID" value={tse.kassen_id} muted={colors.muted} />
            <InfoRow label="TX-Nummer" value={String(tse.tx_number)} muted={colors.muted} />
            <InfoRow label="Status" value={tse.tx_state} muted={colors.muted} />
            {tse.payment_type && (
              <InfoRow
                label="Zahlart (TSE)"
                value={tse.payment_type === 'CASH' ? 'Bar' : 'Unbar'}
                muted={colors.muted}
              />
            )}
            {tse.time_start > 0 && (
              <InfoRow label="Start" value={formatUnixTimestamp(tse.time_start)} muted={colors.muted} />
            )}
            {tse.time_end > 0 && (
              <InfoRow label="Ende" value={formatUnixTimestamp(tse.time_end)} muted={colors.muted} />
            )}
            {tse.signature_counter != null && (
              <InfoRow label="Signaturzähler" value={String(tse.signature_counter)} muted={colors.muted} />
            )}

            {/* eReceipt links */}
            {(tse.ereceipt_url || tse.ereceipt_pdf_url) && (
              <View style={[styles.receiptLinks, { borderTopColor: colors.border }]}>
                {tse.ereceipt_url && (
                  <TouchableOpacity onPress={openEReceipt} style={styles.receiptButton}>
                    <Ionicons name="receipt-outline" size={18} color={colors.success} />
                    <Text style={[styles.receiptLinkText, { color: colors.success }]}>
                      eReceipt anzeigen
                    </Text>
                  </TouchableOpacity>
                )}
                {tse.ereceipt_pdf_url && (
                  <TouchableOpacity onPress={openEReceiptPdf} style={styles.receiptButton}>
                    <Ionicons name="document-outline" size={18} color={colors.success} />
                    <Text style={[styles.receiptLinkText, { color: colors.success }]}>
                      PDF herunterladen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Card>
        )}

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
  statusRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: { fontSize: fontSize.sm, flex: 1 },
  infoValue: { fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right', flex: 1 },
  receiptLinks: {
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  receiptLinkText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  instructionText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
})
