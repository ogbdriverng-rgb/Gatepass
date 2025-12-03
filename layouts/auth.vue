<template>
  <div class="min-h-screen bg-base">
    <!-- Main Content -->
    <slot />

    <!-- Footer -->
    <footer class="py-6 mt-8 border-t border-base bg-secondary">
      <div class="container max-w-md mx-auto px-4 text-center">
        <p class="text-sm text-secondary">
          © 2024 Gatepass. All rights reserved.
          <br />
          <span class="text-xs">Built with ❤️ for form creators</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Auth layout - minimal layout for auth pages
// No header or sidebar, just content and footer
</script>