import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { Card } from '../ui/Card'
import { spacing, fontSize } from '../../theme/tokens'
import type { TimeseriesPoint } from '../../types/analytics'

interface MiniChartProps {
  title: string
  data: TimeseriesPoint[]
  color?: string
  formatValue?: (v: number) => string
}

const CHART_HEIGHT = 120

export function MiniChart({ title, data, color, formatValue }: MiniChartProps) {
  const { colors } = useTheme()
  const chartColor = color ?? colors.primary

  if (data.length === 0) {
    return (
      <Card>
        <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
        <Text style={[styles.empty, { color: colors.mutedLight }]}>Keine Daten</Text>
      </Card>
    )
  }

  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const barWidth = Math.max(4, (Dimensions.get('window').width - 80) / data.length - 2)

  return (
    <Card>
      <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
      <View style={styles.chart}>
        {data.map((point, i) => {
          const height = (point.value / max) * CHART_HEIGHT
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.max(2, height),
                  width: barWidth,
                  backgroundColor: chartColor + '80',
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                },
              ]}
            />
          )
        })}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.sm },
  empty: { fontSize: fontSize.sm, textAlign: 'center', paddingVertical: spacing.lg },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    gap: 2,
  },
  bar: {},
})
