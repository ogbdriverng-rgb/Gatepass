import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  phone?: string
  name: string
  role: 'owner' | 'admin' | 'developer' | 'sponsor'
  billing_plan: 'free' | 'basic' | 'premium' | 'business' | 'enterprise'
  is_active: boolean
  is_suspended: boolean
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export const useAuthStore = defineStore('auth', () => {
  /* ============ STATE ============ */
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)
  const verificationSent = ref(false)

  /* ============ COMPUTED ============ */
  const isLoggedIn = computed(() => !!user.value && !!profile.value && profile.value.is_active)

  const isAdmin = computed(
    () => profile.value?.role === 'admin' || profile.value?.role === 'super_admin'
  )

  const isSuspended = computed(() => profile.value?.is_suspended || false)

  const canCreateForms = computed(() => {
    if (!profile.value) return false
    if (isSuspended.value) return false

    const formLimits = {
      free: 1,
      basic: 10,
      premium: 50,
      business: 200,
      enterprise: -1,
    }

    return formLimits[profile.value.billing_plan] !== 0
  })

  /* ============ SETTERS ============ */
  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const setProfile = (newProfile: UserProfile | null) => {
    profile.value = newProfile
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  /* ============ FETCH PROFILE ============ */
  const fetchProfile = async () => {
    if (!user.value) return

    try {
      isLoading.value = true
      const supabase = useSupabaseClient()
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (fetchError) throw new Error(fetchError.message)

      profile.value = data as UserProfile
      return { success: true, profile: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      console.error('Fetch profile error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

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
      const supabase = useSupabaseClient()
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            phone: credentials.phone,
            role: 'owner',
          },
          emailRedirectTo: `${process.client ? window.location.origin : ''}/auth/verify-email`,
        },
      })

      if (signUpError) throw new Error(signUpError.message)

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: credentials.email,
        phone: credentials.phone || null,
        name: credentials.name,
        role: 'owner',
        billing_plan: 'free',
        is_active: false,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError && !profileError.message.includes('duplicate')) {
        throw new Error(profileError.message)
      }

      verificationSent.value = true
      user.value = authData.user

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
      const supabase = useSupabaseClient()
      const router = useRouter()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (signInError) throw new Error(signInError.message)

      if (!data.user) {
        throw new Error('Sign in failed: No user data returned')
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error('Failed to fetch user profile')
      }

      if (!profileData?.is_active) {
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in')
      }

      user.value = data.user
      profile.value = profileData as UserProfile

      const { error: updateError } = await supabase
  .from('users')
  .update({ last_login: new Date().toISOString() })
  .eq('id', data.user.id)

if (updateError) {
  console.error('Last login update error:', updateError)
}

      if (process.client) {
        await router.push('/dashboard')
      }

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
  const verifyEmail = async (token: string) => {
    isLoading.value = true
    error.value = null

    try {
      const supabase = useSupabaseClient()

      const hashParams = new URLSearchParams(
        process.client ? window.location.hash.substring(1) : ''
      )
      const accessToken = hashParams.get('access_token')

      if (!accessToken) {
        throw new Error('No verification token found')
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        type: 'email_change',
        token,
        email: user.value?.email || '',
      })

      if (verifyError && !verifyError.message.includes('single')) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) throw new Error('Email verification failed')

        if (sessionData.session) {
          user.value = sessionData.session.user
        }
      } else if (data) {
        user.value = data.user
      }

      if (!user.value?.id) {
        throw new Error('Could not verify user')
      }

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
      const supabase = useSupabaseClient()

      const { data, error: supabaseError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.client ? window.location.origin : ''}/auth/callback`,
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
    try {
      isLoading.value = true
      const supabase = useSupabaseClient()
      const router = useRouter()

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw new Error(signOutError.message)

      user.value = null
      profile.value = null
      error.value = null
      verificationSent.value = false

      if (process.client) {
        await router.push('/auth/login')
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      console.error('Sign out error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ FORGOT PASSWORD ============ */
  const forgotPassword = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const supabase = useSupabaseClient()

      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.client ? window.location.origin : ''}/auth/reset-password`,
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
      const supabase = useSupabaseClient()

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
  const updateProfile = async (updates: Partial<UserProfile>) => {
    isLoading.value = true
    error.value = null

    try {
      if (!user.value) throw new Error('No user logged in')

      const supabase = useSupabaseClient()

      const { error: authError } = await supabase.auth.updateUser({
        data: updates,
      })

      if (authError) throw new Error(authError.message)

      const { error: profileError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)

      if (profileError) throw new Error(profileError.message)

      if (profile.value) {
        profile.value = { ...profile.value, ...updates }
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

  /* ============ CHECK EMAIL EXISTS ============ */
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const supabase = useSupabaseClient()

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

  /* ============ INITIALIZE ============ */
  const initialize = async () => {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      const supabase = useSupabaseClient()

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) throw new Error(sessionError.message)

      const session = data.session

      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      }

      isInitialized.value = true

      if (process.client) {
        supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession?.user) {
            user.value = newSession.user
            await fetchProfile()
          } else if (event === 'SIGNED_OUT') {
            user.value = null
            profile.value = null
          } else if (event === 'USER_UPDATED' && newSession?.user) {
            user.value = newSession.user
            await fetchProfile()
          }
        })
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Initialization failed'
      isInitialized.value = true
      console.error('Auth store init error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ RESET STATE ============ */
  const reset = () => {
    user.value = null
    profile.value = null
    isLoading.value = false
    error.value = null
    isInitialized.value = false
    verificationSent.value = false
  }

  return {
    /* State */
    user,
    profile,
    isLoading,
    isInitialized,
    error,
    verificationSent,

    /* Computed */
    isLoggedIn,
    isAdmin,
    isSuspended,
    canCreateForms,

    /* Methods */
    setUser,
    setProfile,
    setLoading,
    setError,
    fetchProfile,
    signUp,
    signIn,
    verifyEmail,
    signInWithOAuth,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkEmailExists,
    initialize,
    reset,
  }
})