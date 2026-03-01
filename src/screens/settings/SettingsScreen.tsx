import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { SettingsStackParamList } from '../../navigation/SettingsStack'

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'SettingsHome'>

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
}

function SettingsRow({ icon, label, onPress }: SettingsRowProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </TouchableOpacity>
  )
}

export function SettingsScreen() {
  const nav = useNavigation<Nav>()
  const { colors, toggle, isDark } = useTheme()
  const signOut = useAuthStore((s) => s.signOut)
  const currentRestaurantId = useAuthStore((s) => s.currentRestaurantId)
  const restaurants = useAuthStore((s) => s.availableRestaurants)
  const selectRestaurant = useAuthStore((s) => s.selectRestaurant)

  const currentRestaurant = restaurants.find((r) => r.id === currentRestaurantId)

  function handleSignOut() {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: signOut },
    ])
  }

  function handleSwitchRestaurant() {
    // Clear current restaurant to show selector
    selectRestaurant('')
    // This will cause RootNavigator to show RestaurantSelector
    // We need to clear currentRestaurantId
    useAuthStore.setState({ currentRestaurantId: null })
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Einstellungen" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Current Restaurant */}
        {currentRestaurant && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>Restaurant</Text>
            <Text style={[styles.restaurantName, { color: colors.foreground }]}>
              {currentRestaurant.name}
            </Text>
            {restaurants.length > 1 && (
              <TouchableOpacity onPress={handleSwitchRestaurant} style={styles.switchBtn}>
                <Text style={[styles.switchText, { color: colors.primary }]}>
                  Restaurant wechseln
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Restaurant Settings */}
        <Card padding="sm">
          <SettingsRow
            icon="restaurant-outline"
            label="Restaurant-Info"
            onPress={() => nav.navigate('RestaurantInfo')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="time-outline"
            label="Öffnungszeiten"
            onPress={() => nav.navigate('Hours')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="receipt-outline"
            label="Bestelleinstellungen"
            onPress={() => nav.navigate('OrderSettings')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="git-branch-outline"
            label="Kanäle"
            onPress={() => nav.navigate('ChannelConfig')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="fast-food-outline"
            label="Speisekarte"
            onPress={() => nav.navigate('Menu')}
          />
        </Card>

        {/* Appearance */}
        <Card padding="sm">
          <TouchableOpacity style={styles.row} onPress={toggle} activeOpacity={0.6}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Account */}
        <Card padding="sm">
          <TouchableOpacity style={styles.row} onPress={handleSignOut} activeOpacity={0.6}>
            <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.error }]}>Abmelden</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  restaurantName: { fontSize: fontSize.lg, fontWeight: '700' },
  switchBtn: { marginTop: spacing.sm },
  switchText: { fontSize: fontSize.sm, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: fontSize.base, fontWeight: '500' },
  divider: { height: 1, marginLeft: 36 + spacing.md + spacing.sm },
})
