/**
 * Form Compiler - Builds flow_json from form and fields
 */

import { createClient } from '@supabase/supabase-js'

export interface CompiledFlow {
  version: number
  fields: Array<{
    id: string
    field_key: string
    label: string
    type: string
    placeholder: string
    is_required: boolean
    order: number
    meta: Record<string, any>
  }>
  total_fields: number
  compiled_at: string
}

/**
 * Helper: Create Supabase client
 */
function createSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  )
}

/**
 * Compile form flow to JSON
 */
export function compileFormFlow(form: any, fields: any[]): CompiledFlow {
  const compiledFields = fields
    .sort((a, b) => a.order_idx - b.order_idx)
    .map((field, index) => ({
      id: field.id,
      field_key: field.field_key,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || '',
      is_required: field.is_required || false,
      order: index,
      meta: field.meta || {
        options: [],
        validations: {},
        conditional_logic: [],
      },
    }))

  return {
    version: form.flow_version || 1,
    fields: compiledFields,
    total_fields: compiledFields.length,
    compiled_at: new Date().toISOString(),
  }
}

/**
 * Update flow_json in database
 */
export async function updateFormFlow(
  supabase: any,
  formId: string,
  flowJson: CompiledFlow
) {
  const { data, error } = await supabase
    .from('forms')
    .update({
      flow_json: flowJson,
      flow_version: (flowJson.version || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', formId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update form flow: ${error.message}`)
  }

  return data
}

/**
 * Recompile form if published
 */
export async function recompileIfPublished(
  formId: string
) {
  try {
    const supabase = createSupabaseClient()

    // Get form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      throw new Error('Form not found')
    }

    // Only recompile if published
    if (!form.is_published) {
      console.log(`[FormCompiler] Form ${formId} not published, skipping recompile`)
      return form
    }

    // Get fields
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('order_idx', { ascending: true })

    if (fieldsError) {
      throw new Error('Failed to fetch fields')
    }

    // Compile
    const flow = compileFormFlow(form, fields || [])

    // Update
    const updated = await updateFormFlow(supabase, formId, flow)

    console.log(`[FormCompiler] Recompiled form ${formId}`)
    return updated
  } catch (error) {
    console.error('[FormCompiler] Error recompiling:', error)
    throw error
  }
}