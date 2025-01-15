<script setup>
import sliderBar1 from '@images/pages/misc-under-maintenance.png';
import sliderBar2 from '@images/pages/pose-fs-9.png';
import { onMounted, ref } from 'vue';
import { VIcon } from 'vuetify/components/VIcon';

// Services
import ElementConstitutifService from "@/utils/services/ElementConstitutifService";
import UniteEnseignementService from '@/utils/services/UniteEnseignementService';

// Déclarations réactives
const elementConstitutifs = ref([]);
const unitesEnseignement = ref([]);
const ecCountByLevel = ref({}); // Compte des EC par niveau
const ueCountByLevel = ref({}); // Compte des UE par niveau

// Initialisation des services
const elementConstitutifService = new ElementConstitutifService();
const uniteEnseignementService = new UniteEnseignementService();

// Récupération des données depuis les services
async function fetchElementConstitutif() {
  try {
    elementConstitutifs.value = await elementConstitutifService.getAllElementConstitutif();    
  } catch (error) {
    console.error("Erreur lors de la récupération des éléments constitutifs:", error);
  }
}

async function fetchUnitesEnseignement() {
  try {
    unitesEnseignement.value = await uniteEnseignementService.getAllUnitesEnseignement();    
  } catch (error) {
    console.error("Erreur lors de la récupération des unités d'enseignement:", error);
  }
}

// Traitement des données
function countECByLevel(level) {
  const filteredUE = unitesEnseignement.value.filter(ue => ue.niveau === level);
  const ueIds = filteredUE.map(ue => ue.id);

  // Compte les EC qui appartiennent à ces UEs
  const count = elementConstitutifs.value.filter(ec => ueIds.includes(ec.unite_enseignement_id)).length;
  if (count > 0) {
    return count;
  } else {
    return 0
  }
}
function countUEByLevel(level) {
  const count = unitesEnseignement.value.filter(ue => ue.niveau === level).length; 
  if (count > 0) {
    return count;
  } else {
    return 0
  }
}

// Données réactives pour le slider
const websiteAnalytics = ref([]);
const isLoading= ref(true)
// Chargement initial
onMounted(async () => {
  try {
    isLoading.value = true;
    await fetchElementConstitutif();
    await fetchUnitesEnseignement();

    // Mettez à jour les données du slider après la récupération des données
    websiteAnalytics.value = [
      {
        name: 'Éléments constitutifs',
        slideImg: sliderBar1,
        data: [
          { classe: 'L1', nbr: countECByLevel("L1") },
          { classe: 'L2', nbr: countECByLevel("L2") },
          { classe: 'L3', nbr: countECByLevel("L3") },
          { classe: 'M1', nbr: countECByLevel("M1") },
          { classe: 'M2', nbr: countECByLevel("M2") },
        ],
      },
      {
        name: 'Unités d\'enseignement',
        slideImg: sliderBar2,
        data: [
          { classe: 'L1', nbr: countUEByLevel("L1") },
          { classe: 'L2', nbr: countUEByLevel("L2") },
          { classe: 'L3', nbr: countUEByLevel("L3") },
          { classe: 'M1', nbr: countUEByLevel("M1") },
          { classe: 'M2', nbr: countUEByLevel("M2") },
        ],
      },
    ];

  } catch (error) {
    console.error("Erreur lors du chargement initial:", error);
  }finally{
    isLoading.value = false;
  }
});


</script>


<template>

<div v-if="isLoading" class="d-flex flex-column justify-center">
      <VProgressCircular
        indeterminate
        color="primary"
      />

    </div>
  <VCard 
  v-else 
  class="v-card-bg"
  >
    
  <!-- color="primary" -->
    <VCarousel 
      color="error"
      cycle
      :continuous="false"
      :show-arrows="false"
      hide-delimiter-background
      :delimiter-icon="() => h(VIcon, { icon: 'fa-circle', size: '10' })"
      height="auto"
      class="carousel-delimiter-top-end web-analytics-carousel "
    >
      <VCarouselItem
        v-for="item in websiteAnalytics"
        :key="item.name"
      >
        <VCardText>
          
          <VRow>
            <VCol cols="12">
              <h5 class="text-h5 text-white mb-1">
                Syllotrack
              </h5>
              <p class="text-sm text-white mb-0">
                Gestion des ressources pédagogiques
              </p>
            </VCol>
            <VCol
              cols="12"
              sm="8"
              order="6"
              order-sm="1"
            >
              <VRow>
                <VCol
                  cols="12"
                  class="pb-0 pt-1"
                >
                  <p class="font-weight-medium text-white mb-1">
                    {{ item.name }}
                  </p>
                </VCol>

                <VCol
                  v-for="d in item.data"
                  :key="d.classe"
                  cols=""
                  class="text-no-wrap pb-2"
                >
                  <VChip
                    label
                    variant="flat"
                    size="default"
                    color="rgba(var(--v-theme-on-surface), 0.12)"
                    class="font-weight-medium text-white rounded me-2"
                  >
                    {{ d.classe }}
                  </VChip>
                  <span class="text-white" >{{ d.nbr }}</span>
                </VCol>
              </VRow>
            </VCol>

            <VCol
              cols="12"
              sm="3"
              order="1"
              order-sm="2"
              class="position-relative text-center"
            >
              <img
                :src="item.slideImg"
                class="card-website-analytics-img"
                style="filter: drop-shadow(0 4px 40px rgba(0, 0, 0, 40%));"
              >
            </VCol>
          </VRow>
        </VCardText>
      </VCarouselItem>
    </VCarousel>
  </VCard>
</template>

<style lang="scss">
.v-card-bg {
  background-image: url('/src/assets/images/pages/user-profile-header-bg.png'); /* Remplacez par votre URL d'image */
  background-position: center; /* Centrer l'image */
  background-repeat: no-repeat; /* Ne pas répéter l'image */
  background-size: cover; /* L'image couvre toute la carte */
}


.card-website-analytics-img {
  block-size: 150px;
}

@media screen and (min-width: 600px) {
  .card-website-analytics-img {
    position: absolute;
    margin: auto;
    inset-block: -1rem 40px;
    inset-inline-end: 1rem;
  }
}

.web-analytics-carousel {
  .v-carousel__controls {
    .v-btn:not(.v-btn--active) {
      opacity: 0.4;
    }
  }
}
</style>

