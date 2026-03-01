import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { useThemeStore } from '../stores/theme-store'
import { supabase } from '../services/supabase'
import { authService } from '../services/auth.service'

/**
 * Bootstrap hook: restores session, hydrates theme, and listens for auth changes.
 * Call once at app root.
 */
export function useAuthBootstrap() {
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const fetchRestaurants = useAuthStore((s) => s.fetchRestaurants)
  const hydrateTheme = useThemeStore((s) => s.hydrate)

  useEffect(() => {
    hydrateTheme()
    restoreSession().then(() => {
      const { user } = useAuthStore.getState()
      if (user) fetchRestaurants()
    })

    // Listen for auth state changes (e.g., token refresh, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const api = authService.getApiClient()
        if (event === 'SIGNED_OUT') {
          api.clearAccessToken()
          useAuthStore.setState({
            user: null,
            session: null,
            availableRestaurants: [],
            currentRestaurantId: null,
          })
        } else if (session) {
          api.setAccessToken(session.access_token)
          useAuthStore.setState({ user: session.user, session })
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])
}
