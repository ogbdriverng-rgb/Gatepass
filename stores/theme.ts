import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type Theme = 'light' | 'dark' | 'auto'
type SponsorTheme = 'default' | string

/**
 * useThemeStore - Pinia store for global theme management
 * Handles theme switching, dark mode, and sponsor branding
 * 
 * Usage:
 * const themeStore = useThemeStore()
 * themeStore.setTheme('dark')
 */
export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')
  const sponsorTheme = ref<SponsorTheme>('default')

  const isDark = computed(() => {
    if (currentTheme.value === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return false
    }
    return currentTheme.value === 'dark'
  })

  /**
   * Set the active theme
   */
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme(theme)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gatepass-theme', theme)
    }
  }

  /**
   * Apply theme to DOM elements
   */
  const applyTheme = (theme: Theme) => {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    if (theme === 'auto') {
      root.removeAttribute('data-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }

    // Dispatch event for external listeners
    window.dispatchEvent(
      new CustomEvent('theme-applied', {
        detail: { theme, isDark: isDark.value },
      })
    )
  }

  /**
   * Set sponsor/brand theme
   * This loads sponsor-specific CSS overrides
   */
  const setSponsorTheme = (sponsor: SponsorTheme) => {
    sponsorTheme.value = sponsor

    if (sponsor !== 'default' && typeof document !== 'undefined') {
      loadSponsorTheme(sponsor)
    }
  }

  /**
   * Load sponsor theme CSS file dynamically
   */
  const loadSponsorTheme = async (sponsor: string) => {
    if (typeof document === 'undefined') return

    try {
      // Check if sponsor theme is already loaded
      const existing = document.getElementById(`sponsor-theme-${sponsor}`)
      if (existing) return

      const link = document.createElement('link')
      link.id = `sponsor-theme-${sponsor}`
      link.rel = 'stylesheet'
      link.href = `/css/themes/sponsors/${sponsor}.css`

      link.onerror = () => {
        console.warn(`Failed to load sponsor theme: ${sponsor}`)
        link.remove()
      }

      document.head.appendChild(link)
    } catch (error) {
      console.error(`Error loading sponsor theme: ${sponsor}`, error)
    }
  }

  /**
   * Toggle between light, dark, and auto
   */
  const toggleTheme = () => {
    switch (currentTheme.value) {
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
   * Initialize store from localStorage
   */
  const initialize = () => {
    if (typeof localStorage === 'undefined') return

    const saved = localStorage.getItem('gatepass-theme') as Theme | null
    const theme: Theme = saved || 'auto'
    setTheme(theme)
  }

  /**
   * Get CSS variable value
   */
  const getCSSVariable = (variableName: string): string => {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim()
  }

  /**
   * Set CSS variable value (for dynamic customization)
   */
  const setCSSVariable = (variableName: string, value: string) => {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty(variableName, value)
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    sponsorTheme: computed(() => sponsorTheme.value),
    isDark,
    setTheme,
    setSponsorTheme,
    toggleTheme,
    applyTheme,
    initialize,
    getCSSVariable,
    setCSSVariable,
  }
})