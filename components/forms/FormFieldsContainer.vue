<template>
  <div class="bg-card rounded-xl border-2 border-dashed border-secondary/30 p-8 min-h-96">
    <!-- EMPTY STATE -->
    <div v-if="fields.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 text-secondary/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
      </svg>
      <p class="text-secondary font-medium mb-1">No fields added yet</p>
      <p class="text-xs text-secondary/70">Click "Add Field" from the left panel to start</p>
    </div>

    <!-- FIELDS LIST WITH DRAG & DROP -->
    <draggable
      v-else
      v-model="fields"
      item-key="id"
      class="space-y-4"
      handle=".drag-handle"
      @end="$emit('reorder-fields')"
    >
      <template #item="{ element: field, index }">
        <div
          :key="field.id"
          :class="[
            'p-6 rounded-lg border-2 transition-all',
            editingFieldId === field.id
              ? 'bg-primary/5 border-primary shadow-md'
              : 'bg-secondary/5 border-base hover:border-primary hover:shadow-md',
          ]"
        >
          <!-- HEADER -->
          <div class="flex items-start justify-between gap-4 mb-3">
            <!-- LEFT: DRAG + INFO -->
            <div class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" @click.stop="$emit('select-field', field.id)">
              <div
                class="drag-handle p-1 cursor-grab active:cursor-grabbing text-secondary hover:text-base transition-colors mt-1 flex-shrink-0"
                title="Drag to reorder"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zM3 9h2v2H3V9zm0 4h2v2H3v-2zm4-4h2v2H7V9zm0 4h2v2H7v-2z"/>
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded flex-shrink-0">
                    {{ index + 1 }}
                  </span>

                  <input
                    v-if="editingFieldId === field.id"
                    :value="field.label"
                    type="text"
                    class="font-bold text-base bg-transparent border-b-2 border-primary outline-none flex-1 min-w-0"
                    @click.stop
                    @input="updateFieldLabel(field.id, $event)"
                    @blur="$emit('update-field', field.id, field)"
                  />
                  <p v-else class="font-bold text-base truncate">{{ field.label }}</p>
                </div>

                <p class="text-xs text-secondary">
                  <span class="font-medium">{{ getFieldTypeName(field.type) }}</span>
                  <span v-if="field.is_required" class="ml-2 text-error font-semibold">• Required</span>
                </p>
              </div>
            </div>

            <!-- RIGHT: BUTTONS -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <!-- EDIT BUTTON - CLEAR & VISIBLE -->
              <button
                v-if="editingFieldId !== field.id"
                @click.stop="$emit('select-field', field.id)"
                class="px-3 py-1 text-xs font-semibold bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                title="Edit field"
              >
                Edit
              </button>

              <button
                @click.stop="$emit('duplicate-field', field)"
                class="p-2 text-secondary hover:bg-primary/10 hover:text-primary rounded transition-colors"
                title="Duplicate field"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>

              <button
                @click.stop="$emit('delete-field', field.id)"
                class="p-2 text-error hover:bg-error/10 rounded transition-colors"
                title="Delete field"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- FIELD EDITOR (When selected) -->
          <div v-if="editingFieldId === field.id" class="ml-8 border-t border-base pt-4" @click.stop>
            <FieldEditor :field="field" @update="handleUpdate" />
          </div>

          <!-- FIELD PREVIEW (When not editing) -->
          <div v-else class="ml-8">
            <FieldPreview :field="field" />
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { getFieldType } from '~/utils/fieldTypes'
import type { FormField } from '~/composables/useForms'

interface Props {
  fields: FormField[]
  editingFieldId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select-field': [fieldId: string]
  'update-field': [fieldId: string, updates: Partial<FormField>]
  'delete-field': [fieldId: string]
  'duplicate-field': [field: FormField]
  'reorder-fields': []
}>()

const fields = computed({
  get: () => props.fields,
  set: (value) => {
    // draggable updates the array directly
  },
})

const getFieldTypeName = (type: string): string => {
  const fieldType = getFieldType(type)
  return fieldType?.name || type
}

const updateFieldLabel = (fieldId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const fieldIndex = props.fields.findIndex(f => f.id === fieldId)
  if (fieldIndex !== -1) {
    props.fields[fieldIndex].label = target.value
  }
}

const handleUpdate = (field: FormField) => {
  emit('update-field', field.id, field)
}
</script>