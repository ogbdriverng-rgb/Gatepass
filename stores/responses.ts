import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormResponse, ResponseWithValues } from '~/composables/useResponses'

/**
 * useResponseStore - Pinia store for response state
 * Manages active responses and session data
 */
export const useResponseStore = defineStore('responses', () => {
  const supabase = useSupabaseClient()

  /* ============ STATE ============ */
  const responses = ref<FormResponse[]>([])
  const currentResponse = ref<ResponseWithValues | null>(null)
  const currentFormId = ref<string | null>(null)
  const currentStep = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /* ============ COMPUTED ============ */
  const totalResponses = computed(() => responses.value.length)
  const completedResponses = computed(() => responses.value.filter(r => r.status === 'completed').length)
  const completionRate = computed(() => {
    if (totalResponses.value === 0) return 0
    return Math.round((completedResponses.value / totalResponses.value) * 100)
  })

  const averageCompletionTime = computed(() => {
    const completed = responses.value.filter(r => r.completion_time_seconds)
    if (completed.length === 0) return 0
    const total = completed.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0)
    return Math.round(total / completed.length)
  })

  const responsesBySource = computed(() => {
    const sources = { whatsapp: 0, web: 0, api: 0 }
    responses.value.forEach(r => {
      if (r.source in sources) {
        sources[r.source as keyof typeof sources]++
      }
    })
    return sources
  })

  /* ============ SETTERS ============ */
  const setCurrentResponse = (response: ResponseWithValues | null) => {
    currentResponse.value = response
  }

  const setCurrentFormId = (formId: string | null) => {
    currentFormId.value = formId
  }

  const setCurrentStep = (stepId: string | null) => {
    currentStep.value = stepId
  }

  /* ============ LOAD RESPONSES ============ */
  const loadResponses = async (formId: string, filters?: {
    status?: string
    source?: string
    limit?: number
  }) => {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.source) {
        query = query.eq('source', filters.source)
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100)

      if (fetchError) throw new Error(fetchError.message)

      responses.value = data || []
      currentFormId.value = formId

      return { success: true, responses: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load responses'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ LOAD CURRENT RESPONSE ============ */
  const loadCurrentResponse = async (responseId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('id', responseId)
        .single()

      if (responseError) throw new Error(responseError.message)

      const { data: values, error: valuesError } = await supabase
        .from('form_response_values')
        .select('*')
        .eq('response_id', responseId)

      if (valuesError) throw new Error(valuesError.message)

      currentResponse.value = {
        ...(response as FormResponse),
        values: values || [],
      }

      return { success: true, response: currentResponse.value }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load response'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ UPDATE RESPONSE ============ */
  const updateResponse = (response: FormResponse) => {
    const index = responses.value.findIndex(r => r.id === response.id)
    if (index !== -1) {
      responses.value[index] = response
    }

    if (currentResponse.value?.id === response.id) {
      currentResponse.value = {
        ...currentResponse.value,
        ...response,
      }
    }
  }

  /* ============ RESET ============ */
  const reset = () => {
    responses.value = []
    currentResponse.value = null
    currentFormId.value = null
    currentStep.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    /* State */
    responses: computed(() => responses.value),
    currentResponse: computed(() => currentResponse.value),
    currentFormId: computed(() => currentFormId.value),
    currentStep: computed(() => currentStep.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    /* Computed */
    totalResponses,
    completedResponses,
    completionRate,
    averageCompletionTime,
    responsesBySource,

    /* Methods */
    setCurrentResponse,
    setCurrentFormId,
    setCurrentStep,
    loadResponses,
    loadCurrentResponse,
    updateResponse,
    reset,
  }
})