<script setup>
import Card from '@/views/dashboard/card.vue';
import Slider from '@/views/dashboard/slider.vue';
import Teble from '@/views/dashboard/teble.vue';
</script>

<template>
  <VCol 
    cols="12"
    md="12"
  >
  <VRow class="py-6">
  <!-- Zone de bienvenue -->
  <VCol
    cols="12"
    md="4"
    class="d-flex flex-column "
    
  >
    <div class="pe-3">
      <h3 class="text-h3 text-high-emphasis mb-5">
        Bon retour,<span class="font-weight-medium"> Utilisateur 👋🏻 </span>
      </h3>

      <div
        class="mb-2 text-wrap"
        style="max-inline-size: 500px;"
      >
        Explorez vos outils et simplifiez votre gestion académique. Nous sommes là pour vous accompagner !
      </div>
    </div>
  </VCol>

  <!-- Composant Slider -->
  <VCol
    cols="12"
    md="8"
    class="align-self-start"
  >
    <Slider />
  </VCol>
</VRow>

  </VCol>
    <!-- 3 card syllabus -->
    <Vrow class="match-height">
      <Vcol>
        <Card/>
      </Vcol>
    </Vrow>
    
    <br><hr><br>
    <!-- tableau -->
    <VRow class="match-height">
      <VCol 
        cols="12"
        md="12"
      >
      <Teble/>
      </VCol>

    </VRow>
</template>
