/**
 * Debug Endpoint - Get session and message flow for debugging
 * Development/testing only
 */

import {
  getTestSession,
  getMessageLogs,
  getValidationErrors,
  checkQueueStats,
} from '~/server/utils/testHelpers'

export default defineEventHandler(async (event) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Debug endpoints disabled in production',
    })
  }

  try {
    const query = getQuery(event)
    const responseId = query.response_id as string

    if (!responseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing query parameter: response_id',
      })
    }

    console.log('[Debug Endpoint] Getting debug info for session:', responseId)

    // Get session
    const { success: sessionSuccess, session } = await getTestSession(responseId)

    if (!sessionSuccess) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found',
      })
    }

    // Get message logs
    const { success: logsSuccess, logs } = await getMessageLogs(responseId)

    // Get validation errors
    const { success: errorsSuccess, errors } = await getValidationErrors(responseId)

    // Get queue stats
    const queueStats = await checkQueueStats()

    return {
      success: true,
      session: sessionSuccess ? session : null,
      message_flow: logsSuccess ? logs : [],
      validation_errors: errorsSuccess ? errors : [],
      queue_stats: queueStats,
    }
  } catch (error) {
    console.error('[Debug Endpoint] Error:', error)
    throw error
  }
})