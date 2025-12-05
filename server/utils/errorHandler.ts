/**
 * Error Handler - Centralized error handling and recovery
 */

import { logMessageError, logValidationError } from './responseLogger'

/**
 * Handle message processing error
 */
export async function handleMessageError(data: {
  phone: string
  message_id: string
  error: Error
  context: string
  attempt: number
  maxAttempts: number
}) {
  console.error(
    `[ErrorHandler] ${data.context} - Attempt ${data.attempt}/${data.maxAttempts}:`,
    data.error.message
  )

  // Log error
  await logMessageError({
    phone: data.phone,
    message_type: data.context,
    error: data.error.message,
    retry_count: data.attempt,
    status: data.attempt < data.maxAttempts ? 'retrying' : 'failed',
  }).catch(err => console.error('[ErrorHandler] Failed to log error:', err))

  return {
    shouldRetry: data.attempt < data.maxAttempts,
    message: getErrorMessage(data.error),
  }
}

/**
 * Handle validation error
 */
export async function handleValidationError(data: {
  response_id: string
  field_id: string
  phone: string
  fieldLabel: string
  fieldType: string
  value: string
  error: Error
}) {
  console.error(
    `[ErrorHandler] Validation error for field ${data.field_id}:`,
    data.error.message
  )

  // Log validation error
  await logValidationError({
    response_id: data.response_id,
    field_id: data.field_id,
    phone: data.phone,
    value_provided: data.value,
    error_message: data.error.message,
    field_type: data.fieldType,
  }).catch(err => console.error('[ErrorHandler] Failed to log validation error:', err))

  return {
    userMessage: data.error.message,
    fieldLabel: data.fieldLabel,
  }
}

/**
 * Handle session error
 */
export async function handleSessionError(data: {
  phone: string
  error: Error
  context: string
}) {
  console.error(`[ErrorHandler] Session error - ${data.context}:`, data.error.message)

  return {
    userMessage: 'There was an error with your session. Please start a new form.',
    logMessage: `${data.context}: ${data.error.message}`,
  }
}

/**
 * Handle WhatsApp API error
 */
export function handleWhatsAppError(error: any): {
  message: string
  shouldRetry: boolean
  statusCode?: number
} {
  const statusCode = error?.status || error?.statusCode || error?.response?.status

  console.error('[ErrorHandler] WhatsApp API Error:', {
    status: statusCode,
    message: error?.message,
    data: error?.data,
  })

  // Determine if error is retryable (server errors and rate limits)
  const retryableStatuses = [429, 500, 502, 503, 504]
  const shouldRetry = retryableStatuses.includes(statusCode)

  const messages: Record<number, string> = {
    400: 'Bad request to WhatsApp API',
    401: 'WhatsApp API authentication failed',
    403: 'Forbidden - Check WhatsApp API permissions',
    404: 'WhatsApp endpoint not found',
    429: 'Too many requests - rate limited',
    500: 'WhatsApp API server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
    504: 'Gateway timeout',
  }

  return {
    message: messages[statusCode] || 'Failed to send message',
    shouldRetry,
    statusCode,
  }
}

/**
 * Handle database error
 */
export function handleDatabaseError(error: any): {
  message: string
  isDatabaseError: boolean
  code?: string
} {
  console.error('[ErrorHandler] Database Error:', {
    code: error?.code,
    message: error?.message,
  })

  const isDatabaseError = 
    error?.code?.startsWith('PGRST') || 
    error?.message?.includes('database') ||
    error?.message?.includes('postgres')

  if (isDatabaseError) {
    return {
      message: 'Database error - please try again later',
      isDatabaseError: true,
      code: error?.code,
    }
  }

  return {
    message: error?.message || 'Unknown error',
    isDatabaseError: false,
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: Error | any): string {
  const message = error?.message || error?.toString() || 'Unknown error'

  // Map technical errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Form not found': 'This form could not be found. Please check the link and try again.',
    'No fields': 'This form has no fields. Please contact the form owner.',
    'Session not found': 'Your session expired. Please start the form again.',
    'Validation failed': 'Your response did not meet the requirements. Please try again.',
    'ECONNREFUSED': 'Connection error. Please try again in a moment.',
    'ETIMEDOUT': 'Request timeout. Please try again.',
    'network': 'Network error. Please check your connection.',
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  return 'Something went wrong. Please try again.'
}

/**
 * Exponential backoff for retries
 */
export function getBackoffDelay(attempt: number, maxDelay = 10000): number {
  const baseDelay = 1000
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1)
  const cappedDelay = Math.min(exponentialDelay, maxDelay)
  // Add jitter (±10%)
  const jitter = cappedDelay * 0.1 * (Math.random() * 2 - 1)
  return cappedDelay + jitter
}

/**
 * Is error retryable
 */
export function isErrorRetryable(error: any): boolean {
  const message = error?.message || ''
  
  // Network errors are retryable
  const retryablePatterns = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'network',
    'timeout',
    'temporarily unavailable',
  ]

  for (const pattern of retryablePatterns) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return true
    }
  }

  // Check status code
  const statusCode = error?.status || error?.statusCode || error?.response?.status
  const retryableStatuses = [429, 500, 502, 503, 504]
  
  return retryableStatuses.includes(statusCode)
}