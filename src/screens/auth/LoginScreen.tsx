import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../stores/auth-store'
import { useTheme } from '../../stores/theme-store'
import { Button } from '../../components/ui/Button'
import { spacing, fontSize, radii } from '../../theme/tokens'

export function LoginScreen() {
  const { colors } = useTheme()
  const signIn = useAuthStore((s) => s.signIn)
  const fetchRestaurants = useAuthStore((s) => s.fetchRestaurants)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      await fetchRestaurants()
    } catch (err: any) {
      Alert.alert('Anmeldung fehlgeschlagen', err.message ?? 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.foreground }]}>Monalisa</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Dashboard</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="E-Mail"
            placeholderTextColor={colors.mutedLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Passwort"
            placeholderTextColor={colors.mutedLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          <Button
            title="Anmelden"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brand: {
    fontSize: fontSize['4xl'],
    fontWeight: '800',
  },
  subtitle: {
    fontSize: fontSize.lg,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
  },
})
