<script setup>
import { useFetch } from '@vueuse/core'
import { onMounted, ref } from 'vue'

import { Gpt } from "@/utils/apiGpt"
import CahierDeTexteService from "@/utils/services/CahierDeTexteService"
import ChapitreService from "@/utils/services/ChapitreService"
import ElementConstitutifService from "@/utils/services/ElementConstitutifService"
import SousChapitreService from "@/utils/services/SousChapitreService"

// Define headers and Cahier data id
const headers = ref([
  // { title: 'id', key: 'id' },
  { title: 'EC', key: 'nomEC' },
  { title: 'Debut', key: 'heureDebut' },
  { title: 'Fin', key: 'heureFin' },
  { title: 'description', key: 'descriptionCours' },
  { title: 'Action', value: 'actions' },
])


const Cahier = ref([])
const isLoading = ref(true)
const errors = ref([])
const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)
const deleteDialog = ref(false)
const addDialog = ref(false)

let itemMt

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

/* 
VARIABLE MANDA
*/

//get ec {}
const getItemsM = async () => {
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
      itemMt = data.map(EC => ({
        element_constitutif_id: EC.id,
        nomEC: EC.nomEC,
      }))
    } else {
      console.error('Unexpected data structure:', data)
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error)
  }
}

await getItemsM()

// Fetch Cahiers from the backend
const fetchCahier = async () => {  
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

fetchCahier()

// Default item template
const defaultItem = ref({
  id: -1,
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

// Open edit dialog
const editItem = item => {
  editedIndex.value = Cahier.value.indexOf(item)
  editedItem.value = { ...item }
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

// Add Cahier (communicating with backend)
const addCahier = async () => {
  try {
    // const response = await fetch('http://localhost:3000/api/Cahiers/Cahiers', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(editedItem.value),
    // })

    // const data = await response.json()
    // if (response.ok) {
    //   fetchCahier()
    //   close() // Close dialog
    // } else {
    //   errors.value.push(data.error || 'Failed to add Cahier')
    // }

    console.log(JSON.stringify(editedItem.value))
    
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
}

// Save (edit Cahier) - communicating with backend
const save = async () => {
  if (editedIndex.value > -1) {
    try {
      const response = await fetch(`http://localhost:3000/api/Cahiers/Cahiers/${editedItem.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedItem.value),
      })

      if (response.ok) {
        Object.assign(Cahier.value[editedIndex.value], editedItem.value)
        close() // Close dialog
      } else {
        const data = await response.json()

        errors.value.push(data.error || 'Failed to update Cahier')
      }
    } catch (error) {
      errors.value.push('An unexpected error occurred: ' + error.message)
    }
  }
}

// Delete Cahier (communicating with backend)
const deleteItemConfirm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/Cahiers/Cahiers/${editedItem.value.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      Cahier.value.splice(editedIndex.value, 1) // Remove from list
      closeDelete() // Close dialog
    } else {
      const data = await response.json()

      errors.value.push(data.error || 'Failed to delete Cahier')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
}

/*
MANDA
 */

// Services initialization
const cahierService = new CahierDeTexteService()
const sousChapitreService = new SousChapitreService()
const elementConstitutifService = new ElementConstitutifService()
const chapitreService = new ChapitreService()

onMounted(async () => {
  await fetchCahiersDeTexte()
  await fetchSousChapitres()
  await fetchElementConstitutif()
  await fetchChapitre()
})

function searchChapitre(elementConstitutifId) {
  // Récupérer les chapitres associés à l'EC sélectionné
  const chapitresAssocies = chapitres.value.filter(
    chapitre => chapitre.element_constitutif_id === elementConstitutifId,
  )

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

  console.log(chapitre_resultat)
  resultatRechercheEC.value = chapitre_resultat
  console.log(jsonToText(chapitre_resultat, elementConstitutifId))
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

  console.log(idsToExclude)
  
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
  const prompt =
    "Voici le syllabus d'un matiere :" +
    jsonToText(resultatRechercheEC.value, elementConstitutifId.value) +
    "\nA quelle(s) sous-chapitre(s) correspond cette desciprion :" +
    descriptionCours.value +
    "\nLe resultat sera sous forme json avec cette structure { sousChapitre : ['ID_sousChapitre','ID_sousChapitre',...] }"

  console.log(prompt)
  
  try {
    const gtp = new Gpt(prompt)
    const gptResponse = await gtp.callGptApi()

    console.log("GPT Response:", gptResponse.result)

    const parsedResult = convertStringToJson(gptResponse.result)

    listeChapitreResultat.value = parsedResult.sousChapitre
  } catch (error) {
    console.error("Error in GPT API call:", error)
  }
}

function convertStringToJson(text) {
  // Étape 1 : Extraire le JSON depuis la chaîne d'entrée avec une expression régulière
  const jsonMatch = text.match(/{[\s\S]*}/)

  if (jsonMatch) {
    try {
      const jsonText = jsonMatch[0].trim() // Récupérer la chaîne JSON
      const jsonObject = JSON.parse(jsonText) // Convertir en objet JavaScript

      console.log(jsonObject) // Afficher l'objet JSON extrait
      
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
}

async function fetchSousChapitres() {
  try {
    sousChapitres.value = await sousChapitreService.getAllSousChapitre()
    console.log(sousChapitres.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des sous chapitres:", error)
  }
}

async function fetchElementConstitutif() {
  try {
    elementConstitutifs.value = await elementConstitutifService.getAllElementConstitutif()
    console.log(elementConstitutifs.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des elements constitutifs:", error)
  }
}

async function fetchChapitre() {
  try {
    chapitres.value = await chapitreService.getAllChapitre()
    console.log(chapitres.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des chapitres:", error)
  }
}

async function fetchCahiersDeTexte() {
  try {
    cahiersDeTexte.value = await cahierService.getAllCahierDeTexte()
    console.log(cahiersDeTexte.value)
  } catch (error) {
    console.error("Erreur lors de la récupération des cahiers de texte:", error)
  }
}

async function addCahierDeTexte() {
  try {
    await cahierService.createCahierDeTexte(
      dateCours.value,
      heureDebut.value,
      heureFin.value,
      descriptionCours.value,
      elementConstitutifId.value,
      sousChapitreId.value,
    )
    await fetchCahiersDeTexte()
  } catch (error) {
    console.error("Erreur lors de l'ajout du cahier de texte:", error)
  }
}

/*
MANDA
 */
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between flex-wrap gap-4">
        <div class="d-flex gap-4 align-center">
          <!-- Add Cahier Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addDialog = true"
          >
            Ajouter Cahier de texte
          </VBtn>
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
        <!-- Custom template for name -->
        <template #item.element_constitutif_id="{ item }">
          {{ item.nomEC }}
        </template>
        <!-- Custom template for description -->
        <template #item.heureDebut="{ item }">
          {{ item.heureDebut }}
        </template>
        
        <template #item.heureFin="{ item }">
          {{ item.heureFin }}
        </template>
        
        <template #item.descriptionCours="{ item }">
          {{ item.descriptionCours }}
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
        <span class="headline">Modifier </span>
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
                v-model="editedItem.nom_Cahiers"
                label="Cahier"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VTextField
                v-model="editedItem.niveau"
                label="Niveau"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VCombobox
                v-model="editedItem.mention_id"
                :items="itemMt"
                item-title="nom_mention"
                item-value="mention_id"
                variant="outlined"
                label="Mention"
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

  <!-- Add Dialog -->
  <VDialog
    v-model="addDialog"
    max-width="600px"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">Ajouter Cahier de Texte</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <VCombobox
                v-model="editedItem.ec"
                :items="itemMt"
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
              <small>
                <strong>Note :</strong> AM = Matin, PM = Soir
              </small>
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
          @click="addCahier"
        >
          Ajouter
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
        Êtes-vous sûr de vouloir supprimer {{ editedItem.nom_Cahiers }} ?
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
          @click="deleteItemConfirm"
        >
          Supprimer
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
