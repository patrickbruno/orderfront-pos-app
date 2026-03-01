import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { radii, spacing, fontSize } from '../../theme/tokens'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'muted'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { colors } = useTheme()

  const bgMap: Record<BadgeVariant, string> = {
    default: colors.primary + '15',
    success: colors.success + '20',
    warning: colors.amber + '20',
    error: colors.error + '20',
    muted: colors.muted + '20',
  }

  const textMap: Record<BadgeVariant, string> = {
    default: colors.primary,
    success: colors.success,
    warning: colors.amber,
    error: colors.error,
    muted: colors.muted,
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant] }]}>
      <Text style={[styles.text, { color: textMap[variant] }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
})
