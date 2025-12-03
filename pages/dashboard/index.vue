<template>
  <div class="min-h-screen bg-base">
    <!-- Header -->
    <div class="bg-card border-b border-base shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-base">Welcome back, {{ userName }}</h1>
            <p class="text-secondary mt-1">Here's your form overview</p>
          </div>
          <div class="flex items-center gap-4">
            <CommonThemeToggle />
            <CommonButton
              variant="secondary"
              label="Sign Out"
              @click="handleSignOut"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <svg class="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <p class="text-secondary">Loading your dashboard...</p>
        </div>
      </div>

      <template v-else>
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <!-- Create Form Card -->
          <div 
            @click="goToCreateForm"
            class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <div class="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-base">Create Form</h3>
                <p class="text-sm text-secondary">Build a new form</p>
              </div>
            </div>
          </div>

          <!-- My Forms Card -->
          <div 
            @click="goToForms"
            class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <div class="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <svg class="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-base">My Forms</h3>
                <p class="text-sm text-secondary">{{ formCount }} form(s)</p>
              </div>
            </div>
          </div>

          <!-- Submissions Card -->
          <div 
            @click="goToResponses"
            class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <div class="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-base">Submissions</h3>
                <p class="text-sm text-secondary">{{ submissionCount }} submission(s)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style="animation-delay: 0.1s;">
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
            <p class="text-secondary text-sm">Active Forms</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ activeFormCount }}</p>
          </div>

          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
            <p class="text-secondary text-sm">Total Responses</p>
            <p class="text-3xl font-bold text-secondary mt-2">{{ totalResponses }}</p>
          </div>

          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
            <p class="text-secondary text-sm">Average Responses</p>
            <p class="text-3xl font-bold text-success mt-2">{{ averageResponses }}</p>
          </div>

          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
            <p class="text-secondary text-sm">Plan</p>
            <p class="text-2xl font-bold text-accent capitalize mt-2">{{ userPlan }}</p>
          </div>
        </div>

        <!-- Recent Forms -->
        <div v-if="recentForms.length > 0" class="mb-8 animate-fade-in" style="animation-delay: 0.2s;">
          <div class="p-6 rounded-xl bg-card border border-base">
            <h3 class="text-lg font-bold text-base mb-4">Recent Forms</h3>
            
            <div class="space-y-3">
              <div
                v-for="form in recentForms.slice(0, 5)"
                :key="form.id"
                class="flex items-center justify-between p-4 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-all cursor-pointer group"
                @click="goToForm(form.form_key)"
              >
                <div class="flex-1">
                  <p class="font-medium text-base group-hover:text-primary transition-colors">{{ form.title }}</p>
                  <p class="text-xs text-secondary mt-1">{{ form.total_responses || 0 }} responses • Created {{ formatDate(form.created_at) }}</p>
                </div>
                <div class="flex items-center gap-4 ml-4">
                  <span v-if="form.is_published" class="px-3 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                    Published
                  </span>
                  <span v-else class="px-3 py-1 bg-warning/10 text-warning text-xs rounded-full font-medium">
                    Draft
                  </span>
                  <svg class="w-4 h-4 text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>

            <button
              @click="goToForms"
              class="mt-4 text-primary hover:text-primary-700 text-sm font-medium transition-colors"
            >
              View all forms →
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="mb-8 animate-fade-in" style="animation-delay: 0.2s;">
          <div class="text-center py-12 p-6 rounded-xl bg-card border border-base">
            <div class="inline-block p-4 bg-secondary/10 rounded-full mb-4">
              <svg class="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </div>
            <p class="text-secondary mb-6">You haven't created any forms yet</p>
            <CommonButton
              variant="primary"
              label="Create Your First Form"
              @click="goToCreateForm"
            />
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 animate-fade-in" style="animation-delay: 0.3s;">
          <div class="p-6 rounded-xl bg-card border border-base">
            <h3 class="font-bold text-base mb-4">Form Status Overview</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-secondary">Published</span>
                <span class="font-semibold text-base">{{ activeFormCount }} of {{ formCount }}</span>
              </div>
              <div class="w-full bg-secondary/10 rounded-full h-2.5">
                <div
                  class="bg-gradient-to-r from-primary to-blue-500 h-2.5 rounded-full transition-all duration-500"
                  :style="{ width: formCount > 0 ? (activeFormCount / formCount) * 100 : 0 + '%' }"
                />
              </div>
            </div>
          </div>

          <div class="p-6 rounded-xl bg-card border border-base">
            <h3 class="font-bold text-base mb-4">Responses This Month</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-secondary">Total Submissions</span>
                <span class="font-semibold text-base">{{ totalResponses }}</span>
              </div>
              <p class="text-xs text-secondary">
                {{ totalResponses === 0 ? 'No responses yet' : `Avg ${averageResponses} per form` }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonCard from '~/components/common/Card.vue'
import CommonButton from '~/components/common/Button.vue'
import CommonThemeToggle from '~/components/common/ThemeToggle.vue'
import type { GatpassForm } from '~/composables/useForms'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const router = useRouter()
const authStore = useAuthStore()
const formStore = useFormStore()
const { listForms } = useForms()

/* ============ STATE ============ */
const isLoading = ref(true)
const recentForms = ref<GatpassForm[]>([])

/* ============ COMPUTED ============ */
const userName = computed(() => {
  return authStore.profile?.name?.split(' ')[0] || 'User'
})

const userPlan = computed(() => {
  return authStore.profile?.billing_plan || 'free'
})

// Dynamic data from store
const formCount = computed(() => {
  return formStore.forms.length
})

const submissionCount = computed(() => {
  return formStore.forms.reduce((sum, f) => sum + (f.total_responses || 0), 0)
})

const activeFormCount = computed(() => {
  return formStore.forms.filter(f => f.is_published).length
})

const totalResponses = computed(() => {
  return submissionCount.value
})

const averageResponses = computed(() => {
  if (formCount.value === 0) return 0
  return Math.round(totalResponses.value / formCount.value)
})

/* ============ LOAD DATA ============ */
const loadForms = async () => {
  isLoading.value = true

  try {
    if (authStore.profile?.id) {
      await formStore.loadForms(authStore.profile.id)
      
      // Get recent forms (last 5)
      recentForms.value = formStore.forms.slice(0, 5)
    }
  } catch (error) {
    console.error('Error loading forms:', error)
  } finally {
    isLoading.value = false
  }
}

/* ============ NAVIGATION ============ */
const goToCreateForm = () => {
  router.push('/dashboard/forms/new')
}

const goToForms = () => {
  router.push('/dashboard/forms')
}

const goToResponses = () => {
  router.push('/dashboard/forms')
}

const goToForm = (formKey: string) => {
  router.push(`/dashboard/forms/${formKey}/edit`)
}

const handleSignOut = async () => {
  await authStore.signOut()
}

/* ============ UTILITIES ============ */
const formatDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ============ LIFECYCLE ============ */
onMounted(() => {
  loadForms()
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
  opacity: 0;
}
</style>