<template>
  <div class="max-w-sm mx-auto">
    <!-- Phone Frame -->
    <div class="bg-black rounded-3xl p-2 shadow-2xl">
      <div class="bg-secondary rounded-2xl overflow-hidden shadow-lg">
        <!-- Status Bar -->
        <div class="bg-secondary text-white px-4 py-2 flex items-center justify-between text-xs">
          <span>9:41</span>
          <div class="flex gap-1 text-lg">
            <span>📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- Chat Header -->
        <div class="bg-secondary-700 text-white px-4 py-3 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-sm">
            💬
          </div>
          <div class="flex-1">
            <p class="font-semibold text-sm">{{ form.title }}</p>
            <p class="text-xs opacity-75">Active now</p>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="h-96 overflow-y-auto bg-secondary-50 p-4 space-y-2 flex flex-col">
          <!-- Welcome Message -->
          <div class="flex justify-start">
            <div class="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-xs shadow-sm">
              <p class="text-sm text-secondary-900">
                👋 {{ form.title }}
              </p>
              <p v-if="form.description" class="text-xs text-secondary-600 mt-1">
                {{ form.description }}
              </p>
            </div>
          </div>

          <!-- Current Field -->
          <div class="flex justify-start mt-4">
            <div class="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-xs shadow-sm">
              <p class="text-sm text-secondary-900 font-semibold mb-2">
                {{ currentField.label }}
              </p>

              <!-- Quick Reply Buttons (for select) -->
              <div v-if="currentField.type === 'select'" class="space-y-2">
                <button
                  v-for="option in currentField.meta.options"
                  :key="option.id"
                  @click="selectOption(option.id)"
                  class="w-full px-3 py-2 bg-secondary bg-opacity-20 text-secondary-900 text-sm rounded border border-secondary text-left hover:bg-opacity-30 transition-colors"
                >
                  {{ option.label }}
                </button>
              </div>

              <!-- Multiselect Checkboxes -->
              <div v-else-if="currentField.type === 'multiselect'" class="space-y-2">
                <label
                  v-for="option in currentField.meta.options"
                  :key="option.id"
                  class="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:bg-opacity-10 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    class="w-4 h-4 rounded border-secondary"
                    @change="selectMultiple(option.id)"
                  />
                  <span class="text-sm text-secondary-900">{{ option.label }}</span>
                </label>
              </div>

              <!-- Text Input -->
              <div v-else-if="['text', 'email', 'phone', 'number'].includes(currentField.type)" class="text-sm text-secondary-600 italic">
                {{ getInputPlaceholder(currentField.type) }}
              </div>

              <!-- Date Input -->
              <div v-else-if="currentField.type === 'date'" class="text-sm text-secondary-600 italic">
                📅 Select a date
              </div>

              <!-- File Upload -->
              <div v-else-if="currentField.type === 'file'" class="text-sm text-secondary-600 italic">
                📎 Send a file or photo
              </div>

              <!-- Rating -->
              <div v-else-if="currentField.type === 'rating'" class="flex gap-1">
                <button
                  v-for="i in currentField.meta.scale || 5"
                  :key="i"
                  @click="selectRating(i)"
                  class="px-2 py-1 bg-secondary bg-opacity-20 text-secondary-900 text-xs rounded hover:bg-opacity-30 transition-colors"
                >
                  {{ i }} ⭐
                </button>
              </div>

              <!-- Textarea -->
              <div v-else-if="currentField.type === 'textarea'" class="text-sm text-secondary-600 italic">
                ✏️ Send your message
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div v-if="form.fields.length > 1" class="flex justify-end gap-2 mt-4">
            <button
              v-if="currentIndex > 0"
              @click="previousField"
              class="px-3 py-1 bg-secondary bg-opacity-20 text-secondary-900 text-xs rounded"
            >
              ← Back
            </button>
            <button
              v-if="currentIndex < form.fields.length - 1"
              @click="nextField"
              class="px-3 py-1 bg-secondary text-white text-xs rounded"
            >
              Next →
            </button>
            <button
              v-else
              @click="submitForm"
              class="px-3 py-1 bg-success text-white text-xs rounded"
            >
              ✓ Done
            </button>
          </div>

          <div class="flex-1" />

          <!-- Timestamp -->
          <div class="text-center text-xs text-secondary-500 mt-4">
            {{ currentTime }}
          </div>
        </div>

        <!-- Input Area -->
        <div class="bg-secondary-100 px-3 py-2 border-t border-secondary-200">
          <div class="flex items-center gap-2">
            <span class="text-xl cursor-pointer">😊</span>
            <input
              type="text"
              placeholder="Type a message..."
              class="flex-1 bg-white rounded-full px-4 py-1 text-sm outline-none"
              disabled
            />
            <span class="text-xl cursor-pointer">✈️</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Info -->
    <p class="text-xs text-secondary text-center mt-4">
      This is a simulation of how your form will appear in WhatsApp
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormWithFields } from '~/composables/useForms'

interface Props {
  form: FormWithFields
}

const props = defineProps<Props>()

/* ============ STATE ============ */
const currentIndex = ref(0)
const selectedResponses = ref<Record<string, any>>({})

/* ============ COMPUTED ============ */
const currentField = computed(() => {
  return props.form.fields[currentIndex.value]
})

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
})

/* ============ METHODS ============ */
const selectOption = (optionId: string) => {
  selectedResponses.value[currentField.value.id] = optionId
  nextField()
}

const selectMultiple = (optionId: string) => {
  const current = selectedResponses.value[currentField.value.id] || []
  const index = current.indexOf(optionId)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(optionId)
  }

  selectedResponses.value[currentField.value.id] = current
}

const selectRating = (rating: number) => {
  selectedResponses.value[currentField.value.id] = rating
  nextField()
}

const nextField = () => {
  if (currentIndex.value < props.form.fields.length - 1) {
    currentIndex.value++
  }
}

const previousField = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const submitForm = () => {
  currentIndex.value = 0
  selectedResponses.value = {}
}

const getInputPlaceholder = (type: string): string => {
  const placeholders: Record<string, string> = {
    text: '✏️ Type your answer',
    email: '📧 Enter your email',
    phone: '📱 Enter your phone number',
    number: '🔢 Enter a number',
  }
  return placeholders[type] || '✏️ Type your answer'
}
</script>