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
        <!-- STEP 1: Signup Form -->
        <div v-if="step === 'signup'" class="mb-6">
          <h2 class="text-2xl font-bold text-base">Create Account</h2>
          <p class="text-secondary text-sm mt-1">Join thousands of form creators</p>
        </div>

        <form v-if="step === 'signup'" @submit.prevent="handleSignUp" class="space-y-4">
          <!-- Full Name Input -->
          <FormTextInput
            v-model="form.name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            icon="user"
            required
            :error="errors.name"
          />

          <!-- Email Input -->
          <FormTextInput
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            icon="email"
            required
            :error="errors.email"
            @blur="checkEmailAvailability"
          />

          <!-- Phone Input (Optional) -->
          <FormTextInput
            v-model="form.phone"
            type="tel"
            label="Phone Number (Optional)"
            placeholder="+234..."
            icon="phone"
            :error="errors.phone"
          />

          <!-- Password Input -->
          <FormTextInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="••••••••"
            icon="lock"
            required
            helper-text="At least 8 characters with uppercase and number"
            :error="errors.password"
          />

          <!-- Confirm Password Input -->
          <FormTextInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            icon="lock"
            required
            :error="errors.confirmPassword"
          />

          <!-- Terms Agreement -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.agreeTerms"
                type="checkbox"
                class="w-4 h-4 rounded"
              />
              <span class="text-sm text-secondary">
                I agree to the
                <a href="#" class="text-primary hover:text-primary-700">Terms of Service</a>
                and
                <a href="#" class="text-primary hover:text-primary-700">Privacy Policy</a>
              </span>
            </label>
            <p v-if="errors.agreeTerms" class="text-red-500 text-xs mt-1">{{ errors.agreeTerms }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || emailChecking"
            class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <!-- Error Message -->
          <div v-if="apiError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ apiError }}</p>
          </div>
        </form>

        <!-- STEP 2: Email Verification Code -->
        <div v-if="step === 'verify'" class="text-center">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-base mb-2">Verify Your Email</h2>
            <p class="text-secondary text-sm">
              We sent an 8-digit code to <strong>{{ form.email }}</strong>
            </p>
          </div>

          <div class="space-y-4">
            <!-- Code Input -->
            <input
              v-model="verificationCode"
              type="text"
              placeholder="00000000"
              maxlength="8"
              inputmode="numeric"
              class="w-full px-4 py-3 text-center text-3xl tracking-widest font-mono bg-slate-100 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              :class="{ 'border-red-500': codeError }"
            />
            <p v-if="codeError" class="text-red-500 text-xs">{{ codeError }}</p>

            <!-- Verify Button -->
            <button
              @click="verifyCode"
              :disabled="isVerifying || verificationCode.length !== 8"
              class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ isVerifying ? 'Verifying...' : 'Verify Code' }}
            </button>

            <!-- Back Button -->
            <button
              @click="step = 'signup'"
              :disabled="isVerifying"
              class="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              Back
            </button>

            <!-- Resend Code -->
            <div class="pt-4 border-t border-slate-200">
              <p class="text-secondary text-sm mb-2">Didn't receive the code?</p>
              <button
                @click="resendCode"
                :disabled="isResending"
                class="text-primary hover:text-primary-700 text-sm font-semibold disabled:opacity-50"
              >
                {{ isResending ? 'Sending...' : 'Resend Code' }}
              </button>
            </div>
          </div>

          <!-- Verification Error -->
          <div v-if="codeError" class="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
            <p class="text-sm text-red-600">{{ codeError }}</p>
          </div>
        </div>

        <!-- STEP 3: Success -->
        <div v-if="step === 'success'" class="text-center">
          <div class="mb-6">
            <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 class="text-2xl font-bold text-base mb-2">Account Created!</h2>
            <p class="text-secondary text-sm">
              Your account has been verified and created successfully.
            </p>
          </div>

          <div class="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
            <p class="text-sm text-green-600 font-semibold">Redirecting to login...</p>
          </div>
        </div>

        <!-- Divider (only on signup step) -->
        <div v-if="step === 'signup'" class="my-6 flex items-center gap-4">
          <div class="flex-1 h-px bg-slate-300"></div>
          <span class="text-sm text-secondary">Or sign up with</span>
          <div class="flex-1 h-px bg-slate-300"></div>
        </div>

        <!-- OAuth Buttons (only on signup step) -->
        <div v-if="step === 'signup'" class="grid grid-cols-2 gap-3">
          <button
            @click="signUpWithGoogle"
            :disabled="isLoading"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Google
          </button>
          <button
            @click="signUpWithGithub"
            :disabled="isLoading"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            GitHub
          </button>
        </div>
      </CommonCard>

      <!-- Sign In Link (only on signup step) -->
      <div v-if="step === 'signup'" class="text-center">
        <p class="text-secondary text-sm">
          Already have an account?
          <NuxtLink to="/auth/login" class="text-primary hover:text-primary-700 font-medium">
            Sign in
          </NuxtLink>
        </p>
      </div>

      <!-- Theme Toggle -->
      <div class="mt-6 flex justify-center">
        <CommonThemeToggle />
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
const supabase = useSupabaseClient()

/* ============ STATE ============ */
const step = ref<'signup' | 'verify' | 'success'>('signup')
const isLoading = ref(false)
const emailChecking = ref(false)
const isVerifying = ref(false)
const isResending = ref(false)
const apiError = ref<string | null>(null)
const codeError = ref<string | null>(null)
const verificationCode = ref('')
const signUpData = ref<any>(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: '',
})

/* ============ VALIDATION ============ */
const validateForm = (): boolean => {
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.agreeTerms = ''

  let isValid = true

  if (!form.name) {
    errors.name = 'Full name is required'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  if (form.phone && !/^\+?[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number'
    isValid = false
  }

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

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (!form.agreeTerms) {
    errors.agreeTerms = 'You must agree to the terms and privacy policy'
    isValid = false
  }

  return isValid
}

/* ============ CHECK EMAIL EXISTS ============ */
const checkEmailAvailability = async () => {
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return
  }

  emailChecking.value = true
  errors.email = ''

  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', form.email)
      .single()

    if (data) {
      errors.email = 'This email is already registered'
    }
  } catch (err) {
    // Email not found, which is good
  } finally {
    emailChecking.value = false
  }
}

/* ============ SIGN UP ============ */
const handleSignUp = async () => {
  if (!validateForm()) return

  isLoading.value = true
  apiError.value = null

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          role: 'owner',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)

    if (!data.user) {
      throw new Error('Failed to create account')
    }

    signUpData.value = data
    step.value = 'verify'
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : 'Sign up failed'
    console.error('Signup error:', err)
  } finally {
    isLoading.value = false
  }
}

/* ============ VERIFY CODE ============ */
const verifyCode = async () => {
  if (verificationCode.value.length !== 8) {
    codeError.value = 'Please enter an 8-digit code'
    return
  }

  try {
    isVerifying.value = true
    codeError.value = null

    const { data, error } = await supabase.auth.verifyOtp({
      type: 'signup',
      token: verificationCode.value,
      email: form.email,
    })

    if (error) throw new Error(error.message)

    if (!data.user?.id) {
      throw new Error('Verification failed')
    }

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: form.email,
      phone: form.phone || null,
      name: form.name,
      role: 'owner',
      billing_plan: 'free',
      is_active: true,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError && !profileError.message.includes('duplicate')) {
      throw new Error(profileError.message)
    }

    step.value = 'success'

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err) {
    codeError.value = err instanceof Error ? err.message : 'Verification failed'
    console.error('Verification error:', err)
  } finally {
    isVerifying.value = false
  }
}

/* ============ RESEND CODE ============ */
const resendCode = async () => {
  try {
    isResending.value = true
    codeError.value = null

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: form.email,
    })

    if (error) throw new Error(error.message)

    alert('Verification code sent to your email!')
  } catch (err) {
    codeError.value = err instanceof Error ? err.message : 'Failed to resend code'
  } finally {
    isResending.value = false
  }
}

/* ============ OAUTH ============ */
const signUpWithGoogle = async () => {
  isLoading.value = true
  apiError.value = null

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : 'Google sign up failed'
  } finally {
    isLoading.value = false
  }
}

const signUpWithGithub = async () => {
  isLoading.value = true
  apiError.value = null

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : 'GitHub sign up failed'
  } finally {
    isLoading.value = false
  }
}
</script>