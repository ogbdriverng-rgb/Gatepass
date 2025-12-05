/**
 * Session Manager - Handles response/session creation and management
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Helper: Create Supabase client
 */
function createSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}

/**
 * Get or create session for phone + form
 */
export async function getOrCreateSession(formId: string, phone: string, contactName?: string) {
  try {
    const supabase = createSupabaseClient()

    // Check for existing in-progress session
    const { data: existing } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .eq('respondent_phone', phone)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      console.log(`[SessionManager] Resuming session ${existing.id}`)
      return { success: true, session: existing, isNew: false }
    }

    // Create new session
    const { data: newSession, error: createError } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        respondent_phone: phone,
        respondent_name: contactName,
        status: 'in_progress',
        source: 'whatsapp',
        version: 1,
        session_data: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create session: ${createError.message}`)
    }

    console.log(`[SessionManager] Created new session ${newSession.id}`)
    return { success: true, session: newSession, isNew: true }
  } catch (error) {
    console.error('[SessionManager] Error:', error)
    throw error
  }
}

/**
 * Get first field for form
 */
export async function getFirstField(formId: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: fields, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('order_idx', { ascending: true })
      .limit(1)

    if (error) {
      throw new Error(`Failed to fetch first field: ${error.message}`)
    }

    if (!fields || fields.length === 0) {
      throw new Error('Form has no fields')
    }

    return { success: true, field: fields[0] }
  } catch (error) {
    console.error('[SessionManager] Error getting first field:', error)
    throw error
  }
}

/**
 * Get all fields for form
 */
export async function getFormFields(formId: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: fields, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('order_idx', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch fields: ${error.message}`)
    }

    return { success: true, fields: fields || [] }
  } catch (error) {
    console.error('[SessionManager] Error getting form fields:', error)
    throw error
  }
}

/**
 * Get current field for session
 */
export async function getCurrentField(responseId: string) {
  try {
    const supabase = createSupabaseClient()

    // Get session to find current_step
    const { data: session, error: sessionError } = await supabase
      .from('form_responses')
      .select('current_step, form_id')
      .eq('id', responseId)
      .single()

    if (sessionError) {
      throw new Error('Session not found')
    }

    if (!session.current_step) {
      throw new Error('No current step set')
    }

    // Get field
    const { data: field, error: fieldError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('id', session.current_step)
      .single()

    if (fieldError) {
      throw new Error('Current field not found')
    }

    return { success: true, field, formId: session.form_id }
  } catch (error) {
    console.error('[SessionManager] Error getting current field:', error)
    throw error
  }
}

/**
 * Set current step for session
 */
export async function setCurrentStep(responseId: string, fieldId: string) {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('form_responses')
      .update({
        current_step: fieldId,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to set current step: ${error.message}`)
    }

    return { success: true, session: data }
  } catch (error) {
    console.error('[SessionManager] Error setting current step:', error)
    throw error
  }
}

/**
 * Initialize session with first field
 */
export async function initializeSession(responseId: string, formId: string) {
  try {
    const { success: fieldsSuccess, field: firstField } = await getFirstField(formId)

    if (!fieldsSuccess || !firstField) {
      throw new Error('No fields found for form')
    }

    // Set current_step to first field
    await setCurrentStep(responseId, firstField.id)

    return { success: true, field: firstField }
  } catch (error) {
    console.error('[SessionManager] Error initializing session:', error)
    throw error
  }
}

/**
 * Get next field
 */
export async function getNextField(responseId: string, allFields: any[]) {
  try {
    const supabase = createSupabaseClient()
    const { data: session } = await supabase
      .from('form_responses')
      .select('current_step')
      .eq('id', responseId)
      .single()

    const currentIndex = allFields.findIndex(f => f.id === session.current_step)

    if (currentIndex === -1) {
      return { success: false, error: 'Current field not found' }
    }

    const nextIndex = currentIndex + 1

    if (nextIndex >= allFields.length) {
      return { success: true, field: null, isComplete: true }
    }

    return { success: true, field: allFields[nextIndex], isComplete: false }
  } catch (error) {
    console.error('[SessionManager] Error getting next field:', error)
    throw error
  }
}

/**
 * Get session by phone number
 */
export async function getSessionByPhone(phone: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: session } = await supabase
      .from('form_responses')
      .select('*')
      .eq('respondent_phone', phone)
      .eq('status', 'in_progress')
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .single()

    if (!session) {
      return { success: false, session: null }
    }

    return { success: true, session }
  } catch (error) {
    return { success: false, session: null }
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(responseId: string) {
  try {
    const supabase = createSupabaseClient()
    const { data: session, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('id', responseId)
      .single()

    if (error) {
      return { success: false, session: null }
    }

    return { success: true, session }
  } catch (error) {
    return { success: false, session: null }
  }
}