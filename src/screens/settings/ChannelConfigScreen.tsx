import React, { useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { useSettingsStore } from '../../stores/settings-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { spacing, fontSize } from '../../theme/tokens'
import type { ChannelConfig, OrderSource } from '../../types/channel'
import { ORDER_SOURCE_LABELS, FULFILLMENT_LABELS } from '../../types/channel'
import type { SettingsStackParamList } from '../../navigation/SettingsStack'

type Nav = NativeStackNavigationProp<SettingsStackParamList>

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

function ChannelCard({ channel, onPress }: { channel: ChannelConfig; onPress: () => void }) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card>
        <View style={styles.channelRow}>
          <View style={styles.channelInfo}>
            <Text style={[styles.channelName, { color: colors.foreground }]}>
              {FULFILLMENT_LABELS[channel.fulfillmentCode] ?? channel.fulfillmentCode}
            </Text>
            <View style={styles.metaRow}>
              {channel.fulfillmentFeeCents > 0 && (
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  {formatCents(channel.fulfillmentFeeCents)}
                </Text>
              )}
              {channel.minOrderAmountCents > 0 && (
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  ab {formatCents(channel.minOrderAmountCents)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            <Badge
              label={channel.isEnabled ? 'Aktiv' : 'Inaktiv'}
              variant={channel.isEnabled ? 'success' : 'muted'}
            />
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

export function ChannelConfigScreen() {
  const { colors } = useTheme()
  const nav = useNavigation<Nav>()
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { channelConfigs, fetchChannels, isLoading } = useSettingsStore()

  useEffect(() => {
    fetchChannels(restaurantId)
  }, [restaurantId])

  // Group channels by order source
  const grouped = channelConfigs.reduce<Record<string, ChannelConfig[]>>((acc, ch) => {
    const key = ch.orderSource
    if (!acc[key]) acc[key] = []
    acc[key].push(ch)
    return acc
  }, {})

  // Order: online first, then kiosk, then others
  const sourceOrder: OrderSource[] = ['online', 'kiosk', 'qr', 'staff_terminal']
  const sortedSources = Object.keys(grouped).sort(
    (a, b) => sourceOrder.indexOf(a as OrderSource) - sourceOrder.indexOf(b as OrderSource)
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Kanäle" showBack onBack={() => nav.goBack()} />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {sortedSources.length > 0 ? (
            sortedSources.map((source) => (
              <View key={source} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {ORDER_SOURCE_LABELS[source as OrderSource] ?? source}
                </Text>
                <View style={styles.cardList}>
                  {grouped[source].map((ch) => (
                    <ChannelCard
                      key={`${ch.orderSource}-${ch.fulfillmentCode}`}
                      channel={ch}
                      onPress={() =>
                        nav.navigate('ChannelDetail', {
                          source: ch.orderSource,
                          fulfillment: ch.fulfillmentCode,
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Keine Kanäle konfiguriert.
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
  content: { padding: spacing.md, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  cardList: { gap: spacing.sm },
  channelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  channelInfo: { flex: 1 },
  channelName: { fontSize: fontSize.base, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  metaText: { fontSize: fontSize.sm },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyText: { fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.xl },
})
