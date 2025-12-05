/**
 * WhatsApp Client - Utility functions for WhatsApp messaging
 */

const API_URL = 'https://graph.instagram.com/v15.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
const ACCESS_TOKEN = process.env.WHATSAPP_API_TOKEN || ''

/**
 * Send text message
 */
export async function sendText(to: string, text: string) {
  return await sendMessage(to, {
    type: 'text',
    text: { body: text },
  })
}

/**
 * Send button message
 */
export async function sendButtons(
  to: string,
  title: string,
  buttons: Array<{ id: string; title: string }>
) {
  return await sendMessage(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: title },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title,
          },
        })),
      },
    },
  })
}

/**
 * Send list message
 */
export async function sendList(
  to: string,
  title: string,
  sections: Array<{
    title: string
    rows: Array<{ id: string; title: string }>
  }>
) {
  return await sendMessage(to, {
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: title },
      action: {
        button: 'Choose',
        sections,
      },
    },
  })
}

/**
 * Send generic message
 */
export async function sendMessage(to: string, message: any, retries = 2) {
  let lastError: any

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await $fetch(`${API_URL}/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
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
      console.error(`[WhatsAppClient] Send attempt ${i + 1} failed:`, error)

      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError
}

/**
 * Log message to database
 */
export async function logMessage(
  supabase: any,
  data: {
    phone: string
    direction: 'inbound' | 'outbound'
    type: string
    message_id?: string
    status: string
    content?: string
    error?: string
  }
) {
  try {
    await supabase.from('whatsapp_messages').insert({
      phone: data.phone,
      direction: data.direction,
      type: data.type,
      message_id: data.message_id,
      status: data.status,
      content: data.content,
      error_message: data.error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[WhatsAppClient] Error logging message:', error)
  }
}