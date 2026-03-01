import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Switch,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { useMenuStore } from '../../stores/menu-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { MenuItem, MenuCategory } from '../../types/menu'
import type { SettingsStackParamList } from '../../navigation/SettingsStack'

type Nav = NativeStackNavigationProp<SettingsStackParamList>

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

function MenuItemRow({
  item,
  onPress,
  onToggleActive,
}: {
  item: MenuItem
  onPress: () => void
  onToggleActive: (val: boolean) => void
}) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.itemRow}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons name="fast-food-outline" size={20} color={colors.muted} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <View style={styles.itemNameRow}>
          <Text
            style={[
              styles.itemName,
              { color: item.isActive ? colors.foreground : colors.muted },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.isSpicy && <Text style={styles.dietaryIcon}>{'\uD83C\uDF36\uFE0F'}</Text>}
          {item.isVegan && <Text style={styles.dietaryIcon}>{'\uD83C\uDF31'}</Text>}
          {item.isVegetarian && !item.isVegan && <Text style={styles.dietaryIcon}>V</Text>}
        </View>
        <Text style={[styles.itemPrice, { color: colors.muted }]}>
          {formatCents(item.basePriceCents)}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <Switch
          value={item.isActive}
          onValueChange={onToggleActive}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor="#fff"
          style={styles.switch}
        />
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
    </TouchableOpacity>
  )
}

export function MenuScreen() {
  const { colors } = useTheme()
  const nav = useNavigation<Nav>()
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { items, categories, fetchMenu, toggleActive, isLoading } = useMenuStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMenu(restaurantId)
  }, [restaurantId])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchMenu(restaurantId)
    setRefreshing(false)
  }, [restaurantId])

  // Build category map
  const categoryMap = new Map<string, MenuCategory>()
  categories.forEach((c) => categoryMap.set(c.id, c))

  // Group items by category, sort by displayOrder
  const grouped = new Map<string, MenuItem[]>()
  const uncategorized: MenuItem[] = []

  const sortedItems = [...items].sort((a, b) => a.displayOrder - b.displayOrder)
  for (const item of sortedItems) {
    if (item.categoryId && categoryMap.has(item.categoryId)) {
      const list = grouped.get(item.categoryId) ?? []
      list.push(item)
      grouped.set(item.categoryId, list)
    } else {
      uncategorized.push(item)
    }
  }

  // Sort categories by displayOrder
  const sortedCategories = [...categories]
    .filter((c) => grouped.has(c.id))
    .sort((a, b) => a.displayOrder - b.displayOrder)

  function handleToggleActive(item: MenuItem, isActive: boolean) {
    toggleActive(restaurantId, item.id, isActive).catch(() => {})
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Speisekarte" showBack onBack={() => nav.goBack()} />
      {isLoading && !refreshing ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sortedCategories.length === 0 && uncategorized.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Keine Artikel vorhanden.
            </Text>
          ) : (
            <>
              {sortedCategories.map((cat) => (
                <View key={cat.id} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                      {cat.name}
                    </Text>
                  </View>
                  <Card padding="sm">
                    {grouped.get(cat.id)!.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        {idx > 0 && (
                          <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        )}
                        <MenuItemRow
                          item={item}
                          onPress={() => nav.navigate('MenuItemDetail', { itemId: item.id })}
                          onToggleActive={(val) => handleToggleActive(item, val)}
                        />
                      </React.Fragment>
                    ))}
                  </Card>
                </View>
              ))}
              {uncategorized.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Ohne Kategorie
                  </Text>
                  <Card padding="sm">
                    {uncategorized.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        {idx > 0 && (
                          <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        )}
                        <MenuItemRow
                          item={item}
                          onPress={() => nav.navigate('MenuItemDetail', { itemId: item.id })}
                          onToggleActive={(val) => handleToggleActive(item, val)}
                        />
                      </React.Fragment>
                    ))}
                  </Card>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
  itemImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1, marginRight: spacing.sm },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemName: { fontSize: fontSize.base, fontWeight: '500' },
  dietaryIcon: { fontSize: 12 },
  itemPrice: { fontSize: fontSize.sm, marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  divider: { height: 1, marginHorizontal: spacing.xs },
  emptyText: { fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.xl },
})
