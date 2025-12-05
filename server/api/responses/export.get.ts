/**
 * Export Responses API - Export form responses to CSV or JSON
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
    const format = ((query.format as string) || 'csv').toLowerCase() as 'csv' | 'json'
    const status = query.status as string

    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: form_id',
      })
    }

    if (!['csv', 'json'].includes(format)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid format. Use csv or json',
      })
    }

    // Verify user owns this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, owner_id, title')
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

    // Get form fields
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('order_idx', { ascending: true })

    if (fieldsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch form fields',
      })
    }

    // Get responses with values
    let responseQuery = supabase
      .from('form_responses')
      .select(`
        id,
        respondent_phone,
        respondent_name,
        status,
        source,
        created_at,
        completed_at,
        completion_time_seconds,
        form_response_values (
          field_id,
          value
        )
      `)
      .eq('form_id', formId)

    if (status) {
      responseQuery = responseQuery.eq('status', status)
    }

    const { data: responses, error: responsesError } = await responseQuery.order(
      'created_at',
      { ascending: false }
    )

    if (responsesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch responses',
      })
    }

    if (!responses || responses.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No responses found',
      })
    }

    // Generate export data
    let exportData: string
    let contentType: string
    let filename: string

    if (format === 'json') {
      const jsonData = responses.map(r => ({
        phone: r.respondent_phone,
        name: r.respondent_name,
        status: r.status,
        source: r.source,
        started_at: r.created_at,
        completed_at: r.completed_at,
        completion_time_seconds: r.completion_time_seconds,
        responses: (fields || []).reduce((acc: Record<string, any>, field) => {
          const value = r.form_response_values.find(v => v.field_id === field.id)
          acc[field.label] = value?.value || null
          return acc
        }, {}),
      }))

      exportData = JSON.stringify(jsonData, null, 2)
      contentType = 'application/json'
      filename = `${form.title}_responses_${Date.now()}.json`
    } else {
      // CSV format
      const headers = [
        'Phone',
        'Name',
        'Status',
        'Source',
        'Started At',
        'Completed At',
        'Completion Time (seconds)',
        ...(fields || []).map(f => f.label),
      ]

      let csv = headers.map(h => `"${h}"`).join(',') + '\n'

      for (const response of responses) {
        const row = [
          response.respondent_phone,
          response.respondent_name || '',
          response.status,
          response.source,
          response.created_at,
          response.completed_at || '',
          response.completion_time_seconds || '',
          ...(fields || []).map(field => {
            const value = response.form_response_values.find(v => v.field_id === field.id)
            return value ? `"${String(value.value).replace(/"/g, '""')}"` : '""'
          }),
        ]

        csv += row.join(',') + '\n'
      }

      exportData = csv
      contentType = 'text/csv'
      filename = `${form.title}_responses_${Date.now()}.csv`
    }

    // Set response headers for download
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

    return exportData
  } catch (error) {
    console.error('[Export Responses API] Error:', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to export responses',
    })
  }
})

/**
 * Require authentication
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