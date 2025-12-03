<template>
  <div class="sticky top-0 z-40 bg-card border-b border-base">
    <div class="p-4 flex items-center justify-between">
      <!-- LEFT: BACK BUTTON + TITLE -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-secondary/20 rounded-lg transition-colors flex-shrink-0"
          title="Back to forms"
        >
          <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-bold text-base truncate">{{ form.title }}</h1>
          <p class="text-sm text-secondary mt-1">
            {{ form.is_published ? '✓ Published' : '📋 Draft' }}
          </p>
        </div>
      </div>

      <!-- RIGHT: ACTION BUTTONS -->
      <div class="flex gap-3">
        <CommonButton
          variant="secondary"
          icon="eye"
          label="Preview"
          @click="$emit('preview')"
        />
        <CommonButton
          v-if="!form.is_published"
          variant="primary"
          icon="upload"
          label="Publish"
          @click="$emit('publish')"
        />
        <CommonButton
          v-else
          variant="secondary"
          icon="download"
          label="Unpublish"
          @click="$emit('unpublish')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GatpassForm } from '~/composables/useForms'

defineProps<{
  form: GatpassForm
}>()

defineEmits<{
  back: []
  preview: []
  publish: []
  unpublish: []
}>()
</script>