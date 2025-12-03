<template>
  <div class="flex h-screen bg-base">
    <!-- Sidebar -->
    <aside class="w-64 bg-card border-r border-base flex flex-col hidden md:flex">
      <!-- Logo -->
      <div class="p-6 border-b border-base">
        <h1 class="text-2xl font-bold text-primary">Gatepass</h1>
        <p class="text-xs text-secondary">Form Builder</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <!-- Dashboard Link -->
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/dashboard', true) ? 'bg-primary text-white' : 'text-secondary hover:bg-secondary'"
        >
          <Icon name="home" class="w-5 h-5" />
          <span class="text-sm font-medium">Dashboard</span>
        </NuxtLink>

        <!-- Forms Link -->
        <NuxtLink
          to="/dashboard/forms"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/dashboard/forms') ? 'bg-primary text-white' : 'text-secondary hover:bg-secondary'"
        >
          <Icon name="clipboard-list" class="w-5 h-5" />
          <span class="text-sm font-medium">My Forms</span>
        </NuxtLink>

        <!-- Create Form Link -->
        <NuxtLink
          to="/dashboard/forms/new"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/dashboard/forms/new') ? 'bg-primary text-white' : 'text-secondary hover:bg-secondary'"
        >
          <Icon name="plus" class="w-5 h-5" />
          <span class="text-sm font-medium">Create Form</span>
        </NuxtLink>

        <div class="my-4 h-px bg-border-primary"></div>

        <!-- Settings Link -->
        <NuxtLink
          to="/dashboard/settings/profile"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/dashboard/settings') ? 'bg-primary text-white' : 'text-secondary hover:bg-secondary'"
        >
          <Icon name="settings" class="w-5 h-5" />
          <span class="text-sm font-medium">Settings</span>
        </NuxtLink>

        <!-- Billing Link -->
        <NuxtLink
          to="/dashboard/billing"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/dashboard/billing') ? 'bg-primary text-white' : 'text-secondary hover:bg-secondary'"
        >
          <Icon name="credit-card" class="w-5 h-5" />
          <span class="text-sm font-medium">Billing</span>
        </NuxtLink>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-base">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-base truncate">{{ userName }}</p>
            <p class="text-xs text-secondary truncate">{{ userEmail }}</p>
          </div>
          <button
            @click="handleSignOut"
            class="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Sign out"
          >
            <Icon name="log-out" class="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-base">
      <div class="flex items-center justify-between p-4">
        <h1 class="text-xl font-bold text-primary">Gatepass</h1>
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2">
          <Icon :name="mobileMenuOpen ? 'x' : 'menu'" class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <nav v-if="mobileMenuOpen" class="p-4 border-t border-base space-y-2">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:bg-secondary"
        >
          <Icon name="home" class="w-5 h-5" />
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/dashboard/forms"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:bg-secondary"
        >
          <Icon name="clipboard-list" class="w-5 h-5" />
          My Forms
        </NuxtLink>
        <NuxtLink
          to="/dashboard/forms/new"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:bg-secondary"
        >
          <Icon name="plus" class="w-5 h-5" />
          Create Form
        </NuxtLink>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Content Area -->
      <div class="flex-1 overflow-auto pt-16 md:pt-0">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const authStore = useAuthStore()

/* ============ STATE ============ */
const mobileMenuOpen = ref(false)

/* ============ COMPUTED ============ */
const userName = computed(() => {
  return authStore.profile?.name || 'User'
})

const userEmail = computed(() => {
  return authStore.profile?.email || ''
})

/* ============ METHODS ============ */
const isActive = (path: string, exact = false) => {
  if (exact) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const handleSignOut = async () => {
  await authStore.signOut()
}
</script>