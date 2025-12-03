<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="font-semibold text-base mb-2">Fields</h3>
      <p class="text-xs text-secondary">Drag fields to add them to your form</p>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      type="text"
      placeholder="Search fields..."
      class="w-full px-3 py-2 border border-base rounded-lg text-sm bg-secondary bg-opacity-10 mb-4"
    />

    <!-- Categories -->
    <div class="space-y-4">
      <div v-for="category in filteredCategories" :key="category.id">
        <!-- Category Header -->
        <button
          @click="toggleCategory(category.id)"
          class="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary hover:bg-opacity-10 rounded-lg transition-colors"
        >
          <div class="flex items-center gap-2">
            <Icon :name="`mdi:${category.icon}`" class="w-4 h-4" />
            <span class="text-sm font-medium text-base">{{ category.label }}</span>
          </div>
          <Icon
            :name="expandedCategories.includes(category.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'"
            class="w-4 h-4 text-secondary"
          />
        </button>

        <!-- Category Fields -->
        <div
          v-if="expandedCategories.includes(category.id)"
          class="ml-2 space-y-2 mt-2"
        >
          <div
            v-for="field in getCategoryFields(category.id)"
            :key="field.id"
            draggable="true"
            @dragstart="startDrag(field)"
            class="p-3 bg-secondary bg-opacity-10 rounded-lg cursor-move hover:bg-opacity-20 transition-colors border border-border-primary"
          >
            <div class="flex items-start gap-2">
              <Icon :name="`mdi:${field.icon}`" class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-base">{{ field.name }}</p>
                <p class="text-xs text-secondary">{{ field.description }}</p>
              </div>
            </div>

            <!-- Quick Add Button -->
            <button
              @click="addField(field.id)"
              class="w-full mt-2 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-8 p-3 bg-info bg-opacity-10 rounded-lg">
      <p class="text-xs font-medium text-info mb-1">💡 Tip:</p>
      <p class="text-xs text-secondary">
        You can drag fields directly into your form or use the "Add" button
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FIELD_CATEGORIES, getFieldsByCategory } from '~/utils/fieldTypes'
import type { FieldTypeConfig } from '~/utils/fieldTypes'

/* ============ STATE ============ */
const search = ref('')
const expandedCategories = ref<string[]>(['input', 'selection'])
const draggedField = ref<FieldTypeConfig | null>(null)

/* ============ EMITS ============ */
const emit = defineEmits<{
  'add-field': [fieldType: string]
}>()

/* ============ COMPUTED ============ */
const categories = computed(() => FIELD_CATEGORIES)

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  return categories.value.filter(cat =>
    getFieldsByCategory(cat.id).some(field =>
      field.name.toLowerCase().includes(search.value.toLowerCase()) ||
      field.description.toLowerCase().includes(search.value.toLowerCase())
    )
  )
})

/* ============ METHODS ============ */
const getCategoryFields = (categoryId: string): FieldTypeConfig[] => {
  let fields = getFieldsByCategory(categoryId)

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    fields = fields.filter(field =>
      field.name.toLowerCase().includes(searchLower) ||
      field.description.toLowerCase().includes(searchLower)
    )
  }

  return fields
}

const toggleCategory = (categoryId: string) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

const startDrag = (field: FieldTypeConfig) => {
  draggedField.value = field
}

const addField = (fieldType: string) => {
  emit('add-field', fieldType)
}
</script>