import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { useTheme } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { useMenuStore } from '../../stores/menu-store'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { MenuItem, UpdateMenuItemInput } from '../../types/menu'
import type { SettingsStackParamList } from '../../navigation/SettingsStack'

type DetailRoute = RouteProp<SettingsStackParamList, 'MenuItemDetail'>

function centsToEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

function euroToCents(euro: string): number {
  const val = parseFloat(euro.replace(',', '.'))
  return isNaN(val) ? 0 : Math.round(val * 100)
}

// --- Field components ---

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
}

function ToggleRow({
  label,
  value,
  onValueChange,
  colors,
}: {
  label: string
  value: boolean
  onValueChange: (v: boolean) => void
  colors: any
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  )
}

function TextField({
  label,
  value,
  onChange,
  colors,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  colors: any
  placeholder?: string
  multiline?: boolean
}) {
  return (
    <View style={styles.fieldColumn}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          { color: colors.foreground, borderColor: colors.border },
          multiline && styles.textInputMultiline,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
      />
    </View>
  )
}

function EuroField({
  label,
  valueCents,
  onChangeCents,
  colors,
}: {
  label: string
  valueCents: number
  onChangeCents: (cents: number) => void
  colors: any
}) {
  const [text, setText] = useState(centsToEuro(valueCents))

  useEffect(() => {
    setText(centsToEuro(valueCents))
  }, [valueCents])

  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={text}
          onChangeText={setText}
          onEndEditing={() => onChangeCents(euroToCents(text))}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={colors.muted}
        />
        <Text style={[styles.inputSuffix, { color: colors.muted }]}>{'€'}</Text>
      </View>
    </View>
  )
}

function NumberField({
  label,
  value,
  onChange,
  colors,
  suffix,
}: {
  label: string
  value: number | null | undefined
  onChange: (v: number | null) => void
  colors: any
  suffix?: string
}) {
  const [text, setText] = useState(value?.toString() ?? '')

  useEffect(() => {
    setText(value?.toString() ?? '')
  }, [value])

  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={text}
          onChangeText={setText}
          onEndEditing={() => {
            const num = parseInt(text, 10)
            onChange(isNaN(num) ? null : num)
          }}
          keyboardType="number-pad"
          placeholder="-"
          placeholderTextColor={colors.muted}
        />
        {suffix && <Text style={[styles.inputSuffix, { color: colors.muted }]}>{suffix}</Text>}
      </View>
    </View>
  )
}

// --- Main Screen ---

export function MenuItemDetailScreen() {
  const { colors } = useTheme()
  const nav = useNavigation()
  const route = useRoute<DetailRoute>()
  const { itemId } = route.params
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { items, categories, updateItem } = useMenuStore()

  const original = items.find((i) => i.id === itemId)
  const [draft, setDraft] = useState<MenuItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (original) {
      setDraft({ ...original })
    }
  }, [original?.id])

  const categoryName = draft?.categoryId
    ? categories.find((c) => c.id === draft.categoryId)?.name
    : undefined

  function update(partial: Partial<MenuItem>) {
    if (!draft) return
    setDraft({ ...draft, ...partial })
  }

  async function handleSave() {
    if (!draft) return
    setIsSaving(true)
    try {
      const payload: UpdateMenuItemInput = {
        name: draft.name,
        description: draft.description,
        basePriceCents: draft.basePriceCents,
        compareAtPriceCents: draft.compareAtPriceCents ?? null,
        isActive: draft.isActive,
        isOutOfStock: draft.isOutOfStock,
        outOfStockReason: draft.outOfStockReason ?? null,
        isVegetarian: draft.isVegetarian,
        isVegan: draft.isVegan,
        hasVeganVariant: draft.hasVeganVariant,
        veganPriceAdjustmentCents: draft.veganPriceAdjustmentCents,
        isSpicy: draft.isSpicy,
        spiceLevel: draft.spiceLevel ?? null,
        isNew: draft.isNew,
        isSpecial: draft.isSpecial,
        isFeatured: draft.isFeatured,
        isPopular: draft.isPopular,
        prepTimeMinutes: draft.prepTimeMinutes ?? null,
      }
      await updateItem(restaurantId, itemId, payload)
      Alert.alert('Gespeichert', 'Artikel wurde aktualisiert.')
    } catch (err: any) {
      Alert.alert('Fehler', err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!draft) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Artikel" showBack onBack={() => nav.goBack()} />
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={draft.name}
        subtitle={categoryName}
        showBack
        onBack={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Status */}
        <Card>
          <SectionHeader title="Status" colors={colors} />
          <ToggleRow
            label="Aktiv"
            value={draft.isActive}
            onValueChange={(v) => update({ isActive: v })}
            colors={colors}
          />
          <ToggleRow
            label="Ausverkauft"
            value={draft.isOutOfStock}
            onValueChange={(v) => update({ isOutOfStock: v })}
            colors={colors}
          />
          {draft.isOutOfStock && (
            <TextField
              label="Grund"
              value={draft.outOfStockReason ?? ''}
              onChange={(v) => update({ outOfStockReason: v || undefined })}
              colors={colors}
              placeholder="z.B. Zutat nicht verfügbar"
            />
          )}
        </Card>

        {/* Grunddaten */}
        <Card>
          <SectionHeader title="Grunddaten" colors={colors} />
          <TextField
            label="Name"
            value={draft.name}
            onChange={(v) => update({ name: v })}
            colors={colors}
          />
          <TextField
            label="Beschreibung"
            value={draft.description}
            onChange={(v) => update({ description: v })}
            colors={colors}
            multiline
          />
        </Card>

        {/* Preise */}
        <Card>
          <SectionHeader title="Preise" colors={colors} />
          <EuroField
            label="Grundpreis"
            valueCents={draft.basePriceCents}
            onChangeCents={(v) => update({ basePriceCents: v })}
            colors={colors}
          />
          <EuroField
            label="Streichpreis"
            valueCents={draft.compareAtPriceCents ?? 0}
            onChangeCents={(v) => update({ compareAtPriceCents: v || undefined })}
            colors={colors}
          />
        </Card>

        {/* Ernährung */}
        <Card>
          <SectionHeader title="Ernährung" colors={colors} />
          <ToggleRow
            label="Vegetarisch"
            value={draft.isVegetarian}
            onValueChange={(v) => update({ isVegetarian: v })}
            colors={colors}
          />
          <ToggleRow
            label="Vegan"
            value={draft.isVegan}
            onValueChange={(v) => update({ isVegan: v })}
            colors={colors}
          />
          <ToggleRow
            label="Vegane Variante"
            value={draft.hasVeganVariant}
            onValueChange={(v) => update({ hasVeganVariant: v })}
            colors={colors}
          />
          {draft.hasVeganVariant && (
            <EuroField
              label="Aufpreis vegan"
              valueCents={draft.veganPriceAdjustmentCents}
              onChangeCents={(v) => update({ veganPriceAdjustmentCents: v })}
              colors={colors}
            />
          )}
          <ToggleRow
            label="Scharf"
            value={draft.isSpicy}
            onValueChange={(v) => update({ isSpicy: v })}
            colors={colors}
          />
          {draft.isSpicy && (
            <NumberField
              label="Schärfegrad"
              value={draft.spiceLevel}
              onChange={(v) => update({ spiceLevel: v ?? undefined })}
              colors={colors}
              suffix="/ 3"
            />
          )}
        </Card>

        {/* Hervorhebung */}
        <Card>
          <SectionHeader title="Hervorhebung" colors={colors} />
          <ToggleRow
            label="Neu"
            value={draft.isNew}
            onValueChange={(v) => update({ isNew: v })}
            colors={colors}
          />
          <ToggleRow
            label="Spezial"
            value={draft.isSpecial}
            onValueChange={(v) => update({ isSpecial: v })}
            colors={colors}
          />
          <ToggleRow
            label="Empfohlen"
            value={draft.isFeatured}
            onValueChange={(v) => update({ isFeatured: v })}
            colors={colors}
          />
          <ToggleRow
            label="Beliebt"
            value={draft.isPopular}
            onValueChange={(v) => update({ isPopular: v })}
            colors={colors}
          />
        </Card>

        {/* Zubereitung */}
        <Card>
          <SectionHeader title="Zubereitung" colors={colors} />
          <NumberField
            label="Zubereitungszeit"
            value={draft.prepTimeMinutes}
            onChange={(v) => update({ prepTimeMinutes: v ?? undefined })}
            colors={colors}
            suffix="Min."
          />
        </Card>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
              Speichern
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fieldColumn: {
    paddingVertical: spacing.xs,
  },
  fieldLabel: { fontSize: fontSize.sm, flex: 1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 100,
  },
  input: {
    fontSize: fontSize.sm,
    paddingVertical: 6,
    textAlign: 'right',
    flex: 1,
  },
  inputSuffix: {
    fontSize: fontSize.sm,
    marginLeft: 4,
  },
  textInput: {
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
})
