import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightColors, darkColors, type ColorPalette } from '../theme/tokens'

const STORAGE_KEY = 'dashboard:theme'

interface ThemeState {
  isDark: boolean
  colors: ColorPalette
  toggle: () => void
  hydrate: () => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  colors: lightColors,

  toggle: () => {
    const next = !get().isDark
    set({ isDark: next, colors: next ? darkColors : lightColors })
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isDark: next }))
  },

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.isDark) {
          set({ isDark: true, colors: darkColors })
        }
      } catch {
        // Corrupted storage, ignore
      }
    }
  },
}))

export function useTheme() {
  const isDark = useThemeStore((s) => s.isDark)
  const colors = useThemeStore((s) => s.colors)
  const toggle = useThemeStore((s) => s.toggle)
  return { isDark, colors, toggle }
}
