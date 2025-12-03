<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label block text-sm font-semibold text-base mb-2">
      {{ label }}
      <span v-if="required" class="text-error ml-1">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Icon placeholder (Left side) -->
      <div
        v-if="icon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none flex items-center justify-center"
      >
        <!-- Email Icon -->
        <svg v-if="icon === 'email'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>

        <!-- Lock Icon -->
        <svg v-else-if="icon === 'lock'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>

        <!-- Phone Icon -->
        <svg v-else-if="icon === 'phone'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.92 7.02C17.45 6.18 16.64 5.55 15.70 5.25c-2.25-.75-5.17-.75-7.42 0-.94.3-1.75.93-2.22 1.77C4.97 9.26 4.98 13.75 7.06 15.98c.47.84 1.28 1.47 2.22 1.77 1.21.4 2.5.59 3.84.59 1.34 0 2.63-.19 3.84-.59.94-.3 1.75-.93 2.22-1.77 2.08-2.23 2.09-6.72.01-8.96zM12 15.4c-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4 3.4 1.52 3.4 3.4-1.52 3.4-3.4 3.4z"/>
        </svg>

        <!-- User Icon -->
        <svg v-else-if="icon === 'user'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>

      <!-- Input -->
      <input
        :id="inputId"
        v-model="model"
        :type="computedType"
        :placeholder="placeholder"
        :name="inputName"
        :disabled="disabled"
        :required="required"
        :autocomplete="getAutocomplete()"
        class="input w-full"
        :class="{
          'pl-10': icon,
          'pr-10': type === 'password',
          'border-red-500': error,
        }"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />

      <!-- Show/Hide Password Toggle (Right side) -->
      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-base transition-colors"
        :title="showPassword ? 'Hide password' : 'Show password'"
      >
        <!-- Eye Open Icon -->
        <svg v-if="showPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>

        <!-- Eye Off Icon -->
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.83 9L15.23 12.4c.15-.35.25-.74.25-1.15 0-2.01-1.63-3.63-3.63-3.63-.41 0-.8.1-1.15.25l3.15 3.15zM7.08 8.54L5.77 7.23c-1.56 1.56-2.56 3.71-2.56 6.14 0 4.97 4.05 9 9 9 2.43 0 4.58-1 6.14-2.56l-1.31-1.31c-1.16.92-2.62 1.47-4.22 1.47-3.79 0-6.88-3.08-6.88-6.88 0-1.6.55-3.06 1.47-4.22zM19.07 4.93L4.93 19.07c3.91 3.13 8.23 3.13 12.14 0 3.91-3.13 3.91-8.22 0-12.14zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      </button>
    </div>

    <!-- Error / Helper text -->
    <p v-if="error" class="mt-1 text-sm text-error">{{ error }}</p>
    <p v-else-if="helperText" class="mt-1 text-sm text-secondary">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  id?: string
  name?: string
  icon?: string
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()

const showPassword = ref(false)

const inputId = computed(() =>
  props.id || `input-${props.label?.toLowerCase().replace(/\s+/g, '-')}`
)

const inputName = computed(() =>
  props.name || props.label?.toLowerCase().replace(/\s+/g, '_') || props.type
)

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const computedType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const getAutocomplete = () => {
  switch (props.type) {
    case 'email':
      return 'email'
    case 'password':
      return 'current-password'
    case 'tel':
      return 'tel'
    case 'url':
      return 'url'
    case 'search':
      return 'off'
    default:
      return 'on'
  }
}
</script>

<style scoped>
input.input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--form-border);
  background-color: var(--form-bg);
  color: var(--form-text);
  font-size: 1rem;
  line-height: 1.5rem;
  transition: all var(--transition-base) ease-in-out;
}

input.input.pl-10 {
  padding-left: 2.5rem;
}

input.input.pr-10 {
  padding-right: 2.5rem;
}

input.input::placeholder {
  color: var(--form-placeholder);
}

input.input:focus {
  border-color: var(--form-border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  outline: none;
}

input.input:disabled {
  background-color: var(--input-disabled-bg);
  border-color: var(--input-disabled-border);
  color: var(--input-disabled-text);
  cursor: not-allowed;
}

input.input.error {
  border-color: var(--color-error);
  background-color: var(--form-error-bg);
}

input.input.error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.label {
  color: var(--form-label);
}
</style>