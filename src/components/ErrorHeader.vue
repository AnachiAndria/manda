<script setup>
const props = defineProps({
  statusCode: {
    type: [
      String,
      Number,
    ],
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
})
</script>

<template>
  <div class="text-center">
    <!-- 👉 Title and subtitle -->
    <h1
      v-if="props.statusCode"
      class="text-h1 font-weight-medium"
    >
      {{ props.statusCode }}
    </h1>
    <h4
      v-if="props.title"
      class="text-h4 font-weight-medium mb-3"
    >
      {{ props.title }}
    </h4>
    <p
      v-if="props.description"
      style="max-inline-size: 50vw;"
    >
      {{ props.description }}
    </p>
  </div>
</template>
