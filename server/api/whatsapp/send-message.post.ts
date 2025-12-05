/**
 * Send Message API - Send WhatsApp messages
 * Authenticated endpoint for sending WhatsApp notifications
 */

import { sendText, sendButtons, sendList, logMessage } from '~/server/utils/whatsappClient'

interface SendMessagePayload {
  to: string
  type: 'text' | 'buttons' | 'list'
  text?: string
  title?: string
  buttons?: Array<{ id: string; title: string }>
  sections?: Array<{
    title: string
    rows: Array<{ id: string; title: string }>
  }>
}

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const body = await readBody(event) as SendMessagePayload
    const supabase = useSupabaseServer()

    // Validate required fields
    if (!body.to || !body.type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: to, type',
      })
    }

    // Validate phone number format
    if (!/^\d+$/.test(body.to.replace(/\D/g, ''))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid phone number format',
      })
    }

    let response: any

    // Handle different message types
    switch (body.type) {
      case 'text':
        if (!body.text || body.text.trim().length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Text content is required for text messages',
          })
        }
        response = await sendText(body.to, body.text)
        break

      case 'buttons':
        if (!body.title || !body.buttons || body.buttons.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Title and at least one button are required',
          })
        }
        if (body.buttons.length > 3) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Maximum 3 buttons allowed',
          })
        }
        response = await sendButtons(body.to, body.title, body.buttons)
        break

      case 'list':
        if (!body.title || !body.sections || body.sections.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Title and at least one section are required',
          })
        }
        response = await sendList(body.to, body.title, body.sections)
        break

      default:
        throw createError({
          statusCode: 400,
          statusMessage: `Unknown message type: ${body.type}`,
        })
    }

    // Log successful message
    await logMessage(supabase, {
      phone: body.to,
      direction: 'outbound',
      type: body.type,
      message_id: response?.messages?.[0]?.id,
      status: 'sent',
      content: body.text || body.title,
    })

    console.log(`[Send Message API] Message sent to ${body.to}`)

    return {
      success: true,
      message_id: response?.messages?.[0]?.id,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[Send Message API] Error:', error)

    // If it's already a createError, throw it
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    // Log error message
    const body = await readBody(event).catch(() => ({})) as SendMessagePayload
    if (body.to) {
      const supabase = useSupabaseServer()
      await logMessage(supabase, {
        phone: body.to,
        direction: 'outbound',
        type: body.type || 'unknown',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }).catch(err => console.error('[Send Message API] Logging error failed:', err))
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to send message',
    })
  }
})

/**
 * Require authentication - Verify JWT token
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

    if (error || !data?.user) {
      return null
    }

    return data.user
  } catch (error) {
    console.error('[Auth] Error verifying token:', error)
    return null
  }
}

/**
 * Get Supabase server client
 */
function useSupabaseServer() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}