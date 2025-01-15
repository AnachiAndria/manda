<script setup>
import { useFetch } from '@vueuse/core';
import { onMounted, ref, watchEffect } from 'vue';


//import Service
import CahierDeTexteService from "@/utils/services/CahierDeTexteService";
import ChapitreService from "@/utils/services/ChapitreService";
import ElementConstitutifService from "@/utils/services/ElementConstitutifService";
import MentionService from "@/utils/services/MentionService";
import ParcoursService from "@/utils/services/ParcoursService";
import SousChapitreService from "@/utils/services/SousChapitreService";
import UniteEnseignementService from '@/utils/services/UniteEnseignementService';
import { VCol } from 'vuetify/lib/components/index.mjs';

// Define headers and Cahier data id
const headers = ref([
  { title: 'EC', key: 'nomEC' },	
  { title: 'Date', key: 'dateCours' },
  { title: 'Debut', key: 'heureDebut' },
  { title: 'Fin', key: 'heureFin' },
  { title: 'description', key: 'descriptionCours' },
  { title: 'Enregistrement', key: 'createdAt' },
  { title: 'Action', value: 'actions' },
])

const Snackbar = ref(false)
const Cahier = ref([])
const isLoading = ref(true)
const isLoadingBtn = ref(false)
const btnEnregistr = ref(false)
const errors = ref([])
const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)
const deleteDialog = ref(false)
const addDialog = ref(false)


const ecDropDown = ref(null)

let itemMt, ecId
const sem = ['L1', 'L2', 'L3', 'M1', 'M2']
const parc = ref([])
/* 
VARIABLE MANDA
*/
const nomProfesseur = ref('')
const dateCours = ref('')
const heureDebut = ref('')
const heureFin = ref('')
const descriptionCours = ref('')
const elementConstitutifId = ref(null)
const chapitreId = ref(null)
const sousChapitreId = ref(null)
const cahiersDeTexte = ref([])
const sousChapitres = ref([])
const elementConstitutifs = ref([])
const chapitres = ref([])
const resultatRechercheEC = ref({})
const listeChapitreResultat = ref([])
const parsedResult = ref([])
 
/* 
VARIABLE MANDA
*/

// Fonction pour formater la date
function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

const getItemsM = async () => {//get ec
  try {
    const res = await useFetch('http://localhost:3000/api/ec/ec', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let data
    try {
      // Attempt to parse if the data is in JSON string format
      data = JSON.parse(res.data.value)
    } catch (e) {
      // If parsing fails, assume it's already an object
      data = res.data.value
    }
    
    if (Array.isArray(data)) {
      itemMt = data;
      // .map(EC => ({
      //   element_constitutif_id: EC.id,
      //   nomEC: EC.nomEC,
      // }))
    } else {
      console.error('Unexpected data structure:', data)
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error)
  }
}

const fetchCahier = async () => {// Fetch Cahiers from the backend
  try {
    const res = await useFetch('http://localhost:3000/api/cahier-de-texte/cahier-de-texte', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      onResponseError({ response }) {
        errors.value = response._data.errors || ['Failed to fetch Cahiers']
      },
    })

    if (res.data.value) {
      Cahier.value = JSON.parse(res.data.value) // Parse JSON data
    } else if (res.error.value) {
      errors.value.push('Error fetching data')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const getItemParc = async () => {//get Parcours
  try {
    const res = await useFetch('http://localhost:3000/api/parcours/parcours', {
      method:'GET',
      headers:{
        'content-type' : 'application/json',
      }
    })

    let data
    try {
      // Attempt to parse if the data is in JSON string format
      data = JSON.parse(res.data.value)
    } catch (e) {
      // If parsing fails, assume it's already an object
      data = res.data.value
    }
    
    parc.value = data

  }catch (err){
    console.error('error geting parcours: '+ err)
  }
}


//get EC with Classe,parcours 
const EcParc = async () => {
  // alert("editedItem.value.session "+editedItem.value.session)
  // alert("editedItem.value.parcours "+editedItem.value.parcours)
  try {
    // Vérifier que les deux champs sont bien sélectionnés
    if (!editedItem.value.session || !editedItem.value.parcours) {
      throw new Error("Veuillez sélectionner une session et un parcours.");
    }

    // Appeler l'API pour obtenir les unités d'enseignement filtrées
    const UEfiltre = await uniteEnseignementService.getFilteredUnitesEnseignement(
      editedItem.value.session,
      editedItem.value.parcours
    );
    
    if (!UEfiltre || UEfiltre.length === 0) {
      throw new Error("Aucune unité d'enseignement trouvée pour les critères sélectionnés.");
    }

    // Filtrer les éléments constitutifs (EC) correspondant à l'UE
    const filterEC = itemMt.filter(ec => UEfiltre.some(ue => ue.id === ec.unite_enseignement_id));

    // Mettre à jour le dropdown des EC
    ecDropDown.value = filterEC;
  } catch (err) {
    // Gestion des erreurs
    console.error("Erreur lors de la récupération des éléments constitutifs :", err.message);
  }
};


// Default item template
const defaultItem = ref({
  id: -1,
  session:null,
  parcours:null,
  nom_Cahiers:null,
  niveau:null,
  mention_id:null,
  ec:null,
  dateCours:null,
  heureDebut:null,
  heureFin:null,
  nom_Cahiers:null
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

const originalNomEC = ref(null)

// Open edit dialog
const editItem = item => {
  editedIndex.value = Cahier.value.indexOf(item)
  editedItem.value = { ...item }
  originalNomEC.value = item.nomEC;
  editDialog.value = true
}

// Open delete dialog
const deleteItem = item => {
  editedIndex.value = Cahier.value.indexOf(item)
  editedItem.value = { ...item }
  deleteDialog.value = true
}

// Close edit dialog
const close = () => {
  addDialog.value = false
  editDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
}

// Close delete dialog
const closeDelete = () => {
  deleteDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
}

/*
MANDA
 */

// Initialize services
const chapitreService = new ChapitreService()
const sousChapitreService = new SousChapitreService()
const elementConstitutifService = new ElementConstitutifService()
const mentionService = new MentionService()
const parcoursService = new ParcoursService()
const uniteEnseignementService = new UniteEnseignementService()
const cahierService = new CahierDeTexteService();

onMounted(async () => {
  await fetchSousChapitres()
  await fetchElementConstitutif()
  await fetchChapitre()
  await getItemsM()
  await fetchCahier()
  await getItemParc()
} 
)
function searchChapitre(ec) {
  // Récupérer les chapitres associés à l'EC sélectionné
  let elementConstitutifId 
  console.log(typeof(ec));
  
  if (typeof ec === 'object' || ec.id) {
     elementConstitutifId = ec.id
    //  console.log("aaaa "+elementConstitutifId);
  } else {
     elementConstitutifId = ec
    //  console.log("oooo "+elementConstitutifId);
  }
  
  console.log("idEC= "+elementConstitutifId);
  
  const chapitresAssocies = chapitres.value.filter(
    chapitre => chapitre.element_constitutif_id === elementConstitutifId,
  )
  console.log(chapitresAssocies);
  
  // Mettre en forme le résultat final avec l'enseignant, la matière et le niveau
  const elementConstitutif = elementConstitutifs.value.find(
    ec => ec.id === elementConstitutifId,
  )

  const chapitre_resultat = {
    enseignant: elementConstitutif.professeur_responsable,
    matiere: elementConstitutif.nomEC,
    chapitres: chapitresAssocies.map(chapitre => ({
      chapitre: chapitre.titre,
      chapitre_id: chapitre.id,
      sous_chapitres: sousChapitres.value
        .filter(sousChapitre => sousChapitre.chapitre_id === chapitre.id)
        .map(sousChapitre => ({
          sous_chapitre_id: sousChapitre.id,
          soustitre: sousChapitre.soustitre,
        })),
    })),
  } 
  resultatRechercheEC.value = chapitre_resultat
  
}

function jsonToText(data, elementConstitutifId) {
  // Étape 1 : Filtrer les objets avec element_constitutif_id = elementConstitutifId
  const filtres = cahiersDeTexte.value.filter(
    cahier => cahier.element_constitutif_id === elementConstitutifId,
  )

  // Étape 2 : Extraire et combiner tous les sous_chapitre_id à exclure
  const idsToExclude = filtres.flatMap(cahier =>
    cahier.sous_chapitre_id.split(","),
  )

  // console.log(idsToExclude)
  
  return `
  Enseignant : ${data.enseignant}
  Matière : ${data.matiere}
  Chapitre(s) :
  ${data.chapitres
    .map((chapitre, index) => {
      // Filtrer les sous-chapitres à exclure
      const sousChapitresFiltres = chapitre.sous_chapitres.filter(
        sousChapitre =>
          !idsToExclude.includes(String(sousChapitre.sous_chapitre_id).trim()),
      )

      // Retourner uniquement si le chapitre a encore des sous-chapitres après filtrage
      if (sousChapitresFiltres.length > 0) {
        return `
            ${index + 1}. ${chapitre.chapitre} (ID_chapitre: ${chapitre.chapitre_id})
            Sous-chapitres :
          ${sousChapitresFiltres
    .map(
      (sousChapitre, idx) =>
        `    ${idx + 1}. ${sousChapitre.soustitre} (ID_sousChapitre: ${
          sousChapitre.sous_chapitre_id
        })`,
    )
    .join("\n")}`
      } else {
        return "" // Retourne une chaîne vide pour les chapitres sans sous-chapitres visibles
      }
    })
    .filter(Boolean) // Supprime les chapitres vides
    .join("\n")}`
}

async function sendGPTRequest() {
  let descri = editedItem.value.nom_Cahiers

  isLoadingBtn.value = true
  if (resultatRechercheEC.value) {
    const prompt =
    "Voici le syllabus d'un matiere :" +
    jsonToText(resultatRechercheEC.value, elementConstitutifId.value) +
    "\n\n\nA quelle(s) sous-chapitre(s) correspond cette desciprion :" + descri +
    "\nLe resultat sera sous forme json avec cette structure { sousChapitre : ['ID_sousChapitre','ID_sousChapitre',...] }"

    console.log(prompt)
    
    try {
      const gtp = new Gpt(prompt)
      const gptResponse = await gtp.callGptApi()

      console.log("GPT Response:", gptResponse.result) //{"sousChapitre": ["3", "5"]}

      parsedResult.value = convertStringToJson(gptResponse.result)

      listeChapitreResultat.value = parsedResult.value.sousChapitre
      console.log(listeChapitreResultat.value);
      btnEnregistr.value = true
    } catch (error) {
      console.error("Error in GPT API call:", error)
    }finally{
      isLoadingBtn.value = false
      resultatRechercheEC.value = null
    }
  }
}

async function sendGPTRequestUpdate(update=false) {
  let descri = editedItem.value.descriptionCours
  
  isLoadingBtn.value = true
  if (resultatRechercheEC.value) {
    const prompt =
    "Voici le syllabus d'un matiere :" +
    jsonToText(resultatRechercheEC.value, elementConstitutifId.value) +
    "\n\n\nA quelle(s) sous-chapitre(s) correspond cette desciprion :" + descri +
    "\nLe resultat sera sous forme json avec cette structure { sousChapitre : ['ID_sousChapitre','ID_sousChapitre',...] }"

    console.log(prompt)
    
    try {
      const gtp = new Gpt(prompt)
      const gptResponse = await gtp.callGptApi()

      console.log("GPT Response:", gptResponse.result) //{"sousChapitre": ["3", "5"]}

      parsedResult.value = convertStringToJson(gptResponse.result)

      listeChapitreResultat.value = parsedResult.value.sousChapitre
      console.log(listeChapitreResultat.value);
      btnEnregistr.value = true
    } catch (error) {
      console.error("Error in GPT API call:", error)
    }finally{
      isLoadingBtn.value = false
      resultatRechercheEC.value = null
    }
  }
}

function convertStringToJson(text) {
  // Étape 1 : Extraire le JSON depuis la chaîne d'entrée avec une expression régulière
  const jsonMatch = text.match(/{[\s\S]*}/)

  if (jsonMatch) {
    try {
      const jsonText = jsonMatch[0].trim() // Récupérer la chaîne JSON
      const jsonObject = JSON.parse(jsonText) // Convertir en objet JavaScript

      // console.log(jsonObject) // Afficher l'objet JSON extrait
      
      return jsonObject
    } catch (error) {
      console.error("Erreur lors de l'analyse du JSON :", error)
    }
  } else {
    console.log("Aucun JSON trouvé dans le texte.")
  }
}

function enregistrerBase() {
  sousChapitreId.value = listeChapitreResultat.value.join(",")
  addCahierDeTexte()
  ecDropDown.value = null
  addDialog.value = false
  editedItem.value = { ...defaultItem.value }
  btnEnregistr.value = false
  Snackbar.value = true//envoyer notif
}
function modifierCahier() {
  sousChapitreId.value = listeChapitreResultat.value.join(",")
  editCahierDeTexte()
  editDialog.value = false
  editedItem.value = { ...defaultItem.value }
  btnEnregistr.value = false
  Snackbar.value = true//envoyer notif
  //, dashboard, 
}

async function fetchSousChapitres() {
  try {
    sousChapitres.value = await sousChapitreService.getAllSousChapitre()
    // console.log(sousChapitres.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des sous chapitres:", error)
  }
}

async function fetchElementConstitutif() {
  try {
    elementConstitutifs.value = await elementConstitutifService.getAllElementConstitutif()
    // console.log(elementConstitutifs.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des elements constitutifs:", error)
  }
}

async function fetchChapitre() {
  try {
    chapitres.value = await chapitreService.getAllChapitre()
    // console.log(chapitres.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des chapitres:", error)
  }
}

async function addCahierDeTexte() {
  try {
    await cahierService.createCahierDeTexte(
      editedItem.value.dateCours,
      editedItem.value.heureDebut,
      editedItem.value.heureFin,
      editedItem.value.nom_Cahiers,
      editedItem.value.ec.id,
      sousChapitreId.value
    )
    await fetchCahier()
  } catch (error) {
    console.error("Erreur lors de l'ajout du cahier de texte:", error)
  }
}

    const calculateEcId = () => {
      if (editedItem.value && editedItem.value.nomEC && typeof editedItem.value.nomEC === 'object' && editedItem.value.nomEC.id) {
        ecId = editedItem.value.nomEC.id;
      } else {
        ecId = editedItem.value?.element_constitutif_id;
      }
    };
    
async function editCahierDeTexte() {
  try {
    await cahierService.updateCahierDeTexte(
      editedItem.value.id,
      editedItem.value.dateCours,
      editedItem.value.heureDebut,
      editedItem.value.heureFin,
      editedItem.value.descriptionCours,
      ecId,
      sousChapitreId.value
    )
    await fetchCahier()

  } catch (error) {
    console.error("erreur lors de la modification du cahier de texte ", error);
    
  }
}
async function deleteCahierDeTexte(){
  try {
    await cahierService.deleteCahierDeTexte(editedItem.value.id)
    Cahier.value.splice(editedIndex.value, 1) // Remove from list
    closeDelete()
    fetchCahier()    
  } catch (err) {
    console.error("erreur lors de la Supression du cahier " + err);
    
  }
}

/*
MANDA
 */


watchEffect(() => {
  if (editedItem.value.session && editedItem.value.parcours) {
    EcParc()
  } else {
    ecDropDown.value = [] // Vider les options si les données ne sont pas disponibles
  }
})

watchEffect(()=>{
  if (editedItem.value.ec) {
    //call function recherche chap
    searchChapitre(editedItem.value.ec)
  } else {
    resultatRechercheEC.value = []
  }
})
const updateFin=ref(true)
// Watch pour détecter les changements
watch(
  () => editedItem.value.nomEC,
  (newValue, oldValue) => {
      if (newValue !== undefined) {
      //get ecId
      calculateEcId()
      searchChapitre(ecId)
    }
  }
);

watch(Snackbar, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      Snackbar.value = false;
    }, 3000); // Délai de 3 secondes (ajustable)
  }
})

</script>

<template>
  <VCol>
    <h3 class="text-h3 font-weight-medium mb-5">
      Liste Cahiers de texte 
        </h3>
  </VCol>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between flex-wrap gap-4">
        <div class="d-flex gap-4 align-center">
          <!-- Add Cahier Button -->
          <!-- <VBtn
            prepend-icon="tabler-plus"
            @click="addDialog = true"
          >
            Ajouter Cahier de texte
          </VBtn> -->
        </div>
        <div
          class="d-flex align-center flex-wrap gap-4"
          style="flex-grow: 0.30;"
        >
          <!-- Search Bar -->
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
      <!-- Data Table with Search -->
      <VDataTable
        :headers="headers"
        :items="Cahier"
        :search="searchQuery"
        :items-per-page="10"
        class="text-no-wrap"
        item-value="id"
      >

        <template #item.nomEC="{ item }">
          {{ item.nomEC }}
        </template> 

        <template #item.dateCours	="{ item }">
          {{ formatDate(item.dateCours) }}
        </template> 

        <template #item.heureDebut="{ item }">
          {{ item.heureDebut }}
        </template>
        
        <template #item.heureFin="{ item }">
          {{ item.heureFin }}
        </template>
        
        <template #item.descriptionCours="{ item }">
          {{ item.descriptionCours }}
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
       
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn @click="editItem(item)">
              <VIcon icon="tabler-edit" />
            </IconBtn>
            <IconBtn @click="deleteItem(item)">
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
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
        <span class="headline">Modifier Cahier de Texte  {{ editedItem.id }}</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow class="match-height">
            <VCol
              cols="12"
              sm="6"
              md="6"
            >
              <VSelect
                v-model="editedItem.session"
                :items="sem"
                variant="outlined"
                label="Niveau"
                chips
                closable-chips
              />
            </VCol>

            <VCol
              cols="12"
              sm="6"
              md="6"
            >
              <VSelect
                v-model="editedItem.parcours"
                :items="parc"
                item-title="nom_parcours"
                item-value="nom_parcours"
                variant="outlined"
                label="Parcours"
                chips
                closable-chips
              />
            </VCol>
            
          </VRow>
          <VRow  class="match-height">
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VCombobox
                v-model="editedItem.nomEC"
                :items="ecDropDown"
                item-title="nomEC" 
                item-value="element_constitutif_id"
                variant="outlined"
                label="EC"
              />
            </VCol>
          </VRow>

          <VRow class="match-height">
            <VCol>
              <VAlert 
                variant="tonal" 
                color="info"
                class="mb-4"
              >
                <small>
                  <strong>Nb : </strong> AM = Matin, PM = Soir
                </small>
              </VAlert>
            </VCol>
            
          </VRow>
          <VRow class="match-height">
            <VCol
              cols="12"
              sm="4"
              md="4"
            >
              <label for="date-input">Date</label>
              <input
                id="date-input"
                v-model="editedItem.dateCours"
                type="date"
                style="inline-size: 140px;"
              >
            </VCol>
            <VCol
              cols="12"
              sm="4"
              md="4"
            >
              <label for="time1-input">Heure de début</label>
              <input
                id="time1-input"
                v-model="editedItem.heureDebut"
                type="time"
                style="inline-size: 140px;"
              >
            </VCol>
            <VCol
              cols="12"
              sm="4"
              md="4"
            >
              <label for="time2-input">Heure de fin</label>
              <input
                id="time2-input"
                v-model="editedItem.heureFin"
                type="time"
                style="inline-size: 140px;"
              >
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VTextField
                v-model="editedItem.descriptionCours"
                label="Description du cours"
              />
            </VCol>
          </VRow>
        </VContainer>
        <VContainer>
          <VRow>
            <VCol v-if="!btnEnregistr">
              <VBtn block
                color="primary"
                variant="elevated"
                :loading="isLoading" :disabled="isLoading"
                @click="sendGPTRequestUpdate()"
              >
                  Confirmer
              </VBtn>
              <VProgressLinear
                v-if="isLoadingBtn"
                indeterminate
                color="primary"
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
          @click="modifierCahier()"
          :disabled="!btnEnregistr"
        >
          Modifier
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Add Dialog -->
  <VDialog
    v-model="addDialog"
    max-width="600px"
    persistent
  >
    <VCard>
      <VCardTitle>
        <span class="headline">Ajouter Cahier de Texte</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow class="match-height">
            <VCol
              cols="12"
              sm="6"
              md="6"
            >
              <VSelect
                v-model="editedItem.session"
                :items="sem"
                variant="outlined"
                label="Niveau"
                chips
                closable-chips
              />
            </VCol>

            <VCol
              cols="12"
              sm="6"
              md="6"
            >
              <VSelect
                v-model="editedItem.parcours"
                :items="parc"
                item-title="nom_parcours"
                item-value="nom_parcours"
                variant="outlined"
                label="Parcours"
                chips
                closable-chips
              />
            </VCol>
            
          </VRow>

          <VRow  class="match-height">
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VCombobox
                v-model="editedItem.ec"
                :items="ecDropDown"
                item-title="nomEC"
                item-value="element_constitutif_id"
                variant="outlined"
                label="EC"
                chips
                closable-chips
              />
            </VCol>
          </VRow>

          <VRow class="match-height">
            <VCol>
              <VAlert 
                variant="tonal" 
                color="info"
                class="mb-4"
              >
                <small>
                  <strong>Nb : </strong> AM = Matin, PM = Soir
                </small>
              </VAlert>
            </VCol>
            
          </VRow>
          <VRow class="match-height">
            <VCol
              cols="12"
              sm="4"
              md="4"
            >
              <label for="date-input">Date</label>
              <input
                id="date-input"
                v-model="editedItem.dateCours"
                type="date"
                style="inline-size: 140px;"
              >
            </VCol>
            <VCol
              cols="12"
              sm="4"
              md="4"
            >
              <label for="time1-input">Heure de début</label>
              <input
                id="time1-input"
                v-model="editedItem.heureDebut"
                type="time"
                style="inline-size: 140px;"
              >
            </VCol>
            <VCol
              cols="12"
              sm="4"
              md="4"
            >
              <label for="time2-input">Heure de fin</label>
              <input
                id="time2-input"
                v-model="editedItem.heureFin"
                type="time"
                style="inline-size: 140px;"
              >
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VTextField
                v-model="editedItem.nom_Cahiers"
                label="Description du cours"
              />
            </VCol>
          </VRow>
        </VContainer>
        <VContainer>
          <VRow>
            <VCol v-if="!btnEnregistr">
              <VBtn block
                color="primary"
                variant="elevated"
                :loading="isLoading" :disabled="isLoading"
                @click="sendGPTRequest()"
              >
                  Confirmer
              </VBtn>
              <VProgressLinear
                v-if="isLoadingBtn"
                indeterminate
                color="primary"
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
          color="primary"
          variant="elevated"
          :disabled="!btnEnregistr"
          @click="enregistrerBase()"
        >
          Enregistrer
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Delete Dialog -->
  <VDialog
    v-model="deleteDialog"
    max-width="600px"
  >
    <VCard>
      <VCardTitle class="headline">
        Confirmer Suppression
      </VCardTitle>
      <VCardText>
        Êtes-vous sûr de vouloir supprimer le cahier de texte pour la matière {{ editedItem.nomEC }} ?
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="error"
          variant="outlined"
          @click="closeDelete"
        >
          Annuler
        </VBtn>
        <VBtn
          color="warning"
          variant="elevated"
          @click="deleteCahierDeTexte()"
        >
          Supprimer
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar
    v-model="Snackbar"
    transition="scroll-y-reverse-transition"
    location="top end"
    color="success"
  >
    Enregistrement terminer
  </VSnackbar>
</template>
