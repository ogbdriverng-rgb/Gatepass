// server/api/forms/public/[form_key].get.ts

export default defineEventHandler(async (event) => {
  try {
    const formKey = getRouterParam(event, 'form_key')
    console.log('📝 API Called - Form Key:', formKey)

    if (!formKey) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form key is required',
      })
    }

    // Create Supabase client for public data
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      config.public.supabase.url,
      config.public.supabase.key
    )

    // Fetch form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, description, form_key, is_published')
      .eq('form_key', formKey)
      .eq('is_published', true)
      .single()

    console.log('📋 Form Query Result:', { form, formError })

    if (formError || !form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found',
      })
    }

    // Fetch latest version - don't use .single()
    const { data: versions, error: versionError } = await supabase
      .from('form_versions')
      .select('flow_json')
      .eq('form_id', form.id)
      .order('version', { ascending: false })
      .limit(1)

    console.log('📌 Version Query Result:', { versions, versionError })

    if (versionError || !versions || versions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No published version found',
      })
    }

    const version = versions[0]

    return {
      id: form.id,
      title: form.title,
      description: form.description || '',
      form_key: form.form_key,
      fields: version.flow_json?.steps || [],
    }
  } catch (error: any) {
    console.error('❌ API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Server error',
    })
  }
})