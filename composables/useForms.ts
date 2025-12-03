import { ref, computed } from 'vue'

export interface FormField {
  id: string
  field_key: string
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'file' | 'date' | 'rating' | 'textarea' | 'phone' | 'url'
  label: string
  placeholder?: string
  is_required: boolean
  order_idx: number
  meta: {
    options?: Array<{ id: string; label: string }>
    validations?: Record<string, any>
    conditional_logic?: any[]
    description?: string
    min?: number
    max?: number
  }
}

export interface GatpassForm {
  id: string
  owner_id: string
  title: string
  description?: string
  slug: string
  public_alias?: string
  form_key: string
  config: {
    allow_edit: boolean
    expiry_days?: number
    validations?: Record<string, any>
  }
  flow_json?: Record<string, any>
  flow_version: number
  is_active: boolean
  is_published: boolean
  status: 'draft' | 'published' | 'archived'
  total_responses: number
  created_at: string
  updated_at: string
}

export interface FormWithFields extends GatpassForm {
  fields: FormField[]
}

/**
 * useForms - Composable for form management
 * Handles CRUD operations for forms and fields
 */
export const useForms = () => {
  const supabase = useSupabaseClient()

  /* ============ STATE ============ */
  const forms = ref<GatpassForm[]>([])
  const currentForm = ref<FormWithFields | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /* ============ COMPUTED ============ */
  const formCount = computed(() => forms.value.length)
  const publishedFormCount = computed(() => forms.value.filter(f => f.is_published).length)

  /* ============ CREATE FORM ============ */
  const createForm = async (data: {
    title: string
    description?: string
    slug: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      // Generate form key
      const formKey = generateFormKey()

      const { data: newForm, error: createError } = await supabase
        .from('forms')
        .insert({
          owner_id: useAuthStore().profile?.id,
          title: data.title,
          description: data.description,
          slug: data.slug,
          form_key: formKey,
          status: 'draft',
          is_active: true,
          is_published: false,
          config: {
            allow_edit: true,
            expiry_days: null,
          },
        })
        .select()
        .single()

      if (createError) throw new Error(createError.message)

      forms.value.push(newForm as GatpassForm)
      currentForm.value = {
        ...(newForm as GatpassForm),
        fields: [],
      }

      return { success: true, form: newForm }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create form'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ GET FORM ============ */
  const getForm = async (formKey: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('form_key', formKey)
        .single()

      if (formError) throw new Error(formError.message)

      // Get form fields
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', form.id)
        .order('order_idx', { ascending: true })

      if (fieldsError) throw new Error(fieldsError.message)

      currentForm.value = {
        ...(form as GatpassForm),
        fields: fields as FormField[],
      }

      return { success: true, form: currentForm.value }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch form'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ LIST FORMS ============ */
  const listForms = async (ownerId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: listError } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (listError) throw new Error(listError.message)

      // Fetch response count for each form
      const formsWithCounts = await Promise.all(
        (data || []).map(async (form) => {
          const { count } = await supabase
            .from('form_responses')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id)

          return {
            ...form,
            total_responses: count || 0,
          }
        })
      )

      forms.value = formsWithCounts as GatpassForm[]
      return { success: true, forms: formsWithCounts }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch forms'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  /* ============ UPDATE FORM ============ */
  const updateForm = async (formId: string, updates: Partial<GatpassForm>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('forms')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formId)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)

      // Update local state
      const index = forms.value.findIndex(f => f.id === formId)
      if (index !== -1) {
        forms.value[index] = data as GatpassForm
      }

      if (currentForm.value?.id === formId) {
        currentForm.value = {
          ...currentForm.value,
          ...(data as GatpassForm),
        }
      }

      return { success: true, form: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update form'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ DELETE FORM ============ */
  const deleteForm = async (formId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase.from('forms').delete().eq('id', formId)

      if (deleteError) throw new Error(deleteError.message)

      forms.value = forms.value.filter(f => f.id !== formId)

      if (currentForm.value?.id === formId) {
        currentForm.value = null
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete form'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ PUBLISH FORM ============ */
  const publishForm = async (formId: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Validate form has at least one field
      if (!currentForm.value?.fields || currentForm.value.fields.length === 0) {
        error.value = 'Form must have at least one field'
        return { success: false, error: error.value }
      }

      // Compile flow JSON
      const flowJson = compileFlow(currentForm.value)

      const { data, error: publishError } = await supabase
        .from('forms')
        .update({
          is_published: true,
          status: 'published',
          flow_json: flowJson,
          flow_version: (currentForm.value.flow_version || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formId)
        .select()
        .single()

      if (publishError) throw new Error(publishError.message)

      // Update local state
      const index = forms.value.findIndex(f => f.id === formId)
      if (index !== -1) {
        forms.value[index] = data as GatpassForm
      }

      if (currentForm.value) {
        currentForm.value = {
          ...currentForm.value,
          ...(data as GatpassForm),
        }
      }

      return { success: true, form: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to publish form'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ UNPUBLISH FORM ============ */
  const unpublishForm = async (formId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: unpublishError } = await supabase
        .from('forms')
        .update({
          is_published: false,
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', formId)
        .select()
        .single()

      if (unpublishError) throw new Error(unpublishError.message)

      // Update local state
      const index = forms.value.findIndex(f => f.id === formId)
      if (index !== -1) {
        forms.value[index] = data as GatpassForm
      }

      if (currentForm.value?.id === formId) {
        currentForm.value = {
          ...currentForm.value,
          ...(data as GatpassForm),
        }
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unpublish form'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ ADD FIELD ============ */
  const addField = async (formId: string, field: Omit<FormField, 'id'>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fieldError } = await supabase
        .from('form_fields')
        .insert({
          form_id: formId,
          ...field,
          id: undefined, // Let DB generate ID
        })
        .select()
        .single()

      if (fieldError) throw new Error(fieldError.message)

      if (currentForm.value?.id === formId) {
        currentForm.value.fields.push(data as FormField)
      }

      return { success: true, field: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add field'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ UPDATE FIELD ============ */
  const updateField = async (fieldId: string, updates: Partial<FormField>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fieldError } = await supabase
        .from('form_fields')
        .update(updates)
        .eq('id', fieldId)
        .select()
        .single()

      if (fieldError) throw new Error(fieldError.message)

      if (currentForm.value) {
        const fieldIndex = currentForm.value.fields.findIndex(f => f.id === fieldId)
        if (fieldIndex !== -1) {
          currentForm.value.fields[fieldIndex] = data as FormField
        }
      }

      return { success: true, field: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update field'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ DELETE FIELD ============ */
  const deleteField = async (fieldId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: fieldError } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId)

      if (fieldError) throw new Error(fieldError.message)

      if (currentForm.value) {
        currentForm.value.fields = currentForm.value.fields.filter(f => f.id !== fieldId)
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete field'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ REORDER FIELDS ============ */
  const reorderFields = async (formId: string, fieldIds: string[]) => {
    isLoading.value = true
    error.value = null

    try {
      // Update order_idx for each field
      const updates = fieldIds.map((fieldId, index) => ({
        id: fieldId,
        order_idx: index,
      }))

      for (const update of updates) {
        const { error: reorderError } = await supabase
          .from('form_fields')
          .update({ order_idx: update.order_idx })
          .eq('id', update.id)

        if (reorderError) throw new Error(reorderError.message)
      }

      // Refresh fields
      if (currentForm.value?.id === formId) {
        currentForm.value.fields.sort((a, b) => a.order_idx - b.order_idx)
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reorder fields'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ HELPER FUNCTIONS ============ */
  const generateFormKey = (): string => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const compileFlow = (form: FormWithFields): Record<string, any> => {
    const steps = form.fields.map((field, index) => {
      const baseStep = {
        step_id: `s${index + 1}`,
        field_id: field.id,
        type: field.type,
        prompt: field.label,
        validations: field.meta.validations || {},
        next: index === form.fields.length - 1 ? null : `s${index + 2}`,
      }

      // Add options for select/multiselect
      if (['select', 'multiselect'].includes(field.type)) {
        ;(baseStep as any).options = field.meta.options || []
      }

      return baseStep
    })

    return {
      form_key: form.form_key,
      title: form.title,
      steps,
      settings: {
        allow_edit: form.config.allow_edit,
        edit_window_days: form.config.expiry_days,
        alias: form.public_alias,
        web_url: `${window.location.origin}/f/${form.form_key}`,
        whatsapp_trigger: `START:${form.form_key}`,
      },
    }
  }

  return {
    /* State */
    forms: computed(() => forms.value),
    currentForm: computed(() => currentForm.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    /* Computed */
    formCount,
    publishedFormCount,

    /* Methods */
    createForm,
    getForm,
    listForms,
    updateForm,
    deleteForm,
    publishForm,
    unpublishForm,
    addField,
    updateField,
    deleteField,
    reorderFields,
  }
}