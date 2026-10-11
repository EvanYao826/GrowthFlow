<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}>(), {
  type: 'button',
  variant: 'secondary',
  disabled: false,
})
</script>

<template>
  <button class="base-button" :class="`base-button--${variant}`" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>
