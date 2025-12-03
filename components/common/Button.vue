<!-- ============ BUTTON COMPONENT ============ -->
<template>
  <button
    :class="[
      'btn',
      variantClass,
      sizeClass,
      {
        'w-full': fullWidth,
        'opacity-50 cursor-not-allowed': disabled,
      },
    ]"
    :disabled="disabled"
    :type="type"
  >
    <!-- Left Icon -->
    <Icon
      v-if="icon && (!iconPosition || iconPosition === 'left') && !socialIcons[icon]"
      :name="`mdi:${icon}`"
      :class="['w-5 h-5', label ? 'mr-2' : '']"
    />
    <span v-else-if="icon && socialIcons[icon]" class="social-icon mr-2">{{ socialIcons[icon] }}</span>

    <!-- Label -->
    <span v-if="label">{{ label }}</span>

    <!-- Right Icon -->
    <Icon
      v-if="icon && iconPosition === 'right' && !socialIcons[icon]"
      :name="`mdi:${icon}`"
      :class="['w-5 h-5', label ? 'ml-2' : '']"
    />
    <span v-else-if="icon && iconPosition === 'right' && socialIcons[icon]" class="social-icon ml-2">{{ socialIcons[icon] }}</span>

    <!-- Default slot -->
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Social media icons (fallback for non-MDI)
const socialIcons: Record<string, string> = {
  google: '🔍',
  github: '🐙',
  twitter: '𝕏',
  facebook: 'f',
  linkedin: 'in',
}

export interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  label?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  iconPosition: 'left',
  disabled: false,
  fullWidth: false,
})

const variantClass = computed(() => {
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    success: 'btn-success',
    error: 'btn-error',
  }
  return variants[props.variant]
})

const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  }
  return sizes[props.size]
})
</script>

<style scoped>
button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-weight: 500;
  transition: all var(--transition-base) ease-in-out;
  border: none;
  cursor: pointer;
}

button:focus-visible {
  outline: 2px solid var(--form-border-focus);
  outline-offset: 2px;
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Social icon fallback styling */
.social-icon {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
