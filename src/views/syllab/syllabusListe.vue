
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

const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)

// Default item template
const defaultItem = ref({
  id: -1,
  nomEC: '',
  objectif: '',
  horaire: '',
  chapitres: [], // Store chapters and sub-chapters
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

// Fetch ECs from the backend
const fetchEC = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/syllabus/EC', {
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

const syllabus = ref(null)

const getSyllabus = async item => {
  try {
    const res = await useFetch(`http://localhost:3000/api/syllabus/syllabus/${item.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.data.value) {
      syllabus.value = JSON.parse(res.data.value)
    } else {
      errors.value.push('Failed to fetch syllabus data.')
    }
  } catch (error) {
    console.error('Error fetching syllabus:', error)
    errors.value.push('An unexpected error occurred.')
  }
}

// Open edit dialog
const voir = item => {
  editedIndex.value = EC.value.indexOf(item)
  editedItem.value = { ...item }

  getSyllabus(item)

  editDialog.value = true
}
</script>

<template>
  <VCard class="mb-6">
    <VCardText>
      <h2>Liste Syllabus</h2>
      <VRow>
        <VCardText>
          <div class="d-flex justify-space-between flex-wrap gap-4">
            <div class="d-flex gap-4 align-center" />
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
            :items-per-page="5"
            height="305"
            fixed-header
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
                <VBtn
                  color="primary"
                  @click="voir(item)"
                >
                  <VIcon icon="tabler-eye" />
                </VBtn>
              </div>
            </template>
          </VDataTable>
        </VCardText>
        <!--
          <VCol
          cols="12"
          md="6"
          lg="6"
          >
          paonnn
          </VCol>
          </VRow> 
        -->
      </vrow>
    </VCardText>
  </VCard>

  <VDialog
    v-model="editDialog"
    persistent
    scrollable
    max-width="80%"
    height="80%"
    content-class="scrollable-dialog"
  >
    <!-- Dialog close btn X -->
    <DialogCloseBtn @click="editDialog = false" />

    <!-- Dialog Content -->
    <VCard>
      <VCardText>
        <div class="d-flex justify-space-between flex-wrap gap-4">
          <div class="d-flex gap-4 align-center">
            <VCardTitle>{{ editedItem.nomEC }}</VCardTitle>
          </div>
          <div class="d-flex  flex-wrap gap-4">
            <VCardTitle>UE: {{ editedItem.nomUE }}</VCardTitle>
          </div>
        </div>
      </VCardText>
      <VDivider />
      
      <VCardText style="block-size: 80%;">
        <VCardText>
          <VChip
            color="success"
            variant="outlined"
          >
            Objectif
          </VChip>
          {{ editedItem.objectif }}
        </VCardText>

        <VCardText>
          <VChip
            color="secondary"
            variant="outlined"
          >
            Volume horaire
          </VChip>
          {{ editedItem.horaire }}
        </VCardText>

        <!-- Chapters and Sub-Chapters -->
        <VList
          v-if="syllabus?.Chapitres"
          density="comfortable"
        >
          <VListGroup
            v-for="(chapitre, index) in syllabus.Chapitres"
            :key="`chapitre-${chapitre.id}`"
            :value="false"
            prepend-icon="tabler-book-2"
            :title="`Chapitre ${index + 1}: ${chapitre.titre}`"
          >
            <template #activator="{ props }">
              <VListItem
                v-bind="props"
                :title="`Chapitre ${index + 1}: ${chapitre.titre}`"
              />
            </template>
            <VListItem
              v-for="sousChapitre in chapitre.SousChapitres"
              :key="sousChapitre.id"
              prepend-icon="tabler-book"
              :title="sousChapitre.soustitre"
            />
          </VListGroup>
        </VList>
        <div v-else>
          Aucune chapitre disponible
        </div>
      </VCardText>

      <VDivider />
      <VCardText class="d-flex justify-space-between flex-wrap gap-4">
        <div class="d-flex gap-4 align-center">
          <VCardTitle>Par: {{ editedItem.professeur_responsable }}</VCardTitle>
        </div>
        <div class="d-flex  flex-wrap gap-4">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="editDialog = false"
          >
            Fermer
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.scrollable-dialog{
  overflow: visible !important;
}

.error-messages {
  color: red;
}
</style>
