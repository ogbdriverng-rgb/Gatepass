import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  /* ============ STATE ============ */
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const verificationSent = ref(false)

  /* ============ COMPUTED ============ */
  const isLoggedIn = computed(() => !!user.value && !!session.value)

  const userProfile = computed(() => {
    if (!user.value) return null
    return {
      id: user.value.id,
      email: user.value.email,
      name: user.value.user_metadata?.name || user.value.email?.split('@')[0],
      phone: user.value.user_metadata?.phone,
      avatar: user.value.user_metadata?.avatar_url,
      role: user.value.user_metadata?.role || 'owner',
    }
  })

  /* ============ SIGN UP ============ */
  const signUp = async (credentials: {
    email: string
    password: string
    name: string
    phone?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      // Step 1: Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            phone: credentials.phone,
            role: 'owner',
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      if (signUpError) throw new Error(signUpError.message)

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Step 2: Create user profile in public.users table
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: credentials.email,
        phone: credentials.phone || null,
        name: credentials.name,
        role: 'owner',
        billing_plan: 'free',
        is_active: false, // Not active until email verified
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError && !profileError.message.includes('duplicate')) {
        throw new Error(profileError.message)
      }

      verificationSent.value = true
      user.value = authData.user
      session.value = authData.session

      return {
        success: true,
        message: 'Signup successful! Please check your email to verify your account.',
        user: authData.user,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      error.value = message
      console.error('Signup error:', err)
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ SIGN IN ============ */
  const signIn = async (credentials: { email: string; password: string }) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (signInError) throw new Error(signInError.message)

      if (!data.user) {
        throw new Error('Sign in failed: No user data returned')
      }

      // Check if user profile exists and is active
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error('Failed to fetch user profile')
      }

      if (!profile?.is_active) {
        // Sign out if email not verified
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in')
      }

      user.value = data.user
      session.value = data.session

      // Update last login
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
          .then(() => {
            // Silently handle
          })
          .catch((err) => console.error('Last login update error:', err))
      }

      await router.push('/dashboard')
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      error.value = message
      console.error('Sign in error:', err)
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ VERIFY EMAIL ============ */
  const verifyEmail = async (token: string, type: string = 'email') => {
    isLoading.value = true
    error.value = null

    try {
      // Extract hash parameters if they exist
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken) {
        throw new Error('No verification token found')
      }

      // Step 1: Verify the email using the token
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        type: 'email_change',
        token,
        email: user.value?.email || '',
      })

      if (verifyError && !verifyError.message.includes('single')) {
        // Try alternative verification
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) throw new Error('Email verification failed')

        if (sessionData.session) {
          user.value = sessionData.session.user
          session.value = sessionData.session
        }
      } else if (data) {
        user.value = data.user
        session.value = data.session
      }

      if (!user.value?.id) {
        throw new Error('Could not verify user')
      }

      // Step 2: Update user profile to active
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)

      if (updateError && !updateError.message.includes('duplicate')) {
        throw new Error(updateError.message)
      }

      return {
        success: true,
        message: 'Email verified successfully! You can now sign in.',
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Email verification failed'
      error.value = message
      console.error('Email verification error:', err)
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ SIGN IN WITH OAUTH ============ */
  const signInWithOAuth = async (provider: 'github' | 'google') => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (supabaseError) throw new Error(supabaseError.message)

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : `OAuth sign in failed`
      error.value = message
      console.error('OAuth error:', err)
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ SIGN OUT ============ */
  const signOut = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase.auth.signOut()

      if (supabaseError) throw new Error(supabaseError.message)

      user.value = null
      session.value = null
      verificationSent.value = false

      await router.push('/auth/login')

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      error.value = message
      console.error('Sign out error:', err)
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ FORGOT PASSWORD ============ */
  const forgotPassword = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (supabaseError) throw new Error(supabaseError.message)

      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.',
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ RESET PASSWORD ============ */
  const resetPassword = async (newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (supabaseError) throw new Error(supabaseError.message)

      return { success: true, message: 'Password updated successfully' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ UPDATE PROFILE ============ */
  const updateProfile = async (updates: {
    name?: string
    phone?: string
    avatar_url?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      if (!user.value) throw new Error('No user logged in')

      // Update Supabase auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: updates,
      })

      if (authError) throw new Error(authError.message)

      // Update user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)

      if (profileError) throw new Error(profileError.message)

      // Update local user
      if (user.value.user_metadata) {
        user.value.user_metadata = { ...user.value.user_metadata, ...updates }
      }

      return { success: true, message: 'Profile updated successfully' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ INITIALIZE AUTH ============ */
  const initAuth = async () => {
    isLoading.value = true

    try {
      // Get current session
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) throw new Error(sessionError.message)

      session.value = data.session
      user.value = data.session?.user || null

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          session.value = newSession
          user.value = newSession?.user || null

          // Redirect based on auth state
          if (event === 'SIGNED_IN') {
            router.push('/dashboard')
          } else if (event === 'SIGNED_OUT') {
            router.push('/auth/login')
          }
        }
      )

      return { success: true, unsubscribe: authListener?.subscription?.unsubscribe }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auth initialization failed'
      error.value = message
      console.error('Auth init error:', err)
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ CHECK EMAIL EXISTS ============ */
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (err) {
      console.error('Error checking email:', err)
      return false
    }
  }

  return {
    /* State */
    user: computed(() => user.value),
    session: computed(() => session.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    verificationSent: computed(() => verificationSent.value),

    /* Computed */
    isLoggedIn,
    userProfile,

    /* Methods */
    signUp,
    signIn,
    verifyEmail,
    signInWithOAuth,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    initAuth,
    checkEmailExists,
  }
}