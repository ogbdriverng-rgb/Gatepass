<template>
  <div class="min-h-screen bg-base">
    <!-- Header -->
    <div class="bg-card border-b border-base sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-base">My Forms</h1>
            <p class="text-secondary mt-1">Create and manage your forms</p>
          </div>
          <NuxtLink to="/dashboard/forms/new" class="inline-block">
            <CommonButton variant="primary" label="Create Form" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Search forms..."
            class="w-full px-4 py-2 border-2 border-base rounded-lg bg-card text-base focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <select
          v-model="filterStatus"
          class="px-4 py-2 border-2 border-base rounded-lg bg-card text-base focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">All Forms</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select
          v-model="sortBy"
          class="px-4 py-2 border-2 border-base rounded-lg bg-card text-base focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="responses">Most Responses</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style="animation-delay: 0.1s;">
        <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
          <p class="text-secondary text-sm">Total Forms</p>
          <p class="text-3xl font-bold text-primary mt-2">{{ formStore.totalForms }}</p>
        </div>

        <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
          <p class="text-secondary text-sm">Published</p>
          <p class="text-3xl font-bold text-success mt-2">{{ formStore.publishedForms }}</p>
        </div>

        <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
          <p class="text-secondary text-sm">Drafts</p>
          <p class="text-3xl font-bold text-warning mt-2">{{ formStore.draftForms }}</p>
        </div>

        <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all">
          <p class="text-secondary text-sm">Total Responses</p>
          <p class="text-3xl font-bold text-accent mt-2">{{ totalResponses }}</p>
        </div>
      </div>

      <!-- Forms List -->
      <div v-if="filteredForms.length > 0" class="space-y-3 animate-fade-in" style="animation-delay: 0.2s;">
        <div
          v-for="form in filteredForms"
          :key="form.id"
          class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
          @click="navigateToForm(form.id, form.form_key)"
        >
          <div class="flex items-center justify-between">
            <!-- Form Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-semibold text-base group-hover:text-primary transition-colors">{{ form.title }}</h3>
                <span
                  :class="[
                    'px-3 py-1 text-xs rounded-full font-medium',
                    form.is_published
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning',
                  ]"
                >
                  {{ form.is_published ? 'Published' : 'Draft' }}
                </span>
              </div>

              <p v-if="form.description" class="text-sm text-secondary mb-3">
                {{ truncate(form.description, 100) }}
              </p>

              <div class="flex flex-wrap gap-4 text-xs text-secondary">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  {{ form.total_responses }} response(s)
                </span>
                <span class="font-mono bg-secondary/10 px-2 py-1 rounded">{{ form.form_key }}</span>
                <span>{{ formatDate(form.created_at) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 ml-4" @click.stop>
              <button
                @click.stop="copyFormLink(form.form_key)"
                class="p-2 hover:bg-secondary/20 rounded-lg transition-colors text-secondary hover:text-primary"
                title="Copy form link"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </button>

              <div class="relative">
                <button
                  @click.stop="toggleMenu(form.id)"
                  class="p-2 hover:bg-secondary/20 rounded-lg transition-colors text-secondary hover:text-primary"
                  title="More options"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="openMenuId === form.id"
                  class="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-base z-50"
                >
                  <button
                    @click.stop="editForm(form.id, form.form_key)"
                    class="w-full text-left px-4 py-2 hover:bg-secondary/10 text-sm text-base transition-colors first:rounded-t-lg"
                  >
                    Edit
                  </button>
                  <button
                    @click.stop="duplicateForm(form.id)"
                    class="w-full text-left px-4 py-2 hover:bg-secondary/10 text-sm text-base transition-colors"
                  >
                    Duplicate
                  </button>
                  <button
                    @click.stop="viewResponses(form.id)"
                    class="w-full text-left px-4 py-2 hover:bg-secondary/10 text-sm text-base transition-colors"
                  >
                    View Responses
                  </button>
                  <button
                    @click.stop="viewAnalytics(form.id)"
                    class="w-full text-left px-4 py-2 hover:bg-secondary/10 text-sm text-base transition-colors"
                  >
                    Analytics
                  </button>
                  <div class="h-px bg-border-primary" />
                  <button
                    @click.stop="showDeleteConfirm(form.id)"
                    class="w-full text-left px-4 py-2 hover:bg-error/10 text-error text-sm transition-colors last:rounded-b-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 p-6 rounded-xl bg-card border border-base animate-fade-in">
        <div class="inline-block p-4 bg-secondary/10 rounded-full mb-4">
          <svg class="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
          </svg>
        </div>
        <p class="text-secondary mb-4">{{ search ? 'No forms found' : 'You have no forms yet' }}</p>
        <NuxtLink v-if="!search" to="/dashboard/forms/new" class="inline-block">
          <CommonButton variant="primary" label="Create Your First Form" />
        </NuxtLink>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteConfirmId"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="deleteConfirmId = null"
    >
      <div 
        class="w-full max-w-sm p-6 rounded-xl bg-card border border-base shadow-xl animate-fade-in"
        @click.stop
      >
        <h3 class="text-xl font-bold text-base mb-2">Delete Form?</h3>
        <p class="text-secondary mb-6">This action cannot be undone. All form data will be deleted.</p>

        <div class="flex gap-3">
          <CommonButton
            variant="secondary"
            label="Cancel"
            @click="deleteConfirmId = null"
          />
          <CommonButton
            variant="primary"
            label="Delete"
            @click="confirmDelete"
            :disabled="isDeleting"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonCard from '~/components/common/Card.vue'
import CommonButton from '~/components/common/Button.vue'
import type { GatpassForm } from '~/composables/useForms'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const router = useRouter()
const authStore = useAuthStore()
const formStore = useFormStore()
const { listForms, deleteForm, createForm } = useForms()

/* ============ STATE ============ */
const search = ref('')
const filterStatus = ref('')
const sortBy = ref('newest')
const deleteConfirmId = ref<string | null>(null)
const isDeleting = ref(false)
const isLoading = ref(true)
const openMenuId = ref<string | null>(null)

/* ============ COMPUTED ============ */
const filteredForms = computed(() => {
  let result = formStore.forms

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(
      f =>
        f.title.toLowerCase().includes(searchLower) ||
        f.description?.toLowerCase().includes(searchLower) ||
        f.form_key.includes(searchLower)
    )
  }

  // Status filter
  if (filterStatus.value) {
    if (filterStatus.value === 'published') {
      result = result.filter(f => f.is_published)
    } else if (filterStatus.value === 'draft') {
      result = result.filter(f => !f.is_published)
    }
  }

  // Sorting
  switch (sortBy.value) {
    case 'oldest':
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'responses':
      result.sort((a, b) => (b.total_responses || 0) - (a.total_responses || 0))
      break
    case 'name':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return result
})

const totalResponses = computed(() => {
  return formStore.forms.reduce((sum, f) => sum + (f.total_responses || 0), 0)
})

/* ============ METHODS ============ */
const loadForms = async () => {
  isLoading.value = true
  try {
    if (authStore.profile?.id) {
      await formStore.loadForms(authStore.profile.id)
    }
  } catch (error) {
    console.error('Error loading forms:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleMenu = (formId: string) => {
  openMenuId.value = openMenuId.value === formId ? null : formId
}

const navigateToForm = (formId: string, formKey: string) => {
  openMenuId.value = null
  router.push(`/dashboard/forms/${formKey}/edit`)
}

const editForm = (formId: string, formKey: string) => {
  openMenuId.value = null
  router.push(`/dashboard/forms/${formKey}/edit`)
}

const viewResponses = (formId: string) => {
  openMenuId.value = null
  // Phase 3
  console.log('View responses for:', formId)
}

const viewAnalytics = (formId: string) => {
  openMenuId.value = null
  // Phase 3
  console.log('View analytics for:', formId)
}

const duplicateForm = async (formId: string) => {
  openMenuId.value = null
  const form = formStore.forms.find(f => f.id === formId)
  if (!form) return

  const newForm = await createForm({
    title: `${form.title} (Copy)`,
    description: form.description,
    slug: `${form.slug}-copy-${Date.now()}`,
  })

  if (newForm.success) {
    await loadForms()
  }
}

const copyFormLink = async (formKey: string) => {
  const link = `${window.location.origin}/f/${formKey}`
  await navigator.clipboard.writeText(link)
  // You can add a toast notification here
}

const showDeleteConfirm = (formId: string) => {
  openMenuId.value = null
  deleteConfirmId.value = formId
}

const confirmDelete = async () => {
  if (!deleteConfirmId.value) return

  isDeleting.value = true
  try {
    const result = await deleteForm(deleteConfirmId.value)
    if (result.success) {
      formStore.removeFromList(deleteConfirmId.value)
      deleteConfirmId.value = null
    }
  } catch (error) {
    console.error('Error deleting form:', error)
  } finally {
    isDeleting.value = false
  }
}

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
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