<!-- ====== 2. FormKeyField.vue ====== -->
<!-- components/forms/FormKeyField.vue -->

<template>
  <div>
    <p class="text-sm font-medium text-base mb-2">Form Key</p>
    <div class="flex gap-2">
      <input
        :value="formKey"
        type="text"
        readonly
        class="flex-1 px-3 py-2 border border-base rounded-lg text-sm bg-secondary bg-opacity-10 font-mono text-xs"
      />
      <button
        @click="$emit('copy')"
        class="p-2 hover:bg-secondary rounded-lg transition-colors"
        title="Copy form key"
      >
        <Icon name="mdi:content-copy" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    formKey: string
  }>(),
  {}
)

defineEmits<{
  copy: []
}>()
</script>

