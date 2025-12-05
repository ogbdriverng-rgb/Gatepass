/**
 * Form Utilities - Database helper functions
 */

/**
 * Get form by form_key
 */
export async function getFormByKey(formKey: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('form_key', formKey)
      .single()

    if (error) {
      return { success: false, form: null, error: error.message }
    }

    return { success: true, form }
  } catch (error) {
    console.error('[FormUtils] Error getting form:', error)
    return { success: false, form: null, error: 'Failed to get form' }
  }
}

/**
 * Get form with all fields
 */
export async function getFormWithFields(formKey: string) {
  try {
    const { success: formSuccess, form } = await getFormByKey(formKey)

    if (!formSuccess || !form) {
      return { success: false, form: null }
    }

    const supabase = createSupabaseClient()
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', form.id)
      .order('order_idx', { ascending: true })

    if (fieldsError) {
      return { success: false, form: null, error: fieldsError.message }
    }

    return { success: true, form: { ...form, fields: fields || [] } }
  } catch (error) {
    console.error('[FormUtils] Error getting form with fields:', error)
    return { success: false, form: null }
  }
}

/**
 * Get fields for form
 */
export async function getFormFieldsUtil(formId: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: fields, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('order_idx', { ascending: true })

    if (error) {
      return { success: false, fields: [], error: error.message }
    }

    return { success: true, fields: fields || [] }
  } catch (error) {
    console.error('[FormUtils] Error getting form fields:', error)
    return { success: false, fields: [] }
  }
}

/**
 * Get current field for response
 */
export async function getCurrentFieldUtil(responseId: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: response, error: responseError } = await supabase
      .from('form_responses')
      .select('current_step, form_id')
      .eq('id', responseId)
      .single()

    if (responseError) {
      return { success: false, field: null, error: 'Session not found' }
    }

    if (!response.current_step) {
      return { success: false, field: null, error: 'No current step' }
    }

    const { data: field, error: fieldError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('id', response.current_step)
      .single()

    if (fieldError) {
      return { success: false, field: null, error: 'Field not found' }
    }

    return { success: true, field, formId: response.form_id }
  } catch (error) {
    console.error('[FormUtils] Error getting current field:', error)
    return { success: false, field: null }
  }
}

/**
 * Check if form is published
 */
export async function isFormPublished(formKey: string): Promise<boolean> {
  try {
    const { success, form } = await getFormByKey(formKey)
    return success && form?.is_published === true
  } catch (error) {
    return false
  }
}

/**
 * Get form response count
 */
export async function getFormResponseCount(formId: string) {
  try {
    const supabase = createSupabaseClient()
    const { count } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('status', 'completed')

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('[FormUtils] Error getting response count:', error)
    return { success: false, count: 0 }
  }
}

/**
 * Helper: Create Supabase client
 */
function createSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}