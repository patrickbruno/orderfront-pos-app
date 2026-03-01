import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { useSettingsStore } from '../../stores/settings-store'
import { Header } from '../../components/ui/Header'
import { Button } from '../../components/ui/Button'
import { spacing, fontSize, radii } from '../../theme/tokens'

export function RestaurantInfoScreen() {
  const { colors } = useTheme()
  const nav = useNavigation()
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { restaurantData, fetchSettings, updateCore, isLoading } = useSettingsStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings(restaurantId)
  }, [restaurantId])

  useEffect(() => {
    if (restaurantData) {
      setName(restaurantData.name ?? '')
      setPhone(restaurantData.phone ?? '')
      setEmail(restaurantData.email ?? '')
    }
  }, [restaurantData])

  async function handleSave() {
    setSaving(true)
    try {
      await updateCore(restaurantId, { name, phone, email })
      Alert.alert('Gespeichert', 'Restaurant-Info wurde aktualisiert.')
    } catch (err: any) {
      Alert.alert('Fehler', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Restaurant-Info" showBack onBack={() => nav.goBack()} />
      {isLoading && !restaurantData ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.label, { color: colors.muted }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={name}
            onChangeText={setName}
            placeholder="Restaurant-Name"
            placeholderTextColor={colors.mutedLight}
          />

          <Text style={[styles.label, { color: colors.muted }]}>Telefon</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefonnummer"
            placeholderTextColor={colors.mutedLight}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: colors.muted }]}>E-Mail</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={email}
            onChangeText={setEmail}
            placeholder="E-Mail-Adresse"
            placeholderTextColor={colors.mutedLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button title="Speichern" onPress={handleSave} loading={saving} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.base,
  },
})
