<script setup>
//service
import ElementConstitutifService from "@/utils/services/ElementConstitutifService";
import ChapitreService from "@/utils/services/ChapitreService";
import { onMounted } from "vue";

//iitialiser service 
const elementConstitutifService = new ElementConstitutifService()
const chapitreService = new ChapitreService()

//valeur 
const elementConstitutifs = ref([])
const chapitres = ref([])
const logisticData = ref([])
//fetch 
async function fetchElementConstitutif() {
  try {
    elementConstitutifs.value = await elementConstitutifService.getAllElementConstitutif();    
  } catch (error) {
    console.error("Erreur lors de la récupération des éléments constitutifs:", error);
  }
}

//chapitre
async function fetchChapitre() {
  try {
    chapitres.value = await chapitreService.getAllChapitre();
  } catch (error) {
    console.error("Erreur lors de la récupération des chapitres:", error);
  }
}
function countDistinctElementConstitutifIds(chapitres) {
  // Utiliser un Set pour stocker les IDs uniques
  const uniqueIds = new Set(chapitres.map(chapitre => chapitre.element_constitutif_id));
  return uniqueIds.size; // Retourne le nombre d'IDs uniques
}
async function affectvaleur() {
  let syllabus = countDistinctElementConstitutifIds(chapitres.value)
  let ec = elementConstitutifs.value.length
  let evilSyllabus = ec - syllabus
  
  logisticData.value = ([
  {
    icon: 'tabler-book-2',
    color: 'primary',
    title: 'Élément constitutif enregistrés',
    value: ec,
    isHover: false,
  },
  {
    icon: 'tabler-file-check',
    color: 'success',
    title: 'Syllabus enregistrés',
    value: syllabus,
    isHover: false,
  },
  {
    icon: 'tabler-file-alert',
    color: 'error',
    title: 'Élément constitutif sans syllabus',
    value: evilSyllabus,
    isHover: false,
  },
])
}

onMounted(async () =>{
  await fetchElementConstitutif()
  await fetchChapitre()
  affectvaleur()
})
</script>

<template>
  <VRow>
    <VCol
      v-for="(data, index) in logisticData"
      :key="index"
      cols="12"
      md="4"
      sm="4"
    >
      <div>
        <VCard
          class="logistics-card-statistics cursor-pointer"
          :style="data.isHover ? { 'border-block-end': `2px solid rgba(var(--v-theme-${data.color}))` } : { 'border-block-end': `2px solid rgba(var(--v-theme-${data.color}), var(--v-disabled-opacity))` }"
          @mouseenter="data.isHover = true"
          @mouseleave="data.isHover = false"
        >
          <VCardText>
            <div class="d-flex align-center gap-x-4 mb-2">
              <VAvatar
                variant="tonal"
                :color="data.color"
                rounded
              >
                <VIcon
                  :icon="data.icon"
                  size="28"
                />
              </VAvatar>
              <h5 class="text-h5 font-weight-medium">
                {{ data.value }}
              </h5>
            </div>

            <!-- titre -->
            <div class="text-body-1">
              {{ data.title }}
            </div>
          </VCardText>
        </VCard>
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
@use "@core/scss/base/mixins" as mixins;

.logistics-card-statistics:hover {
  @include mixins.elevation(12);

  transition: all 0.1s ease-out;
}
</style>
