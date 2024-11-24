<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['cancel'])
</script>

<template>
  <div class="pa-6 d-flex align-center">
    <h5 class="text-h5">
      {{ props.title }}
    </h5>
    <VSpacer />

    <slot name="beforeClose" />

    <IconBtn
      variant="tonal"
      class="rounded"
      size="32"
      @click="$emit('cancel')"
    >
      <VIcon
        size="18"
        icon="tabler-x"
      />
    </IconBtn>
  </div>
</template>
