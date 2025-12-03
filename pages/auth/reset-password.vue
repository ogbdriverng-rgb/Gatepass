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
        <!-- Step 1: Reset Form -->
        <template v-if="!passwordReset">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-base">Create New Password</h2>
            <p class="text-secondary text-sm mt-1">Enter a new password for your account</p>
          </div>

          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <!-- New Password Input -->
            <FormsTextInput
              v-model="form.password"
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon="lock"
              :error="errors.password"
              helperText="At least 8 characters with uppercase and number"
              required
            />

            <!-- Confirm Password Input -->
            <FormsTextInput
              v-model="form.confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon="lock"
              :error="errors.confirmPassword"
              required
            />

            <!-- Password Strength Indicator -->
            <div class="mt-4 p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-20 rounded-lg">
              <p class="text-xs font-medium text-secondary mb-2">Password Requirements:</p>
              <div class="space-y-1 text-xs text-secondary">
                <div :class="{ 'text-success': form.password.length >= 8 }">
                  ✓ At least 8 characters
                </div>
                <div :class="{ 'text-success': /[A-Z]/.test(form.password) }">
                  ✓ One uppercase letter
                </div>
                <div :class="{ 'text-success': /[0-9]/.test(form.password) }">
                  ✓ One number
                </div>
                <div :class="{ 'text-success': form.password === form.confirmPassword && form.password }">
                  ✓ Passwords match
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <CommonButton
              variant="primary"
              type="submit"
              label="Reset Password"
              fullWidth
              :disabled="isLoading"
            />

            <!-- Error Message -->
            <div v-if="apiError" class="p-3 bg-error bg-opacity-10 border border-error rounded-lg">
              <p class="text-sm text-error">{{ apiError }}</p>
            </div>
          </form>
        </template>

        <!-- Step 2: Success Message -->
        <template v-else>
          <div class="text-center">
            <!-- Success Icon -->
            <div class="mb-4 inline-flex items-center justify-center w-12 h-12 bg-success bg-opacity-10 rounded-full">
              <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 class="text-2xl font-bold text-base mb-2">Password Reset Successful</h2>
            <p class="text-secondary text-sm mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>

            <div class="bg-success bg-opacity-10 border border-success border-opacity-20 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-2 text-sm text-success">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your account is secure</span>
              </div>
            </div>

            <!-- Sign In Button -->
            <CommonButton
              variant="primary"
              label="Sign In"
              fullWidth
              @click="goToLogin"
            />
          </div>
        </template>
      </CommonCard>

      <!-- Theme Toggle -->
      <div class="mt-6 flex justify-center">
        <CommonThemeToggle />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
})

const router = useRouter()
const { resetPassword } = useAuth()

/* ============ STATE ============ */
const isLoading = ref(false)
const passwordReset = ref(false)
const apiError = ref<string | null>(null)
const hasValidToken = ref(true)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  password: '',
  confirmPassword: '',
})

/* ============ CHECK TOKEN ON MOUNT ============ */
onMounted(() => {
  // Check if user has valid reset token
  // This is typically handled by Supabase in the session
  // If no valid token, redirect back to forgot password

  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('access_token')
  const refreshToken = urlParams.get('refresh_token')

  if (!accessToken) {
    hasValidToken.value = false
    apiError.value = 'Invalid or expired password reset link. Please request a new one.'
  }
})

/* ============ VALIDATION ============ */
const validateForm = (): boolean => {
  errors.password = ''
  errors.confirmPassword = ''

  let isValid = true

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = 'Password must contain at least one uppercase letter'
    isValid = false
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = 'Password must contain at least one number'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

/* ============ RESET PASSWORD ============ */
const handleResetPassword = async () => {
  if (!hasValidToken.value) {
    apiError.value = 'Invalid or expired password reset link'
    return
  }

  if (!validateForm()) return

  isLoading.value = true
  apiError.value = null

  try {
    const result = await resetPassword(form.confirmPassword)

    if (!result.success) {
      apiError.value = result.error || 'Failed to reset password'
      return
    }

    passwordReset.value = true

    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  } catch (error) {
    apiError.value = 'An unexpected error occurred. Please try again.'
    console.error('Reset password error:', error)
  } finally {
    isLoading.value = false
  }
}

/* ============ NAVIGATION ============ */
const goToLogin = () => {
  router.push('/auth/login')
}
</script>