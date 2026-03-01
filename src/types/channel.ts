export type OrderSource = 'online' | 'kiosk' | 'qr' | 'staff_terminal'
export type FulfillmentCode = 'delivery' | 'takeaway' | 'dine_in'

export interface ChannelConfig {
  restaurantId: string
  orderSource: OrderSource
  fulfillmentCode: FulfillmentCode
  isEnabled: boolean
  disabledMessage: string | null
  minAdvanceMinutes: number | null
  maxAdvanceDays: number | null
  phoneRequired: boolean
  phoneRequiredMinAmountCents: number | null
  minOrderAmountCents: number
  fulfillmentFeeCents: number
  freeFeeThresholdCents: number | null
  serviceFeeEnabled: boolean
  serviceFeeFixedCents: number
  serviceFeePercentageBps: number
  serviceFeeMaxCents: number
  serviceFeeDescription: string | null
  maxCartSize: number
  maxItemQuantity: number
  maxOrderAmountCents: number
  maxTipAmountCents: number
  onlinePaymentEnabled: boolean
  offlinePaymentEnabled: boolean
  dayCounterPrefix: string
  displayName: string
  requiresScheduling: boolean
  requiresCustomerName: boolean
  requiresEmail: boolean
  tseEnabled: boolean
}

export interface UpdateChannelConfigRequest {
  isEnabled?: boolean
  disabledMessage?: string | null
  minAdvanceMinutes?: number | null
  maxAdvanceDays?: number | null
  phoneRequired?: boolean
  phoneRequiredMinAmountCents?: number | null
  minOrderAmountCents?: number
  fulfillmentFeeCents?: number
  freeFeeThresholdCents?: number | null
  serviceFeeEnabled?: boolean
  serviceFeeFixedCents?: number
  serviceFeePercentageBps?: number
  serviceFeeMaxCents?: number
  serviceFeeDescription?: string | null
  maxCartSize?: number
  maxItemQuantity?: number
  maxOrderAmountCents?: number
  maxTipAmountCents?: number
  onlinePaymentEnabled?: boolean
  offlinePaymentEnabled?: boolean
  requiresScheduling?: boolean
  requiresCustomerName?: boolean
  requiresEmail?: boolean
  tseEnabled?: boolean
}

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  online: 'Online',
  kiosk: 'Kiosk',
  qr: 'QR',
  staff_terminal: 'Terminal',
}

export const FULFILLMENT_LABELS: Record<FulfillmentCode, string> = {
  delivery: 'Lieferung',
  takeaway: 'Abholung',
  dine_in: 'Vor Ort',
}
