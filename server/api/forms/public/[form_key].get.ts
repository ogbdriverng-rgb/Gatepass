// server/api/forms/public/[form_key].get.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const formKey = getRouterParam(event, 'form_key')

  if (!formKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Form key is required',
    })
  }

  try {
    // Get published form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('form_key', formKey)
      .eq('is_published', true)
      .single()

    if (formError || !form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'This form does not exist or is not published',
      })
    }

    // Get form fields
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', form.id)
      .order('order_idx', { ascending: true })

    if (fieldsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load form fields',
      })
    }

    // Transform fields to match the public form component structure
    const transformedFields = (fields || []).map((field: any) => ({
      field_id: field.id,
      prompt: field.label,
      type: field.type,
      options: field.meta?.options || [],
      validations: {
        required: field.is_required,
        ...field.meta?.validations,
      },
      placeholder: field.placeholder,
      description: field.meta?.description,
    }))

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      form_key: form.form_key,
      fields: transformedFields,
    }
  } catch (error: any) {
    console.error('Error loading form:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load form',
    })
  }
})