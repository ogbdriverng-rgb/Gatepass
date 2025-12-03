/**
 * guest.ts - Route middleware for guest-only routes
 * Redirects logged-in users away from auth pages
 *
 * Usage in page: definePageMeta({ middleware: 'guest' })
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const user = useSupabaseUser()

  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // If user is already logged in, redirect to dashboard
  if (authStore.isLoggedIn && user.value) {
    return navigateTo('/dashboard')
  }
})