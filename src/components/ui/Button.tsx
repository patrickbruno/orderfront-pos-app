import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useTheme } from '../../stores/theme-store'
import { radii, spacing, fontSize } from '../../theme/tokens'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme()

  const bgMap: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.card,
    outline: 'transparent',
    ghost: 'transparent',
    destructive: colors.error,
  }

  const textColorMap: Record<string, string> = {
    primary: colors.primaryForeground,
    secondary: colors.foreground,
    outline: colors.foreground,
    ghost: colors.foreground,
    destructive: '#FFFFFF',
  }

  const paddingMap = { sm: spacing.sm, md: spacing.md, lg: spacing.lg }
  const fontMap = { sm: fontSize.sm, md: fontSize.base, lg: fontSize.lg }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: bgMap[variant],
          paddingVertical: paddingMap[size],
          paddingHorizontal: paddingMap[size] * 1.5,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColorMap[variant], fontSize: fontMap[size] },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
})
