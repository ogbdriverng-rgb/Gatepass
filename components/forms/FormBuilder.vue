<template>
  <div class="flex h-screen bg-base">
    <!-- Left Panel: Field Palette -->
    <div class="w-72 bg-card border-r border-base overflow-y-auto">
      <FieldPalette @add-field="handleAddField" />
    </div>

    <!-- Center Panel: Form Canvas -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-2xl mx-auto">
        <!-- Form Header -->
        <div class="mb-8">
          <input
            v-model="formTitle"
            type="text"
            placeholder="Untitled Form"
            class="text-4xl font-bold bg-transparent text-base outline-none mb-2 w-full"
            @blur="updateFormTitle"
          />
          <textarea
            v-model="formDescription"
            placeholder="Add a description..."
            class="w-full bg-secondary bg-opacity-10 rounded-lg p-3 text-secondary text-sm resize-none outline-none border border-base"
            rows="3"
            @blur="updateFormDescription"
          />
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <draggable
            v-model="fields"
            item-key="id"
            class="space-y-4"
            @end="handleReorderFields"
          >
            <template #item="{ element: field }">
              <DraggableField
                :field="field"
                :is-editing="editingFieldId === field.id"
                @edit="editingFieldId = field.id"
                @delete="handleDeleteField(field.id)"
                @update="handleUpdateField(field.id, $event)"
              />
            </template>
          </draggable>

          <!-- Add Field Button -->
          <div v-if="fields.length === 0" class="text-center py-8">
            <Icon name="mdi:plus" class="w-12 h-12 mx-auto text-secondary opacity-50 mb-4" />
            <p class="text-secondary">Add your first field from the palette</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Field Inspector/Preview -->
    <div class="w-80 bg-card border-l border-base overflow-y-auto flex flex-col">
      <!-- Form Actions -->
      <div class="p-4 border-b border-base">
        <CommonButton
          variant="primary"
          label="Preview"
          icon="eye"
          fullWidth
          @click="togglePreview"
          class="mb-2"
        />
        <CommonButton
          v-if="!isPublished"
          variant="secondary"
          label="Publish"
          fullWidth
          @click="handlePublish"
        />
        <CommonButton
          v-else
          variant="secondary"
          label="Unpublish"
          fullWidth
          @click="handleUnpublish"
        />
      </div>

      <!-- Field Inspector -->
      <div v-if="editingFieldId && selectedField" class="flex-1 p-4">
        <FieldInspector :field="selectedField" @update="handleUpdateField(selectedField.id, $event)" />
      </div>

      <!-- Form Settings -->
      <div v-else class="flex-1 p-4">
        <h3 class="font-semibold text-base mb-4">Form Settings</h3>

        <div class="space-y-4">
          <!-- Allow Edit -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="formConfig.allow_edit"
              type="checkbox"
              class="w-4 h-4 rounded border-base"
            />
            <span class="text-sm text-secondary">Allow respondents to edit responses</span>
          </label>

          <!-- Edit Window -->
          <div>
            <label class="text-sm font-medium text-base block mb-2">Edit window (days)</label>
            <input
              v-model.number="formConfig.expiry_days"
              type="number"
              placeholder="Leave empty for unlimited"
              class="w-full px-3 py-2 border border-base rounded-lg text-sm"
            />
          </div>

          <!-- Status Badge -->
          <div class="mt-6 p-3 bg-secondary bg-opacity-10 rounded-lg">
            <p class="text-xs font-medium text-secondary mb-2">Status:</p>
            <div class="flex gap-2">
              <span
                v-if="isPublished"
                class="px-2 py-1 bg-success bg-opacity-10 text-success text-xs rounded"
              >
                Published
              </span>
              <span v-else class="px-2 py-1 bg-warning bg-opacity-10 text-warning text-xs rounded">
                Draft
              </span>
            </div>
          </div>

          <!-- Form Key -->
          <div class="mt-4 p-3 bg-secondary bg-opacity-10 rounded-lg">
            <p class="text-xs font-medium text-secondary mb-1">Form Key:</p>
            <p class="text-xs font-mono text-base break-all">{{ formKey }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <FormPreview v-if="showPreview" :form="currentForm" @close="showPreview = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import type { FormWithFields, FormField } from '~/composables/useForms'

const route = useRoute()
const router = useRouter()
const formStore = useFormStore()
const { getForm, updateForm, addField, updateField, deleteField, reorderFields, publishForm, unpublishForm } = useForms()

/* ============ STATE ============ */
const formTitle = ref('')
const formDescription = ref('')
const formKey = ref('')
const isPublished = ref(false)
const fields = ref<FormField[]>([])
const editingFieldId = ref<string | null>(null)
const showPreview = ref(false)
const isLoading = ref(false)

const formConfig = ref({
  allow_edit: true,
  expiry_days: null as number | null,
})

/* ============ COMPUTED ============ */
const currentForm = computed<FormWithFields | null>(() => {
  if (!formStore.currentForm) return null
  return {
    ...formStore.currentForm,
    fields: fields.value,
  }
})

const selectedField = computed(() => {
  return fields.value.find(f => f.id === editingFieldId.value)
})

/* ============ LOAD FORM ============ */
const loadForm = async () => {
  isLoading.value = true
  const formKeyParam = route.params.form_key as string

  try {
    const result = await getForm(formKeyParam)

    if (!result.success || !result.form) {
      await router.push('/dashboard/forms')
      return
    }

    const form = result.form
    await formStore.loadCurrentForm(form.id)

    formTitle.value = form.title
    formDescription.value = form.description || ''
    formKey.value = form.form_key
    isPublished.value = form.is_published
    fields.value = form.fields
    formConfig.value = {
      allow_edit: form.config.allow_edit,
      expiry_days: form.config.expiry_days,
    }
  } catch (error) {
    console.error('Error loading form:', error)
  } finally {
    isLoading.value = false
  }
}

/* ============ HANDLERS ============ */
const handleAddField = async (fieldType: string) => {
  if (!currentForm.value) return

  const newField: Omit<FormField, 'id'> = {
    field_key: `field_${Date.now()}`,
    type: fieldType as any,
    label: `Question ${fields.value.length + 1}`,
    placeholder: '',
    is_required: false,
    order_idx: fields.value.length,
    meta: {
      options: [],
      validations: {},
      conditional_logic: [],
    },
  }

  const result = await addField(currentForm.value.id, newField)

  if (result.success && result.field) {
    fields.value.push(result.field)
    editingFieldId.value = result.field.id
  }
}

const handleUpdateField = async (fieldId: string, updates: Partial<FormField>) => {
  const result = await updateField(fieldId, updates)

  if (result.success && result.field) {
    const index = fields.value.findIndex(f => f.id === fieldId)
    if (index !== -1) {
      fields.value[index] = result.field
    }
  }
}

const handleDeleteField = async (fieldId: string) => {
  const result = await deleteField(fieldId)

  if (result.success) {
    fields.value = fields.value.filter(f => f.id !== fieldId)
    editingFieldId.value = null
  }
}

const handleReorderFields = async () => {
  if (!currentForm.value) return

  const fieldIds = fields.value.map(f => f.id)
  await reorderFields(currentForm.value.id, fieldIds)
}

const handlePublish = async () => {
  if (!currentForm.value) return

  const result = await publishForm(currentForm.value.id)

  if (result.success) {
    isPublished.value = true
    formStore.updateFormInList(result.form as any)
  }
}

const handleUnpublish = async () => {
  if (!currentForm.value) return

  const result = await unpublishForm(currentForm.value.id)

  if (result.success) {
    isPublished.value = false
    formStore.updateFormInList({
      ...currentForm.value,
      is_published: false,
      status: 'draft',
    })
  }
}

const updateFormTitle = async () => {
  if (!currentForm.value) return
  await updateForm(currentForm.value.id, { title: formTitle.value })
}

const updateFormDescription = async () => {
  if (!currentForm.value) return
  await updateForm(currentForm.value.id, { description: formDescription.value })
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

/* ============ LIFECYCLE ============ */
onMounted(() => {
  loadForm()
})
</script>