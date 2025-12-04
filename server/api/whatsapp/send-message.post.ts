/**
 * Send Message API
 * Allows sending messages via WhatsApp API
 * Used for notifications, reminders, etc.
 */

interface SendMessagePayload {
  to: string
  type: 'text' | 'template' | 'interactive'
  text?: string
  template_name?: string
  template_params?: Record<string, any>
}

export default defineEventHandler(async (event) => {
  // Verify authentication
  const user = await requireAuth(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // Get request body
  const body = await readBody(event) as SendMessagePayload

  // Validate
  if (!body.to || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: to, type',
    })
  }

  try {
    const whatsapp = useWhatsAppClient()

    let message: any = {
      messaging_product: 'whatsapp',
      to: body.to,
    }

    if (body.type === 'text') {
      message.type = 'text'
      message.text = { body: body.text }
    } else if (body.type === 'template') {
      message.type = 'template'
      message.template = {
        name: body.template_name,
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters:
              body.template_params &&
              Object.values(body.template_params).map(v => ({ type: 'text', text: String(v) })),
          },
        ],
      }
    }

    const result = await whatsapp.sendMessage(message)

    // Log message
    await logWhatsAppMessage({
      direction: 'outbound',
      phone: body.to,
      type: body.type,
      message_id: result.messages?.[0]?.id,
      status: 'sent',
    })

    return {
      success: true,
      message_id: result.messages?.[0]?.id,
    }
  } catch (error) {
    console.error('[Send Message API] Error:', error)

    await logWhatsAppMessage({
      direction: 'outbound',
      phone: body.to,
      type: body.type,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send message',
    })
  }
})

/**
 * Require authentication
 */
async function requireAuth(event: any) {
  try {
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const supabase = useSupabaseServer()

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

/**
 * Log WhatsApp message
 */
async function logWhatsAppMessage(data: any) {
  try {
    const supabase = useSupabaseServer()

    await supabase.from('whatsapp_messages').insert({
      phone: data.phone,
      direction: data.direction,
      type: data.type,
      message_id: data.message_id,
      status: data.status,
      content: data.message,
      error_message: data.error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Log WhatsApp Message] Error:', error)
  }
}

/**
 * WhatsApp Client
 */
function useWhatsAppClient() {
  const apiUrl = 'https://graph.instagram.com/v15.0'
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
  const accessToken = process.env.WHATSAPP_API_TOKEN || ''

  return {
    async sendMessage(message: any) {
      const response = await $fetch(`${apiUrl}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: message,
      })

      return response
    },
  }
}

/**
 * Helper: Get Supabase server client
 */
function useSupabaseServer() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}