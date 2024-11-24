<script setup>
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'

// Define headers and Parcour data id
const headers = ref([
  // { title: 'id', key: 'id' },
  { title: 'Parcours', key: 'nom_parcours' },
  { title: 'Niveau', key: 'niveau' },
  { title: 'Mention', key: 'nom_mention' },
  { title: 'Action', value: 'actions' },
])

const itemsL = ['L1', 'L2', 'L3', 'M1', 'M2']

const Parcour = ref([])
const isLoading = ref(true)
const errors = ref([])


let itemMt

const getItemsM = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/mention/mention', {
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
      itemMt = data.map(mention => ({
        mention_id: mention.id,
        nom_mention: mention.nom_mention,
      }))
    } else {
      console.error('Unexpected data structure:', data)
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error)
  }
}

// Call getItemsM when needed
await getItemsM()

// Fetch Parcours from the backend
const fetchParcour = async () => {  
  try {
    const res = await useFetch('http://localhost:3000/api/parcours/parcours', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      onResponseError({ response }) {
        errors.value = response._data.errors || ['Failed to fetch Parcours']
      },
    })

    if (res.data.value) {
      Parcour.value = JSON.parse(res.data.value) // Parse JSON data
    } else if (res.error.value) {
      errors.value.push('Error fetching data')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

fetchParcour()

const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)
const deleteDialog = ref(false)
const addDialog = ref(false)

// Default item template
const defaultItem = ref({
  id: -1,
  nom_parcours: '',
  nom_mention: '',
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

// Open edit dialog
const editItem = item => {
  editedIndex.value = Parcour.value.indexOf(item)
  editedItem.value = { ...item }
  editDialog.value = true
}

// Open delete dialog
const deleteItem = item => {
  editedIndex.value = Parcour.value.indexOf(item)
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

// Add Parcour (communicating with backend)
const addParcour = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/parcours/parcours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedItem.value),
    })

    const data = await response.json()
    if (response.ok) {
      // Parcour.value.push({
      //   ...editedItem.value,
      //   id: data.insertedId,
      //   Mention: { nom_mention: editedItem.value.mention_id.nom_mention },
      // })
      fetchParcour()
      close() // Close dialog
    } else {
      errors.value.push(data.error || 'Failed to add Parcour')
    }

    // console.log(JSON.stringify(editedItem.value))
    
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
}

// Save (edit Parcour) - communicating with backend
const save = async () => {
  if (editedIndex.value > -1) {
    try {
      const response = await fetch(`http://localhost:3000/api/parcours/parcours/${editedItem.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedItem.value),
      })

      if (response.ok) {
        Object.assign(Parcour.value[editedIndex.value], editedItem.value)
        close() // Close dialog
      } else {
        const data = await response.json()

        errors.value.push(data.error || 'Failed to update Parcour')
      }
    } catch (error) {
      errors.value.push('An unexpected error occurred: ' + error.message)
    }
  }
}

// Delete Parcour (communicating with backend)
const deleteItemConfirm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/parcours/parcours/${editedItem.value.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      Parcour.value.splice(editedIndex.value, 1) // Remove from list
      closeDelete() // Close dialog
    } else {
      const data = await response.json()

      errors.value.push(data.error || 'Failed to delete Parcour')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
}
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between flex-wrap gap-4">
        <div class="d-flex gap-4 align-center">
          <!-- Add Parcour Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addDialog = true"
          >
            Ajouter Parcour
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
        :items="Parcour"
        :search="searchQuery"
        :items-per-page="10"
        class="text-no-wrap"
        item-value="id"
      >
        <!-- Custom template for name -->
        <template #item.nom_parcours="{ item }">
          {{ item.nom_parcours }}
        </template>
        <!-- Custom template for description -->
        <template #item.niveau="{ item }">
          {{ item.niveau }}
        </template>
        
        <template #item.nom_mention="{ item }">
          {{ item.Mention.nom_mention }}
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
                v-model="editedItem.nom_parcours"
                label="Parcour"
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
        <span class="headline">Ajouter Parcour</span>
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
                v-model="editedItem.nom_parcours"
                label="Parcour"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <AppSelect
                v-model="editedItem.niveau"
                multiple
                :items="itemsL"
                variant="outlined"
                label="Niveau"
                chips
                closable-chips
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="12"
              md="12"
            >
              <AppSelect
                v-model="editedItem.mention_id"
                :items="itemMt"
                item-title="nom_mention"
                item-value="mention_id"
                variant="outlined"
                label="Mention"
                chips
                closable-chips
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
          @click="addParcour"
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
        Êtes-vous sûr de vouloir supprimer {{ editedItem.nom_parcours }} ?
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
