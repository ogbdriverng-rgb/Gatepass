/**
 * Response Logger - Logs responses, events and errors to database
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

export async function logWebhookEvent(data: {
  webhook_id: string
  event_type: 'incoming_message' | 'session_start' | 'session_end' | 'form_completed' | 'error'
  phone: string
  form_id?: string
  response_id?: string
  payload: Record<string, any>
  status: 'success' | 'error' | 'pending'
  error_message?: string
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('webhook_logs').insert({
      webhook_id: data.webhook_id,
      event_type: data.event_type,
      phone: data.phone,
      form_id: data.form_id,
      response_id: data.response_id,
      payload: data.payload,
      response_status: data.status === 'success' ? 200 : 400,
      error_message: data.error_message,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging webhook event:', error)
  }
}

/**
 * Log message flow
 */
export async function logMessageFlow(data: {
  response_id: string
  field_id: string
  message_type: 'question_sent' | 'response_received' | 'validation_error' | 'completion'
  content?: string
  error?: string
  metadata?: Record<string, any>
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('message_flow_logs').insert({
      response_id: data.response_id,
      field_id: data.field_id,
      message_type: data.message_type,
      content: data.content,
      error_message: data.error,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging message flow:', error)
  }
}

export async function logFormCompletion(data: {
  response_id: string
  form_id: string
  phone: string
  completion_time_seconds: number
  field_count: number
  total_fields: number
  error?: string
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('form_completion_logs').insert({
      response_id: data.response_id,
      form_id: data.form_id,
      phone: data.phone,
      completion_time_seconds: data.completion_time_seconds,
      field_count: data.field_count,
      total_fields: data.total_fields,
      status: data.error ? 'error' : 'success',
      error_message: data.error,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging form completion:', error)
  }
}

export async function logValidationError(data: {
  response_id: string
  field_id: string
  phone: string
  value_provided: string
  error_message: string
  field_type: string
  field_label: string
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('validation_error_logs').insert({
      response_id: data.response_id,
      field_id: data.field_id,
      phone: data.phone,
      value_provided: data.value_provided,
      error_message: data.error_message,
      field_type: data.field_type,
      field_label: data.field_label,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging validation error:', error)
  }
}

export async function logSessionEvent(data: {
  response_id: string
  event_type: 'created' | 'resumed' | 'completed' | 'abandoned' | 'expired'
  phone: string
  form_id: string
  metadata?: Record<string, any>
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('session_event_logs').insert({
      response_id: data.response_id,
      event_type: data.event_type,
      phone: data.phone,
      form_id: data.form_id,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging session event:', error)
  }
}

export async function logMessageError(data: {
  phone: string
  message_type: string
  error: string
  retry_count: number
  status: 'retrying' | 'failed'
  context?: string
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('message_error_logs').insert({
      phone: data.phone,
      message_type: data.message_type,
      error_message: data.error,
      retry_count: data.retry_count,
      status: data.status,
      context: data.context,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging message error:', error)
  }
}

export async function logApiError(data: {
  endpoint: string
  method: string
  status_code: number
  error_message: string
  user_id?: string
  metadata?: Record<string, any>
}) {
  try {
    const supabase = createSupabaseClient()
    await supabase.from('api_error_logs').insert({
      endpoint: data.endpoint,
      method: data.method,
      status_code: data.status_code,
      error_message: data.error_message,
      user_id: data.user_id,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ResponseLogger] Error logging API error:', error)
  }
}

export async function getLogs(data: {
  type: 'webhook' | 'message_flow' | 'validation' | 'session' | 'error'
  response_id?: string
  form_id?: string
  phone?: string
  limit?: number
}) {
  try {
    const supabase = createSupabaseClient()
    let query: any

    switch (data.type) {
      case 'webhook':
        query = supabase.from('webhook_logs').select('*')
        if (data.response_id) query = query.eq('response_id', data.response_id)
        if (data.form_id) query = query.eq('form_id', data.form_id)
        if (data.phone) query = query.eq('phone', data.phone)
        break

      case 'message_flow':
        query = supabase.from('message_flow_logs').select('*')
        if (data.response_id) query = query.eq('response_id', data.response_id)
        break

      case 'validation':
        query = supabase.from('validation_error_logs').select('*')
        if (data.response_id) query = query.eq('response_id', data.response_id)
        if (data.phone) query = query.eq('phone', data.phone)
        break

      case 'session':
        query = supabase.from('session_event_logs').select('*')
        if (data.response_id) query = query.eq('response_id', data.response_id)
        if (data.phone) query = query.eq('phone', data.phone)
        break

      case 'error':
        query = supabase.from('message_error_logs').select('*')
        if (data.phone) query = query.eq('phone', data.phone)
        break
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(data.limit || 50)

    if (error) {
      throw error
    }

    return { success: true, logs: logs || [] }
  } catch (error) {
    console.error('[ResponseLogger] Error fetching logs:', error)
    return { success: false, logs: [] }
  }
}