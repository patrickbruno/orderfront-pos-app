import React, { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/auth-store'
import { useTheme } from '../../stores/theme-store'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { Restaurant } from '../../types/restaurant'

export function RestaurantSelectorScreen() {
  const { colors } = useTheme()
  const restaurants = useAuthStore((s) => s.availableRestaurants)
  const fetchRestaurants = useAuthStore((s) => s.fetchRestaurants)
  const selectRestaurant = useAuthStore((s) => s.selectRestaurant)
  const signOut = useAuthStore((s) => s.signOut)

  useEffect(() => {
    if (restaurants.length === 0) {
      fetchRestaurants()
    }
  }, [])

  function handleSelect(restaurant: Restaurant) {
    selectRestaurant(restaurant.id)
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Restaurant auswählen</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Wähle das Restaurant, das du verwalten möchtest
        </Text>
      </View>

      {restaurants.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                    <Text style={[styles.role, { color: colors.muted }]}>{item.role}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.footer}>
        <Button title="Abmelden" variant="ghost" onPress={signOut} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  role: {
    fontSize: fontSize.sm,
  },
  footer: {
    padding: spacing.md,
  },
})
