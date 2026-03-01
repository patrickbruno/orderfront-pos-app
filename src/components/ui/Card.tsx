import React from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { radii, spacing } from '../../theme/tokens'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: keyof typeof spacing
}

export function Card({ children, style, padding = 'md' }: CardProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
  },
})
