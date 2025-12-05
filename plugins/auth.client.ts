/**
 * plugins/auth.client.ts
 * Initialize auth store on app startup for session persistence
 * The .client suffix ensures this only runs in the browser
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('🔐 Auth plugin loading...')
  
  const authStore = useAuthStore()

  try {
    // Initialize auth - this restores session from Supabase
    console.log('🔐 Initializing auth store...')
    await authStore.initialize()
    console.log('✅ Auth store initialized successfully')
  } catch (error) {
    console.error('❌ Auth initialization error:', error)
  }
})