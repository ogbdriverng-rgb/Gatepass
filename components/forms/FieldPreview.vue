
<!-- ====== 7. FieldPreview.vue ====== -->
<!-- components/forms/FieldPreview.vue -->

<template>
  <div class="space-y-2">
    <!-- Text Input -->
    <template v-if="['text', 'email', 'phone', 'url', 'number'].includes(field.type)">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <input
        type="text"
        :placeholder="field.placeholder || 'Answer...'"
        disabled
        class="w-full px-3 py-2 border border-base rounded-lg bg-secondary bg-opacity-10 text-sm"
      />
    </template>

    <!-- Textarea -->
    <template v-else-if="field.type === 'textarea'">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <textarea
        :placeholder="field.placeholder || 'Answer...'"
        disabled
        class="w-full px-3 py-2 border border-base rounded-lg bg-secondary bg-opacity-10 text-sm resize-none"
        rows="3"
      />
    </template>

    <!-- Date -->
    <template v-else-if="field.type === 'date'">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <input
        type="date"
        disabled
        class="w-full px-3 py-2 border border-base rounded-lg bg-secondary bg-opacity-10 text-sm"
      />
    </template>

    <!-- Select -->
    <template v-else-if="field.type === 'select'">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <select disabled class="w-full px-3 py-2 border border-base rounded-lg bg-secondary bg-opacity-10 text-sm">
        <option>Choose an option...</option>
        <option v-for="option in field.meta.options" :key="option.id">
          {{ option.label }}
        </option>
      </select>
    </template>

    <!-- Multiselect (as checkboxes) -->
    <template v-else-if="field.type === 'multiselect'">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <div class="space-y-2">
        <label v-for="option in field.meta.options" :key="option.id" class="flex items-center gap-2">
          <input type="checkbox" disabled class="w-4 h-4 rounded border-base" />
          <span class="text-sm">{{ option.label }}</span>
        </label>
      </div>
    </template>

    <!-- Rating -->
    <template v-else-if="field.type === 'rating'">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <div class="flex gap-1">
        <button
          v-for="i in field.meta.scale || 5"
          :key="i"
          disabled
          class="px-3 py-1 border border-base rounded bg-secondary bg-opacity-10 text-sm"
        >
          {{ i }}
        </button>
      </div>
    </template>

    <!-- File Upload -->
    <template v-else-if="field.type === 'file'">
      <label class="text-sm text-secondary">{{ field.label }}</label>
      <div class="px-4 py-6 border-2 border-dashed border-base rounded-lg text-center">
        <Icon name="mdi:upload" class="w-6 h-6 mx-auto text-secondary mb-2" />
        <p class="text-sm text-secondary">Click to upload</p>
      </div>
    </template>

    <!-- Required Indicator -->
    <div v-if="field.is_required" class="text-xs text-error">
      * Required
    </div>

    <!-- Description -->
    <div v-if="field.meta.description" class="text-xs text-secondary italic">
      {{ field.meta.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormField } from '~/composables/useForms'

interface Props {
  field: FormField
}

withDefaults(defineProps<Props>(), {})
</script>

