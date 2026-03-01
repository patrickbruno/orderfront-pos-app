import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { Card } from '../ui/Card'
import { spacing, fontSize } from '../../theme/tokens'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
}

export function KPICard({ title, value, subtitle }: KPICardProps) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card} padding="md">
      <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.mutedLight }]}>{subtitle}</Text>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140 },
  title: { fontSize: fontSize.sm, fontWeight: '500' },
  value: { fontSize: fontSize['2xl'], fontWeight: '700', marginTop: spacing.xs },
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
})
