/**
 * Helper Utilities - Common utility functions
 */

/**
 * Format progress indicator
 */
export function getFormattedProgress(current: number, total: number): string {
  return `(${current}/${total})`
}

/**
 * Get field type config
 */
export function getFieldTypeConfig(fieldType: string) {
  const configs: Record<string, any> = {
    text: {
      name: 'Text',
      icon: 'mdi-format-text',
      placeholder: 'Enter text...',
    },
    email: {
      name: 'Email',
      icon: 'mdi-email',
      placeholder: 'your@email.com',
    },
    phone: {
      name: 'Phone',
      icon: 'mdi-phone',
      placeholder: '+234...',
    },
    number: {
      name: 'Number',
      icon: 'mdi-numeric',
      placeholder: 'Enter number...',
    },
    url: {
      name: 'URL',
      icon: 'mdi-link',
      placeholder: 'https://...',
    },
    date: {
      name: 'Date',
      icon: 'mdi-calendar',
      placeholder: 'YYYY-MM-DD',
    },
    textarea: {
      name: 'Long Text',
      icon: 'mdi-text-box-multiple',
      placeholder: 'Enter longer text...',
    },
    select: {
      name: 'Dropdown',
      icon: 'mdi-menu-down',
      placeholder: 'Select an option',
    },
    multiselect: {
      name: 'Multiple Choice',
      icon: 'mdi-checkbox-marked',
      placeholder: 'Select options',
    },
    rating: {
      name: 'Rating',
      icon: 'mdi-star',
      placeholder: 'Rate 1-5',
    },
    file: {
      name: 'File',
      icon: 'mdi-file',
      placeholder: 'Upload file',
    },
  }

  return configs[fieldType] || { name: fieldType, icon: 'mdi-help' }
}

/**
 * Extract form key from START message
 */
export function extractFormKey(message: string): string | null {
  const match = message.match(/^START:([a-zA-Z0-9]+)$/)
  return match ? match[1] : null
}

/**
 * Format phone number to E.164
 */
export function formatPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  // If doesn't start with country code, assume 234 (Nigeria)
  if (!cleaned.startsWith('234')) {
    if (cleaned.startsWith('0')) {
      return '234' + cleaned.substring(1)
    }
    return '234' + cleaned
  }

  return cleaned
}

/**
 * Validate E.164 phone
 */
export function isValidE164Phone(phone: string): boolean {
  const e164Regex = /^\d{10,15}$/
  return e164Regex.test(phone.replace(/\D/g, ''))
}

/**
 * Get retry delay with exponential backoff
 */
export function getRetryDelay(attempt: number): number {
  const baseDelay = 1000
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000)
  return delay + Math.random() * 1000
}

/**
 * Parse interactive message
 */
export function parseInteractiveMessage(message: any) {
  if (message.interactive?.button_reply) {
    return {
      type: 'button_reply',
      id: message.interactive.button_reply.id,
      title: message.interactive.button_reply.title,
    }
  }

  if (message.interactive?.list_reply) {
    return {
      type: 'list_reply',
      id: message.interactive.list_reply.id,
      title: message.interactive.list_reply.title,
    }
  }

  return null
}

/**
 * Is message a form start
 */
export function isFormStartMessage(text: string): boolean {
  return text.startsWith('START:') && text.length > 6
}

/**
 * Sanitize string for database
 */
export function sanitizeString(str: string, maxLength = 500): string {
  return str
    .trim()
    .substring(0, maxLength)
    .replace(/[^\w\s\-.,!?@#$%&()]/g, '')
}

/**
 * Generate unique ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(
  currentFieldIndex: number,
  totalFields: number
): number {
  if (totalFields === 0) return 0
  return Math.round(((currentFieldIndex + 1) / totalFields) * 100)
}

/**
 * Format completion time
 */
export function formatCompletionTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}h ${remainingMinutes}m`
}

/**
 * Is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Get human-readable timestamp
 */
export function getHumanReadableTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}