/**
 * Start Queue Worker on Server Init
 * Initializes the WhatsApp message queue worker on server startup
 */

import { startQueueWorker } from '../utils/queueWorker'

let workerStarted = false

export default defineEventHandler((event) => {
  // Only start once, on first request
  if (!workerStarted && process.env.NODE_ENV !== 'test') {
    try {
      startQueueWorker()
      workerStarted = true
      console.log('[StartWorker] Queue worker initialized')
    } catch (error) {
      console.error('[StartWorker] Failed to start queue worker:', error)
    }
  }
})