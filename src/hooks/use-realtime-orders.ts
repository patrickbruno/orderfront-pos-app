import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth-store'
import { useOrdersStore } from '../stores/orders-store'
import { useTrackingStore } from '../stores/tracking-store'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to real-time order changes via Supabase Realtime.
 * Refreshes both the orders list and tracking kanban when changes occur.
 */
export function useRealtimeOrders() {
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)
  const refreshOrders = useOrdersStore((s) => s.refresh)
  const refreshKanban = useTrackingStore((s) => s.refresh)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!restaurantId) return

    const channel = supabase
      .channel(`orders:${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          refreshOrders()
          refreshKanban()
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [restaurantId])
}
