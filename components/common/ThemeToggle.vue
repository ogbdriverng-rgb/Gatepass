<!-- ============ THEME TOGGLE COMPONENT ============ -->
<template>
  <div class="flex items-center gap-2">
    <!-- Theme Toggle Button -->
    <button
      class="p-2 rounded-lg transition-all duration-base"
      :class="{
        'bg-secondary text-neutral-0': themeStore.isDark,
        'bg-neutral-200 text-neutral-900': !themeStore.isDark,
      }"
      :title="`Switch to ${getNextTheme()} theme`"
      @click="themeStore.toggleTheme()"
    >
      <!-- Sun Icon for Dark Mode -->
      <svg v-if="themeStore.isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v4m0 12v4m10-10h-4M4 12H0m16.485-7.071l-2.828 2.828m-11.314 11.314l-2.828 2.828m0-16.97l2.828 2.828m11.314 11.314l2.828 2.828"/>
      </svg>
      
      <!-- Moon Icon for Light Mode -->
      <svg v-else-if="themeStore.currentTheme !== 'auto'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      
      <!-- Monitor Icon for Auto Mode -->
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20m0 0l-.75 3M9 20h6m-.75-3l.75 3m0 0l.75-3M15 17v3m0 0v3"/>
        <rect x="3" y="3" width="18" height="12" rx="2" ry="2"/>
      </svg>
    </button>

    <!-- Theme Label -->
    <span v-if="showLabel" class="text-xs font-medium text-secondary">
      {{ formatThemeName(themeStore.currentTheme) }}
    </span>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="relative group">
      <button class="p-2 rounded-lg hover:bg-secondary hover:bg-opacity-10">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      <div
        class="absolute right-0 mt-1 w-40 bg-card rounded-lg shadow-lg border border-base hidden group-hover:block z-dropdown"
      >
        <button
          v-for="t in themes"
          :key="t"
          class="w-full text-left px-4 py-2 hover:bg-secondary hover:bg-opacity-10 transition-colors text-sm flex items-center gap-2"
          :class="{
            'font-bold text-primary': themeStore.currentTheme === t,
            'text-secondary': themeStore.currentTheme !== t,
          }"
          @click="themeStore.setTheme(t)"
        >
          <!-- Sun Icon -->
          <svg v-if="t === 'light'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v4m0 12v4m10-10h-4M4 12H0m16.485-7.071l-2.828 2.828m-11.314 11.314l-2.828 2.828m0-16.97l2.828 2.828m11.314 11.314l2.828 2.828"/>
          </svg>
          
          <!-- Moon Icon -->
          <svg v-else-if="t === 'dark'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          
          <!-- Monitor Icon -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20m0 0l-.75 3M9 20h6m-.75-3l.75 3m0 0l.75-3M15 17v3m0 0v3"/>
            <rect x="3" y="3" width="18" height="12" rx="2" ry="2"/>
          </svg>
          
          {{ formatThemeName(t) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

export interface Props {
  showLabel?: boolean
  showDropdown?: boolean
}

withDefaults(defineProps<Props>(), {
  showLabel: false,
  showDropdown: false,
})

const themeStore = useThemeStore()

type Theme = 'light' | 'dark' | 'auto'
const themes: Theme[] = ['light', 'dark', 'auto']

const getNextTheme = (): string => {
  switch (themeStore.currentTheme) {
    case 'light':
      return 'Dark'
    case 'dark':
      return 'Auto'
    case 'auto':
      return 'Light'
  }
}

const formatThemeName = (theme: Theme): string => {
  return theme.charAt(0).toUpperCase() + theme.slice(1)
}
</script>