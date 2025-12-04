/**
 * WhatsApp Webhook Verification Endpoint (GET)
 * Meta sends a verification request to confirm webhook URL
 * 
 * Meta sends: GET /api/webhook/whatsapp?hub.mode=subscribe&hub.challenge=xxxx&hub.verify_token=yyyy
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  // Meta sends with dots: hub.mode, hub.challenge, hub.verify_token
  const hubMode = (query['hub.mode'] || query.hub_mode) as string
  const hubChallenge = (query['hub.challenge'] || query.hub_challenge) as string
  const hubVerifyToken = (query['hub.verify_token'] || query.hub_verify_token) as string

  // Get verify token from runtime config (loaded from .env)
  const verifyToken = config.whatsappWebhookToken

  console.log('[WhatsApp Webhook GET] Verification request received:', {
    hub_mode: hubMode,
    hub_challenge: hubChallenge ? `${hubChallenge.substring(0, 10)}...` : 'missing',
    hub_verify_token: hubVerifyToken ? '***' : 'missing',
    token_configured: !!verifyToken,
  })

  // Validate that verify token is configured
  if (!verifyToken) {
    console.error('[WhatsApp Webhook GET] ❌ WHATSAPP_WEBHOOK_TOKEN not configured in environment')
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook token not configured',
    })
  }

  // Validate verification token matches
  if (hubVerifyToken !== verifyToken) {
    console.error('[WhatsApp Webhook GET] ❌ Invalid verification token provided', {
      received: hubVerifyToken ? '***' : 'missing',
      expected: '***',
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid verification token',
    })
  }

  // Validate mode is 'subscribe'
  if (hubMode !== 'subscribe') {
    console.error('[WhatsApp Webhook GET] ❌ Invalid mode:', hubMode)
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid mode: ${hubMode}. Expected: subscribe`,
    })
  }

  // Validate challenge is present
  if (!hubChallenge) {
    console.error('[WhatsApp Webhook GET] ❌ Missing hub_challenge parameter')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing hub_challenge parameter',
    })
  }

  // Verification successful - return the challenge
  console.log('[WhatsApp Webhook GET] ✅ Verification successful - returning challenge')
  return hubChallenge
})