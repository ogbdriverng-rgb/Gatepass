import { ref, computed } from 'vue'

export interface FormResponse {
  id: string
  form_id: string
  respondent_phone: string
  respondent_name?: string
  respondent_email?: string
  status: 'in_progress' | 'completed' | 'abandoned'
  source: 'whatsapp' | 'web' | 'api'
  version: number
  current_step?: string
  session_data: Record<string, any>
  device_info?: Record<string, any>
  ip_address?: string
  completion_time_seconds?: number
  created_at: string
  updated_at: string
  completed_at?: string
  last_activity_at: string
}

export interface ResponseValue {
  id: string
  response_id: string
  field_id: string
  value: any
  created_at: string
}

export interface ResponseWithValues extends FormResponse {
  values: ResponseValue[]
}

/**
 * useResponses - Composable for response management
 * Handles response CRUD, session management, and submission tracking
 */
export const useResponses = () => {
  const supabase = useSupabaseClient()

  /* ============ STATE ============ */
  const responses = ref<FormResponse[]>([])
  const currentResponse = ref<ResponseWithValues | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /* ============ COMPUTED ============ */
  const responseCount = computed(() => responses.value.length)
  const completedCount = computed(() => responses.value.filter(r => r.status === 'completed').length)
  const completionRate = computed(() => {
    if (responseCount.value === 0) return 0
    return Math.round((completedCount.value / responseCount.value) * 100)
  })

  /* ============ CREATE RESPONSE (New Session) ============ */
  const createResponse = async (data: {
    form_id: string
    respondent_phone: string
    respondent_name?: string
    respondent_email?: string
    source: 'whatsapp' | 'web' | 'api'
    device_info?: Record<string, any>
    ip_address?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const { data: newResponse, error: createError } = await supabase
        .from('form_responses')
        .insert({
          form_id: data.form_id,
          respondent_phone: data.respondent_phone,
          respondent_name: data.respondent_name,
          respondent_email: data.respondent_email,
          source: data.source,
          status: 'in_progress',
          version: 1,
          session_data: {},
          device_info: data.device_info,
          ip_address: data.ip_address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) throw new Error(createError.message)

      currentResponse.value = {
        ...(newResponse as FormResponse),
        values: [],
      }

      return { success: true, response: newResponse }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create response'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ GET RESPONSE ============ */
  const getResponse = async (responseId: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Get response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('id', responseId)
        .single()

      if (responseError) throw new Error(responseError.message)

      // Get response values
      const { data: values, error: valuesError } = await supabase
        .from('form_response_values')
        .select('*')
        .eq('response_id', responseId)

      if (valuesError) throw new Error(valuesError.message)

      currentResponse.value = {
        ...(response as FormResponse),
        values: values as ResponseValue[],
      }

      return { success: true, response: currentResponse.value }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch response'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ LIST RESPONSES ============ */
  const listResponses = async (formId: string, filters?: {
    status?: string
    source?: string
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

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.source) {
        query = query.eq('source', filters.source)
      }

      const { data, error: listError } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0)

      if (listError) throw new Error(listError.message)

      responses.value = data as FormResponse[]
      return { success: true, responses: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch responses'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ ADD RESPONSE VALUE ============ */
  const addResponseValue = async (data: {
    response_id: string
    field_id: string
    value: any
  }) => {
    isLoading.value = true
    error.value = null

    try {
      // Check if value exists, update or create
      const { data: existing, error: checkError } = await supabase
        .from('form_response_values')
        .select('id')
        .eq('response_id', data.response_id)
        .eq('field_id', data.field_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message)
      }

      let result
      if (existing) {
        // Update existing
        const { data: updated, error: updateError } = await supabase
          .from('form_response_values')
          .update({ value: data.value, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)
        result = updated
      } else {
        // Create new
        const { data: created, error: createError } = await supabase
          .from('form_response_values')
          .insert({
            response_id: data.response_id,
            field_id: data.field_id,
            value: data.value,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) throw new Error(createError.message)
        result = created
      }

      // Update local state
      if (currentResponse.value?.id === data.response_id) {
        const valueIndex = currentResponse.value.values.findIndex(
          v => v.field_id === data.field_id
        )
        if (valueIndex !== -1) {
          currentResponse.value.values[valueIndex] = result as ResponseValue
        } else {
          currentResponse.value.values.push(result as ResponseValue)
        }
      }

      return { success: true, value: result }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save response value'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ UPDATE RESPONSE STATUS ============ */
  const updateResponseStatus = async (
    responseId: string,
    status: 'in_progress' | 'completed' | 'abandoned'
  ) => {
    isLoading.value = true
    error.value = null

    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      }

      // Add completion time if completing
      if (status === 'completed' && currentResponse.value?.created_at) {
        const createdTime = new Date(currentResponse.value.created_at).getTime()
        const completionTime = Math.floor((Date.now() - createdTime) / 1000)
        updates.completion_time_seconds = completionTime
        updates.completed_at = new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('form_responses')
        .update(updates)
        .eq('id', responseId)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)

      // Update local state
      const index = responses.value.findIndex(r => r.id === responseId)
      if (index !== -1) {
        responses.value[index] = data as FormResponse
      }

      if (currentResponse.value?.id === responseId) {
        currentResponse.value = {
          ...currentResponse.value,
          ...(data as FormResponse),
        }
      }

      return { success: true, response: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update response status'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ GET OR CREATE SESSION ============ */
  const getOrCreateSession = async (formId: string, phone: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Check for existing in-progress session
      const { data: existing, error: checkError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .eq('respondent_phone', phone)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message)
      }

      if (existing) {
        // Return existing session
        const { data: values } = await supabase
          .from('form_response_values')
          .select('*')
          .eq('response_id', existing.id)

        currentResponse.value = {
          ...(existing as FormResponse),
          values: values || [],
        }

        return { success: true, response: currentResponse.value, isNew: false }
      }

      // Create new session
      const { data: newResponse, error: createError } = await supabase
        .from('form_responses')
        .insert({
          form_id: formId,
          respondent_phone: phone,
          source: 'whatsapp',
          status: 'in_progress',
          version: 1,
          session_data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) throw new Error(createError.message)

      currentResponse.value = {
        ...(newResponse as FormResponse),
        values: [],
      }

      return { success: true, response: currentResponse.value, isNew: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get or create session'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ DELETE RESPONSE ============ */
  const deleteResponse = async (responseId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', responseId)

      if (deleteError) throw new Error(deleteError.message)

      responses.value = responses.value.filter(r => r.id !== responseId)

      if (currentResponse.value?.id === responseId) {
        currentResponse.value = null
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete response'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    /* State */
    responses: computed(() => responses.value),
    currentResponse: computed(() => currentResponse.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    /* Computed */
    responseCount,
    completedCount,
    completionRate,

    /* Methods */
    createResponse,
    getResponse,
    listResponses,
    addResponseValue,
    updateResponseStatus,
    getOrCreateSession,
    deleteResponse,
  }
}