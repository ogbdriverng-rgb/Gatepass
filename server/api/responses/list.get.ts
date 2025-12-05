/**
 * List Responses API - Get form responses with filtering
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
    const status = query.status as string
    const source = query.source as string
    const limit = Math.min(parseInt((query.limit as string) || '50'), 500)
    const offset = parseInt((query.offset as string) || '0')
    const sortBy = (query.sort_by as string) || 'created_at'
    const sortOrder = ((query.sort_order as string) || 'desc') as 'asc' | 'desc'

    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: form_id',
      })
    }

    // Verify user owns this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, owner_id')
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
        statusMessage: 'Access denied - you do not own this form',
      })
    }

    // Build response query
    let responseQuery = supabase
      .from('form_responses')
      .select('*', { count: 'exact' })
      .eq('form_id', formId)

    // Apply status filter
    if (status && ['in_progress', 'completed', 'abandoned'].includes(status)) {
      responseQuery = responseQuery.eq('status', status)
    }

    // Apply source filter
    if (source && ['whatsapp', 'web', 'api'].includes(source)) {
      responseQuery = responseQuery.eq('source', source)
    }

    // Apply sorting
    const validSortFields = ['created_at', 'completed_at', 'completion_time_seconds', 'updated_at']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'

    const { data: responses, count, error: responseError } = await responseQuery
      .order(sortField, { ascending: sortOrder === 'asc' })
      .limit(limit)
      .offset(offset)

    if (responseError) {
      throw createError({
        statusCode: 500,
        statusMessage: responseError.message,
      })
    }

    // Calculate stats
    let stats = {
      total: count || 0,
      completed: 0,
      in_progress: 0,
      abandoned: 0,
    }

    if (offset === 0) {
      const { count: completedCount } = await supabase
        .from('form_responses')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId)
        .eq('status', 'completed')

      const { count: inProgressCount } = await supabase
        .from('form_responses')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId)
        .eq('status', 'in_progress')

      const { count: abandonedCount } = await supabase
        .from('form_responses')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId)
        .eq('status', 'abandoned')

      stats = {
        total: count || 0,
        completed: completedCount || 0,
        in_progress: inProgressCount || 0,
        abandoned: abandonedCount || 0,
      }
    }

    return {
      success: true,
      data: responses || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: (offset + limit) < (count || 0),
      },
      stats,
      filters: {
        status: status || null,
        source: source || null,
        sort_by: sortField,
        sort_order: sortOrder,
      },
    }
  } catch (error) {
    console.error('[List Responses API] Error:', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list responses',
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