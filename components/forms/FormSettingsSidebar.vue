<template>
  <div>
    <!-- Header -->
    <div class="p-6 border-b border-base flex-shrink-0">
      <h3 class="text-lg font-bold text-base">Settings</h3>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- STATUS BADGES -->
      <div class="p-4 bg-secondary/5 rounded-lg">
        <p class="text-xs font-semibold text-secondary mb-3 uppercase tracking-wide">Status</p>
        <div class="flex gap-2 flex-wrap">
          <span
            :class="[
              'px-3 py-1 rounded text-xs font-semibold',
              form.is_published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
            ]"
          >
            {{ form.is_published ? '✓ Published' : '● Draft' }}
          </span>
          <span class="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
            {{ form.fields.length }} Field{{ form.fields.length !== 1 ? 's' : '' }}
          </span>
          <span class="px-3 py-1 bg-info/10 text-info rounded text-xs font-semibold">
            {{ form.total_responses || 0 }} Response{{ form.total_responses !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <div class="h-px bg-base" />

      <!-- FORM OPTIONS -->
      <div>
        <h4 class="text-xs font-semibold text-base mb-4 uppercase tracking-wide">Form Options</h4>

        <!-- ALLOW EDIT -->
        <label class="flex items-center gap-3 cursor-pointer mb-4">
          <input
            :checked="form.config?.allow_edit"
            type="checkbox"
            class="w-4 h-4 rounded border-2 border-base"
            @change="handleUpdateConfig"
          />
          <span class="text-sm text-base">Allow respondents to edit responses</span>
        </label>

        <!-- EDIT WINDOW -->
        <div>
          <label class="text-xs font-semibold text-base block mb-2">Edit Window (Days)</label>
          <input
            :value="form.config?.expiry_days || ''"
            type="number"
            placeholder="Leave empty for unlimited"
            class="w-full px-3 py-2 border-2 border-base rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
            @blur="handleUpdateExpiry"
          />
          <p class="text-xs text-secondary mt-1">How long respondents can edit their responses</p>
        </div>
      </div>

      <div class="h-px bg-base" />

      <!-- SHARING -->
      <div>
        <h4 class="text-xs font-semibold text-base mb-4 uppercase tracking-wide">Sharing</h4>

        <!-- FORM KEY -->
        <div class="mb-4">
          <label class="text-xs font-semibold text-secondary block mb-2">Form Key</label>
          <div class="flex gap-2">
            <input
              :value="form.form_key"
              type="text"
              readonly
              class="flex-1 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm font-mono text-xs"
            />
            <button
              @click="copyKey"
              class="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex-shrink-0"
              title="Copy form key"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- WEB URL -->
        <div class="mb-4">
          <label class="text-xs font-semibold text-secondary block mb-2">Web Form URL</label>
          <div class="flex gap-2">
            <input
              :value="`${baseUrl}/f/${form.form_key}`"
              type="text"
              readonly
              class="flex-1 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm font-mono text-xs truncate"
            />
            <button
              @click="copyUrl"
              class="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex-shrink-0"
              title="Copy web URL"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-secondary mt-1">Share this link publicly</p>
        </div>

        <!-- WHATSAPP TRIGGER -->
        <div>
          <label class="text-xs font-semibold text-secondary block mb-2">WhatsApp Trigger</label>
          <div class="flex gap-2">
            <input
              :value="`START:${form.form_key}`"
              type="text"
              readonly
              class="flex-1 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm font-mono text-xs"
            />
            <button
              @click="copyWhatsApp"
              class="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex-shrink-0"
              title="Copy WhatsApp trigger"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-secondary mt-1">WhatsApp users can type this to start</p>
        </div>
      </div>

      <div class="h-px bg-base" />

      <!-- ANALYTICS -->
      <div>
        <h4 class="text-xs font-semibold text-base mb-3 uppercase tracking-wide">Analytics</h4>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-primary/5 rounded-lg">
            <p class="text-xs text-secondary mb-1">Total Responses</p>
            <p class="text-2xl font-bold text-primary">{{ form.total_responses || 0 }}</p>
          </div>

          <div class="p-3 bg-success/5 rounded-lg">
            <p class="text-xs text-secondary mb-1">Fields</p>
            <p class="text-2xl font-bold text-success">{{ form.fields.length }}</p>
          </div>
        </div>
      </div>

      <!-- SPACER -->
      <div class="flex-1" />

      <!-- DANGER ZONE -->
      <div class="border-t border-base pt-6">
        <h4 class="text-xs font-semibold text-error mb-3 uppercase tracking-wide">Danger Zone</h4>
        <button
          @click="$emit('delete')"
          class="w-full px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg font-medium transition-colors text-sm"
        >
          Delete Form
        </button>
        <p class="text-xs text-secondary mt-2">This action cannot be undone</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GatpassForm } from '~/composables/useForms'

interface Props {
  form: GatpassForm
  baseUrl: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-config': [config: any]
  'update-expiry': [days: number | null]
  delete: []
}>()

const handleUpdateConfig = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-config', {
    ...props.form.config,
    allow_edit: target.checked,
  })
}

const handleUpdateExpiry = (event: Event) => {
  const target = event.target as HTMLInputElement
  const days = target.value ? parseInt(target.value) : null
  emit('update-expiry', days)
}

const copyKey = () => {
  navigator.clipboard.writeText(props.form.form_key)
}

const copyUrl = () => {
  navigator.clipboard.writeText(`${props.baseUrl}/f/${props.form.form_key}`)
}

const copyWhatsApp = () => {
  navigator.clipboard.writeText(`START:${props.form.form_key}`)
}
</script>