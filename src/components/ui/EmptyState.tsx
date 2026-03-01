import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../stores/theme-store'
import { spacing, fontSize } from '../../theme/tokens'

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  message?: string
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.mutedLight} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.base,
    textAlign: 'center',
  },
})
