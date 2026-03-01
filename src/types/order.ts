export type OrderStatus = 'draft' | 'confirmed' | 'cancelled'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded'
export type TrackingState = 'open' | 'preparation' | 'ready' | 'out_for_delivery' | 'done'
export type DeliveryMethod = 'takeaway' | 'delivery' | 'dine_in'
export type PaymentProvider = 'stripe' | 'cash' | 'stripe_terminal'

export interface EmbeddedPaymentInfo {
  provider: PaymentProvider
  status: PaymentStatus
  amountCents: number
  platformFeeCents?: number
  stripePaymentIntentId?: string
  stripeSessionId?: string
  stripeInvoiceId?: string
}

export interface TseTransaction {
  beleg_nr: number
  kassen_id: string
  tss_serial_number?: string
  client_serial_number?: string
  tx_number: number
  tx_state: string
  time_start: number
  time_end: number
  signature_value?: string
  signature_algorithm?: string
  signature_counter?: number
  qr_code_data?: string
  ereceipt_url?: string
  ereceipt_pdf_url?: string
  receipt_type?: string
  total_amount_cents?: number
  tip_amount_cents?: number
  payment_type?: string
  payment_method?: string
}

export interface OrderLineItemExtra {
  id?: string
  slug: string | null
  name: string
  shortName?: string
  quantity: number
  priceCents: number
  subtotalCents: number
}

export interface OrderLineItem {
  id?: string
  menuItemId: string | null
  name: string
  shortName?: string
  category?: string
  quantity: number
  basePriceCents: number
  itemTotalCents: number
  lineItemTaxType: string
  vatRatePercent: number
  comment?: string
  isVegan: boolean
  displayOrder?: number
  extras: OrderLineItemExtra[]
}

export interface Order {
  id: string
  restaurantId?: string
  orderNumber: string | null
  dayCounter?: number
  dayCounterPrefix?: string
  orderSource?: 'online' | 'kiosk' | 'qr' | 'staff_terminal'

  customer: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }

  delivery: {
    method: DeliveryMethod
    address?: {
      street: string
      houseNumber: string
      postalCode: string
      city: string
      floor?: string
      companyName?: string
    }
    instructions?: string
  }

  timing: {
    orderDate: string
    orderTime: string
    preferredDeliveryDateTime?: string
  }

  items: OrderLineItem[]

  pricingCents: {
    subtotalCents: number
    deliveryFeeCents: number
    serviceFeeCents: number
    tipCents: number
    totalCents: number
  }

  status: {
    current: OrderStatus
    updatedAt: string
  }

  currentState?: TrackingState
  orderComment?: string

  payment?: EmbeddedPaymentInfo

  createdAt: string
  updatedAt: string
}

/** Tracking state labels in German */
export const TRACKING_STATE_LABELS: Record<TrackingState, string> = {
  open: 'Neu',
  preparation: 'Zubereitung',
  ready: 'Bereit',
  out_for_delivery: 'Lieferung',
  done: 'Fertig',
}

/** Ordered tracking states for kanban columns */
export const TRACKING_STATES: TrackingState[] = [
  'open', 'preparation', 'ready', 'out_for_delivery', 'done'
]

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  takeaway: 'Abholung',
  delivery: 'Lieferung',
  dine_in: 'Vor Ort',
}
