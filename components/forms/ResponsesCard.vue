
<!-- ====== 4. ResponsesCard.vue ====== -->
<!-- components/forms/ResponsesCard.vue -->

<template>
  <div class="p-3 bg-secondary bg-opacity-10 rounded-lg">
    <p class="text-xs text-secondary mb-1">Responses</p>
    <p class="text-2xl font-bold text-primary">
      {{ count || 0 }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number
  }>(),
  {
    count: 0,
  }
)
</script>


