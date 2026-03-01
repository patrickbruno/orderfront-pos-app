import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { RootNavigator } from './src/navigation/RootNavigator'
import { useAuthBootstrap } from './src/hooks/use-auth'
import { useRealtimeOrders } from './src/hooks/use-realtime-orders'
import { useThemeStore } from './src/stores/theme-store'

function AppInner() {
  useAuthBootstrap()
  useRealtimeOrders()
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  )
}
