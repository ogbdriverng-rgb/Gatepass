/**
 * Response Detail API - Get single response with values
 */

export default defineEventHandler(async (event) => {
  try {
    // Verify auth
    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const supabase = useSupabaseServer()
    const responseId = getRouterParam(event, 'id')

    if (!responseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing response ID',
      })
    }

    // Get response
    const { data: response, error: responseError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('id', responseId)
      .single()

    if (responseError || !response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Response not found',
      })
    }

    // Verify user owns the form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', response.form_id)
      .eq('owner_id', user.id)
      .single()

    if (formError || !form) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied',
      })
    }

    // Get response values with field info
    const { data: values, error: valuesError } = await supabase
      .from('form_response_values')
      .select(
        `
        id,
        field_id,
        value,
        created_at,
        form_fields:field_id (
          id,
          label,
          type,
          placeholder
        )
      `
      )
      .eq('response_id', responseId)
      .order('created_at', { ascending: true })

    if (valuesError) {
      console.error('Error fetching values:', valuesError)
    }

    return {
      success: true,
      data: {
        ...response,
        values: values || [],
      },
    }
  } catch (error) {
    console.error('[Response Detail API] Error:', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get response',
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