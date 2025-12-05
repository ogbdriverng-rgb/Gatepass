<template>
  <div class="flex h-screen bg-base overflow-hidden">
    <!-- LOADING -->
    <div v-if="isLoading" class="w-full flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <svg class="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p class="text-secondary">Loading form...</p>
      </div>
    </div>

    <!-- ERROR -->
    <div v-else-if="!currentForm" class="w-full flex items-center justify-center p-4">
      <div class="w-full max-w-md p-6 rounded-xl bg-card border border-base text-center">
        <div class="inline-block p-4 bg-error/10 rounded-full mb-4">
          <svg class="w-8 h-8 text-error" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-base mb-2">Form Not Found</h2>
        <p class="text-secondary mb-6">The form could not be loaded.</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Back to Forms
        </button>
      </div>
    </div>

    <!-- MAIN BUILDER -->
    <template v-else>
      <!-- LEFT: FIELD PALETTE -->
      <aside class="w-80 bg-card border-r border-base flex flex-col hidden lg:flex">
        <div class="p-6 border-b border-base flex-shrink-0">
          <h3 class="text-lg font-bold text-base">Fields</h3>
          <p class="text-xs text-secondary mt-1">Click to add fields</p>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <FieldPalette @add-field="handleAddField" />
        </div>
      </aside>

      <!-- CENTER: MAIN CANVAS -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- HEADER WITH BACK BUTTON & ACTIONS -->
        <header class="bg-card border-b border-base px-6 py-4 flex-shrink-0">
          <div class="flex items-center justify-between gap-4">
            <!-- BACK + TITLE -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <button
                @click="goBack"
                class="p-2 hover:bg-secondary/20 rounded-lg transition-colors flex-shrink-0"
                title="Back to forms"
              >
                <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <div class="min-w-0 flex-1">
                <h1 class="text-lg font-bold text-base truncate">{{ currentForm.title }}</h1>
                <p class="text-xs text-secondary">
                  <span v-if="currentForm.is_published" class="text-success">✓ Published</span>
                  <span v-else class="text-warning">● Draft</span>
                  <span class="mx-2">•</span>
                  <span v-if="saveStatus === 'saving'" class="text-secondary animate-pulse">Saving...</span>
                  <span v-else-if="saveStatus === 'saved'" class="text-success">Saved</span>
                  <span v-else class="text-secondary">
                    {{ currentForm.fields.length }} field{{ currentForm.fields.length !== 1 ? 's' : '' }}
                    {{ responseCount > 0 ? `• ${responseCount} response${responseCount !== 1 ? 's' : ''}` : '' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- ACTION BUTTONS - VISIBLE -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="showPreview = true"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 transition"
              >
                Preview
              </button>
              <button
                @click="handleSaveChanges"
                :disabled="isSavingChanges"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {{ isSavingChanges ? 'Saving...' : 'Save Changes' }}
              </button>
              <button
                v-if="!currentForm.is_published"
                @click="handlePublish"
                :disabled="isPublishing || currentForm.fields.length === 0"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {{ isPublishing ? 'Publishing...' : 'Publish' }}
              </button>
              <button
                v-else
                @click="handleUnpublish"
                :disabled="isPublishing"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {{ isPublishing ? 'Unpublishing...' : 'Unpublish' }}
              </button>
            </div>
          </div>
        </header>

        <!-- CANVAS -->
        <div class="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-base via-base to-secondary/5">
          <div class="max-w-3xl mx-auto">
            <!-- FORM META -->
            <div class="bg-card rounded-xl border border-base p-8 mb-6">
              <input
                v-model="formData.title"
                type="text"
                placeholder="Untitled Form"
                class="text-3xl font-bold bg-transparent text-base outline-none mb-4 w-full placeholder-secondary/50"
                @blur="autoSave"
              />
              <textarea
                v-model="formData.description"
                placeholder="Add a description..."
                class="w-full bg-secondary/5 rounded-lg p-4 text-secondary text-sm resize-none outline-none border border-base focus:border-primary transition-colors"
                rows="2"
                @blur="autoSave"
              />
            </div>

            <!-- FIELDS WITH DRAG AND DROP -->
            <div
              class="space-y-4"
              @dragover.prevent="dragOverIndex = true"
              @dragleave.prevent="dragOverIndex = false"
              @drop.prevent="handleDrop"
            >
              <div
                v-for="(field, index) in currentForm.fields"
                :key="field.id"
                draggable="true"
                @dragstart="handleDragStart(index)"
                @dragend="handleDragEnd"
                @dragover.prevent
                @drop.prevent="handleDropOnField(index)"
                class="transition-all p-4 bg-card rounded-lg border-2 border-base hover:border-primary"
                :class="{ 'opacity-50 bg-secondary/10': draggedIndex === index, 'border-primary': editingFieldId === field.id }"
              >
                <div
                  class="flex items-start justify-between gap-4 cursor-move"
                  @click="selectField(field.id)"
                >
                  <!-- DRAG HANDLE -->
                  <div class="flex items-center gap-3 flex-1">
                    <svg class="w-5 h-5 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z"/>
                    </svg>
                    
                    <!-- FIELD INFO -->
                    <div class="flex-1">
                      <p class="font-semibold text-base">{{ field.label }}</p>
                      <p class="text-xs text-secondary capitalize">{{ field.type }}</p>
                    </div>
                  </div>

                  <!-- FIELD ACTIONS -->
                  <div class="flex gap-2 flex-shrink-0">
                    <button
                      @click.stop="duplicateField(field)"
                      class="p-2 hover:bg-secondary/20 rounded transition-colors text-secondary hover:text-primary"
                      title="Duplicate field"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </button>
                    <button
                      @click.stop="deleteFieldFromForm(field.id)"
                      class="p-2 hover:bg-error/20 rounded transition-colors text-secondary hover:text-error"
                      title="Delete field"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- EXPANDED EDITING PANEL -->
                <div v-if="editingFieldId === field.id" class="mt-4 pt-4 border-t border-base space-y-4" @click.stop>
                  <!-- LABEL -->
                  <div>
                    <label class="block text-xs font-semibold text-secondary mb-2">Label</label>
                    <input
                      :value="field.label"
                      @input.stop="handleUpdateField(field.id, { label: $event.target.value })"
                      @click.stop
                      type="text"
                      class="w-full px-3 py-2 bg-secondary/5 border border-base rounded outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <!-- PLACEHOLDER -->
                  <div>
                    <label class="block text-xs font-semibold text-secondary mb-2">Placeholder</label>
                    <input
                      :value="field.placeholder"
                      @input.stop="handleUpdateField(field.id, { placeholder: $event.target.value })"
                      @click.stop
                      type="text"
                      class="w-full px-3 py-2 bg-secondary/5 border border-base rounded outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <!-- REQUIRED TOGGLE -->
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      :checked="field.is_required"
                      @change.stop="handleUpdateField(field.id, { is_required: $event.target.checked })"
                      @click.stop
                      type="checkbox"
                      class="w-4 h-4 rounded"
                    />
                    <span class="text-xs font-semibold text-secondary">Required field</span>
                  </label>

                  <!-- OPTIONS FOR SELECT/MULTISELECT -->
                  <div v-if="['select', 'multiselect'].includes(field.type)" @click.stop>
                    <label class="block text-xs font-semibold text-secondary mb-2">Options</label>
                    <div class="space-y-2">
                      <div
                        v-for="(option, optIdx) in field.meta.options"
                        :key="option.id"
                        class="flex gap-2 items-center"
                      >
                        <input
                          :value="option.label"
                          @input.stop="updateFieldOption(field.id, optIdx, $event.target.value)"
                          @click.stop
                          type="text"
                          placeholder="Option label"
                          class="flex-1 px-2 py-1 bg-secondary/5 border border-base rounded text-xs outline-none focus:border-primary"
                        />
                        <button
                          @click.stop="deleteFieldOption(field.id, optIdx)"
                          class="p-1 hover:bg-error/20 rounded transition-colors text-secondary hover:text-error"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <button
                        @click.stop="addFieldOption(field.id)"
                        class="w-full text-xs font-semibold text-primary hover:text-primary/80 py-2 px-2 border border-dashed border-primary rounded transition-colors"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- EMPTY STATE -->
            <div v-if="currentForm.fields.length === 0" class="text-center py-12 p-6 rounded-xl bg-card border border-base">
              <svg class="w-12 h-12 text-secondary mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <p class="text-secondary mb-4">No fields yet</p>
              <p class="text-xs text-secondary">Add fields from the palette on the left</p>
            </div>
          </div>
        </div>
      </main>

      <!-- RIGHT: SETTINGS SIDEBAR -->
      <FormSettingsSidebar
        :form="currentForm"
        :base-url="baseUrl"
        @update-config="updateFormConfig"
        @update-expiry="updateFormExpiry"
        @delete="showDeleteDialog = true"
      />

      <!-- PREVIEW MODAL -->
      <FormPreview
        v-if="showPreview"
        :form="currentForm"
        @close="showPreview = false"
      />

      <!-- DELETE CONFIRMATION -->
      <DeleteFormDialog
        v-if="showDeleteDialog"
        :is-deleting="isDeleting"
        @confirm="handleDelete"
        @cancel="showDeleteDialog = false"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFieldType } from '~/utils/fieldTypes'
import type { FormWithFields, FormField } from '~/composables/useForms'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

// pages/dashboard/forms/[form_key]/edit.vue - Script section fixes

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const formStore = useFormStore()
const { getForm, updateForm, addField, updateField, deleteField: deleteFieldAPI, reorderFields, publishForm, unpublishForm, deleteForm: deleteFormAPI } = useForms()

/* STATE */
const isLoading = ref(true)
const isPublishing = ref(false)
const isSavingChanges = ref(false)
const isDeleting = ref(false)
const saveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
const editingFieldId = ref<string | null>(null)
const showPreview = ref(false)
const showDeleteDialog = ref(false)
const saveTimeout = ref<NodeJS.Timeout | null>(null)
const responseCount = ref(0)
const responseRefreshInterval = ref<NodeJS.Timeout | null>(null)

/* DRAG AND DROP STATE */
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref(false)

const formData = ref({
  title: '',
  description: '',
  config: {
    allow_edit: true,
    expiry_days: null as number | null,
  },
})

const baseUrl = computed(() => {
  if (process.client) {
    return window.location.origin
  }
  return 'https://gatepass.ng'
})

const currentForm = computed(() => formStore.currentForm)

/* SHOW ERROR */
const showError = (message: string) => {
  alert(`❌ ${message}`)
}

/* SHOW SUCCESS */
const showSuccess = (message: string) => {
  alert(`✅ ${message}`)
}

/* VALIDATE FORM */
const validateForm = (): string[] => {
  const errors: string[] = []

  if (!currentForm.value?.title?.trim()) {
    errors.push('Form title is required')
  }

  if (currentForm.value?.fields.length === 0) {
    errors.push('Add at least one field')
  }

  currentForm.value?.fields.forEach((field, index) => {
    if (!field.label?.trim()) {
      errors.push(`Field ${index + 1}: Label is required`)
    }

    if (['select', 'multiselect'].includes(field.type)) {
      if (!field.meta.options || field.meta.options.length === 0) {
        errors.push(`Field ${index + 1}: Add at least one option`)
      }
      if (field.meta.options?.some(o => !o.label?.trim())) {
        errors.push(`Field ${index + 1}: All options must have labels`)
      }
    }
  })

  return errors
}

/* LOAD FORM */
const loadForm = async () => {
  isLoading.value = true
  const formKey = route.params.form_key as string

  try {
    const result = await getForm(formKey)
    if (!result.success || !result.form) throw new Error('Form not found')

    await formStore.loadCurrentForm(result.form.id)

    if (currentForm.value) {
      formData.value.title = currentForm.value.title
      formData.value.description = currentForm.value.description || ''
      formData.value.config = currentForm.value.config
    }
  } catch (error) {
    console.error('Error loading form:', error)
    showError('Failed to load form')
  } finally {
    isLoading.value = false
  }
}

/* FETCH RESPONSE COUNT */
const fetchResponseCount = async () => {
  if (!currentForm.value) return

  try {
    const { count } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', currentForm.value.id)

    responseCount.value = count || 0

    if (currentForm.value) {
      currentForm.value.total_responses = count || 0
    }
  } catch (error) {
    console.error('Error fetching response count:', error)
  }
}

/* AUTO-SAVE */
const autoSave = async () => {
  if (!currentForm.value) return

  saveStatus.value = 'saving'

  if (saveTimeout.value) clearTimeout(saveTimeout.value)

  saveTimeout.value = setTimeout(async () => {
    try {
      const result = await updateForm(currentForm.value!.id, {
        title: formData.value.title,
        description: formData.value.description,
        config: formData.value.config,
      })

      if (result.success) {
        saveStatus.value = 'saved'
        setTimeout(() => { saveStatus.value = 'idle' }, 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      saveStatus.value = 'idle'
    }
  }, 1000)
}

/* SAVE CHANGES - Updates published form */
const handleSaveChanges = async () => {
  if (!currentForm.value) return

  isSavingChanges.value = true
  try {
    const result = await updateForm(currentForm.value.id, {
      title: formData.value.title,
      description: formData.value.description,
      config: formData.value.config,
    })

    if (result.success) {
      showSuccess('Form changes saved successfully!')
      formStore.updateFormInList(result.form as any)
      saveStatus.value = 'saved'
      setTimeout(() => { saveStatus.value = 'idle' }, 2000)
    } else {
      showError(result.error || 'Failed to save changes')
    }
  } catch (error) {
    console.error('Save changes error:', error)
    showError(error instanceof Error ? error.message : 'Failed to save changes')
  } finally {
    isSavingChanges.value = false
  }
}

/* WATCH FOR CONFIG CHANGES */
watch(() => formData.value.config, () => {
  autoSave()
}, { deep: true })

/* DRAG AND DROP HANDLERS */
const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = false
}

const handleDropOnField = async (targetIndex: number) => {
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    draggedIndex.value = null
    dragOverIndex.value = false
    return
  }

  if (!currentForm.value) return

  try {
    const draggedField = currentForm.value.fields[draggedIndex.value]
    currentForm.value.fields.splice(draggedIndex.value, 1)
    currentForm.value.fields.splice(targetIndex, 0, draggedField)

    currentForm.value.fields.forEach((field, index) => {
      field.order_idx = index
    })

    for (let i = 0; i < currentForm.value.fields.length; i++) {
      const field = currentForm.value.fields[i]
      await updateField(field.id, { order_idx: i })
    }

    showSuccess('Field order saved!')
  } catch (error) {
    console.error('Reorder error:', error)
    showError(error instanceof Error ? error.message : 'Failed to reorder fields')
  } finally {
    draggedIndex.value = null
    dragOverIndex.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragOverIndex.value = false
}

/* FIELD ACTIONS */
const selectField = (fieldId: string) => {
  if (editingFieldId.value === fieldId) {
    editingFieldId.value = null
  } else {
    editingFieldId.value = fieldId
  }
}

const handleUpdateField = async (fieldId: string, updates: any) => {
  try {
    const fieldIndex = currentForm.value?.fields.findIndex(f => f.id === fieldId)
    if (fieldIndex !== undefined && fieldIndex >= 0 && currentForm.value) {
      Object.assign(currentForm.value.fields[fieldIndex], updates)
    }

    const result = await updateField(fieldId, updates)
    if (!result.success) {
      showError(result.error || 'Failed to update field')
    }
  } catch (error) {
    console.error('Field update error:', error)
    showError(error instanceof Error ? error.message : 'Field update failed')
  }
}

const deleteFieldFromForm = async (fieldId: string) => {
  if (!confirm('Delete this field?')) return

  try {
    const result = await deleteFieldAPI(fieldId)
    if (!result.success) {
      showError(result.error || 'Failed to delete field')
    } else {
      editingFieldId.value = null
      if (currentForm.value) {
        currentForm.value.fields = currentForm.value.fields.filter(f => f.id !== fieldId)
      }
    }
  } catch (error) {
    console.error('Delete error:', error)
    showError(error instanceof Error ? error.message : 'Delete failed')
  }
}

const duplicateField = async (field: FormField) => {
  if (!currentForm.value) return

  try {
    const newField = {
      ...field,
      id: undefined,
      label: `${field.label} (Copy)`,
      order_idx: currentForm.value.fields.length,
    }

    const result = await addField(currentForm.value.id, newField)
    if (!result.success) {
      showError(result.error || 'Failed to duplicate field')
    } else if (result.field) {
      currentForm.value.fields.push(result.field)
    }
  } catch (error) {
    console.error('Duplicate error:', error)
    showError(error instanceof Error ? error.message : 'Duplicate failed')
  }
}

const handleAddField = async (fieldType: string) => {
  if (!currentForm.value) return

  try {
    const fieldTypeConfig = getFieldType(fieldType)

    const newField: any = {
      field_key: `field_${Date.now()}`,
      type: fieldType,
      label: fieldTypeConfig?.name || 'Field',
      placeholder: '',
      is_required: false,
      order_idx: currentForm.value.fields.length,
      meta: {
        options: [],
        validations: {},
        conditional_logic: [],
      },
    }

    const result = await addField(currentForm.value.id, newField)
    if (result.success && result.field) {
      currentForm.value.fields.push(result.field)
      editingFieldId.value = result.field.id
    } else {
      showError(result.error || 'Failed to add field')
    }
  } catch (error) {
    console.error('Add field error:', error)
    showError(error instanceof Error ? error.message : 'Failed to add field')
  }
}

/* FIELD OPTION HANDLERS */
const addFieldOption = async (fieldId: string) => {
  const field = currentForm.value?.fields.find(f => f.id === fieldId)
  if (!field) return

  const newOption = {
    id: `opt_${Date.now()}`,
    label: '',
  }

  field.meta.options = field.meta.options || []
  field.meta.options.push(newOption)

  await handleUpdateField(fieldId, { meta: field.meta })
}

const updateFieldOption = async (fieldId: string, optionIndex: number, newLabel: string) => {
  const field = currentForm.value?.fields.find(f => f.id === fieldId)
  if (!field || !field.meta.options) return

  field.meta.options[optionIndex].label = newLabel
  await handleUpdateField(fieldId, { meta: field.meta })
}

const deleteFieldOption = async (fieldId: string, optionIndex: number) => {
  const field = currentForm.value?.fields.find(f => f.id === fieldId)
  if (!field || !field.meta.options) return

  field.meta.options.splice(optionIndex, 1)
  await handleUpdateField(fieldId, { meta: field.meta })
}

/* PUBLISH/UNPUBLISH */
const handlePublish = async () => {
  if (!currentForm.value) return

  const errors = validateForm()
  if (errors.length > 0) {
    showError(`Cannot publish:\n${errors.join('\n')}`)
    return
  }

  isPublishing.value = true
  try {
    const result = await publishForm(currentForm.value.id)
    if (result.success) {
      // Update local state with published form
      const publishedForm = result.form as GatpassForm
      if (currentForm.value) {
        currentForm.value.is_published = publishedForm.is_published
        currentForm.value.status = publishedForm.status
        currentForm.value.flow_json = publishedForm.flow_json
        currentForm.value.flow_version = publishedForm.flow_version
      }
      formStore.updateFormInList(publishedForm)
      showSuccess('Form published successfully!')
      // Reset preview modal state to allow it to open
      showPreview.value = false
    } else {
      showError(result.error || 'Failed to publish form')
    }
  } catch (error) {
    console.error('Publish error:', error)
    showError(error instanceof Error ? error.message : 'Publish failed')
  } finally {
    isPublishing.value = false
  }
}

const handleUnpublish = async () => {
  if (!currentForm.value) return

  isPublishing.value = true
  try {
    const result = await unpublishForm(currentForm.value.id)
    if (result.success) {
      const unpublishedForm = {
        ...currentForm.value,
        is_published: false,
        status: 'draft' as const,
      }
      formStore.updateFormInList(unpublishedForm as GatpassForm)
      if (currentForm.value) {
        currentForm.value.is_published = false
        currentForm.value.status = 'draft'
      }
      showSuccess('Form unpublished successfully!')
    } else {
      showError(result.error || 'Failed to unpublish form')
    }
  } catch (error) {
    console.error('Unpublish error:', error)
    showError(error instanceof Error ? error.message : 'Unpublish failed')
  } finally {
    isPublishing.value = false
  }
}

/* CONFIG UPDATES */
const updateFormConfig = (config: any) => {
  formData.value.config = config
}

const updateFormExpiry = (days: number | null) => {
  formData.value.config.expiry_days = days
}

/* DELETE */
const handleDelete = async () => {
  if (!currentForm.value) return

  isDeleting.value = true
  try {
    const result = await deleteFormAPI(currentForm.value.id)
    if (result.success) {
      formStore.removeFromList(currentForm.value.id)
      await router.push('/dashboard/forms')
    } else {
      showError(result.error || 'Failed to delete form')
    }
  } catch (error) {
    console.error('Delete error:', error)
    showError(error instanceof Error ? error.message : 'Delete failed')
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
  }
}

/* UTILS */
const goBack = async () => {
  // Use proper router navigation
  await router.push('/dashboard/forms')
}

/* LIFECYCLE */
onMounted(async () => {
  await loadForm()
  await fetchResponseCount()

  responseRefreshInterval.value = setInterval(() => {
    fetchResponseCount()
  }, 5000)
})

onUnmounted(() => {
  if (responseRefreshInterval.value) {
    clearInterval(responseRefreshInterval.value)
  }
})

watch(() => currentForm.value?.id, async () => {
  await fetchResponseCount()
}, { immediate: true })
</script>