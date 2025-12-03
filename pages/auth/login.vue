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
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-base">Welcome Back</h2>
          <p class="text-secondary text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Input -->
          <FormTextInput
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            icon="email"
            required
            :error="errors.email"
          />

          <!-- Password Input -->
          <FormTextInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="••••••••"
            icon="lock"
            required
            :error="errors.password"
          />

          <!-- Remember Me + Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-2 border-slate-300 accent-blue-600"
              />
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>

          <!-- Error Message -->
          <div v-if="apiError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ apiError }}</p>
          </div>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-4">
          <div class="flex-1 h-px bg-slate-300"></div>
          <span class="text-sm text-gray-600">Or continue with</span>
          <div class="flex-1 h-px bg-slate-300"></div>
        </div>

        <!-- OAuth Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="signInWithGoogle"
            :disabled="isLoading"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Google
          </button>
          <button
            @click="signInWithGithub"
            :disabled="isLoading"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            GitHub
          </button>
        </div>
      </CommonCard>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="text-gray-600 text-sm">
          Don't have an account?
          <NuxtLink
            to="/auth/signup"
            class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Create one
          </NuxtLink>
        </p>
      </div>

      <!-- Theme Toggle -->
      <div class="mt-8 flex justify-center">
        <CommonThemeToggle :showLabel="true" :showDropdown="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import CommonCard from '~/components/common/Card.vue'
import CommonThemeToggle from '~/components/common/ThemeToggle.vue'
import FormTextInput from '~/components/forms/TextInput.vue'

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
})

const router = useRouter()
const authStore = useAuthStore()

/* ============ STATE ============ */
const isLoading = ref(false)
const apiError = ref<string | null>(null)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  email: '',
  password: '',
})

/* ============ VALIDATION ============ */
const validateForm = (): boolean => {
  errors.email = ''
  errors.password = ''
  let isValid = true

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

/* ============ SIGN IN ============ */
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  apiError.value = null

  try {
    const result = await authStore.signIn({
      email: form.email,
      password: form.password,
    })

    if (!result.success) {
      apiError.value = result.error || 'Sign in failed'
      console.log('Login failed:', result.error)
      return
    }

    console.log('Login successful')
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

/* ============ OAUTH ============ */
const signInWithGoogle = async () => {
  isLoading.value = true
  apiError.value = null

  try {
    const result = await authStore.signInWithOAuth('google')

    if (!result.success) {
      apiError.value = result.error || 'Google sign in failed'
    }
  } catch (error) {
    apiError.value = 'Google sign in failed'
    console.error('Google OAuth error:', error)
  } finally {
    isLoading.value = false
  }
}

const signInWithGithub = async () => {
  isLoading.value = true
  apiError.value = null

  try {
    const result = await authStore.signInWithOAuth('github')

    if (!result.success) {
      apiError.value = result.error || 'GitHub sign in failed'
    }
  } catch (error) {
    apiError.value = 'GitHub sign in failed'
    console.error('GitHub OAuth error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>