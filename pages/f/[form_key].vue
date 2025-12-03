<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
    <!-- LOADING -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block p-4 bg-blue-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Loading form...</p>
      </div>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center border border-red-200">
        <div class="inline-block p-4 bg-red-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink to="/" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
          Back to Home
        </NuxtLink>
      </div>
    </div>

    <!-- FORM VIEW -->
    <div v-else-if="form" class="max-w-2xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-3">{{ form.title }}</h1>
          <p v-if="form.description" class="text-gray-600 text-lg">{{ form.description }}</p>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Fields -->
          <div v-for="(field, index) in form.fields" :key="field.field_id" class="space-y-2">
            <!-- Label -->
            <label class="block">
              <span class="text-sm font-semibold text-gray-900">
                {{ index + 1 }}. {{ field.prompt }}
                <span v-if="field.validations?.required" class="text-red-500 ml-1">*</span>
              </span>
            </label>

            <!-- Field Input Based on Type -->
            <div class="ml-0">
              <!-- Text Input -->
              <input
                v-if="field.type === 'text'"
                :key="`${field.field_id}-input`"
                v-model="formResponses[field.field_id]"
                type="text"
                :placeholder="`Enter ${field.prompt}`"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />

              <!-- Select Dropdown -->
              <select
                v-else-if="field.type === 'select'"
                :key="`${field.field_id}-select`"
                v-model="formResponses[field.field_id]"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select an option</option>
                <option v-for="option in field.options" :key="option.id" :value="option.label">
                  {{ option.label }}
                </option>
              </select>

              <!-- Text Area -->
              <textarea
                v-else-if="field.type === 'textarea'"
                :key="`${field.field_id}-textarea`"
                v-model="formResponses[field.field_id]"
                :placeholder="`Enter ${field.prompt}`"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />

              <!-- Default fallback -->
              <input
                v-else
                :key="`${field.field_id}-default`"
                v-model="formResponses[field.field_id]"
                type="text"
                :placeholder="`Enter ${field.prompt}`"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-4 py-3 mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>

          <!-- Error Message -->
          <div v-if="submitError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ submitError }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="submitSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-600">✓ Form submitted successfully!</p>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 text-sm text-gray-600">
        <p>Powered by <span class="font-semibold text-gray-900">Gatepass</span></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: false
})

const route = useRoute()

/* STATE */
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)

const form = ref<any>(null)
const formResponses = ref<any>({})

/* LOAD FORM */
const loadForm = async () => {
  isLoading.value = true
  error.value = null

  try {
    const formKey = route.params.form_key as string
    console.log('Loading form with key:', formKey)

    // Use $fetch to call the API
    const response = await $fetch(`/api/forms/public/${formKey}`)

    console.log('API Response:', response)

    if (!response) {
      error.value = 'This form does not exist or is not published'
      return
    }

    form.value = response
    console.log('Form loaded:', form.value)
  } catch (err: any) {
    console.error('Error loading form:', err)
    error.value = err.data?.message || 'Failed to load form. Please try again.'
  } finally {
    isLoading.value = false
  }
}

/* SUBMIT FORM */
const handleSubmit = async () => {
  isSubmitting.value = true
  submitError.value = null
  submitSuccess.value = false

  try {
    // Validate required fields
    if (form.value.fields) {
      for (const field of form.value.fields) {
        if (field.validations?.required && !formResponses.value[field.field_id]) {
          submitError.value = `${field.prompt} is required`
          isSubmitting.value = false
          return
        }
      }
    }

    // Submit responses
    const response = await $fetch(`/api/forms/public/${route.params.form_key}/submit`, {
      method: 'POST',
      body: {
        responses: formResponses.value,
      },
    })

    if (!response) {
      submitError.value = 'Failed to submit form. Please try again.'
      return
    }

    submitSuccess.value = true
    formResponses.value = {}

    // Reset success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false
    }, 3000)
  } catch (err: any) {
    console.error('Submit error:', err)
    submitError.value = err.data?.message || 'An error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

/* LIFECYCLE */
onMounted(() => {
  loadForm()
})
</script>