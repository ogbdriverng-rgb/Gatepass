/**
 * Message Processor - Business Logic for Handling WhatsApp Messages
 * This processes messages from the webhook queue
 */

import { createClient } from '@supabase/supabase-js'

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

export class MessageProcessor {
  private supabase: any
  private whatsappClient: any

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    )
    this.whatsappClient = new WhatsAppClient()
  }

  /**
   * Process a single message
   */
  async processMessage(message: ProcessingMessage) {
    console.log(`[MessageProcessor] Processing message from ${message.from}`)

    try {
      // Step 1: Check if message starts a form (START:form_key)
      if (message.text.startsWith('START:')) {
        return await this.handleFormStart(message)
      }

      // Step 2: Check if user has active session
      const session = await this.findActiveSession(message.from)

      if (!session) {
        // No active session, ask user to start a form
        await this.whatsappClient.sendMessage(message.from, {
          type: 'text',
          body: 'Please use the link provided to start a form.',
        })
        return
      }

      // Step 3: Handle message based on form flow
      return await this.handleFormResponse(session, message)
    } catch (error) {
      console.error(`[MessageProcessor] Error processing message:`, error)
      throw error
    }
  }

  /**
   * Handle form start command
   */
  private async handleFormStart(message: ProcessingMessage) {
    try {
      // Extract form key from START:abc123
      const formKey = message.text.split(':')[1]

      if (!formKey) {
        throw new Error('Invalid form key')
      }

      // Get form details
      const { data: form, error: formError } = await this.supabase
        .from('forms')
        .select('*')
        .eq('form_key', formKey)
        .eq('is_published', true)
        .single()

      if (formError) {
        throw new Error('Form not found')
      }

      // Check for existing session
      const { data: existingSession } = await this.supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', form.id)
        .eq('respondent_phone', message.from)
        .eq('status', 'in_progress')
        .limit(1)
        .single()

      let responseId: string

      if (existingSession) {
        // Resume existing session
        responseId = existingSession.id
        console.log(`[MessageProcessor] Resuming session ${responseId}`)
      } else {
        // Create new session
        const { data: newResponse, error: createError } = await this.supabase
          .from('form_responses')
          .insert({
            form_id: form.id,
            respondent_phone: message.from,
            respondent_name: message.contact_name,
            status: 'in_progress',
            source: 'whatsapp',
            version: form.flow_version || 1,
            session_data: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create response: ${createError.message}`)
        }

        responseId = newResponse.id
        console.log(`[MessageProcessor] Created new session ${responseId}`)
      }

      // Get first field from flow
      const { data: fields } = await this.supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', form.id)
        .order('order_idx', { ascending: true })
        .limit(1)

      const firstField = fields?.[0]

      if (!firstField) {
        throw new Error('Form has no fields')
      }

      // Send first question
      await this.sendFieldPrompt(message.from, firstField, 1, fields.length)

      return { success: true, responseId }
    } catch (error) {
      console.error('[MessageProcessor] Error starting form:', error)
      await this.whatsappClient.sendMessage(message.from, {
        type: 'text',
        body: 'Sorry, there was an error starting the form. Please try again.',
      })
      throw error
    }
  }

  /**
   * Handle response to form field
   */
  private async handleFormResponse(session: any, message: ProcessingMessage) {
    try {
      // Get current field from flow
      const { data: response } = await this.supabase
        .from('form_responses')
        .select('*')
        .eq('id', session.id)
        .single()

      const { data: fields } = await this.supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', response.form_id)
        .order('order_idx', { ascending: true })

      // Find current field index
      const currentFieldIndex = fields.findIndex(f => f.id === response.current_step)
      const currentField = fields[currentFieldIndex]

      if (!currentField) {
        throw new Error('Field not found')
      }

      // Validate response value
      const validation = await this.validateResponse(
        message,
        currentField,
        response.respondent_phone
      )

      if (!validation.valid) {
        // Send error message and re-prompt
        await this.whatsappClient.sendMessage(message.from, {
          type: 'text',
          body: validation.error || 'Invalid response. Please try again.',
        })
        return
      }

      // Save response value
      await this.supabase.from('form_response_values').upsert({
        response_id: session.id,
        field_id: currentField.id,
        value: validation.value,
        created_at: new Date().toISOString(),
      })

      // Check if more fields
      const nextFieldIndex = currentFieldIndex + 1

      if (nextFieldIndex >= fields.length) {
        // Form complete
        await this.completeForm(session.id, fields)
        await this.whatsappClient.sendMessage(message.from, {
          type: 'text',
          body: '✅ Thank you! Your response has been submitted.',
        })
        return { success: true, status: 'completed' }
      }

      // Send next question
      const nextField = fields[nextFieldIndex]
      await this.updateCurrentStep(session.id, nextField.id)
      await this.sendFieldPrompt(
        message.from,
        nextField,
        nextFieldIndex + 1,
        fields.length
      )

      return { success: true, status: 'in_progress' }
    } catch (error) {
      console.error('[MessageProcessor] Error handling response:', error)
      await this.whatsappClient.sendMessage(message.from, {
        type: 'text',
        body: 'Sorry, there was an error processing your response.',
      })
      throw error
    }
  }

  /**
   * Send field prompt message
   */
  private async sendFieldPrompt(
    phone: string,
    field: any,
    questionNumber: number,
    totalQuestions: number
  ) {
    const progress = `(${questionNumber}/${totalQuestions})`

    const header = `${field.label} ${progress}`

    if (field.type === 'select' && field.meta.options?.length) {
      // Send as buttons (max 3)
      const buttons = field.meta.options.slice(0, 3).map((opt: any) => ({
        type: 'reply',
        reply: {
          id: opt.id,
          title: opt.label,
        },
      }))

      await this.whatsappClient.sendMessage(phone, {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: header },
          action: { buttons },
        },
      })
    } else if (
      field.type === 'multiselect' &&
      field.meta.options?.length > 3
    ) {
      // Send as list
      const rows = field.meta.options.map((opt: any) => ({
        id: opt.id,
        title: opt.label,
      }))

      await this.whatsappClient.sendMessage(phone, {
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
      // Send as text
      await this.whatsappClient.sendMessage(phone, {
        type: 'text',
        body: header,
      })
    }
  }

  /**
   * Validate response value
   */
  private async validateResponse(message: ProcessingMessage, field: any, phone: string) {
    try {
      const value = message.interactive_reply_id || message.text

      // Add validation based on field type
      if (field.meta.validations?.required && !value) {
        return {
          valid: false,
          error: 'This field is required',
        }
      }

      return {
        valid: true,
        value,
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid response',
      }
    }
  }

  /**
   * Complete form submission
   */
  private async completeForm(responseId: string, fields: any[]) {
    const completedAt = new Date().toISOString()
    const { data: response } = await this.supabase
      .from('form_responses')
      .select('created_at')
      .eq('id', responseId)
      .single()

    const completionTime = Math.floor(
      (new Date(completedAt).getTime() -
        new Date(response.created_at).getTime()) /
        1000
    )

    await this.supabase
      .from('form_responses')
      .update({
        status: 'completed',
        completed_at: completedAt,
        completion_time_seconds: completionTime,
        updated_at: completedAt,
      })
      .eq('id', responseId)
  }

  /**
   * Find active session for phone
   */
  private async findActiveSession(phone: string) {
    const { data } = await this.supabase
      .from('form_responses')
      .select('*')
      .eq('respondent_phone', phone)
      .eq('status', 'in_progress')
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .single()

    return data
  }

  /**
   * Update current step
   */
  private async updateCurrentStep(responseId: string, fieldId: string) {
    await this.supabase
      .from('form_responses')
      .update({
        current_step: fieldId,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', responseId)
  }
}

/**
 * WhatsApp Cloud API Client
 */
class WhatsAppClient {
  private apiUrl: string
  private phoneNumberId: string
  private accessToken: string

  constructor() {
    this.apiUrl = 'https://graph.instagram.com/v15.0'
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    this.accessToken = process.env.WHATSAPP_API_TOKEN || ''
  }

  /**
   * Send message via WhatsApp
   */
  async sendMessage(to: string, message: any) {
    try {
      const response = await $fetch(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            messaging_product: 'whatsapp',
            to,
            ...message,
          },
        }
      )

      console.log(`[WhatsAppClient] Message sent to ${to}:`, response)
      return response
    } catch (error) {
      console.error(`[WhatsAppClient] Error sending message:`, error)
      throw error
    }
  }
}