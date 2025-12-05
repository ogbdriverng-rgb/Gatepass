/**
 * Test Endpoint - Simulate WhatsApp messages for testing
 * Development/testing only
 */

import { simulateIncomingMessage } from '~/server/utils/testHelpers'

interface TestMessagePayload {
  from: string
  text: string
  contact_name?: string
  message_id?: string
}

export default defineEventHandler(async (event) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Test endpoints disabled in production',
    })
  }

  try {
    const body = await readBody(event) as TestMessagePayload

    // Validate required fields
    if (!body.from || !body.text) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: from, text',
      })
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\d{10,15}$/
    const cleanPhone = body.from.replace(/\D/g, '')
    
    if (!phoneRegex.test(cleanPhone)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid phone number format. Use E.164 format (e.g., 2348012345678)',
      })
    }

    console.log('[Test Endpoint] Simulating message:', {
      from: body.from,
      text: body.text,
      contact_name: body.contact_name,
      timestamp: new Date().toISOString(),
    })

    const result = await simulateIncomingMessage({
      from: body.from,
      text: body.text,
      contact_name: body.contact_name,
      message_id: body.message_id,
      timestamp: Date.now(),
    })

    return {
      success: result.success,
      message: result.success ? 'Message processed successfully' : 'Failed to process message',
      data: result.result || null,
      error: result.error ? {
        name: result.error.name,
        message: result.error.message,
      } : null,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[Test Endpoint] Error:', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})