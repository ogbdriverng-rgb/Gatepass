/**
 * Queue Worker - Polls Redis queue and processes messages
 * Runs continuously in background
 */

import { processMessage } from './messageProcessor'

let Redis: any = null

// Lazy load Redis
async function loadRedis() {
  if (!Redis) {
    const module = await import('ioredis')
    Redis = module.default
  }
  return Redis
}

interface QueuedMessage {
  message_id: string
  from: string
  timestamp: number
  type: string
  text: string
  media_id?: string
  interactive_reply_id?: string
  interactive_reply_title?: string
  contact_name?: string
  queued_at: string
  status: string
  retry_count?: number
}

let redis: any = null
let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const QUEUE_NAME = 'whatsapp:incoming:queue'
const DEAD_LETTER_QUEUE = 'whatsapp:dead_letter_queue'
const MAX_RETRIES = 3
const POLL_INTERVAL = 2000 // 2 seconds

/**
 * Initialize Redis connection
 */
async function initRedis() {
  if (redis) return redis

  try {
    const RedisClass = await loadRedis()
    redis = new RedisClass(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: () => null,
      maxRetriesPerRequest: 1,
    })

    redis.on('connect', () => {
      console.log('[QueueWorker] Redis connected')
    })

    redis.on('error', (err: any) => {
      console.error('[QueueWorker] Redis error:', err.message)
    })

    return redis
  } catch (error) {
    console.error('[QueueWorker] Failed to initialize Redis:', error)
    return null
  }
}

/**
 * Start queue worker
 */
export async function startQueueWorker() {
  if (isWorkerRunning) {
    console.log('[QueueWorker] Worker already running')
    return
  }

  // Skip in development if Redis not available
  if (process.env.NODE_ENV === 'development') {
    console.log('[QueueWorker] Skipping in development mode (Redis optional)')
    return
  }

  console.log('[QueueWorker] Starting queue worker...')
  
  try {
    await initRedis()
    
    if (!redis) {
      console.warn('[QueueWorker] Redis not available, worker cannot start')
      return
    }
    
    isWorkerRunning = true

    workerInterval = setInterval(async () => {
      try {
        await pollQueue()
      } catch (error) {
        console.error('[QueueWorker] Poll error:', error)
      }
    }, POLL_INTERVAL)

    console.log('[QueueWorker] ✅ Queue worker started')
  } catch (error) {
    console.error('[QueueWorker] Failed to start:', error)
    isWorkerRunning = false
  }
}

/**
 * Stop queue worker
 */
export function stopQueueWorker() {
  if (!isWorkerRunning) return

  console.log('[QueueWorker] Stopping queue worker...')
  isWorkerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  if (redis) {
    redis.disconnect()
    redis = null
  }

  console.log('[QueueWorker] ✅ Queue worker stopped')
}

/**
 * Poll queue for messages
 */
async function pollQueue() {
  try {
    if (!redis) return

    // Get message from queue (RPOP = right pop, FIFO)
    const messageJson = await redis.rpop(QUEUE_NAME)

    if (!messageJson) {
      return // No messages in queue
    }

    const message = JSON.parse(messageJson) as QueuedMessage

    console.log(`[QueueWorker] Processing message ${message.message_id}`)

    await processQueuedMessage(message)
  } catch (error) {
    console.error('[QueueWorker] Error polling queue:', error)
  }
}

/**
 * Process queued message with retry logic
 */
async function processQueuedMessage(message: QueuedMessage) {
  const retryCount = message.retry_count || 0

  try {
    // Process message through message processor
    await processMessage(message)

    console.log(`[QueueWorker] ✅ Message ${message.message_id} processed successfully`)
  } catch (error) {
    console.error(`[QueueWorker] Error processing message ${message.message_id}:`, error)

    if (!redis) {
      console.warn('[QueueWorker] Redis not available, message lost')
      return
    }

    if (retryCount < MAX_RETRIES) {
      // Retry: push back to queue with incremented retry count
      const retryMessage = {
        ...message,
        retry_count: retryCount + 1,
        retry_at: new Date().toISOString(),
      }

      await redis.lpush(QUEUE_NAME, JSON.stringify(retryMessage))

      console.log(
        `[QueueWorker] Message ${message.message_id} queued for retry (${retryCount + 1}/${MAX_RETRIES})`
      )
    } else {
      // Max retries exceeded: move to dead letter queue
      const deadLetterMessage = {
        ...message,
        failed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      await redis.lpush(DEAD_LETTER_QUEUE, JSON.stringify(deadLetterMessage))

      console.log(
        `[QueueWorker] ❌ Message ${message.message_id} moved to dead letter queue after ${MAX_RETRIES} retries`
      )
    }
  }
}

/**
 * Get queue stats
 */
export async function getQueueStats() {
  try {
    if (!redis) {
      return {
        is_running: isWorkerRunning,
        queue_length: 0,
        dead_letter_length: 0,
        redis_available: false,
      }
    }

    const queueLength = await redis.llen(QUEUE_NAME)
    const deadLetterLength = await redis.llen(DEAD_LETTER_QUEUE)

    return {
      is_running: isWorkerRunning,
      queue_length: queueLength,
      dead_letter_length: deadLetterLength,
      redis_available: true,
    }
  } catch (error) {
    console.error('[QueueWorker] Error getting stats:', error)
    return {
      is_running: isWorkerRunning,
      queue_length: 0,
      dead_letter_length: 0,
      redis_available: false,
    }
  }
}

/**
 * Clear dead letter queue
 */
export async function clearDeadLetterQueue() {
  try {
    if (!redis) {
      return { success: false, error: 'Redis not available' }
    }

    await redis.del(DEAD_LETTER_QUEUE)
    console.log('[QueueWorker] Dead letter queue cleared')
    return { success: true }
  } catch (error) {
    console.error('[QueueWorker] Error clearing dead letter queue:', error)
    return { success: false, error }
  }
}

/**
 * Get dead letter messages
 */
export async function getDeadLetterMessages(limit = 50) {
  try {
    if (!redis) {
      return {
        success: false,
        messages: [],
        error: 'Redis not available',
      }
    }

    // Get messages from dead letter queue (LRANGE)
    const messages = await redis.lrange(DEAD_LETTER_QUEUE, 0, limit - 1)

    return {
      success: true,
      messages: messages.map(m => JSON.parse(m)),
    }
  } catch (error) {
    console.error('[QueueWorker] Error getting dead letter messages:', error)
    return {
      success: false,
      messages: [],
      error,
    }
  }
}