/**
 * Test Helpers - Utilities for testing WhatsApp integration
 */

import { createClient } from '@supabase/supabase-js'
import { processMessage } from './messageProcessor'

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
 * Simulate incoming WhatsApp message
 */
export async function simulateIncomingMessage(data: {
  from: string
  text: string
  contact_name?: string
  message_id?: string
  timestamp?: number
}) {
  const message = {
    message_id: data.message_id || `msg_${Date.now()}`,
    from: data.from,
    timestamp: data.timestamp || Date.now(),
    type: 'text',
    text: data.text,
    contact_name: data.contact_name,
  }

  console.log('[TestHelper] Simulating message:', message)

  try {
    const result = await processMessage(message)
    console.log('[TestHelper] Message processed:', result)
    return { success: true, result }
  } catch (error) {
    console.error('[TestHelper] Error processing message:', error)
    return { success: false, error }
  }
}

/**
 * Get form for testing
 */
export async function getTestForm(formKey: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('form_key', formKey)
      .single()

    if (formError) {
      return { success: false, form: null, error: formError.message }
    }

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
    console.error('[TestHelper] Error getting form:', error)
    return { success: false, form: null, error }
  }
}

/**
 * Get session for testing
 */
export async function getTestSession(responseId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: response, error: responseError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('id', responseId)
      .single()

    if (responseError) {
      return { success: false, session: null, error: responseError.message }
    }

    const { data: values, error: valuesError } = await supabase
      .from('form_response_values')
      .select('*')
      .eq('response_id', responseId)

    if (valuesError) {
      return { success: false, session: null, error: valuesError.message }
    }

    return {
      success: true,
      session: { ...response, values: values || [] },
    }
  } catch (error) {
    console.error('[TestHelper] Error getting session:', error)
    return { success: false, session: null, error }
  }
}

/**
 * Check queue stats
 */
export async function checkQueueStats() {
  try {
    const module = await import('ioredis')
    const RedisClass = module.default
    const redis = new RedisClass(process.env.REDIS_URL || 'redis://localhost:6379')

    const queueLength = await redis.llen('whatsapp:incoming:queue')
    const dlqLength = await redis.llen('whatsapp:dead_letter_queue')

    await redis.disconnect()

    return {
      success: true,
      queue_length: queueLength,
      dead_letter_length: dlqLength,
    }
  } catch (error) {
    console.error('[TestHelper] Error checking queue:', error)
    return {
      success: false,
      queue_length: 0,
      dead_letter_length: 0,
      error,
    }
  }
}

/**
 * Clear test data
 */
export async function clearTestData(formId: string) {
  try {
    const supabase = createSupabaseClient()

    // Delete response values first (foreign key constraint)
    const { data: responses } = await supabase
      .from('form_responses')
      .select('id')
      .eq('form_id', formId)

    if (responses && responses.length > 0) {
      for (const response of responses) {
        await supabase
          .from('form_response_values')
          .delete()
          .eq('response_id', response.id)
      }
    }

    // Delete responses
    const { error: responseError } = await supabase
      .from('form_responses')
      .delete()
      .eq('form_id', formId)

    if (responseError) {
      return { success: false, error: responseError.message }
    }

    // Delete fields
    const { error: fieldError } = await supabase
      .from('form_fields')
      .delete()
      .eq('form_id', formId)

    if (fieldError) {
      return { success: false, error: fieldError.message }
    }

    console.log('[TestHelper] Cleared test data for form', formId)
    return { success: true }
  } catch (error) {
    console.error('[TestHelper] Error clearing test data:', error)
    return { success: false, error }
  }
}

/**
 * Get message flow logs for debugging
 */
export async function getMessageLogs(responseId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: logs, error } = await supabase
      .from('message_flow_logs')
      .select('*')
      .eq('response_id', responseId)
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, logs: [], error: error.message }
    }

    return { success: true, logs: logs || [] }
  } catch (error) {
    console.error('[TestHelper] Error getting message logs:', error)
    return { success: false, logs: [], error }
  }
}

/**
 * Get validation errors for debugging
 */
export async function getValidationErrors(responseId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: errors, error } = await supabase
      .from('validation_error_logs')
      .select('*')
      .eq('response_id', responseId)
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, errors: [], error: error.message }
    }

    return { success: true, errors: errors || [] }
  } catch (error) {
    console.error('[TestHelper] Error getting validation errors:', error)
    return { success: false, errors: [], error }
  }
}

/**
 * Get session events for debugging
 */
export async function getSessionEvents(responseId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: events, error } = await supabase
      .from('session_event_logs')
      .select('*')
      .eq('response_id', responseId)
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, events: [], error: error.message }
    }

    return { success: true, events: events || [] }
  } catch (error) {
    console.error('[TestHelper] Error getting session events:', error)
    return { success: false, events: [], error }
  }
}

/**
 * Get all logs for a response
 */
export async function getAllLogs(responseId: string) {
  try {
    const [messageLogsResult, validationErrorsResult, sessionEventsResult] = await Promise.all([
      getMessageLogs(responseId),
      getValidationErrors(responseId),
      getSessionEvents(responseId),
    ])

    return {
      success: true,
      message_flow: messageLogsResult.logs || [],
      validation_errors: validationErrorsResult.errors || [],
      session_events: sessionEventsResult.events || [],
    }
  } catch (error) {
    console.error('[TestHelper] Error getting all logs:', error)
    return {
      success: false,
      message_flow: [],
      validation_errors: [],
      session_events: [],
      error,
    }
  }
}