<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  divider: {
    type: Boolean,
    required: false,
    default: true,
  },
})
</script>

<template>
  <VDivider v-if="props.divider" />

  <div class="customizer-section">
    <div>
      <VChip
        size="x-small"
        color="primary"
      >
        <span class="text-xs font-weight-medium">{{ props.title }}</span>
      </VChip>
    </div>

    <slot />
  </div>
</template>
