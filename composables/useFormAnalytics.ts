/**
 * useFormAnalytics - Composable for form analytics
 */

import { ref, computed } from 'vue'

interface FormAnalytics {
  total_responses: number
  completed: number
  in_progress: number
  abandoned: number
  completion_rate: number
  avg_completion_time_seconds: number
}

interface FieldStat {
  field_id: string
  label: string
  type: string
  responses: number
  response_rate: number
}

/**
 * useFormAnalytics - Get and manage form analytics
 */
export const useFormAnalytics = () => {
  const $fetch = useFetch()
  const authStore = useAuthStore()

  /* ============ STATE ============ */
  const analytics = ref<FormAnalytics | null>(null)
  const fieldStats = ref<FieldStat[]>([])
  const responsesBySource = ref<Record<string, number>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /* ============ COMPUTED ============ */
  const completionRate = computed(() => analytics.value?.completion_rate || 0)
  const avgCompletionTime = computed(() => analytics.value?.avg_completion_time_seconds || 0)
  const totalResponses = computed(() => analytics.value?.total_responses || 0)
  const completedResponses = computed(() => analytics.value?.completed || 0)

  /* ============ GET FORM ANALYTICS ============ */
  const getFormAnalytics = async (formId: string, period: '24h' | '7d' | '30d' = '7d') => {
    isLoading.value = true
    error.value = null

    try {
      const authToken = await getAuthToken()

      const response = await $fetch(`/api/analytics/form`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        query: {
          form_id: formId,
          period,
        },
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch analytics')
      }

      analytics.value = response.summary
      fieldStats.value = response.field_stats || []
      responsesBySource.value = response.by_source || {}

      return { success: true, data: response }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch analytics'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /* ============ EXPORT RESPONSES ============ */
  const exportResponses = async (
    formId: string,
    format: 'csv' | 'json' = 'csv',
    status?: string
  ) => {
    try {
      const authToken = await getAuthToken()

      const query: Record<string, string> = {
        form_id: formId,
        format,
      }

      if (status) {
        query.status = status
      }

      const params = new URLSearchParams(query)
      const url = `/api/responses/export?${params.toString()}`

      // Use native fetch for download
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from header
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `responses.${format}`

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) {
          filename = match[1]
        }
      }

      // Download file
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      return { success: true, filename }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      return { success: false, error: error.value }
    }
  }

  /* ============ GET FIELD RESPONSE RATE ============ */
  const getFieldResponseRate = (fieldId: string): number => {
    const fieldStat = fieldStats.value.find(f => f.field_id === fieldId)
    return fieldStat?.response_rate || 0
  }

  /* ============ GET SOURCE BREAKDOWN ============ */
  const getSourceBreakdown = computed(() => {
    const total = totalResponses.value
    if (total === 0) {
      return {
        whatsapp: { count: 0, percentage: 0 },
        web: { count: 0, percentage: 0 },
        api: { count: 0, percentage: 0 },
      }
    }

    return {
      whatsapp: {
        count: responsesBySource.value.whatsapp || 0,
        percentage: Math.round(((responsesBySource.value.whatsapp || 0) / total) * 100),
      },
      web: {
        count: responsesBySource.value.web || 0,
        percentage: Math.round(((responsesBySource.value.web || 0) / total) * 100),
      },
      api: {
        count: responsesBySource.value.api || 0,
        percentage: Math.round(((responsesBySource.value.api || 0) / total) * 100),
      },
    }
  })

  /* ============ HELPERS ============ */
  const getAuthToken = async (): Promise<string> => {
    const { data } = await useSupabaseClient().auth.getSession()
    return data.session?.access_token || ''
  }

  return {
    /* State */
    analytics: computed(() => analytics.value),
    fieldStats: computed(() => fieldStats.value),
    responsesBySource: computed(() => responsesBySource.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    /* Computed */
    completionRate,
    avgCompletionTime,
    totalResponses,
    completedResponses,
    getSourceBreakdown,

    /* Methods */
    getFormAnalytics,
    exportResponses,
    getFieldResponseRate,
  }
}