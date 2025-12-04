/**
 * WhatsApp Webhook Handler
 * Receives incoming messages from WhatsApp Cloud API
 * Validates, processes, and queues for worker
 */

interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: 'text' | 'image' | 'document' | 'button'
          text?: { body: string }
          image?: { id: string; mime_type: string }
          document?: { id: string; mime_type: string; filename: string }
          button?: { text: string; payload: string }
          interactive?: {
            type: 'button_reply' | 'list_reply'
            button_reply?: { id: string; title: string }
            list_reply?: { id: string; title: string }
          }
        }>
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
      }
      field: string
    }>
  }>
}

/**
 * GET - Webhook verification (required by Meta)
 */
export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    return handleWebhookVerification(event)
  }

  if (method === 'POST') {
    return handleWebhookMessage(event)
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  })
})

/**
 * Verify webhook subscription
 */
async function handleWebhookVerification(event: any) {
  const query = getQuery(event)
  const token = process.env.WHATSAPP_WEBHOOK_TOKEN
  const verifyToken = query.hub_verify_token

  if (!token || verifyToken !== token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid verification token',
    })
  }

  const challenge = query.hub_challenge
  return challenge
}

/**
 * Handle incoming WhatsApp message
 */
async function handleWebhookMessage(event: any) {
  const body = await readBody(event)

  // Log webhook for debugging
  console.log('[WhatsApp Webhook]', JSON.stringify(body, null, 2))

  // Validate webhook signature (security)
  const signature = getHeader(event, 'x-hub-signature-256')
  if (!validateWebhookSignature(body, signature)) {
    console.error('[WhatsApp Webhook] Invalid signature')
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid webhook signature',
    })
  }

  try {
    // Extract messages from payload
    const messages = extractMessages(body)

    if (messages.length === 0) {
      return { status: 'ok' }
    }

    // Queue each message for processing
    for (const message of messages) {
      await queueMessage(message)
    }

    // Return 200 immediately to acknowledge receipt
    return { status: 'ok' }
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error)
    // Still return 200 to prevent retry loops
    return { status: 'ok' }
  }
}

/**
 * Validate webhook signature
 */
function validateWebhookSignature(body: any, signature?: string): boolean {
  if (!signature) return false

  const secret = process.env.WHATSAPP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[WhatsApp Webhook] WHATSAPP_WEBHOOK_SECRET not set')
    return false
  }

  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex')

  const expectedSignature = `sha256=${hash}`

  return signature === expectedSignature
}

/**
 * Extract messages from payload
 */
function extractMessages(payload: WhatsAppWebhookPayload) {
  const messages: any[] = []

  if (!payload.entry) return messages

  for (const entry of payload.entry) {
    if (!entry.changes) continue

    for (const change of entry.changes) {
      if (!change.value.messages) continue

      for (const message of change.value.messages) {
        const contact = change.value.contacts?.[0]

        messages.push({
          message_id: message.id,
          from: message.from,
          timestamp: parseInt(message.timestamp) * 1000,
          type: message.type,
          text: message.text?.body || '',
          media_id: message.image?.id || message.document?.id,
          media_type: message.image?.mime_type || message.document?.mime_type,
          filename: message.document?.filename,
          button_payload: message.button?.payload,
          interactive_type: message.interactive?.type,
          interactive_reply_id:
            message.interactive?.button_reply?.id || message.interactive?.list_reply?.id,
          interactive_reply_title:
            message.interactive?.button_reply?.title || message.interactive?.list_reply?.title,
          contact_name: contact?.profile.name,
          contact_wa_id: contact?.wa_id,
        })
      }
    }
  }

  return messages
}

/**
 * Queue message for processing
 */
async function queueMessage(message: any) {
  const client = useRedis()

  try {
    // Queue message to Redis for processing
    await client.lpush(
      'whatsapp:incoming:queue',
      JSON.stringify({
        ...message,
        queued_at: new Date().toISOString(),
        status: 'pending',
      })
    )

    console.log(`[WhatsApp Webhook] Queued message ${message.message_id}`)
  } catch (error) {
    console.error('[WhatsApp Webhook] Error queueing message:', error)

    // Fallback: Log to database if Redis fails
    try {
      const supabase = useSupabaseServer()
      await supabase.from('webhook_logs').insert({
        webhook_id: message.message_id,
        event_type: 'incoming_message',
        phone: message.from,
        payload: message,
        response_status: 500,
        error_message: 'Failed to queue to Redis',
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('[WhatsApp Webhook] Error logging to database:', dbError)
    }
  }
}

/**
 * Helper: Get Redis client
 */
function useRedis() {
  // Import Redis client (configure in your setup)
  // For now, we'll use a placeholder
  const Redis = require('ioredis')
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  return redis
}

/**
 * Helper: Get Supabase server client
 */
function useSupabaseServer() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
  return supabase
}