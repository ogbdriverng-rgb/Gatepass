/**
 * Field Types Configuration
 * Defines available field types for forms
 */

export interface FieldTypeConfig {
  id: string
  name: string
  description: string
  icon: string
  category: 'input' | 'selection' | 'media' | 'rating'
  default_meta: Record<string, any>
  supports_options: boolean
  supports_validation: boolean
  supports_conditional: boolean
  whatsapp_type: string
}

export const FIELD_TYPES: Record<string, FieldTypeConfig> = {
  text: {
    id: 'text',
    name: 'Short Text',
    description: 'Single line text input',
    icon: 'type',
    category: 'input',
    default_meta: {
      placeholder: '',
      validations: {
        required: false,
        min_length: 0,
        max_length: 255,
        pattern: '',
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  email: {
    id: 'email',
    name: 'Email',
    description: 'Email address input',
    icon: 'mail',
    category: 'input',
    default_meta: {
      placeholder: 'name@example.com',
      validations: {
        required: false,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  phone: {
    id: 'phone',
    name: 'Phone',
    description: 'Phone number input',
    icon: 'phone',
    category: 'input',
    default_meta: {
      placeholder: '+234...',
      validations: {
        required: false,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  number: {
    id: 'number',
    name: 'Number',
    description: 'Numeric input',
    icon: 'hash',
    category: 'input',
    default_meta: {
      placeholder: '',
      validations: {
        required: false,
        min: 0,
        max: 1000,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  textarea: {
    id: 'textarea',
    name: 'Long Text',
    description: 'Multi-line text input',
    icon: 'align-left',
    category: 'input',
    default_meta: {
      placeholder: '',
      validations: {
        required: false,
        min_length: 0,
        max_length: 5000,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  date: {
    id: 'date',
    name: 'Date',
    description: 'Date picker',
    icon: 'calendar',
    category: 'input',
    default_meta: {
      validations: {
        required: false,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  select: {
    id: 'select',
    name: 'Single Select',
    description: 'Choose one option',
    icon: 'chevron-down',
    category: 'selection',
    default_meta: {
      options: [
        { id: 'opt_1', label: 'Option 1' },
        { id: 'opt_2', label: 'Option 2' },
      ],
      validations: {
        required: false,
      },
    },
    supports_options: true,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'buttons',
  },

  multiselect: {
    id: 'multiselect',
    name: 'Multi Select',
    description: 'Choose multiple options',
    icon: 'check-square',
    category: 'selection',
    default_meta: {
      options: [
        { id: 'opt_1', label: 'Option 1' },
        { id: 'opt_2', label: 'Option 2' },
      ],
      validations: {
        required: false,
      },
    },
    supports_options: true,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'list',
  },

  rating: {
    id: 'rating',
    name: 'Rating',
    description: 'Star or numeric rating',
    icon: 'star',
    category: 'rating',
    default_meta: {
      scale: 5,
      validations: {
        required: false,
      },
    },
    supports_options: false,
    supports_validation: false,
    supports_conditional: true,
    whatsapp_type: 'text',
  },

  file: {
    id: 'file',
    name: 'File Upload',
    description: 'Upload files (images, documents)',
    icon: 'upload',
    category: 'media',
    default_meta: {
      allowed_types: ['image/jpeg', 'image/png', 'image/jpg'],
      max_size_mb: 10,
      validations: {
        required: false,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'document',
  },

  url: {
    id: 'url',
    name: 'URL',
    description: 'Website URL input',
    icon: 'link',
    category: 'input',
    default_meta: {
      placeholder: 'https://example.com',
      validations: {
        required: false,
      },
    },
    supports_options: false,
    supports_validation: true,
    supports_conditional: true,
    whatsapp_type: 'text',
  },
}

export const FIELD_CATEGORIES = [
  { id: 'input', label: 'Input Fields', icon: 'type' },
  { id: 'selection', label: 'Selection', icon: 'check-square' },
  { id: 'media', label: 'Media', icon: 'image' },
  { id: 'rating', label: 'Rating', icon: 'star' },
]

export const getFieldType = (typeId: string): FieldTypeConfig | undefined => {
  return FIELD_TYPES[typeId]
}

export const getFieldsByCategory = (category: string): FieldTypeConfig[] => {
  return Object.values(FIELD_TYPES).filter(field => field.category === category)
}

export const getAllFields = (): FieldTypeConfig[] => {
  return Object.values(FIELD_TYPES)
}