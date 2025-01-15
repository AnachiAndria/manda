<script setup>
import { onMounted, ref } from 'vue';

import ChapitreService from "@/utils/services/ChapitreService";
import ElementConstitutifService from "@/utils/services/ElementConstitutifService";
import ParcoursService from "@/utils/services/ParcoursService";
import UniteEnseignementService from '@/utils/services/UniteEnseignementService';
import CahierDeTexteService from '@/utils/services/CahierDeTexteService';
import SousChapitreService from '@/utils/services/SousChapitreService';

//initialize services
const chapitreService = new ChapitreService()
const elementConstitutifService = new ElementConstitutifService()
const parcoursService = new ParcoursService()
const uniteEnseignementService = new UniteEnseignementService()
const cahiersDeTexteService = new CahierDeTexteService()
const sousChapitresService = new SousChapitreService()

// Define headers and Mention data
const headers = ref([
  { title: 'Element constitutifs', key: 'titreEC' },
  { title: 'classe', key: 'classe' },
  { title: 'parcours', key: 'parcours' },
  { title: 'syllabus', key: 'syllabus' },
  { title: 'Progression', key: 'ecId' },
])

const selectedNiveau = ref(null);
const dataTable = ref([])
const isLoading = ref(true)
const errors = ref([])

const searchQuery = ref('')
const selectedStatus = ref()
const editDialog = ref(false)

const defaultItem = ref({
  id: -1,
  nom_mention: '',
})
const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)
const elementConstitutifs = ref([])
const parcours = ref([])
const chapitres = ref([])
const unitesEnseignement = ref([])
const cahiersDeTexte = ref([])
const sousChapitres = ref([])

// Filtre combiné par niveau
const filteredItems = computed(() => {
  return dataTable.value.filter((item) => {
    if (!selectedNiveau.value) return true; // Si aucun niveau sélectionné, afficher tout
    return item.classe === selectedNiveau.value;
  });
});

// Open edit dialog
const editItem = item => {
  editedIndex.value = mention.value.indexOf(item)
  editedItem.value = { ...item }
  editDialog.value = true
}

// Close edit dialog
const close = () => {
  editDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
}

//methode 
async function fetchElementConstitutif() {
  try {
    elementConstitutifs.value = await elementConstitutifService.getAllElementConstitutif();
  } catch (error) {
    console.error("Erreur lors de la récupération des elements constitutifs:", error);
  }
}
async function fetchCahiersDeTexte() {
  try {
    cahiersDeTexte.value = await cahiersDeTexteService.getAllCahierDeTexte();
  } catch (error) {
    console.error("Erreur lors de la récupération des elements constitutifs:", error);
  }
}
async function fetchElementSousChapitres() {
  try {
    sousChapitres.value = await sousChapitresService.getAllSousChapitre();
  } catch (error) {
    console.error("Erreur lors de la récupération des elements constitutifs:", error);
  }
}
async function fetchParcours() {
  try {
    parcours.value = await parcoursService.getAllParcours();
  } catch (error) {
    console.error("Erreur lors de la récupération des parcours:", error);
  }
}
async function fetchChapitre() {
  try {
    chapitres.value = await chapitreService.getAllChapitre();
  } catch (error) {
    console.error("Erreur lors de la récupération des chapitres:", error);
  }
}
async function fetchUnitesEnseignement() {
  try {
    unitesEnseignement.value = await uniteEnseignementService.getAllUnitesEnseignement();
  } catch (error) {
    console.error("Erreur lors de la récupération des unités d'enseignement:", error);
  }
}

function generateDataTable(elementConstitutifs, parcours, chapitres, unitesEnseignement) {
  return elementConstitutifs.map(ec => {
    // Trouver le parcours associé à l'EC
    const parcoursAssocie = parcours.find(p => p.nom_parcours === ec.nom_parcours);

    // Trouver les chapitres associés à l'EC
    const hasSyllabus = chapitres.some(chapitre => chapitre.element_constitutif_id === ec.id);

    // Trouver l'unité d'enseignement associée à l'EC
    const ueAssocie = unitesEnseignement.find(ue => ue.id === ec.unite_enseignement_id);

    return {
      ecId: getProgression(ec.id),
      titreEC: ec.nomEC, // Titre de l'EC
      classe: ueAssocie?.niveau || "Non défini", // Classe (niveau)
      parcours: parcoursAssocie?.nom_parcours || "Non défini", // Parcours
      syllabus: hasSyllabus, // Syllabus : vrai ou faux
    };
  });
}

const getProgression = (elementConstitutifId) => {
  // Étape 1 : Filtrer les objets avec element_constitutif_id = elementConstitutifId
  const filtres = cahiersDeTexte.value.filter(
    (cahier) => cahier.element_constitutif_id === elementConstitutifId
  );

  // Extraire tous les sous-chapitre_id à exclure
  const idsToExclude = filtres.flatMap((cahier) =>
    cahier.sous_chapitre_id.split(",")
  );

  // Étape 2 : Récupérer tous les sous-chapitres
  const totalSousChapitres = sousChapitres.value.length;
  let sousChapitresTermines = 0;

  // Étape 3 : Vérifier si les sous-chapitres sont terminés
  sousChapitres.value.forEach((sousChapitre) => {
    if (idsToExclude.includes(sousChapitre.id.toString())) {
      sousChapitresTermines++; // Incrémenter si terminé
    }
  });

  // Étape 4 : Calculer le pourcentage
  return totalSousChapitres > 0
    ? ((sousChapitresTermines / totalSousChapitres) * 100).toFixed(2)
    : "0.00";
};


onMounted(async () =>{
  try {
    await fetchElementConstitutif()
    await fetchUnitesEnseignement()
    await fetchChapitre()
    await fetchParcours()
    await fetchCahiersDeTexte()
    await fetchElementSousChapitres()

    dataTable.value = generateDataTable(
      elementConstitutifs.value,
      parcours.value,
      chapitres.value,
      unitesEnseignement.value
    );
    console.log(dataTable.value);
    
  } catch (error) {
    console.error("Erreur lors du chargement initial: ",error);    
  }
})
</script>

<template>
  <VCard class="overflow-visible">
    <div class="w-100 sticky-header">
      <div class=" d-flex align-center gap-4 flex-wrap bg-background pa-6">
        <VCardTitle>Liste des element constitutifs</VCardTitle>
        <VSpacer />
        
      </div>
    </div>
    
    <VCardText>
      <div class="d-flex justify-space-between flex-wrap gap-4">
        <div class="d-flex align-center flex-wrap gap-4">
          <!-- Filtrer par Niveau -->
          <AppSelect
            width="250px"
            v-model="selectedNiveau"
            placeholder="Sélectionner Niveau"
            clearable
            clear-icon="tabler-x"
            single-line
            :items="['L1', 'L2', 'L3', 'M1', 'M2']"
          />
        </div>
        <div class="d-flex align-center flex-wrap gap-4" style="flex-grow: 0.30;">
          <!-- Barre de Recherche -->
          <VTextField
            v-model="searchQuery"
            density="compact"
            placeholder="Recherche ..."
            append-inner-icon="tabler-search"
          />
        </div>
      </div>
    </VCardText>
    <VDivider />
    <VCardText>
      <!-- Data Table avec filtres -->
      <VDataTable
        :headers="headers"
        :items="filteredItems"
        :search="searchQuery"
        :items-per-page="10"
        class="text-no-wrap"
        item-value="id"
      >
        <!-- Template personnalisé -->
        <template #item.titreEC="{ item }">
          {{ item.titreEC }}
        </template>
        <template #item.classe="{ item }">
          {{ item.classe }}
        </template>
        <template #item.parcours="{ item }">
          {{ item.parcours }}
        </template>
        <template #item.syllabus="{ item }">
          <VAvatar
            size="40"
            :color="item.syllabus == true ?'success':'error'"
            variant="tonal"
          >
            <VIcon
              size="20"
              :color="item.syllabus == true ?'success':'error'"
              class="rounded-0"
            >
              {{ item.syllabus == true ? 'tabler-file-check' : 'tabler-file-alert'}}
            </VIcon>
          </VAvatar>
        </template>
        <template #item.actions="{ item }">
          {{ecId}}
        </template>
      </VDataTable>
    </VCardText>
  </VCard>

  <!-- Edit Dialog -->
  <VDialog
    v-model="editDialog"
    max-width="600px"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">Modifier la mention {{ editedItem.nom_mention }}</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VTextField
                v-model="editedItem.nom_mention"
                label="Nom"
              />
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="error"
          variant="outlined"
          @click="close"
        >
          Annuler
        </VBtn>
        <VBtn
          color="warning"
          variant="elevated"
          @click="save"
        >
          Modifier
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

</template>
