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
        <div v-if="!verificationComplete" class="text-center">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-base mb-2">Verify Your Email</h2>
            <p class="text-secondary text-sm">
              We sent a verification link to your email. Click it to activate your account.
            </p>
          </div>

          <!-- Auto Verification Message -->
          <div v-if="isVerifying" class="space-y-4">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p class="text-secondary text-sm">Verifying your email...</p>
          </div>

          <!-- Manual Code Entry -->
          <div v-else-if="!tokenFound" class="space-y-4">
            <p class="text-secondary text-sm mb-4">Or enter the verification code from your email:</p>
            
            <div class="space-y-3">
              <input
                v-model="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="w-full px-4 py-3 bg-slate-100 border-2 border-slate-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-primary"
              />

              <button
                @click="verifyWithCode"
                :disabled="isVerifying || verificationCode.length !== 6"
                class="w-full px-4 py-3 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {{ isVerifying ? 'Verifying...' : 'Verify Code' }}
              </button>
            </div>

            <!-- Resend -->
            <div class="mt-6 pt-6 border-t border-slate-200">
              <p class="text-secondary text-sm mb-3">Didn't receive the email?</p>
              <button
                @click="resendVerificationEmail"
                :disabled="isResending"
                class="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {{ isResending ? 'Sending...' : 'Resend Verification Email' }}
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="verificationError && !isVerifying" class="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
            <p class="text-sm text-red-600">{{ verificationError }}</p>
          </div>

          <!-- Success Redirect Message -->
          <div v-if="tokenFound && isVerifying" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-600">Verification link detected. Verifying...</p>
          </div>
        </div>

        <!-- Success State -->
        <div v-else class="text-center">
          <div class="mb-6">
            <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 class="text-2xl font-bold text-base mb-2">Email Verified!</h2>
            <p class="text-secondary text-sm">
              Your account is now active. You can sign in to your account.
            </p>
          </div>

          <div class="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
            <p class="text-sm text-green-600 font-semibold">Account activation complete!</p>
          </div>

          <NuxtLink
            to="/auth/login"
            class="block w-full px-4 py-3 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold transition text-center"
          >
            Go to Sign In
          </NuxtLink>
        </div>
      </CommonCard>

      <!-- Back Link -->
      <div class="text-center">
        <NuxtLink to="/auth/signup" class="text-primary hover:text-primary-700 text-sm font-medium">
          ← Back to Sign Up
        </NuxtLink>
      </div>

      <!-- Theme Toggle -->
      <div class="mt-6 flex justify-center">
        <CommonThemeToggle />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
})

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

/* ============ STATE ============ */
const isVerifying = ref(false)
const verificationComplete = ref(false)
const verificationError = ref<string | null>(null)
const isResending = ref(false)
const verificationCode = ref('')
const tokenFound = ref(false)

/* ============ VERIFY EMAIL ON MOUNT ============ */
onMounted(async () => {
  try {
    // Check if there's a token in the URL hash
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))

    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (accessToken && type === 'signup') {
      tokenFound.value = true
      isVerifying.value = true
      await autoVerifyWithToken(accessToken)
    }
  } catch (err) {
    verificationError.value = err instanceof Error ? err.message : 'An error occurred'
    isVerifying.value = false
  }
})

/* ============ AUTO VERIFY WITH TOKEN ============ */
const autoVerifyWithToken = async (token: string) => {
  try {
    isVerifying.value = true
    verificationError.value = null

    // Exchange token for session
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'email_change',
      token,
      email: route.query.email as string || '',
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user?.id) {
      throw new Error('Could not verify user')
    }

    // Update user profile to active
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.user.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    verificationComplete.value = true

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err) {
    verificationError.value = err instanceof Error ? err.message : 'Verification failed'
    isVerifying.value = false
    tokenFound.value = false
  }
}

/* ============ VERIFY WITH CODE ============ */
const verifyWithCode = async () => {
  if (verificationCode.value.length !== 6) {
    verificationError.value = 'Please enter a valid 6-digit code'
    return
  }

  try {
    isVerifying.value = true
    verificationError.value = null

    // Get the current session to get the user's email
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session?.user?.email) {
      throw new Error('Could not determine user email')
    }

    const { data, error } = await supabase.auth.verifyOtp({
      type: 'email',
      token: verificationCode.value,
      email: sessionData.session.user.email,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user?.id) {
      throw new Error('Could not verify user')
    }

    // Update user profile to active
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.user.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    verificationComplete.value = true

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err) {
    verificationError.value = err instanceof Error ? err.message : 'Verification failed'
    isVerifying.value = false
  }
}

/* ============ RESEND VERIFICATION EMAIL ============ */
const resendVerificationEmail = async () => {
  try {
    isResending.value = true
    verificationError.value = null

    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session?.user?.email) {
      throw new Error('Could not determine user email')
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: sessionData.session.user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    verificationError.value = null
    alert('Verification email sent! Check your inbox.')
  } catch (err) {
    verificationError.value = err instanceof Error ? err.message : 'Failed to resend email'
  } finally {
    isResending.value = false
  }
}
</script>