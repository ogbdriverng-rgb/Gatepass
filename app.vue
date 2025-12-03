<template>
  <div class="min-h-screen bg-base transition-colors duration-base">
    <!-- Main Content -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'

// Initialize theme on app load
const themeStore = useThemeStore()
onMounted(() => {
  themeStore.initialize()
})

// Initialize auth on app load
const authStore = useAuthStore()
onMounted(async () => {
  await authStore.initialize()
})
</script>

<style>
* {
  @apply transition-colors duration-base;
}
</style>