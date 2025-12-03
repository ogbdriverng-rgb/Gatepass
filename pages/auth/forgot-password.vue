<template>
  <div class="min-h-screen bg-base flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary mb-2">Gatepass</h1>
        <p class="text-secondary">WhatsApp Form Builder</p>
      </div>

      <!-- Main Card -->
      <CommonCard class="mb-6">
        <!-- Step 1: Email Input -->
        <template v-if="!emailSent">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-base">Reset Password</h2>
            <p class="text-secondary text-sm mt-1">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <form @submit.prevent="handleForgotPassword" class="space-y-4" autocomplete="on">
            <!-- Email Input -->
            <FormsTextInput
              v-model="form.email"
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              icon="mail"
              :error="errors.email"
              required
            />

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>

            <!-- Error Message -->
            <div v-if="apiError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ apiError }}</p>
            </div>
          </form>
        </template>

        <!-- Step 2: Success Message -->
        <template v-else>
          <div class="text-center">
            <!-- Success Icon -->
            <div class="mb-4 inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 class="text-2xl font-bold text-base mb-2">Check Your Email</h2>
            <p class="text-secondary text-sm mb-6">
              We've sent a password reset link to
              <span class="font-medium text-base">{{ form.email }}</span>
            </p>

            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
              <p class="text-sm text-slate-700 mb-2"><strong>💡 Tip:</strong></p>
              <ul class="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Check your spam folder if you don't see the email</li>
                <li>The link will expire in 24 hours</li>
                <li>Click the link to set a new password</li>
              </ul>
            </div>

            <!-- Resend Link -->
            <p class="text-secondary text-sm mb-4">
              Didn't receive the email?
              <button
                @click="resendResetLink"
                :disabled="isResending"
                class="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {{ isResending ? 'Sending...' : 'Send again' }}
              </button>
            </p>

            <!-- Back to Login -->
            <button
              @click="goBackToLogin"
              class="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
            >
              Back to Login
            </button>
          </div>
        </template>
      </CommonCard>

      <!-- Sign In Link -->
      <div class="text-center">
        <p class="text-secondary text-sm">
          Remember your password?
          <NuxtLink
            to="/auth/login"
            class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>

      <!-- Theme Toggle -->
      <div class="mt-6 flex justify-center">
        <ClientOnly>
          <CommonThemeToggle />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
})

const router = useRouter()
const authStore = useAuthStore()

/* ============ STATE ============ */
const isLoading = ref(false)
const isResending = ref(false)
const emailSent = ref(false)
const apiError = ref<string | null>(null)

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

/* ============ VALIDATION ============ */
const validateEmail = (): boolean => {
  errors.email = ''

  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    return false
  }

  return true
}

/* ============ FORGOT PASSWORD ============ */
const handleForgotPassword = async () => {
  if (!validateEmail()) return

  isLoading.value = true
  apiError.value = null

  try {
    const result = await authStore.forgotPassword(form.email)

    if (!result.success) {
      apiError.value = result.error || 'Failed to send reset email'
      return
    }

    emailSent.value = true
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    console.error('Forgot password error:', error)
  } finally {
    isLoading.value = false
  }
}

/* ============ RESEND RESET LINK ============ */
const resendResetLink = async () => {
  isResending.value = true
  apiError.value = null

  try {
    const result = await authStore.forgotPassword(form.email)

    if (!result.success) {
      apiError.value = result.error || 'Failed to resend reset email'
      return
    }

    // Show temporary success indicator
    const temp = emailSent.value
    emailSent.value = false
    setTimeout(() => {
      emailSent.value = temp
    }, 500)
  } catch (error) {
    apiError.value = 'Failed to resend reset email'
    console.error('Resend error:', error)
  } finally {
    isResending.value = false
  }
}

/* ============ NAVIGATION ============ */
const goBackToLogin = () => {
  router.push('/auth/login')
}
</script>