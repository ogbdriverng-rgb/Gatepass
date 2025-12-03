<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900">{{ error.statusCode }}</h1>
      <p class="text-xl text-gray-600 mt-4">{{ error.message }}</p>
      <button @click="handleError" class="mt-8 px-6 py-3 bg-primary-600 text-white rounded-lg">
        Go Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: { statusCode: number; message: string }
}>()

const handleError = () => clearError({ redirect: '/' })
</script>
