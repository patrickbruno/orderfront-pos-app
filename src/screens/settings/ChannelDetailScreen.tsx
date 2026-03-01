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
import { useSettingsStore } from '../../stores/settings-store'
import { channelsService } from '../../services/channels.service'
import { Header } from '../../components/ui/Header'
import { Card } from '../../components/ui/Card'
import { spacing, fontSize, radii } from '../../theme/tokens'
import type { ChannelConfig, UpdateChannelConfigRequest } from '../../types/channel'
import { ORDER_SOURCE_LABELS, FULFILLMENT_LABELS } from '../../types/channel'
import type { SettingsStackParamList } from '../../navigation/SettingsStack'

type DetailRoute = RouteProp<SettingsStackParamList, 'ChannelDetail'>

function centsToEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

function euroToCents(euro: string): number {
  const val = parseFloat(euro.replace(',', '.'))
  return isNaN(val) ? 0 : Math.round(val * 100)
}

function bpsToPercent(bps: number): string {
  return (bps / 100).toFixed(2)
}

function percentToBps(pct: string): number {
  const val = parseFloat(pct.replace(',', '.'))
  return isNaN(val) ? 0 : Math.round(val * 100)
}

// --- Field components ---

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  )
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

function EuroField({
  label,
  valueCents,
  onChangeCents,
  colors,
  placeholder,
}: {
  label: string
  valueCents: number
  onChangeCents: (cents: number) => void
  colors: any
  placeholder?: string
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
          placeholder={placeholder ?? '0,00'}
          placeholderTextColor={colors.muted}
        />
        <Text style={[styles.inputSuffix, { color: colors.muted }]}>{'\u20AC'}</Text>
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
  value: number | null
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
        {suffix && (
          <Text style={[styles.inputSuffix, { color: colors.muted }]}>{suffix}</Text>
        )}
      </View>
    </View>
  )
}

function PercentField({
  label,
  valueBps,
  onChangeBps,
  colors,
}: {
  label: string
  valueBps: number
  onChangeBps: (bps: number) => void
  colors: any
}) {
  const [text, setText] = useState(bpsToPercent(valueBps))

  useEffect(() => {
    setText(bpsToPercent(valueBps))
  }, [valueBps])

  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={text}
          onChangeText={setText}
          onEndEditing={() => onChangeBps(percentToBps(text))}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={colors.muted}
        />
        <Text style={[styles.inputSuffix, { color: colors.muted }]}>%</Text>
      </View>
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

// --- Main Screen ---

export function ChannelDetailScreen() {
  const { colors } = useTheme()
  const nav = useNavigation()
  const route = useRoute<DetailRoute>()
  const { source, fulfillment } = route.params
  const restaurantId = useAuthStore((s) => s.currentRestaurantId)!
  const { updateChannel } = useSettingsStore()

  const [config, setConfig] = useState<ChannelConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const title = `${ORDER_SOURCE_LABELS[source as keyof typeof ORDER_SOURCE_LABELS] ?? source} \u2013 ${FULFILLMENT_LABELS[fulfillment as keyof typeof FULFILLMENT_LABELS] ?? fulfillment}`

  useEffect(() => {
    loadChannel()
  }, [source, fulfillment])

  async function loadChannel() {
    setIsLoading(true)
    try {
      const data = await channelsService.fetchChannel(restaurantId, source, fulfillment)
      setConfig(data)
    } catch (err: any) {
      Alert.alert('Fehler', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function update(partial: Partial<ChannelConfig>) {
    if (!config) return
    setConfig({ ...config, ...partial })
  }

  async function handleSave() {
    if (!config) return
    setIsSaving(true)
    try {
      const payload: UpdateChannelConfigRequest = {
        isEnabled: config.isEnabled,
        disabledMessage: config.disabledMessage,
        minAdvanceMinutes: config.minAdvanceMinutes,
        maxAdvanceDays: config.maxAdvanceDays,
        phoneRequired: config.phoneRequired,
        phoneRequiredMinAmountCents: config.phoneRequiredMinAmountCents,
        minOrderAmountCents: config.minOrderAmountCents,
        fulfillmentFeeCents: config.fulfillmentFeeCents,
        freeFeeThresholdCents: config.freeFeeThresholdCents,
        serviceFeeEnabled: config.serviceFeeEnabled,
        serviceFeeFixedCents: config.serviceFeeFixedCents,
        serviceFeePercentageBps: config.serviceFeePercentageBps,
        serviceFeeMaxCents: config.serviceFeeMaxCents,
        serviceFeeDescription: config.serviceFeeDescription,
        maxCartSize: config.maxCartSize,
        maxItemQuantity: config.maxItemQuantity,
        maxOrderAmountCents: config.maxOrderAmountCents,
        maxTipAmountCents: config.maxTipAmountCents,
        onlinePaymentEnabled: config.onlinePaymentEnabled,
        offlinePaymentEnabled: config.offlinePaymentEnabled,
        requiresScheduling: config.requiresScheduling,
        requiresCustomerName: config.requiresCustomerName,
        requiresEmail: config.requiresEmail,
        tseEnabled: config.tseEnabled,
      }
      await updateChannel(restaurantId, source, fulfillment, payload)
      Alert.alert('Gespeichert', 'Kanal-Einstellungen wurden aktualisiert.')
    } catch (err: any) {
      Alert.alert('Fehler', err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !config) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title={title} showBack onBack={() => nav.goBack()} />
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title={title} showBack onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Status */}
        <Card>
          <SectionHeader title="Status" colors={colors} />
          <ToggleRow
            label="Aktiviert"
            value={config.isEnabled}
            onValueChange={(v) => update({ isEnabled: v })}
            colors={colors}
          />
          {!config.isEnabled && (
            <TextField
              label="Deaktivierungs-Nachricht"
              value={config.disabledMessage ?? ''}
              onChange={(v) => update({ disabledMessage: v || null })}
              colors={colors}
              placeholder="Aktuell nicht verf\u00FCgbar"
              multiline
            />
          )}
        </Card>

        {/* Geb\u00FChren */}
        <Card>
          <SectionHeader title="Geb\u00FChren" colors={colors} />
          <EuroField
            label="Liefergeb\u00FChr"
            valueCents={config.fulfillmentFeeCents}
            onChangeCents={(v) => update({ fulfillmentFeeCents: v })}
            colors={colors}
          />
          <EuroField
            label="Kostenlos ab"
            valueCents={config.freeFeeThresholdCents ?? 0}
            onChangeCents={(v) => update({ freeFeeThresholdCents: v || null })}
            colors={colors}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Servicegeb\u00FChr"
            value={config.serviceFeeEnabled}
            onValueChange={(v) => update({ serviceFeeEnabled: v })}
            colors={colors}
          />
          {config.serviceFeeEnabled && (
            <>
              <EuroField
                label="Fest (fix)"
                valueCents={config.serviceFeeFixedCents}
                onChangeCents={(v) => update({ serviceFeeFixedCents: v })}
                colors={colors}
              />
              <PercentField
                label="Prozentual"
                valueBps={config.serviceFeePercentageBps}
                onChangeBps={(v) => update({ serviceFeePercentageBps: v })}
                colors={colors}
              />
              <EuroField
                label="Maximum"
                valueCents={config.serviceFeeMaxCents}
                onChangeCents={(v) => update({ serviceFeeMaxCents: v })}
                colors={colors}
              />
            </>
          )}
        </Card>

        {/* Zeitfenster */}
        <Card>
          <SectionHeader title="Zeitfenster" colors={colors} />
          <NumberField
            label="Min. Vorlaufzeit"
            value={config.minAdvanceMinutes}
            onChange={(v) => update({ minAdvanceMinutes: v })}
            colors={colors}
            suffix="Min."
          />
          <NumberField
            label="Max. Vorausbestellung"
            value={config.maxAdvanceDays}
            onChange={(v) => update({ maxAdvanceDays: v })}
            colors={colors}
            suffix="Tage"
          />
        </Card>

        {/* Limits */}
        <Card>
          <SectionHeader title="Limits" colors={colors} />
          <EuroField
            label="Mindestbestellwert"
            valueCents={config.minOrderAmountCents}
            onChangeCents={(v) => update({ minOrderAmountCents: v })}
            colors={colors}
          />
          <EuroField
            label="Maximalbestellwert"
            valueCents={config.maxOrderAmountCents}
            onChangeCents={(v) => update({ maxOrderAmountCents: v })}
            colors={colors}
          />
          <NumberField
            label="Max. Warenkorb-Positionen"
            value={config.maxCartSize}
            onChange={(v) => update({ maxCartSize: v ?? 0 })}
            colors={colors}
          />
          <NumberField
            label="Max. Artikelanzahl"
            value={config.maxItemQuantity}
            onChange={(v) => update({ maxItemQuantity: v ?? 0 })}
            colors={colors}
          />
          <EuroField
            label="Max. Trinkgeld"
            valueCents={config.maxTipAmountCents}
            onChangeCents={(v) => update({ maxTipAmountCents: v })}
            colors={colors}
          />
        </Card>

        {/* Zahlung */}
        <Card>
          <SectionHeader title="Zahlung" colors={colors} />
          <ToggleRow
            label="Online-Zahlung"
            value={config.onlinePaymentEnabled}
            onValueChange={(v) => update({ onlinePaymentEnabled: v })}
            colors={colors}
          />
          <ToggleRow
            label="Barzahlung"
            value={config.offlinePaymentEnabled}
            onValueChange={(v) => update({ offlinePaymentEnabled: v })}
            colors={colors}
          />
        </Card>

        {/* Formular */}
        <Card>
          <SectionHeader title="Formular" colors={colors} />
          <ToggleRow
            label="Terminbuchung erforderlich"
            value={config.requiresScheduling}
            onValueChange={(v) => update({ requiresScheduling: v })}
            colors={colors}
          />
          <ToggleRow
            label="Name erforderlich"
            value={config.requiresCustomerName}
            onValueChange={(v) => update({ requiresCustomerName: v })}
            colors={colors}
          />
          <ToggleRow
            label="E-Mail erforderlich"
            value={config.requiresEmail}
            onValueChange={(v) => update({ requiresEmail: v })}
            colors={colors}
          />
          <ToggleRow
            label="Telefon erforderlich"
            value={config.phoneRequired}
            onValueChange={(v) => update({ phoneRequired: v })}
            colors={colors}
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  divider: { height: 1, marginVertical: spacing.sm },
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
