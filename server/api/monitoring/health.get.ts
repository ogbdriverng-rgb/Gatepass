/**
 * Health Check Endpoint - Monitor WhatsApp integration health
 */

import { getQueueStats } from '~/server/utils/queueWorker'

export default defineEventHandler(async (event) => {
  try {
    const timestamp = new Date().toISOString()

    // Check Queue Worker
    const queueStats = await getQueueStats()
    const queueHealthy = queueStats.queue_length !== undefined

    // Check Database
    let databaseHealthy = false
    let databaseLatency = 0
    let databaseError: string | null = null

    try {
      const supabase = useSupabaseServer()
      const startTime = Date.now()

      const { error, data } = await supabase
        .from('forms')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      databaseLatency = Date.now() - startTime
      databaseHealthy = !error
      databaseError = error?.message || null
    } catch (err) {
      databaseHealthy = false
      databaseError = err instanceof Error ? err.message : 'Connection failed'
    }

    // Check WhatsApp Configuration
    const whatsappConfigured =
      !!process.env.WHATSAPP_PHONE_NUMBER_ID &&
      !!process.env.WHATSAPP_API_TOKEN &&
      !!process.env.WHATSAPP_WEBHOOK_TOKEN

    // Overall health status
    const isHealthy = queueHealthy && databaseHealthy && whatsappConfigured

    // Get recent errors
    let recentErrors = 0
    try {
      const supabase = useSupabaseServer()
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

      const { count, error: countError } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('response_status', 500)
        .gte('created_at', oneHourAgo)

      if (!countError) {
        recentErrors = count || 0
      }
    } catch (err) {
      console.error('[Health Check] Error fetching recent errors:', err)
    }

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      uptime: process.uptime(),
      version: '1.0.0',
      components: {
        queue_worker: {
          status: queueStats.is_running ? 'running' : 'stopped',
          queue_length: queueStats.queue_length,
          dead_letter_queue: queueStats.dead_letter_length,
          healthy: queueHealthy,
        },
        database: {
          status: databaseHealthy ? 'connected' : 'disconnected',
          latency_ms: databaseLatency,
          error: databaseError,
          healthy: databaseHealthy,
        },
        whatsapp: {
          status: whatsappConfigured ? 'configured' : 'not_configured',
          phone_number_id: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
          api_token: !!process.env.WHATSAPP_API_TOKEN,
          webhook_token: !!process.env.WHATSAPP_WEBHOOK_TOKEN,
          healthy: whatsappConfigured,
        },
      },
      metrics: {
        recent_errors_1h: recentErrors,
        error_threshold_exceeded: recentErrors > 10,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        redis_configured: !!process.env.REDIS_URL,
        supabase_configured: !!process.env.SUPABASE_URL,
      },
    }
  } catch (error) {
    console.error('[Health Check] Critical error:', error)

    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Health check failed',
    }
  }
})

/**
 * Helper: Get Supabase server client
 */
function useSupabaseServer() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}