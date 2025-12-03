// server/api/forms/public/[form_key]/submit.post.ts

export default defineEventHandler(async (event) => {
  try {
    const formKey = getRouterParam(event, 'form_key')
    console.log('📝 Form Submission - Form Key:', formKey)

    if (!formKey) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form key is required',
      })
    }

    const body = await readBody(event)
    const responses = body.responses
    const sessionData = body.sessionData || {} // Get session data from request

    console.log('📋 Responses:', responses)
    console.log('📌 Session Data:', sessionData)

    // Create Supabase client
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      config.public.supabase.url,
      config.public.supabase.key
    )

    // Get form ID from form_key
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('form_key', formKey)
      .eq('is_published', true)
      .single()

    if (formError || !form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found',
      })
    }

    // Get device info and IP
    const userAgent = getHeader(event, 'user-agent') || ''
    const clientIP = getHeader(event, 'x-forwarded-for') || 
                     getHeader(event, 'cf-connecting-ip') ||
                     event.node?.req?.socket?.remoteAddress || ''

    // Insert response with session data
    const { data: response, error: submitError } = await supabase
      .from('form_responses')
      .insert({
        form_id: form.id,
        responses: responses,
        session_data: {
          ...sessionData,
          submittedAt: new Date().toISOString(),
        },
        device_info: {
          userAgent: userAgent,
        },
        ip_address: clientIP,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (submitError) {
      console.error('❌ Submit Error:', submitError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to submit form',
      })
    }

    console.log('✅ Response saved:', response)

    return {
      success: true,
      message: 'Form submitted successfully',
      response_id: response.id,
    }
  } catch (error: any) {
    console.error('❌ API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Server error',
    })
  }
})