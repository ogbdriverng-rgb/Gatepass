<template>
  <div class="space-y-4">
    <!-- PLACEHOLDER -->
    <div>
      <label class="text-xs font-medium text-secondary block mb-1">Placeholder</label>
      <input
        v-model="field.placeholder"
        type="text"
        class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
        @blur="emitUpdate"
      />
    </div>

    <!-- DESCRIPTION -->
    <div>
      <label class="text-xs font-medium text-secondary block mb-1">Description / Help Text</label>
      <textarea
        v-model="field.meta.description"
        placeholder="Optional help text for respondents"
        class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
        rows="2"
        @blur="emitUpdate"
      />
    </div>

    <!-- REQUIRED -->
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        v-model="field.is_required"
        type="checkbox"
        class="w-4 h-4 rounded border-2 border-base"
        @change="emitUpdate"
      />
      <span class="text-sm text-base font-medium">Required field</span>
    </label>

    <!-- OPTIONS FOR SELECT/MULTISELECT -->
    <div v-if="['select', 'multiselect'].includes(field.type)">
      <label class="text-xs font-medium text-secondary block mb-3">Options</label>

      <div class="space-y-2 mb-3">
        <div v-for="(option, index) in field.meta.options" :key="option.id" class="flex gap-2 items-center">
          <input
            v-model="option.label"
            type="text"
            placeholder="Option label"
            class="flex-1 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
            @blur="emitUpdate"
          />
          <button
            @click="removeOption(index)"
            class="p-2 text-error hover:bg-error/10 rounded transition-colors flex-shrink-0"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </button>
        </div>
      </div>

      <button
        @click="addOption"
        class="w-full px-3 py-2 border-2 border-dashed border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
      >
        + Add Option
      </button>
    </div>

    <!-- RATING SCALE -->
    <div v-if="field.type === 'rating'">
      <label class="text-xs font-medium text-secondary block mb-2">Rating Scale</label>
      <div class="flex items-center gap-2">
        <input
          v-model.number="field.meta.scale"
          type="number"
          min="1"
          max="10"
          class="w-16 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
          @blur="emitUpdate"
        />
        <span class="text-xs text-secondary">stars (1-10)</span>
      </div>
    </div>

    <!-- FILE UPLOAD SETTINGS -->
    <div v-if="field.type === 'file'">
      <label class="text-xs font-medium text-secondary block mb-2">Max File Size (MB)</label>
      <input
        v-model.number="field.meta.max_size_mb"
        type="number"
        min="1"
        max="100"
        class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
        @blur="emitUpdate"
      />
    </div>

    <!-- VALIDATION RULES -->
    <div v-if="supportsValidation" class="border-t border-base pt-4">
      <h4 class="text-xs font-semibold text-base mb-3">Validation Rules</h4>

      <!-- MIN/MAX LENGTH -->
      <div v-if="['text', 'textarea'].includes(field.type)" class="space-y-2">
        <div>
          <label class="text-xs font-medium text-secondary block mb-1">Min Length</label>
          <input
            v-model.number="field.meta.validations.min_length"
            type="number"
            min="0"
            class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
            @blur="emitUpdate"
          />
        </div>

        <div>
          <label class="text-xs font-medium text-secondary block mb-1">Max Length</label>
          <input
            v-model.number="field.meta.validations.max_length"
            type="number"
            min="1"
            class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
            @blur="emitUpdate"
          />
        </div>
      </div>

      <!-- MIN/MAX FOR NUMBER -->
      <div v-if="field.type === 'number'" class="space-y-2">
        <div>
          <label class="text-xs font-medium text-secondary block mb-1">Minimum Value</label>
          <input
            v-model.number="field.meta.validations.min"
            type="number"
            class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
            @blur="emitUpdate"
          />
        </div>

        <div>
          <label class="text-xs font-medium text-secondary block mb-1">Maximum Value</label>
          <input
            v-model.number="field.meta.validations.max"
            type="number"
            class="w-full px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm focus:outline-none focus:border-primary transition-colors"
            @blur="emitUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFieldType } from '~/utils/fieldTypes'
import type { FormField } from '~/composables/useForms'

interface Props {
  field: FormField
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [field: FormField]
}>()

const supportsValidation = computed(() => {
  const fieldType = getFieldType(props.field.type)
  return fieldType?.supports_validation ?? false
})

const addOption = () => {
  const options = props.field.meta.options || []
  props.field.meta.options = [
    ...options,
    {
      id: `opt_${Date.now()}`,
      label: '',
    },
  ]
  emitUpdate()
}

const removeOption = (index: number) => {
  if (props.field.meta.options) {
    const options = props.field.meta.options
    props.field.meta.options = options.filter((_, i) => i !== index)
    emitUpdate()
  }
}

const emitUpdate = () => {
  emit('update', props.field)
}
</script>