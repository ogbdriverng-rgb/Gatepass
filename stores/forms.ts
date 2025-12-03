import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GatpassForm, FormWithFields } from '~/composables/useForms'

/**
 * useFormStore - Pinia store for form state
 * Manages selected form, UI state, and editing
 */
export const useFormStore = defineStore('forms', () => {
  const supabase = useSupabaseClient()

  /* ============ STATE ============ */
  const selectedFormId = ref<string | null>(null)
  const isBuilderOpen = ref(false)
  const editingFieldId = ref<string | null>(null)
  const previewMode = ref(false)
  const sidebarOpen = ref(true)

  const forms = ref<GatpassForm[]>([])
  const currentForm = ref<FormWithFields | null>(null)

  /* ============ COMPUTED ============ */
  const selectedForm = computed(() => {
    if (selectedFormId.value) {
      return forms.value.find(f => f.id === selectedFormId.value)
    }
    return currentForm.value
  })

  const totalForms = computed(() => forms.value.length)
  const publishedForms = computed(() => forms.value.filter(f => f.is_published).length)
  const draftForms = computed(() => forms.value.filter(f => !f.is_published).length)

  const isEditing = computed(() => !!editingFieldId.value)

  /* ============ SETTERS ============ */
  const setSelectedForm = (formId: string | null) => {
    selectedFormId.value = formId
  }

  const setBuilderOpen = (open: boolean) => {
    isBuilderOpen.value = open
  }

  const setEditingField = (fieldId: string | null) => {
    editingFieldId.value = fieldId
  }

  const setPreviewMode = (mode: boolean) => {
    previewMode.value = mode
  }

  const setSidebarOpen = (open: boolean) => {
    sidebarOpen.value = open
  }

  /* ============ LOAD FORMS ============ */
  const loadForms = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

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

      forms.value = formsWithCounts
      return { success: true }
    } catch (err) {
      console.error('Error loading forms:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to load forms' }
    }
  }
  /* ============ LOAD CURRENT FORM ============ */
  const loadCurrentForm = async (formId: string) => {
    try {
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single()

      if (formError) throw new Error(formError.message)

      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('order_idx', { ascending: true })

      if (fieldsError) throw new Error(fieldsError.message)

      currentForm.value = {
        ...(form as GatpassForm),
        fields: fields || [],
      }

      selectedFormId.value = formId

      return { success: true }
    } catch (err) {
      console.error('Error loading current form:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to load form' }
    }
  }

  /* ============ UPDATE FORM LIST ============ */
  const updateFormInList = (form: GatpassForm) => {
    const index = forms.value.findIndex(f => f.id === form.id)
    if (index !== -1) {
      forms.value[index] = form
    }

    if (currentForm.value?.id === form.id) {
      currentForm.value = {
        ...currentForm.value,
        ...form,
      }
    }
  }

  /* ============ ADD TO LIST ============ */
  const addFormToList = (form: GatpassForm) => {
    forms.value.unshift(form)
  }

  /* ============ REMOVE FROM LIST ============ */
  const removeFromList = (formId: string) => {
    forms.value = forms.value.filter(f => f.id !== formId)

    if (selectedFormId.value === formId) {
      selectedFormId.value = null
      currentForm.value = null
    }
  }

  /* ============ RESET ============ */
  const reset = () => {
    selectedFormId.value = null
    isBuilderOpen.value = false
    editingFieldId.value = null
    previewMode.value = false
    forms.value = []
    currentForm.value = null
  }

  return {
    /* State */
    selectedFormId: computed(() => selectedFormId.value),
    isBuilderOpen: computed(() => isBuilderOpen.value),
    editingFieldId: computed(() => editingFieldId.value),
    previewMode: computed(() => previewMode.value),
    sidebarOpen: computed(() => sidebarOpen.value),
    forms: computed(() => forms.value),
    currentForm: computed(() => currentForm.value),

    /* Computed */
    selectedForm,
    totalForms,
    publishedForms,
    draftForms,
    isEditing,

    /* Methods */
    setSelectedForm,
    setBuilderOpen,
    setEditingField,
    setPreviewMode,
    setSidebarOpen,
    loadForms,
    loadCurrentForm,
    updateFormInList,
    addFormToList,
    removeFromList,
    reset,
  }
})