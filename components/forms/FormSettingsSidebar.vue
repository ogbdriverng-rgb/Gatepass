<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-6 border-b border-base flex-shrink-0">
      <h3 class="text-lg font-bold text-base">Settings</h3>
    </div>

    <!-- Content - Fixed scrolling -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
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
              :class="['px-3 py-2 rounded-lg transition-colors flex-shrink-0', copiedKey ? 'bg-success/20 text-success' : 'bg-primary/10 hover:bg-primary/20 text-primary']"
              :title="copiedKey ? 'Copied!' : 'Copy form key'"
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
              :class="['px-3 py-2 rounded-lg transition-colors flex-shrink-0', copiedUrl ? 'bg-success/20 text-success' : 'bg-primary/10 hover:bg-primary/20 text-primary']"
              :title="copiedUrl ? 'Copied!' : 'Copy web URL'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-secondary mt-1">Share this link publicly</p>
        </div>
      </div>

      <div class="h-px bg-base" />

      <!-- WHATSAPP SECTION -->
      <div v-if="form.is_published">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.154 1.592 2.619 4.747 4.118 7.876 4.118 2.305 0 4.47-.822 6.162-2.376.826-.713 1.529-1.596 2.07-2.61l-.002-.004A9.87 9.87 0 0012.05 2.05C6.476 2.052 2.05 6.476 2.05 12.05c0 2.305.822 4.47 2.376 6.162.713.826 1.596 1.529 2.61 2.07l.004.002c1.564.805 3.322 1.266 5.16 1.266 5.573 0 9.999-4.426 10-9.999 0-2.305-.822-4.47-2.376-6.162-.713-.826-1.596-1.529-2.61-2.07z"/>
          </svg>
          <h4 class="text-xs font-semibold text-base uppercase tracking-wide">WhatsApp Integration</h4>
        </div>

        <!-- WhatsApp Link -->
        <div class="mb-4">
          <label class="text-xs font-semibold text-secondary block mb-2">WhatsApp Link</label>
          <div class="flex gap-2">
            <input
              :value="whatsappLink"
              type="text"
              readonly
              class="flex-1 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm font-mono text-xs truncate"
            />
            <button
              @click="copyWhatsAppLink"
              :class="['px-3 py-2 rounded-lg transition-colors flex-shrink-0', copiedWhatsApp ? 'bg-success/20 text-success' : 'bg-green-600 hover:bg-green-700 text-white']"
              :title="copiedWhatsApp ? 'Copied!' : 'Copy WhatsApp link'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-secondary mt-1">Users can click to start on WhatsApp</p>
        </div>

        <!-- QR Code -->
        <div class="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
          <p class="text-xs font-semibold text-secondary mb-3">QR Code</p>
          <div v-if="qrCode" class="flex justify-center">
            <img :src="qrCode" :alt="`QR Code for ${form.title}`" class="w-40 h-40" />
          </div>
          <div v-else class="w-40 h-40 mx-auto bg-gray-100 rounded flex items-center justify-center">
            <p class="text-xs text-secondary">Generating...</p>
          </div>
          <p class="text-xs text-secondary mt-2">Scan to open form on WhatsApp</p>
        </div>

        <!-- Open WhatsApp Button -->
        <button
          @click="openWhatsApp"
          class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.154 1.592 2.619 4.747 4.118 7.876 4.118 2.305 0 4.47-.822 6.162-2.376.826-.713 1.529-1.596 2.07-2.61l-.002-.004A9.87 9.87 0 0012.05 2.05C6.476 2.052 2.05 6.476 2.05 12.05c0 2.305.822 4.47 2.376 6.162.713.826 1.596 1.529 2.61 2.07l.004.002c1.564.805 3.322 1.266 5.16 1.266 5.573 0 9.999-4.426 10-9.999 0-2.305-.822-4.47-2.376-6.162-.713-.826-1.596-1.529-2.61-2.07z"/>
          </svg>
          Open in WhatsApp
        </button>

        <!-- WhatsApp Trigger -->
        <div>
          <label class="text-xs font-semibold text-secondary block mb-2">WhatsApp Trigger Command</label>
          <div class="flex gap-2">
            <input
              :value="`START:${form.form_key}`"
              type="text"
              readonly
              class="flex-1 px-3 py-2 border-2 border-base rounded-lg bg-secondary/5 text-sm font-mono text-xs"
            />
            <button
              @click="copyTrigger"
              :class="['px-3 py-2 rounded-lg transition-colors flex-shrink-0', copiedTrigger ? 'bg-success/20 text-success' : 'bg-primary/10 hover:bg-primary/20 text-primary']"
              :title="copiedTrigger ? 'Copied!' : 'Copy trigger'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-secondary mt-1">Users type this command to start</p>
        </div>
      </div>

      <!-- Draft State Info -->
      <div v-else class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p class="text-xs text-yellow-700 font-semibold mb-1">📋 Draft Form</p>
        <p class="text-xs text-yellow-600">
          Publish your form to generate WhatsApp link and QR code for sharing.
        </p>
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
import { ref, computed, onMounted, watch } from 'vue'
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

const copiedKey = ref(false)
const copiedUrl = ref(false)
const copiedWhatsApp = ref(false)
const copiedTrigger = ref(false)
const qrCode = ref<string>('')

const whatsappLink = computed(() => {
  // Default phone for WhatsApp bot
  const botPhone = '2348140827580'
  const cleanPhone = botPhone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=START:${props.form.form_key}`
})

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

const copyWithFeedback = (text: string, feedbackRef: any) => {
  navigator.clipboard.writeText(text)
  feedbackRef.value = true
  setTimeout(() => {
    feedbackRef.value = false
  }, 2000)
}

const copyKey = () => copyWithFeedback(props.form.form_key, copiedKey)
const copyUrl = () => copyWithFeedback(`${props.baseUrl}/f/${props.form.form_key}`, copiedUrl)
const copyWhatsAppLink = () => copyWithFeedback(whatsappLink.value, copiedWhatsApp)
const copyTrigger = () => copyWithFeedback(`START:${props.form.form_key}`, copiedTrigger)

const openWhatsApp = () => {
  window.open(whatsappLink.value, '_blank')
}

// Generate QR Code - Fixed to handle async properly
const generateQRCode = async () => {
  if (!props.form.is_published) {
    qrCode.value = ''
    return
  }

  try {
    // Use a CDN-based QR code generator instead
    const encodedUrl = encodeURIComponent(whatsappLink.value)
    qrCode.value = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedUrl}`
  } catch (error) {
    console.error('Error generating QR code:', error)
    qrCode.value = ''
  }
}

// Watch for form publish status changes
watch(
  () => props.form.is_published,
  () => {
    generateQRCode()
  }
)

// Initial generation on mount
onMounted(() => {
  generateQRCode()
})
</script>