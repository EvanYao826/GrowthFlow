<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
  options: readonly { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onChange(event: Event) {
  const target = event.target
  if (target instanceof HTMLSelectElement) emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="form-field">
    <label class="form-label" :for="id">{{ label }}</label>
    <select :id="id" class="form-select" :value="modelValue" @change="onChange">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
