/**
 * auth.ts - Route middleware for protecting authenticated routes
 * Ensures user is logged in before accessing protected pages
 *
 * Usage in page: definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const user = useSupabaseUser()

  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // Check if user is logged in
  if (!authStore.isLoggedIn || !user.value) {
    // Redirect to login with return URL
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  // Check if user is suspended
  if (authStore.isSuspended) {
    // Sign out suspended users
    await authStore.signOut()
    return navigateTo('/auth/suspended')
  }
})