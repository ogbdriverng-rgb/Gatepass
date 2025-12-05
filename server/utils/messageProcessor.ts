/**
 * Message Processor - Updated for Phase 7
 * Adds comprehensive error handling and logging
 */

import { createClient } from '@supabase/supabase-js'
import {
  getOrCreateSession,
  initializeSession,
  getCurrentField,
  setCurrentStep,
  getFormFields,
  getNextField,
  getSessionByPhone,
} from './sessionManager'
import { validateFieldValue } from './validation'
import {
  handleMessageError,
  handleValidationError,
  handleSessionError,
  handleWhatsAppError,
} from './errorHandler'
import { logMessageFlow, logSessionEvent, logFormCompletion } from './responseLogger'

/**
 * Helper: Create Supabase client
 */
function createSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}

interface ProcessingMessage {
  message_id: string
  from: string
  timestamp: number
  type: string
  text: string
  media_id?: string
  interactive_reply_id?: string
  interactive_reply_title?: string
  contact_name?: string
}

/**
 * Process a single message
 */
export async function processMessage(message: ProcessingMessage) {
  console.log(`[MessageProcessor] Processing message ${message.message_id} from ${message.from}`)

  try {
    if (message.text.startsWith('START:')) {
      return await handleFormStart(message)
    }

    const { success, session } = await getSessionByPhone(message.from)

    if (!success || !session) {
      await sendWhatsAppMessage(message.from, {
        type: 'text',
        body: 'Please use the link provided to start a form.',
      })
      return { success: false, error: 'No active session' }
    }

    return await handleFormResponse(session, message)
  } catch (error) {
    const { shouldRetry, message: errorMsg } = await handleMessageError({
      phone: message.from,
      message_id: message.message_id,
      error: error as Error,
      context: 'process_message',
      attempt: 1,
      maxAttempts: 3,
    })

    throw error
  }
}

/**
 * Handle form start command (START:form_key)
 */
async function handleFormStart(message: ProcessingMessage) {
  try {
    const supabase = createSupabaseClient()
    const formKey = message.text.split(':')[1]

    if (!formKey) {
      throw new Error('Invalid form key')
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('form_key', formKey)
      .eq('is_published', true)
      .single()

    if (formError || !form) {
      await sendWhatsAppMessage(message.from, {
        type: 'text',
        body: 'Form not found or not published.',
      })
      return { success: false, error: 'Form not found' }
    }

    // Get or create session
    const { success: sessionSuccess, session, isNew } = await getOrCreateSession(
      form.id,
      message.from,
      message.contact_name
    )

    if (!sessionSuccess || !session) {
      throw new Error('Failed to create session')
    }

    // Log session creation
    await logSessionEvent({
      response_id: session.id,
      event_type: isNew ? 'created' : 'resumed',
      phone: message.from,
      form_id: form.id,
    })

    // Initialize session with first field
    const { success: initSuccess, field: firstField } = await initializeSession(
      session.id,
      form.id
    )

    if (!initSuccess || !firstField) {
      throw new Error('Form has no fields')
    }

    // Get all fields
    const { success: fieldsSuccess, fields: allFields } = await getFormFields(form.id)

    if (!fieldsSuccess || !allFields) {
      throw new Error('Failed to fetch form fields')
    }

    // Send first question
    await sendFieldPrompt(message.from, firstField, 1, allFields.length)

    // Log message sent
    await logMessageFlow({
      response_id: session.id,
      field_id: firstField.id,
      message_type: 'question_sent',
      content: firstField.label,
    })

    return { success: true, responseId: session.id, isNewSession: isNew }
  } catch (error) {
    console.error('[MessageProcessor] Error starting form:', error)

    const { userMessage, logMessage: logMsg } = await handleSessionError({
      phone: message.from,
      error: error as Error,
      context: 'form_start',
    })

    await sendWhatsAppMessage(message.from, {
      type: 'text',
      body: userMessage,
    })

    throw error
  }
}

/**
 * Handle response to form field
 */
async function handleFormResponse(session: any, message: ProcessingMessage) {
  try {
    // Get current field
    const { success: currentSuccess, field: currentField, formId } = await getCurrentField(
      session.id
    )

    if (!currentSuccess || !currentField) {
      throw new Error('Could not get current field')
    }

    // Get all fields
    const { success: fieldsSuccess, fields: allFields } = await getFormFields(formId)

    if (!fieldsSuccess || !allFields) {
      throw new Error('Failed to fetch form fields')
    }

    // Validate response with field-specific validation
    const validation = validateFieldValue(message.text, currentField.type, currentField)

    if (!validation.valid) {
      // Log validation error
      await handleValidationError({
        response_id: session.id,
        field_id: currentField.id,
        phone: message.from,
        fieldLabel: currentField.label,
        fieldType: currentField.type,
        value: message.text,
        error: new Error(validation.error),
      })

      await logMessageFlow({
        response_id: session.id,
        field_id: currentField.id,
        message_type: 'validation_error',
        error: validation.error,
      })

      await sendWhatsAppMessage(message.from, {
        type: 'text',
        body: validation.error || 'Invalid response. Please try again.',
      })

      return { success: false, error: 'Validation failed' }
    }

    const supabase = createSupabaseClient()

    // Save response value
    const { error: saveError } = await supabase.from('form_response_values').upsert({
      response_id: session.id,
      field_id: currentField.id,
      value: validation.value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (saveError) {
      throw new Error(`Failed to save response: ${saveError.message}`)
    }

    // Log response received
    await logMessageFlow({
      response_id: session.id,
      field_id: currentField.id,
      message_type: 'response_received',
      content: validation.value,
    })

    // Update session activity
    await supabase
      .from('form_responses')
      .update({
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    // Get next field
    const { success: nextSuccess, field: nextField, isComplete } = await getNextField(
      session.id,
      allFields
    )

    if (!nextSuccess) {
      throw new Error('Failed to get next field')
    }

    if (isComplete) {
      // Form is complete
      await completeFormSubmission(session.id, session.created_at, formId, allFields.length)
      await sendWhatsAppMessage(message.from, {
        type: 'text',
        body: '✅ Thank you! Your response has been submitted.',
      })
      return { success: true, status: 'completed' }
    }

    // Find current field index for progress
    const currentIndex = allFields.findIndex(f => f.id === currentField.id)
    const nextIndex = currentIndex + 1

    // Set next field as current step
    await setCurrentStep(session.id, nextField.id)

    // Send next question
    await sendFieldPrompt(message.from, nextField, nextIndex + 1, allFields.length)

    // Log next question sent
    await logMessageFlow({
      response_id: session.id,
      field_id: nextField.id,
      message_type: 'question_sent',
      content: nextField.label,
    })

    return { success: true, status: 'in_progress' }
  } catch (error) {
    console.error('[MessageProcessor] Error handling response:', error)

    const { userMessage } = await handleSessionError({
      phone: message.from,
      error: error as Error,
      context: 'form_response',
    })

    await sendWhatsAppMessage(message.from, {
      type: 'text',
      body: userMessage,
    })

    throw error
  }
}

/**
 * Send field prompt message
 */
async function sendFieldPrompt(
  phone: string,
  field: any,
  questionNumber: number,
  totalQuestions: number
) {
  const progress = `(${questionNumber}/${totalQuestions})`
  const header = `${field.label} ${progress}`

  try {
    if (field.type === 'select' && field.meta?.options?.length) {
      const buttons = field.meta.options.slice(0, 3).map((opt: any) => ({
        type: 'reply',
        reply: {
          id: opt.id,
          title: opt.label,
        },
      }))

      await sendWhatsAppMessage(phone, {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: header },
          action: { buttons },
        },
      })
    } else if (field.type === 'multiselect' && field.meta?.options?.length > 3) {
      const rows = field.meta.options.map((opt: any) => ({
        id: opt.id,
        title: opt.label,
      }))

      await sendWhatsAppMessage(phone, {
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: header },
          action: {
            button: 'Choose',
            sections: [
              {
                title: 'Options',
                rows,
              },
            ],
          },
        },
      })
    } else {
      await sendWhatsAppMessage(phone, {
        type: 'text',
        body: header,
      })
    }
  } catch (error) {
    console.error('[MessageProcessor] Error sending field prompt:', error)
    throw error
  }
}

/**
 * Complete form submission
 */
async function completeFormSubmission(
  responseId: string,
  createdAt: string,
  formId: string,
  fieldCount: number
) {
  const supabase = createSupabaseClient()
  const completedAt = new Date().toISOString()
  const completionTime = Math.floor(
    (new Date(completedAt).getTime() - new Date(createdAt).getTime()) / 1000
  )

  const { data: session, error: fetchError } = await supabase
    .from('form_responses')
    .select('respondent_phone')
    .eq('id', responseId)
    .single()

  if (!fetchError && session) {
    const { error } = await supabase
      .from('form_responses')
      .update({
        status: 'completed',
        completed_at: completedAt,
        completion_time_seconds: completionTime,
        updated_at: completedAt,
      })
      .eq('id', responseId)

    if (!error) {
      // Log completion
      await logFormCompletion({
        response_id: responseId,
        form_id: formId,
        phone: session.respondent_phone,
        completion_time_seconds: completionTime,
        field_count: fieldCount,
        total_fields: fieldCount,
      })

      // Log session event
      await logSessionEvent({
        response_id: responseId,
        event_type: 'completed',
        phone: session.respondent_phone,
        form_id: formId,
      })

      console.log(`[MessageProcessor] Form ${responseId} completed in ${completionTime}s`)
    }
  }
}

/**
 * Send message via WhatsApp with error handling
 */
export async function sendWhatsAppMessage(to: string, message: any, retries = 2) {
  let lastError: any

  for (let i = 0; i <= retries; i++) {
    try {
      const apiUrl = 'https://graph.instagram.com/v15.0'
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
      const accessToken = process.env.WHATSAPP_API_TOKEN || ''

      const response = await $fetch(`${apiUrl}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: {
          messaging_product: 'whatsapp',
          to,
          ...message,
        },
      })

      console.log(`[WhatsAppClient] Message sent to ${to}`)
      return response
    } catch (error) {
      lastError = error
      const { message: errorMsg, shouldRetry } = handleWhatsAppError(error)

      console.error(`[WhatsAppClient] Send attempt ${i + 1} failed: ${errorMsg}`)

      if (i < retries && shouldRetry) {
        const delay = Math.min(1000 * (i + 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else if (!shouldRetry) {
        break
      }
    }
  }

  throw lastError
}