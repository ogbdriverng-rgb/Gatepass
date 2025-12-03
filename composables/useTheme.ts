import { ref, computed, watch } from 'vue'

type Theme = 'light' | 'dark' | 'auto'

/**
 * useTheme - Composable for managing theme switching
 * Handles light/dark mode with system preference fallback
 * 
 * Usage:
 * const { theme, isDark, setTheme, toggleTheme } = useTheme()
 */
export const useTheme = () => {
  const theme = ref<Theme>('light')

  /**
   * Resolves the actual theme considering 'auto' preference
   */
  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'auto') {
      if (process.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      return 'light'
    }
    return theme.value
  })

  /**
   * Quick check if dark mode is active
   */
  const isDark = computed(() => resolvedTheme.value === 'dark')

  /**
   * Apply theme to DOM and store preference
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme

    if (process.client) {
      const root = document.documentElement

      // Handle 'auto' mode by listening to system preference
      if (newTheme === 'auto') {
        root.removeAttribute('data-theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      } else {
        root.setAttribute('data-theme', newTheme)
      }

      // Persist preference to localStorage
      localStorage.setItem('gatepass-theme-preference', newTheme)

      // Dispatch custom event for other components to listen
      window.dispatchEvent(
        new CustomEvent('theme-changed', {
          detail: { theme: newTheme, resolvedTheme: resolvedTheme.value },
        })
      )
    }
  }

  /**
   * Cycle through themes: light -> dark -> auto -> light
   */
  const toggleTheme = () => {
    switch (theme.value) {
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('auto')
        break
      case 'auto':
        setTheme('light')
        break
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  const initTheme = () => {
    if (!process.client) return

    // Get saved preference or default to 'auto'
    const saved = localStorage.getItem(
      'gatepass-theme-preference'
    ) as Theme | null
    const initial: Theme = saved || 'auto'

    setTheme(initial)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme.value === 'auto') {
        setTheme('auto') // Re-apply to update resolved theme
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange)
  }

  return {
    theme: computed(() => theme.value),
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
    initTheme,
  }
}