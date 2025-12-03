<!-- components/forms/FormPreview.vue -->

<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
    <!-- Modal Container -->
    <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Form Preview</h2>
        <button
          @click="emit('close')"
          class="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content - Scrollable -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Form Title & Description -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ form.title }}</h1>
          <p v-if="form.description" class="text-gray-600 dark:text-gray-400 mt-2">{{ form.description }}</p>
        </div>

        <!-- Fields -->
        <div class="space-y-8">
          <div v-if="form.fields.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">No fields added yet</p>
          </div>

          <div v-for="(field, index) in form.fields" :key="field.id" class="space-y-3">
            <!-- Field Label -->
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ index + 1 }}</span>
              </div>
              <label class="font-semibold text-gray-900 dark:text-white">
                {{ field.label }}
                <span v-if="field.is_required" class="text-red-500 ml-1">*</span>
              </label>
            </div>

            <!-- Field Input -->
            <div class="ml-11">
              <FieldPreview :field="field" />
            </div>

            <!-- Divider -->
            <div v-if="index < form.fields.length - 1" class="h-px bg-gray-200 dark:bg-slate-700 my-6" />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-6 border-t border-gray-200 dark:border-slate-700 space-y-3">
          <button
            disabled
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Submit
          </button>
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            This is a preview. The form will function in the actual web and WhatsApp interfaces.
          </p>
        </div>

        <!-- WhatsApp Preview Toggle -->
        <div class="pt-6 border-t border-gray-200 dark:border-slate-700 space-y-4">
          <button
            @click="showWhatsAppPreview = !showWhatsAppPreview"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                :d="showWhatsAppPreview ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'"
              />
            </svg>
            {{ showWhatsAppPreview ? 'Hide' : 'Show' }} WhatsApp Preview
          </button>

          <!-- WhatsApp Preview Content -->
          <div v-if="showWhatsAppPreview" class="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
            <WhatsAppSimulator :form="form" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormWithFields } from '~/composables/useForms'

interface Props {
  form: FormWithFields
}

withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  close: []
}>()

const showWhatsAppPreview = ref(false)
</script>