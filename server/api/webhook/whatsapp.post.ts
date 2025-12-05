/**
 * WhatsApp Webhook Handler (POST)
 * Receives incoming messages from WhatsApp Cloud API
 * Validates, processes, and queues for worker
 */

import { createHmac } from 'crypto'
import Redis from 'ioredis'
import { createClient } from '@supabase/supabase-js'

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
          type: 'text' | 'image' | 'document' | 'button' | 'interactive'
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
 * GET - Webhook verification
 */
async function handleWebhookVerification(event: any) {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const hubMode = (query['hub.mode'] || query.hub_mode) as string
  const hubChallenge = (query['hub.challenge'] || query.hub_challenge) as string
  const hubVerifyToken = (query['hub.verify_token'] || query.hub_verify_token) as string

  const verifyToken = config.public.whatsappWebhookToken || config.whatsappWebhookToken

  console.log('[WhatsApp Webhook GET] Verification request:', {
    hub_mode: hubMode,
    hub_challenge: hubChallenge ? `${hubChallenge.substring(0, 10)}...` : 'missing',
    hub_verify_token: hubVerifyToken ? '***' : 'missing',
    token_configured: !!verifyToken,
  })

  if (!verifyToken) {
    console.error('[WhatsApp Webhook GET] ❌ WHATSAPP_WEBHOOK_TOKEN not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook token not configured',
    })
  }

  if (hubVerifyToken !== verifyToken) {
    console.error('[WhatsApp Webhook GET] ❌ Invalid verification token')
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid verification token',
    })
  }

  if (hubMode !== 'subscribe') {
    console.error('[WhatsApp Webhook GET] ❌ Invalid mode:', hubMode)
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid mode: ${hubMode}`,
    })
  }

  if (!hubChallenge) {
    console.error('[WhatsApp Webhook GET] ❌ Missing hub_challenge')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing hub_challenge',
    })
  }

  console.log('[WhatsApp Webhook GET] ✅ Verification successful')
  return hubChallenge
}

/**
 * POST - Handle incoming message
 */
async function handleWebhookMessage(event: any) {
  const body = await readBody(event)

  console.log('[WhatsApp Webhook POST] Received webhook payload')

  // Validate signature
  const signature = getHeader(event, 'x-hub-signature-256')
  if (!validateWebhookSignature(body, signature)) {
    console.error('[WhatsApp Webhook POST] Invalid signature')
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid webhook signature',
    })
  }

  try {
    const messages = extractMessages(body)

    if (messages.length === 0) {
      console.log('[WhatsApp Webhook POST] No messages in payload')
      return { status: 'ok' }
    }

    console.log(`[WhatsApp Webhook POST] Extracted ${messages.length} message(s)`)

    // Queue each message
    for (const message of messages) {
      await queueMessage(message)
    }

    return { status: 'ok' }
  } catch (error) {
    console.error('[WhatsApp Webhook POST] Error:', error)
    // Return 200 to prevent retries
    return { status: 'ok' }
  }
}

/**
 * Validate webhook signature (HMAC-SHA256)
 */
function validateWebhookSignature(body: any, signature?: string): boolean {
  if (!signature) {
    console.warn('[WhatsApp Webhook] No signature provided')
    return false
  }

  const secret = process.env.WHATSAPP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[WhatsApp Webhook] WHATSAPP_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    const hash = createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex')

    const expectedSignature = `sha256=${hash}`

    const isValid = signature === expectedSignature
    console.log('[WhatsApp Webhook] Signature validation:', isValid ? '✅ Valid' : '❌ Invalid')

    return isValid
  } catch (error) {
    console.error('[WhatsApp Webhook] Signature validation error:', error)
    return false
  }
}

/**
 * Extract messages from webhook payload
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

        // Handle different message types
        let text = ''
        let interactiveReplyId = ''
        let interactiveReplyTitle = ''

        if (message.type === 'text') {
          text = message.text?.body || ''
        } else if (message.type === 'interactive') {
          if (message.interactive?.type === 'button_reply') {
            interactiveReplyId = message.interactive.button_reply?.id || ''
            interactiveReplyTitle = message.interactive.button_reply?.title || ''
            text = interactiveReplyTitle
          } else if (message.interactive?.type === 'list_reply') {
            interactiveReplyId = message.interactive.list_reply?.id || ''
            interactiveReplyTitle = message.interactive.list_reply?.title || ''
            text = interactiveReplyTitle
          }
        }

        messages.push({
          message_id: message.id,
          from: message.from,
          timestamp: parseInt(message.timestamp) * 1000,
          type: message.type,
          text,
          media_id: message.image?.id || message.document?.id,
          media_type: message.image?.mime_type || message.document?.mime_type,
          filename: message.document?.filename,
          button_payload: message.button?.payload,
          interactive_reply_id: interactiveReplyId,
          interactive_reply_title: interactiveReplyTitle,
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
  try {
    const redis = getRedisClient()

    await redis.lpush(
      'whatsapp:incoming:queue',
      JSON.stringify({
        ...message,
        queued_at: new Date().toISOString(),
        status: 'pending',
      })
    )

    console.log(`[WhatsApp Webhook POST] Queued message ${message.message_id}`)
  } catch (error) {
    console.error('[WhatsApp Webhook POST] Error queueing message:', error)

    // Fallback: Log to database
    try {
      const supabase = getSupabaseClient()
      await supabase.from('webhook_logs').insert({
        webhook_id: message.message_id,
        event_type: 'incoming_message',
        phone: message.from,
        payload: message,
        response_status: 500,
        error_message: error instanceof Error ? error.message : 'Failed to queue',
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('[WhatsApp Webhook POST] Error logging to database:', dbError)
    }
  }
}

/**
 * Helper: Get Redis client
 */
function getRedisClient() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  return new Redis(redisUrl)
}

/**
 * Helper: Get Supabase server client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''
  return createClient(supabaseUrl, supabaseKey)
}  