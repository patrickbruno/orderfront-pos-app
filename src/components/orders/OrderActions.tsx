import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Button } from '../ui/Button'
import { useOrdersStore } from '../../stores/orders-store'
import { spacing } from '../../theme/tokens'
import type { TrackingState } from '../../types/order'
import { TRACKING_STATES, TRACKING_STATE_LABELS } from '../../types/order'

interface OrderActionsProps {
  orderId: string
  currentState: TrackingState
}

export function OrderActions({ orderId, currentState }: OrderActionsProps) {
  const updateTrackingState = useOrdersStore((s) => s.updateTrackingState)
  const idx = TRACKING_STATES.indexOf(currentState)
  const nextState = idx < TRACKING_STATES.length - 1 ? TRACKING_STATES[idx + 1] : null

  async function handleAdvance() {
    if (!nextState) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await updateTrackingState(orderId, nextState)
    } catch (err: any) {
      Alert.alert('Fehler', err.message)
    }
  }

  if (!nextState || currentState === 'done') return null

  return (
    <View style={styles.container}>
      <Button
        title={`→ ${TRACKING_STATE_LABELS[nextState]}`}
        onPress={handleAdvance}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.sm },
})
