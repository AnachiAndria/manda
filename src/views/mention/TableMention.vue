<script setup>
import { useFetch } from '@vueuse/core';
import { ref } from 'vue';

// Define headers and Mention data
const headers = ref([
  { title: 'Mention', key: 'nom_mention' },
  { title: 'Parcours', key: 'Parcours' },
  { title: 'Action', value: 'actions' },
])

const mention = ref([])
const isLoading = ref(true)
const errors = ref([])

// Fetch Mentions from the backend
const fetchmention = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/mention/mention', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      onResponseError({ response }) {
        errors.value = response._data.errors || ['Failed to fetch Mentions']
      },
    })

    if (res.data.value) {
      mention.value = JSON.parse(res.data.value) // Parse JSON data
    } else if (res.error.value) {
      errors.value.push('Error fetching data')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

fetchmention()

const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)
const deleteDialog = ref(false)
const addDialog = ref(false)

// Default item template
const defaultItem = ref({
  id: -1,
  nom_mention: '',
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

// Open edit dialog
const editItem = item => {
  editedIndex.value = mention.value.indexOf(item)
  editedItem.value = { ...item }
  editDialog.value = true
}

// Open delete dialog
const deleteItem = item => {
  editedIndex.value = mention.value.indexOf(item)
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

// Add Mention (communicating with backend)
const addMention = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/mention/mention', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedItem.value),
    })

    const data = await response.json()
    if (response.ok) {
      fetchmention()
      close() // Close dialog
    } else {
      errors.value.push(data.error || 'Failed to add Mention')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
}

// Save (edit Mention) - communicating with backend
const save = async () => {
  if (editedIndex.value > -1) {
    try {
      const response = await fetch(`http://localhost:3000/api/mention/mention/${editedItem.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedItem.value),
      })

      if (response.ok) {
        Object.assign(mention.value[editedIndex.value], editedItem.value)
        close() // Close dialog
      } else {
        const data = await response.json()

        errors.value.push(data.error || 'Failed to update Mention')
      }
    } catch (error) {
      errors.value.push('An unexpected error occurred: ' + error.message)
    }
  }
}

// Delete Mention (communicating with backend)
const deleteItemConfirm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/mention/mention/${editedItem.value.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      mention.value.splice(editedIndex.value, 1) // Remove from list
      closeDelete() // Close dialog
    } else {
      const data = await response.json()

      errors.value.push(data.error || 'Failed to delete Mention')
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
          <!-- Add Mention Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addDialog = true"
          >
            Nouvelle mention
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
        :items="mention"
        :search="searchQuery"
        :items-per-page="10"
        class="text-no-wrap"
        item-value="id"
      >
        <!-- Custom template for name -->
        <template #item.nom_mention="{ item }">
          {{ item.nom_mention }}
        </template>
        <template #item.Parcours="{ item }">
          {{ item.Parcours && item.Parcours.length > 0 ? item.Parcours.map(parcours => parcours.nom_parcours).join(', ') : '' }}
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

  <!-- Add Dialog -->
  <VDialog
    v-model="addDialog"
    max-width="600px"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">Ajouter un nouvelle mention</span>
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
          color="primary"
          variant="elevated"
          @click="addMention"
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
        Êtes-vous sûr de vouloir supprimer {{ editedItem.nom_mention }} ?
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
