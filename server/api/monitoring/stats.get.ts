/**
 * Stats Endpoint - Get WhatsApp integration statistics
 */

export default defineEventHandler(async (event) => {
  try {
    const supabase = useSupabaseServer()
    const query = getQuery(event)
    const period = (query.period as string) || '24h'

    // Calculate time range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '24h':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()

    // Total responses
    const { count: totalResponses } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr)

    // Completed responses
    const { count: completedResponses } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startDateStr)

    // In-progress responses
    const { count: inProgressResponses } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress')
      .gte('created_at', startDateStr)

    // WhatsApp source only
    const { count: whatsappResponses } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'whatsapp')
      .gte('created_at', startDateStr)

    // Errors
    const { count: errors } = await supabase
      .from('webhook_logs')
      .select('*', { count: 'exact', head: true })
      .neq('response_status', 200)
      .gte('created_at', startDateStr)

    // Average completion time
    const { data: completionTimes, error: ctError } = await supabase
      .from('form_responses')
      .select('completion_time_seconds')
      .eq('status', 'completed')
      .gte('created_at', startDateStr)

    let avgCompletionTime = 0
    if (!ctError && completionTimes && completionTimes.length > 0) {
      const validTimes = completionTimes.filter(r => r.completion_time_seconds)
      if (validTimes.length > 0) {
        const total = validTimes.reduce((sum, r) => sum + r.completion_time_seconds, 0)
        avgCompletionTime = Math.round(total / validTimes.length)
      }
    }

    // Messages sent
    const { count: messagesSent } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .gte('timestamp', startDateStr)

    // Messages failed
    const { count: messagesFailed } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .eq('status', 'failed')
      .gte('timestamp', startDateStr)

    // Completion rate
    const completionRate =
      totalResponses && totalResponses > 0
        ? Math.round((completedResponses || 0 / totalResponses) * 100)
        : 0

    return {
      success: true,
      period,
      timestamp: new Date().toISOString(),
      responses: {
        total: totalResponses || 0,
        completed: completedResponses || 0,
        in_progress: inProgressResponses || 0,
        completion_rate: completionRate,
        avg_completion_time_seconds: avgCompletionTime,
      },
      whatsapp: {
        total_responses: whatsappResponses || 0,
        messages_sent: messagesSent || 0,
        messages_failed: messagesFailed || 0,
        success_rate: messagesSent && messagesSent > 0 
          ? Math.round(((messagesSent - (messagesFailed || 0)) / messagesSent) * 100)
          : 0,
      },
      errors: {
        total_errors: errors || 0,
        error_rate: totalResponses && totalResponses > 0
          ? Math.round(((errors || 0) / totalResponses) * 100)
          : 0,
      },
    }
  } catch (error) {
    console.error('[Stats Endpoint] Error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to get stats',
    })
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