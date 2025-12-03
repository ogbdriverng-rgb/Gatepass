<template>
  <component
    :is="resolvedIcon"
    :class="[
      `w-${size} h-${size}`,
      colorClass,
      className
    ]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

// IMPORTANT: prevents recursion
defineOptions({
  name: 'CommonIcon'
})

export interface Props {
  name: string
  size?: 4 | 5 | 6 | 8 | 10 | 12
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 5,
  color: 'primary',
  className: '',
})

const resolvedIcon = computed(() => {
  // change heroicons set here if needed
  return `i-heroicons-${props.name}-20-solid`
})

const colorClass = computed(() => {
  const map: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  }
  return map[props.color] || 'text-primary'
})
</script>
