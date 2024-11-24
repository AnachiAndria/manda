<script setup>
import TableUE from '@/views/UEEC/tableUE.vue'
import { ref } from 'vue'

const test = ref(false)
</script>

<template>
  <div>
    <!--
      <VRow class="match-height">
      <VCol
      cols="12"
      md="5"
      lg="12"
      >
      <UEECwidget />
      </VCol>
      </VRow> 
    -->
    <VRow class="match-height">
      <VCol
        cols="12"
        md="12"
      >
        <TableUE />
      </VCol>
    </VRow>
  </div>
</template>
    