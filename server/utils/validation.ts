/**
 * Validation Utilities - Field-specific validation
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate number
 */
export function validateNumber(value: string, min?: number, max?: number): boolean {
  const num = parseFloat(value)

  if (isNaN(num)) {
    return false
  }

  if (min !== undefined && num < min) {
    return false
  }

  if (max !== undefined && num > max) {
    return false
  }

  return true
}

/**
 * Validate date format
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Validate field value based on type
 */
export function validateFieldValue(
  value: string,
  fieldType: string,
  field: any
): { valid: boolean; error?: string } {
  // Check required
  if (field.is_required && !value) {
    return {
      valid: false,
      error: `${field.label} is required`,
    }
  }

  // Empty optional field is valid
  if (!value) {
    return { valid: true }
  }

  switch (fieldType) {
    case 'email':
      if (!validateEmail(value)) {
        return {
          valid: false,
          error: `${field.label} must be a valid email`,
        }
      }
      break

    case 'phone':
      if (!validatePhone(value)) {
        return {
          valid: false,
          error: `${field.label} must be a valid phone number`,
        }
      }
      break

    case 'url':
      if (!validateUrl(value)) {
        return {
          valid: false,
          error: `${field.label} must be a valid URL`,
        }
      }
      break

    case 'number':
      const min = field.meta?.min
      const max = field.meta?.max
      if (!validateNumber(value, min, max)) {
        let msg = `${field.label} must be a valid number`
        if (min !== undefined && max !== undefined) {
          msg += ` between ${min} and ${max}`
        } else if (min !== undefined) {
          msg += ` at least ${min}`
        } else if (max !== undefined) {
          msg += ` at most ${max}`
        }
        return {
          valid: false,
          error: msg,
        }
      }
      break

    case 'date':
      if (!validateDate(value)) {
        return {
          valid: false,
          error: `${field.label} must be a valid date`,
        }
      }
      break

    case 'select':
      if (field.meta?.options) {
        const validOption = field.meta.options.some((opt: any) => opt.id === value || opt.label === value)
        if (!validOption) {
          return {
            valid: false,
            error: `${field.label} must be a valid option`,
          }
        }
      }
      break

    case 'multiselect':
      if (field.meta?.options) {
        const values = Array.isArray(value) ? value : [value]
        const allValid = values.every((v: string) =>
          field.meta.options.some((opt: any) => opt.id === v || opt.label === v)
        )
        if (!allValid) {
          return {
            valid: false,
            error: `${field.label} contains invalid options`,
          }
        }
      }
      break

    case 'rating':
      const rating = parseInt(value)
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return {
          valid: false,
          error: `${field.label} must be between 1 and 5`,
        }
      }
      break
  }

  return { valid: true }
}

/**
 * Get validation error message
 */
export function getValidationErrorMessage(fieldType: string, fieldLabel: string): string {
  const messages: Record<string, string> = {
    email: `${fieldLabel} must be a valid email address`,
    phone: `${fieldLabel} must be a valid phone number`,
    url: `${fieldLabel} must be a valid URL`,
    number: `${fieldLabel} must be a valid number`,
    date: `${fieldLabel} must be a valid date`,
    select: `${fieldLabel} must be a valid selection`,
    multiselect: `${fieldLabel} must contain valid selections`,
    rating: `${fieldLabel} must be between 1 and 5`,
    text: `${fieldLabel} is invalid`,
    textarea: `${fieldLabel} is invalid`,
  }

  return messages[fieldType] || `${fieldLabel} is invalid`
}