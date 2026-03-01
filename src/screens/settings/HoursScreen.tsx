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

const DAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

export function HoursScreen() {
  const { colors } = useTheme()
  const nav = useNavigation()
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { hours, fetchHours, isLoading } = useSettingsStore()

  useEffect(() => {
    fetchHours(restaurantId)
  }, [restaurantId])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Öffnungszeiten" showBack onBack={() => nav.goBack()} />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {hours && Array.isArray(hours) ? (
            hours.map((day: any, i: number) => (
              <Card key={i}>
                <View style={styles.dayRow}>
                  <Text style={[styles.dayLabel, { color: colors.foreground }]}>
                    {DAY_LABELS[i] ?? `Tag ${i + 1}`}
                  </Text>
                  {day.closed ? (
                    <Text style={[styles.closedText, { color: colors.error }]}>Geschlossen</Text>
                  ) : (
                    <Text style={[styles.timeText, { color: colors.foreground }]}>
                      {day.open ?? '—'} – {day.close ?? '—'}
                    </Text>
                  )}
                </View>
              </Card>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Keine Öffnungszeiten konfiguriert.
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.md, gap: spacing.sm },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayLabel: { fontSize: fontSize.base, fontWeight: '600' },
  timeText: { fontSize: fontSize.base },
  closedText: { fontSize: fontSize.base, fontWeight: '500' },
  emptyText: { fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.xl },
})
