import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { DateRangePreset } from '../../types/analytics'

interface DateRangePickerProps {
  activePreset: DateRangePreset
  onSelect: (preset: DateRangePreset) => void
}

const presets: { key: DateRangePreset; label: string }[] = [
  { key: 'today', label: 'Heute' },
  { key: 'week', label: 'Woche' },
  { key: 'month', label: 'Monat' },
]

export function DateRangePicker({ activePreset, onSelect }: DateRangePickerProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      {presets.map((p) => {
        const isActive = p.key === activePreset
        return (
          <TouchableOpacity
            key={p.key}
            onPress={() => onSelect(p.key)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                { color: isActive ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: '600' },
})
