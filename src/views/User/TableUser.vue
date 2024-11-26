<script setup>
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'

// Define headers and user data
const headers = ref([
  { title: 'Nom', key: 'nom' },
  { title: 'Prénoms', key: 'prenom' },
  { title: 'Email', key: 'email' },
  { title: 'Mot de Passe', value: 'mdp' },
  { title: 'Action', value: 'actions' },
])

const user = ref([])
const isLoading = ref(true)
const errors = ref([])
const userData = useCookie('userData')

// Fetch user from the backend
const fetchUser = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/user/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      onResponseError({ response }) {
        errors.value = response._data.errors || ['Failed to fetch user']
      },
    })

    if (res.data.value) {
      user.value = JSON.parse(res.data.value) // Parse JSON data
      console.log(user.value)
    } else if (res.error.value) {
      errors.value.push('Error fetching data')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

fetchUser()

const searchQuery = ref('')

// Dialog states
const editDialog = ref(false)
const deleteDialog = ref(false)
const addDialog = ref(false)

// Default item template
const defaultItem = ref({
  IdUser: -1,
  nom: '',
  prenom: '',
  mail: '',
  mdp: '',
})

const editedItem = ref({ ...defaultItem.value })
const editedIndex = ref(-1)

// Open edit dialog
const editItem = item => {
  editedIndex.value = user.value.indexOf(item)
  editedItem.value = { ...item }
  editedItem.value.mail = item.email
  editDialog.value = true
}

// Open delete dialog
const deleteItem = item => {
  editedIndex.value = user.value.indexOf(item)
  editedItem.value = { ...item }
  deleteDialog.value = true
}

// Close edit dialog
const close = () => {
  editDialog.value = false
  addDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
  fetchUser()
}

// Close delete dialog
const closeDelete = () => {
  deleteDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
  fetchUser()
}

// Add user (communicating with backend)
const adduser = async () => {
  try {
    console.log(editedItem.value)

    const response = await fetch('http://localhost:3000/api/user/user/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedItem.value),
    })

    const data = await response.json()
    if (response.ok) {
      user.value.push({ ...editedItem.value, IdUser: data.insertedId })
      close() // Close dialog
    } else {
      errors.value.push(data.error || 'Failed to add user')
    }
  } catch (error) {
    errors.value.push('An unexpected error occurred: ' + error.message)
  }
  addDialog.value = false
}

// Save (edit user) - communicating with backend
const save = async () => {
  if (editedIndex.value > -1) {close
    try {
      const response = await fetch(`http://localhost:3000/api/user/user/update/${editedItem.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedItem.value),
      })

      if (response.ok) {
        Object.assign(user.value[editedIndex.value], editedItem.value)
        close() // Close dialog
      } else {
        const data = await response.json()

        errors.value.push(data.error || 'Failed to update user')
      }
    } catch (error) {
      errors.value.push('An unexpected error occurred: ' + error.message)
    }
  }
  editDialog.value = false
}

// Delete user (communicating with backend)
const deleteItemConfirm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/user/user/delete/${editedItem.value.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      user.value.splice(editedIndex.value, 1) // Remove from list
      closeDelete() // Close dialog
    } else {
      const data = await response.json()

      errors.value.push(data.error || 'Failed to delete user')
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
          <!-- Add user Button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="addDialog = true"
          >
            Ajouter utilisateur
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
        :items="user"
        :search="searchQuery"
        :items-per-page="10"
        class="text-no-wrap"
        item-value="id"
      >
        <!-- Custom template for each row -->
        <template #item="{ item }">
          <!-- Vérifie si l'email de l'item est différent de celui dans le cookie, et cache sinon -->
          <tr v-if="item.email !== userData.email">
            <td>{{ item.nom }}</td>
            <td>{{ item.prenom }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.mdp }}</td>
            <td>
              <div class="d-flex gap-1">
                <IconBtn @click="editItem(item)">
                  <VIcon icon="tabler-edit" />
                </IconBtn>
                <IconBtn @click="deleteItem(item)">
                  <VIcon icon="tabler-trash" />
                </IconBtn>
              </div>
            </td>
          </tr>
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
                v-model="editedItem.nom"
                label="Nom"
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
                v-model="editedItem.prenom"
                label="Prénoms"
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
                v-model="editedItem.mail"
                label="Email"
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
                v-model="editedItem.mdp"
                label="Mot de Passe"
              />
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
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
        <span class="headline">Ajouter user</span>
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
                v-model="editedItem.nom"
                label="Nom"
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
                v-model="editedItem.prenom"
                label="Prénoms"
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
                v-model="editedItem.mail"
                label="Email"
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
                v-model="editedItem.mdp"
                label="Mot de Passe"
              />
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
          variant="outlined"
          @click="close"
        >
          Annuler
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          @click="adduser"
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
        Êtes-vous sûr de vouloir supprimer {{ editedItem.nom }} ?
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
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
