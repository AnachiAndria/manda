<script setup>
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'

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

//get CHapitre 
/*
chapitre: chapitre.titre,
chapitre_id: chapitre.id,
sous_chapitres:{
  sous_chapitre_id: sousChapitre.id,
  soustitre: sousChapitre.soustitre,
}
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
