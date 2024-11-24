<script setup>
import FormulaireUser from '@/views/User/FormulaireUser.vue'
import ProfileUser from '@/views/User/ProfileUser.vue'
</script>

<template>
  <VRow class="match-height">
    <VCol
      cols="12"
      md="5"
      lg="4"
    >
      <ProfileUser />
    </VCol>
    <VCol
      cols="12"
      md="7"
      lg="8"
    >
      <FormulaireUser />
    </VCol>
  </vrow>
</template>
