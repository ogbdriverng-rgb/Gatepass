
<!-- ====== 8. DeleteFormDialog.vue ====== -->
<!-- components/forms/DeleteFormDialog.vue -->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <CommonCard class="w-full max-w-sm">
      <h3 class="text-xl font-bold text-base mb-2">Delete Form?</h3>
      <p class="text-secondary text-sm mb-6">
        This action cannot be undone. All form data and responses will be permanently deleted.
      </p>

      <div class="flex gap-3">
        <CommonButton
          variant="secondary"
          label="Cancel"
          fullWidth
          @click="$emit('cancel')"
        />
        <CommonButton
          variant="error"
          label="Delete"
          fullWidth
          :disabled="isDeleting"
          @click="$emit('confirm')"
        />
      </div>
    </CommonCard>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isDeleting?: boolean
  }>(),
  {
    isDeleting: false,
  }
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>