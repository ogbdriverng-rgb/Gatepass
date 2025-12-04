/**
 * Alias Resolver - Resolves form aliases to form keys
 * Handles requests like: /api/aliases/resolve/peter
 * Returns form key or redirect target
 */

export default defineEventHandler(async (event) => {
  const alias = getRouterParam(event, 'alias')

  if (!alias) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Alias is required',
    })
  }

  try {
    const supabase = useSupabaseServer()

    // Query aliases table
    const { data: aliasData, error: aliasError } = await supabase
      .from('aliases')
      .select('form_id, type')
      .eq('alias', alias)
      .eq('is_active', true)
      .single()

    if (aliasError || !aliasData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Alias not found',
      })
    }

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('form_key, public_alias, is_published')
      .eq('id', aliasData.form_id)
      .single()

    if (formError || !form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found',
      })
    }

    if (!form.is_published) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Form is not published',
      })
    }

    // Increment click count
    await supabase
      .from('aliases')
      .update({ clicks: supabase.rpc('increment_clicks') })
      .eq('alias', alias)

    // Return based on type
    const botPhoneNumber = process.env.WHATSAPP_BOT_PHONE_NUMBER || '1234567890'
    const baseUrl = process.env.API_BASE_URL || 'https://gatepass.ng'

    return {
      alias,
      form_key: form.form_key,
      type: aliasData.type,
      whatsapp_link: `https://wa.me/${botPhoneNumber}?text=START:${form.form_key}`,
      web_url: `${baseUrl}/f/${form.form_key}`,
    }
  } catch (error) {
    console.error('[Alias Resolver] Error:', error)
    throw error
  }
})

/**
 * Helper: Get Supabase server client
 */
function useSupabaseServer() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
  return supabase
}