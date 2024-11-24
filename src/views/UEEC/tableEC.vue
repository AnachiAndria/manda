<script setup>
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'

// Define headers and EC data
const headers = ref([
  { title: 'EC', key: 'nomEC' },
  { title: 'professeur', key: 'professeur_responsable' },
  { title: 'semestre', key: 'session' },
  { title: 'UE', key: 'nomUE' },
  { title: 'Action', value: 'actions' },
])

const EC = ref([])
const isLoading = ref(true)
const errors = ref([])
const sem = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']


let itemMt

const getItemsM = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/UE/UE', {
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
      itemMt = data.map(UE => ({
        unite_enseignement_id: UE.id,
        nomUE: UE.nomUE,
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

// Fetch ECs from the backend
const fetchEC = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/EC/EC', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      onResponseError({ response }) {
        errors.value = response._data.errors || ['Failed to fetch ECs']
      },
    })

    if (res.data.value) {
      EC.value = JSON.parse(res.data.value) // Parse JSON data
    } else if (res.error.value) {
      errors.value.push('Error fetching data')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

fetchEC()

const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)
const deleteDialog = ref(false)
const addDialog = ref(false)

// Default item template
const defaultItem = ref({
  id: -1,
  nom_EC: '',
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

// Open edit dialog
const editItem = item => {
  editedIndex.value = EC.value.indexOf(item)
  editedItem.value = { ...item }
  editDialog.value = true
}

// Open delete dialog
const deleteItem = item => {
  editedIndex.value = EC.value.indexOf(item)
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

// Add EC (communicating with backend)
const addEC = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/EC/EC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedItem.value),
    })

    const data = await response.json()
    if (response.ok) {
      fetchEC()
      close() // Close dialog
    } else {
      errors.value.push(data.error || 'Failed to add EC')
    }

    // console.log(JSON.stringify(editedItem.value))
  
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
}

// Save (edit EC) - communicating with backend
const save = async () => {
  if (editedIndex.value > -1) {
    try {
      const response = await fetch(`http://localhost:3000/api/EC/EC/${editedItem.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedItem.value),
      })

      if (response.ok) {
        Object.assign(EC.value[editedIndex.value], editedItem.value)
        close() // Close dialog
      } else {
        const data = await response.json()

        errors.value.push(data.error || 'Failed to update EC')
      }
    } catch (error) {
      errors.value.push('An unexpected error occurred: ' + error.message)
    }
  }
}

// Delete EC (communicating with backend)
const deleteItemConfirm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/EC/EC/${editedItem.value.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      EC.value.splice(editedIndex.value, 1) // Remove from list
      closeDelete() // Close dialog
    } else {
      const data = await response.json()

      errors.value.push(data.error || 'Failed to delete EC')
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
          <!-- Add EC Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addDialog = true"
          >
            Nouvelle EC
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
        :items="EC"
        :search="searchQuery"
        :items-per-page="10"
        class="text-no-wrap"
        item-value="id"
      >
        <!-- Custom template for name -->
        <template #item.nomEC="{ item }">
          {{ item.nomEC }}
        </template>
        <template #item.professeur_responsable="{ item }">
          {{ item.professeur_responsable }}
        </template>
        <template #item.session="{ item }">
          {{ item.session }}
        </template>
        <template #item.nomUE="{ item }">
          {{ item.nomUE }}
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
        <span class="headline">Modifier la EC {{ editedItem.nom_EC }}</span>
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
                v-model="editedItem.nomEC"
                label="EC"
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
                v-model="editedItem.professeur_responsable"
                label="Professeur"
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
                v-model="editedItem.session"
                :items="sem"
                variant="outlined"
                label="semestre"
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
              <VCombobox
                v-model="editedItem.unite_enseignement_id"
                :items="itemMt"
                item-title="nomUE"
                item-value="unite_enseignement_id"
                variant="outlined"
                label="UE"
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
        <span class="headline">Ajouter un nouvelle EC</span>
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
                v-model="editedItem.nomEC"
                label="EC"
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
                v-model="editedItem.professeur_responsable"
                label="Professeur"
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
                v-model="editedItem.unite_enseignement_id"
                :items="itemMt"
                item-title="nomUE"
                item-value="unite_enseignement_id"
                variant="outlined"
                label="UE"
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
                v-model="editedItem.session"
                :items="sem"
                variant="outlined"
                label="semestre"
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
          @click="addEC"
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
        Êtes-vous sûr de vouloir supprimer {{ editedItem.nom_EC }} ?
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
          color="error"
          variant="elevated"
          @click="deleteItemConfirm"
        >
          Supprimer
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
