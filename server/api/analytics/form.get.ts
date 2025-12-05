/**
 * Form Analytics API - Get detailed form analytics and metrics
 */

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const supabase = useSupabaseServer()
    const query = getQuery(event)

    const formId = query.form_id as string
    const period = ((query.period as string) || '7d') as '24h' | '7d' | '30d'

    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: form_id',
      })
    }

    // Verify user owns this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, owner_id, title, created_at')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found',
      })
    }

    if (form.owner_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied',
      })
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '7d':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()

    // Get all responses in period
    const { data: allResponses, count: totalCount } = await supabase
      .from('form_responses')
      .select('id, status, source, created_at, completed_at, completion_time_seconds', {
        count: 'exact',
      })
      .eq('form_id', formId)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false })

    if (!allResponses) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch responses',
      })
    }

    // Calculate response stats
    const completed = allResponses.filter(r => r.status === 'completed').length
    const inProgress = allResponses.filter(r => r.status === 'in_progress').length
    const abandoned = allResponses.filter(r => r.status === 'abandoned').length

    // Calculate completion time
    let avgCompletionTime = 0
    const completedResponses = allResponses.filter(
      r => r.status === 'completed' && r.completion_time_seconds
    )

    if (completedResponses.length > 0) {
      const total = completedResponses.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0)
      avgCompletionTime = Math.round(total / completedResponses.length)
    }

    // Response by source
    const responsesBySource = allResponses.reduce(
      (acc: Record<string, number>, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1
        return acc
      },
      { whatsapp: 0, web: 0, api: 0 }
    )

    // Completion rate
    const completionRate = totalCount && totalCount > 0 ? (completed / totalCount) * 100 : 0

    // Get field stats
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('id, label, type')
      .eq('form_id', formId)
      .order('order_idx', { ascending: true })

    if (fieldsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch form fields',
      })
    }

    let fieldStats: any[] = []
    if (fields && completed > 0) {
      for (const field of fields) {
        const { count: fieldResponses } = await supabase
          .from('form_response_values')
          .select('*', { count: 'exact', head: true })
          .eq('field_id', field.id)

        fieldStats.push({
          field_id: field.id,
          label: field.label,
          type: field.type,
          responses: fieldResponses || 0,
          response_rate: Math.round(((fieldResponses || 0) / completed) * 100),
        })
      }
    }

    // Daily data for charts
    const dailyData = allResponses.reduce(
      (acc: Record<string, { count: number; completed: number }>, r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { count: 0, completed: 0 }
        }
        acc[date].count++
        if (r.status === 'completed') {
          acc[date].completed++
        }
        return acc
      },
      {}
    )

    return {
      success: true,
      form: {
        id: form.id,
        title: form.title,
        created_at: form.created_at,
      },
      period,
      summary: {
        total_responses: totalCount || 0,
        completed,
        in_progress: inProgress,
        abandoned,
        completion_rate: Math.round(completionRate),
        avg_completion_time_seconds: avgCompletionTime,
      },
      by_source: responsesBySource,
      field_stats: fieldStats,
      daily_data: Object.entries(dailyData)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, data]) => ({
          date,
          ...data,
        })),
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[Form Analytics API] Error:', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get analytics',
    })
  }
})

/**
 * Require authentication - Verify JWT token
 */
async function requireAuth(event: any) {
  try {
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const supabase = useSupabaseServer()

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      return null
    }

    return data.user
  } catch (error) {
    console.error('[Auth] Error verifying token:', error)
    return null
  }
}

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