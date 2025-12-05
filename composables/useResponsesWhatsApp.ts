/**
 * useResponsesWhatsApp - WhatsApp-specific response management
 */

import { ref, computed } from 'vue'

export interface WhatsAppResponse {
  id: string
  form_id: string
  respondent_phone: string
  respondent_name?: string
  status: 'in_progress' | 'completed' | 'abandoned'
  source: 'whatsapp'
  current_step?: string
  completion_time_seconds?: number
  created_at: string
  updated_at: string
  completed_at?: string
  last_activity_at: string
}

export interface WhatsAppResponseValue {
  id: string
  field_id: string
  value: any
  created_at: string
}

/**
 * useResponsesWhatsApp - Composable for WhatsApp response management
 */
export const useResponsesWhatsApp = () => {
  const supabase = useSupabaseClient()

  /* ============ STATE ============ */
  const responses = ref<WhatsAppResponse[]>([])
  const currentResponse = ref<WhatsAppResponse | null>(null)
  const responseValues = ref<WhatsAppResponseValue[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /* ============ COMPUTED ============ */
  const totalResponses = computed(() => responses.value.length)
  const completedResponses = computed(() =>
    responses.value.filter(r => r.status === 'completed').length
  )
  const inProgressResponses = computed(() =>
    responses.value.filter(r => r.status === 'in_progress').length
  )
  const abandonedResponses = computed(() =>
    responses.value.filter(r => r.status === 'abandoned').length
  )

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

  /* ============ GET FORM RESPONSES ============ */
  const getFormResponses = async (formId: string, filters?: {
    status?: string
    limit?: number
    offset?: number
  }) => {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .eq('source', 'whatsapp')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0)

      if (fetchError) throw new Error(fetchError.message)

      responses.value = data || []
      return { success: true, responses: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch responses'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ GET SINGLE RESPONSE ============ */
  const getResponse = async (responseId: string) => {
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

      currentResponse.value = response as WhatsAppResponse
      responseValues.value = values || []

      return {
        success: true,
        response: currentResponse.value,
        values: responseValues.value,
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch response'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ GET PHONE RESPONSES ============ */
  const getPhoneResponses = async (phone: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('respondent_phone', phone)
        .eq('source', 'whatsapp')
        .order('created_at', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)

      responses.value = data || []
      return { success: true, responses: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch responses'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ MARK AS ABANDONED ============ */
  const markAbandoned = async (responseId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('form_responses')
        .update({
          status: 'abandoned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)

      const index = responses.value.findIndex(r => r.id === responseId)
      if (index !== -1) {
        responses.value[index] = data as WhatsAppResponse
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark abandoned'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ EXPORT RESPONSES ============ */
  const exportResponses = async (formId: string, format: 'csv' | 'json' = 'csv') => {
    try {
      const { success, responses: formResponses } = await getFormResponses(formId)

      if (!success || !formResponses) {
        throw new Error('Failed to fetch responses')
      }

      if (format === 'json') {
        return {
          success: true,
          data: JSON.stringify(formResponses, null, 2),
          filename: `responses_${formId}_${Date.now()}.json`,
        }
      }

      // CSV format
      let csv = 'Phone,Name,Status,Completion Time,Started,Completed\n'

      for (const response of formResponses) {
        const completionTime = response.completion_time_seconds
          ? `${Math.round(response.completion_time_seconds / 60)}m`
          : '-'
        csv += `${response.respondent_phone},"${response.respondent_name || ''}",${response.status},${completionTime},"${response.created_at}","${response.completed_at || ''}"\n`
      }

      return {
        success: true,
        data: csv,
        filename: `responses_${formId}_${Date.now()}.csv`,
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      return { success: false, error: error.value }
    }
  }

  /* ============ GET STATS ============ */
  const getStats = async (formId: string) => {
    try {
      const { success } = await getFormResponses(formId)

      if (!success) {
        throw new Error('Failed to fetch responses')
      }

      return {
        success: true,
        stats: {
          total: totalResponses.value,
          completed: completedResponses.value,
          in_progress: inProgressResponses.value,
          abandoned: abandonedResponses.value,
          completion_rate: completionRate.value,
          avg_completion_time: averageCompletionTime.value,
        },
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get stats'
      return { success: false, error: error.value }
    }
  }

  return {
    /* State */
    responses: computed(() => responses.value),
    currentResponse: computed(() => currentResponse.value),
    responseValues: computed(() => responseValues.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    /* Computed */
    totalResponses,
    completedResponses,
    inProgressResponses,
    abandonedResponses,
    completionRate,
    averageCompletionTime,

    /* Methods */
    getFormResponses,
    getResponse,
    getPhoneResponses,
    markAbandoned,
    exportResponses,
    getStats,
  }
}