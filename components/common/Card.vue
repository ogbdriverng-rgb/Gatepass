
<!-- ============ CARD COMPONENT ============ -->
<template>
  <div
    class="card"
    :class="{
      'p-4 sm:p-6': !noPadding,
      'cursor-pointer hover:shadow-lg': clickable && !disabled,
      'opacity-50 cursor-not-allowed': disabled,
    }"
    :role="clickable ? 'button' : undefined"
    @click="clickable && !disabled && emit('click')"
  >
    <!-- Header -->
    <div v-if="title || subtitle || hasHeader" class="mb-4">
      <slot name="header">
        <div>
          <h3 v-if="title" class="text-lg font-semibold text-primary">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm text-secondary mt-1">
            {{ subtitle }}
          </p>
        </div>
      </slot>
    </div>

    <!-- Content -->
    <slot />

    <!-- Footer -->
    <div v-if="hasFooter" class="mt-4 pt-4 border-t border-base">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue'

export interface Props {
  title?: string
  subtitle?: string
  clickable?: boolean
  disabled?: boolean
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  clickable: false,
  disabled: false,
  noPadding: false,
})

const emit = defineEmits<{
  click: []
}>()

const slots = useSlots()
const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
</script>

<style scoped>
.card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  transition: all var(--transition-base) ease-in-out;
}

.card:hover {
  box-shadow: var(--shadow-md);
}
</style>