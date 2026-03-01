import React, { useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { useSettingsStore } from '../../stores/settings-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize } from '../../theme/tokens'

export function OrderSettingsScreen() {
  const { colors } = useTheme()
  const nav = useNavigation()
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { settings, fetchSettings, isLoading } = useSettingsStore()

  useEffect(() => {
    fetchSettings(restaurantId)
  }, [restaurantId])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Bestelleinstellungen" showBack onBack={() => nav.goBack()} />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <View style={styles.settingRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Bestellnummern-Typ</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>
                {settings?.orderNumberType ?? 'Standard'}
              </Text>
            </View>
          </Card>
          <Card>
            <View style={styles.settingRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Auto-Bestätigung</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>
                {settings?.autoConfirm ? 'Aktiviert' : 'Deaktiviert'}
              </Text>
            </View>
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.md, gap: spacing.sm },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.base },
  value: { fontSize: fontSize.base, fontWeight: '600' },
})
