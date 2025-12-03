import { useThemeStore } from '~/stores/theme'

/**
 * theme.client.ts - Client-side theme plugin
 * Initializes theme system on app startup
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const themeStore = useThemeStore()

  // Initialize theme from localStorage or system preference
  themeStore.initialize()

  // Listen for system theme preference changes (for 'auto' mode)
  if (process.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      // If user has 'auto' mode enabled, reapply theme
      if (themeStore.currentTheme === 'auto') {
        themeStore.applyTheme('auto')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // Cleanup on app unmount (if needed)
    nuxtApp.hook('app:unmounted', () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    })
  }

  return {
    provide: {
      theme: {
        store: themeStore,
      },
    },
  }
})