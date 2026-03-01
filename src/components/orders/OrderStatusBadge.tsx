import React from 'react'
import { Badge } from '../ui/Badge'
import type { TrackingState, PaymentStatus } from '../../types/order'
import { TRACKING_STATE_LABELS } from '../../types/order'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'muted'

const trackingVariantMap: Record<TrackingState, BadgeVariant> = {
  open: 'warning',
  preparation: 'default',
  ready: 'success',
  out_for_delivery: 'default',
  done: 'muted',
}

const paymentVariantMap: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  processing: 'warning',
  succeeded: 'success',
  failed: 'error',
  cancelled: 'muted',
  refunded: 'muted',
  partially_refunded: 'warning',
}

export function TrackingStateBadge({ state }: { state: TrackingState }) {
  return (
    <Badge
      label={TRACKING_STATE_LABELS[state]}
      variant={trackingVariantMap[state]}
    />
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Ausstehend',
    processing: 'Verarbeitung',
    succeeded: 'Bezahlt',
    failed: 'Fehlgeschlagen',
    cancelled: 'Storniert',
    refunded: 'Erstattet',
    partially_refunded: 'Teilerstattet',
  }
  return <Badge label={labels[status]} variant={paymentVariantMap[status]} />
}
