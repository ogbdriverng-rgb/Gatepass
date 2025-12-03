<template>
  <div
    :class="[
      'p-6 rounded-lg border-2 transition-all cursor-move',
      isEditing
        ? 'bg-primary bg-opacity-10 border-primary'
        : 'bg-card border-base hover:border-primary hover:shadow-md',
    ]"
    @click="emit('edit')"
  >
    <!-- Field Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-start gap-3 flex-1">
        <!-- Drag Handle -->
        <Icon name="mdi:drag-vertical" class="w-5 h-5 text-secondary mt-1 flex-shrink-0" />

        <!-- Field Info -->
        <div class="flex-1">
          <input
            v-if="isEditing"
            v-model="fieldLabel"
            type="text"
            class="font-semibold text-base bg-transparent border-b-2 border-primary outline-none w-full"
            @click.stop
            @blur="updateLabel"
          />
          <p v-else class="font-semibold text-base">{{ field.label }}</p>

          <p class="text-xs text-secondary mt-1">
            {{ getFieldTypeName(field.type) }}
            <span v-if="field.is_required" class="ml-2 text-error">• Required</span>
          </p>
        </div>
      </div>

      <!-- Delete Button -->
      <button
        @click.stop="emit('delete')"
        class="p-2 text-error hover:bg-error hover:bg-opacity-10 rounded transition-colors"
      >
        <Icon name="mdi:trash-2" class="w-4 h-4" />
      </button>
    </div>

    <!-- Field Preview -->
    <div v-if="!isEditing" class="ml-8 mb-4">
      <FieldPreview :field="field" />
    </div>

    <!-- Field Settings (When Editing) -->
    <div v-if="isEditing" class="ml-8 space-y-4">
      <!-- Field Type -->
      <div>
        <label class="text-xs font-medium text-secondary block mb-2">Field Type</label>
        <p class="text-sm text-base">{{ getFieldTypeName(field.type) }}</p>
      </div>

      <!-- Placeholder -->
      <div>
        <label class="text-xs font-medium text-secondary block mb-1">Placeholder</label>
        <input
          v-model="fieldPlaceholder"
          type="text"
          class="w-full px-2 py-1 border border-base rounded text-sm bg-secondary bg-opacity-10"
          @blur="updateField"
        />
      </div>

      <!-- Required Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="fieldRequired"
          type="checkbox"
          class="w-4 h-4 rounded border-base"
          @change="updateField"
        />
        <span class="text-sm text-base">Required field</span>
      </label>

      <!-- Options (for select/multiselect) -->
      <div v-if="field.type === 'select' || field.type === 'multiselect'">
        <label class="text-xs font-medium text-secondary block mb-2">Options</label>
        <div class="space-y-2">
          <div v-for="(option, index) in fieldOptions" :key="index" class="flex gap-2">
            <input
              v-model="option.label"
              type="text"
              placeholder="Option label"
              class="flex-1 px-2 py-1 border border-base rounded text-sm bg-secondary bg-opacity-10"
              @blur="updateField"
            />
            <button
              @click="removeOption(index)"
              class="p-1 text-error hover:bg-error hover:bg-opacity-10 rounded"
            >
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <CommonButton
          variant="secondary"
          size="sm"
          label="Add Option"
          icon="plus"
          @click="addOption"
          class="mt-2 w-full"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="text-xs font-medium text-secondary block mb-1">Description</label>
        <textarea
          v-model="fieldDescription"
          placeholder="Help text for respondents"
          class="w-full px-2 py-1 border border-base rounded text-sm bg-secondary bg-opacity-10 resize-none"
          rows="2"
          @blur="updateField"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getFieldType } from '~/utils/fieldTypes'
import type { FormField } from '~/composables/useForms'

interface Props {
  field: FormField
  isEditing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
  update: [updates: Partial<FormField>]
}>()

/* ============ STATE ============ */
const fieldLabel = ref(props.field.label)
const fieldPlaceholder = ref(props.field.placeholder || '')
const fieldRequired = ref(props.field.is_required)
const fieldDescription = ref(props.field.meta.description || '')
const fieldOptions = ref(
  JSON.parse(JSON.stringify(props.field.meta.options || []))
)

/* ============ COMPUTED ============ */
const getFieldTypeName = (type: string): string => {
  const fieldType = getFieldType(type)
  return fieldType?.name || type
}

/* ============ METHODS ============ */
const updateLabel = () => {
  updateField()
}

const updateField = () => {
  emit('update', {
    label: fieldLabel.value,
    placeholder: fieldPlaceholder.value,
    is_required: fieldRequired.value,
    meta: {
      ...props.field.meta,
      description: fieldDescription.value,
      options: fieldOptions.value,
    },
  })
}

const addOption = () => {
  fieldOptions.value.push({
    id: `opt_${Date.now()}`,
    label: '',
  })
}

const removeOption = (index: number) => {
  fieldOptions.value.splice(index, 1)
  updateField()
}
</script>