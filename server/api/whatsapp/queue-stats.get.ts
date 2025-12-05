/**
 * Queue Stats API - Get queue worker status
 */

import { getQueueStats } from '~/server/utils/queueWorker'

export default defineEventHandler(async (event) => {
  try {
    const stats = await getQueueStats()
    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('[Queue Stats API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get queue stats',
    })
  }
})