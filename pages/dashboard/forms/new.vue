<template>
  <div class="min-h-screen bg-base">
    <!-- Header -->
    <div class="bg-card border-b border-base">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-base">Create New Form</h1>
        <p class="text-secondary mt-1">Start building your form</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-12 max-w-2xl">
      <!-- Wizard Steps -->
      <div class="flex gap-4 mb-12">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex-1"
        >
          <div
            :class="[
              'h-1 rounded-full mb-2 transition-colors',
              currentStep > index ? 'bg-success' : currentStep === index ? 'bg-primary' : 'bg-border-primary',
            ]"
          />
          <p :class="['text-xs font-medium', currentStep >= index ? 'text-base' : 'text-secondary']">
            {{ step }}
          </p>
        </div>
      </div>

      <!-- Step 1: Form Details -->
      <Card v-if="currentStep === 0" class="mb-6">
        <h2 class="text-2xl font-bold text-base mb-6">Form Details</h2>

        <div class="space-y-6">
          <!-- Title -->
          <div>
            <TextInput
              :model-value="formData.title"
              label="Form Title"
              placeholder="e.g., Event Registration, Customer Feedback"
              icon="heading-1"
              :error="errors.title"
              required
              @update:model-value="formData.title = $event"
              @blur="validateTitle"
            />
            <p class="text-xs text-secondary mt-2">Give your form a clear, descriptive title</p>
          </div>

          <!-- Description -->
          <div>
            <label class="label block text-sm font-semibold text-base mb-2">Description (Optional)</label>
            <textarea
              v-model="formData.description"
              placeholder="Add a description to help respondents understand what this form is about"
              class="w-full px-4 py-2 border-2 border-base rounded-lg bg-secondary bg-opacity-10 text-base outline-none focus:border-primary transition-colors resize-none"
              rows="4"
            />
            <p class="text-xs text-secondary mt-2">
              {{ formData.description?.length || 0 }} / 500 characters
            </p>
          </div>

          <!-- Slug -->
          <div>
            <TextInput
              :model-value="formData.slug"
              label="URL Slug"
              placeholder="form-slug (auto-generated if empty)"
              icon="link"
              :error="errors.slug"
              @update:model-value="formData.slug = $event"
            />
            <p class="text-xs text-secondary mt-2">
              Used in your form's public URL
            </p>
          </div>
        </div>
      </Card>

      <!-- Step 2: Form Type Selection -->
      <Card v-if="currentStep === 1" class="mb-6">
        <h2 class="text-2xl font-bold text-base mb-6">Form Type</h2>

        <p class="text-secondary mb-6">Select a template or start from scratch</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Blank Form -->
          <div
            @click="formData.template = 'blank'"
            :class="[
              'p-6 rounded-lg border-2 cursor-pointer transition-all',
              formData.template === 'blank'
                ? 'bg-primary bg-opacity-10 border-primary'
                : 'bg-card border-base hover:border-primary',
            ]"
          >
            <Icon name="square" size="8" color="primary" class="mb-3" />
            <h3 class="font-semibold text-base mb-1">Blank Form</h3>
            <p class="text-sm text-secondary">Start from scratch with an empty form</p>
          </div>

          <!-- Event Registration Template -->
          <div
            @click="formData.template = 'event'"
            :class="[
              'p-6 rounded-lg border-2 cursor-pointer transition-all',
              formData.template === 'event'
                ? 'bg-primary bg-opacity-10 border-primary'
                : 'bg-card border-base hover:border-primary',
            ]"
          >
            <Icon name="calendar" size="8" color="secondary" class="mb-3" />
            <h3 class="font-semibold text-base mb-1">Event Registration</h3>
            <p class="text-sm text-secondary">Pre-built template for events</p>
          </div>

          <!-- Feedback Template -->
          <div
            @click="formData.template = 'feedback'"
            :class="[
              'p-6 rounded-lg border-2 cursor-pointer transition-all',
              formData.template === 'feedback'
                ? 'bg-primary bg-opacity-10 border-primary'
                : 'bg-card border-base hover:border-primary',
            ]"
          >
            <Icon name="chat-bubble" size="8" color="secondary" class="mb-3" />
            <h3 class="font-semibold text-base mb-1">Feedback Form</h3>
            <p class="text-sm text-secondary">Collect customer or product feedback</p>
          </div>

          <!-- Survey Template -->
          <div
            @click="formData.template = 'survey'"
            :class="[
              'p-6 rounded-lg border-2 cursor-pointer transition-all',
              formData.template === 'survey'
                ? 'bg-primary bg-opacity-10 border-primary'
                : 'bg-card border-base hover:border-primary',
            ]"
          >
            <Icon name="list" size="8" color="secondary" class="mb-3" />
            <h3 class="font-semibold text-base mb-1">Survey</h3>
            <p class="text-sm text-secondary">Create a comprehensive survey</p>
          </div>
        </div>
      </Card>

      <!-- Step 3: Review -->
      <Card v-if="currentStep === 2" class="mb-6">
        <h2 class="text-2xl font-bold text-base mb-6">Review Your Form</h2>

        <div class="space-y-4 p-4 bg-secondary bg-opacity-10 rounded-lg mb-6">
          <div>
            <p class="text-xs text-secondary mb-1">Title</p>
            <p class="font-semibold text-base">{{ formData.title }}</p>
          </div>

          <div>
            <p class="text-xs text-secondary mb-1">Description</p>
            <p class="text-sm text-secondary">{{ formData.description || '(No description)' }}</p>
          </div>

          <div>
            <p class="text-xs text-secondary mb-1">Template</p>
            <p class="text-sm text-base capitalize">{{ formData.template }}</p>
          </div>

          <div>
            <p class="text-xs text-secondary mb-1">URL Slug</p>
            <p class="text-sm font-mono text-base">{{ formData.slug || '(auto-generated)' }}</p>
          </div>
        </div>

        <p class="text-sm text-secondary mb-6">
          ✓ You'll be able to add and edit fields after creating your form
        </p>
      </Card>

      <!-- Navigation Buttons -->
      <div class="flex gap-3">
        <Button
          v-if="currentStep > 0"
          variant="secondary"
          label="Back"
          @click="previousStep"
        />

        <div class="flex-1" />

        <Button
          v-if="currentStep < steps.length - 1"
          variant="primary"
          label="Next"
          :disabled="!canProceed"
          @click="nextStep"
        />

        <Button
          v-else
          variant="primary"
          label="Create Form"
          :disabled="isCreating"
          @click="createNewForm"
        />
      </div>

      <!-- Error Message -->
      <div v-if="apiError" class="mt-4 p-3 bg-error bg-opacity-10 border border-error rounded-lg">
        <p class="text-sm text-error">{{ apiError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '~/components/common/Card.vue'
import TextInput from '~/components/forms/TextInput.vue'
import Button from '~/components/common/Button.vue'
import Icon from '~/components/common/Icon.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const router = useRouter()
const authStore = useAuthStore()
const formStore = useFormStore()
const { createForm } = useForms()

/* ============ STATE ============ */
const currentStep = ref(0)
const isCreating = ref(false)
const apiError = ref<string | null>(null)

const steps = ['Form Details', 'Form Type', 'Review']

const formData = ref({
  title: '',
  description: '',
  slug: '',
  template: 'blank',
})

const errors = ref({
  title: '',
  slug: '',
})

/* ============ COMPUTED ============ */
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return formData.value.title.trim().length >= 3
  }
  if (currentStep.value === 1) {
    return !!formData.value.template
  }
  return true
})

/* ============ METHODS ============ */
const validateTitle = () => {
  errors.value.title = ''
  if (formData.value.title.trim().length < 3) {
    errors.value.title = 'Title must be at least 3 characters'
  }
}

const generateSlug = () => {
  if (!formData.value.slug) {
    formData.value.slug = formData.value.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
}

const nextStep = () => {
  if (currentStep.value === 0) {
    validateTitle()
    if (errors.value.title) return
    generateSlug()
  }

  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const createNewForm = async () => {
  if (isCreating.value) return

  isCreating.value = true
  apiError.value = null

  try {
    validateTitle()
    if (errors.value.title) {
      isCreating.value = false
      return
    }

    const result = await createForm({
      title: formData.value.title,
      description: formData.value.description,
      slug: formData.value.slug,
    })

    if (!result.success) {
      apiError.value = result.error || 'Failed to create form'
      return
    }

    if (result.form) {
      // Load template fields if selected
      if (formData.value.template !== 'blank') {
        await applyTemplate(result.form.id, formData.value.template)
      }

      formStore.addFormToList(result.form as any)

      // Redirect to form editor
      router.push(`/dashboard/forms/${result.form.form_key}/edit`)
    }
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : 'An error occurred'
  } finally {
    isCreating.value = false
  }
}

const applyTemplate = async (formId: string, template: string) => {
  // Template fields to add
  const templates: Record<string, Array<{ type: string; label: string; placeholder?: string }>> = {
    event: [
      { type: 'text', label: 'Full Name', placeholder: 'John Doe' },
      { type: 'email', label: 'Email Address', placeholder: 'john@example.com' },
      { type: 'tel', label: 'Phone Number', placeholder: '+234...' },
      { type: 'select', label: 'Will you be attending?' },
      { type: 'select', label: 'Number of guests' },
      { type: 'textarea', label: 'Any dietary restrictions?' },
    ],
    feedback: [
      { type: 'text', label: 'Your Name' },
      { type: 'email', label: 'Email Address' },
      { type: 'select', label: 'How satisfied are you?' },
      { type: 'textarea', label: 'What can we improve?' },
      { type: 'multiselect', label: 'What did you like most?' },
    ],
    survey: [
      { type: 'text', label: 'Your Name' },
      { type: 'email', label: 'Email Address' },
      { type: 'select', label: 'Age Group' },
      { type: 'multiselect', label: 'Which topics interest you?' },
      { type: 'rating', label: 'Overall experience' },
      { type: 'textarea', label: 'Additional comments' },
    ],
  }

  const fields = templates[template] || []
  const { addField } = useForms()

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    await addField(formId, {
      field_key: `field_${i}`,
      type: field.type as any,
      label: field.label,
      placeholder: field.placeholder || '',
      is_required: i === 0, // First field required
      order_idx: i,
      meta: {
        options: [],
        validations: {},
        conditional_logic: [],
      },
    })
  }
}
</script>