<script setup>
import { ref } from 'vue'

const refForm = ref()
const newMdp = ref('')
const confirmMdp = ref('')
const currentMdp = ref('')

// Access the user data from the cookie
const userCookie = useCookie('userData')
const userData = ref(userCookie.value)  // Make it a ref for reactivity

const nom = ref(userData.value.nom)
const prenom = ref(userData.value.prenom)
const email = ref(userData.value.email)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const ConfirmDialog = ref(false) // Used for the modification confirmation dialog

// Function to reset form fields to their initial state
function Annuler() {
  ConfirmDialog.value = false
  newMdp.value = ''
  confirmMdp.value = ''
  nom.value = userData.value.nom
  prenom.value = userData.value.prenom
  email.value = userData.value.email
}

// Function to open confirmation dialog if the form is valid
async function openConfirmDialog() {
  const isValid = await refForm.value.validate()
  if (
    isValid &&
    (newMdp.value != '' ||
    confirmMdp.value != '' ||
    nom.value != userData.value.nom ||
    prenom.value != userData.value.prenom ||
    email.value != userData.value.email)
  ) {
    ConfirmDialog.value = true
  }
}

// Function to handle the actual modification after password verification
async function modifyUser() {
  // Send password and updated data to the backend for validation and modification
  const response = await fetch(`http://localhost:3000/api/user/user/updateProfile/${userData.value.IdUser}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: nom.value,
      prenom: prenom.value,
      email: email.value,
      mdp: currentMdp.value,
      newMdp: newMdp.value,
    }),
  })

  const result = await response.json()

  // if (result.success) {
  //   ConfirmDialog.value = false
  // } else {
  //   alert(result.message || 'Erreur lors de la modification')
  // }
  ConfirmDialog.value = false
}
</script>


<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="">
          <VForm
            ref="refForm"
            @submit.prevent="() => {}"
          >
            <VContainer 
              class="container"
              style="padding: 0%;"
            >
              <!-- Form fields for user info -->
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="nom"
                    label="Nom"
                    placeholder="John"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="prenom"
                    label="Prenom"
                    placeholder="Doe"
                    :rules="[requiredValidator]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="email"
                    label="email"
                    placeholder="john@email.com"
                    :rules="[requiredValidator, emailValidator]"
                  />
                </VCol>
              </VRow>
              <!-- Password fields for new password -->
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="newMdp"
                    label="New Password"
                    placeholder="············"
                    :type="isNewPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="confirmMdp"
                    label="Confirm Password"
                    placeholder="············"
                    :type="isConfirmPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    :rules="[confirmedValidator(confirmMdp,newMdp)]"
                    @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  />
                </VCol>
              </VRow>
            </VContainer>
            <VContainer>
              <VSpacer />
            </VContainer>
            <!-- Actions for Annuler and Modifier -->
            <VCardActions style="padding: 0%;">
              <VSpacer />
              <VBtn
                color="secondary"
                variant="outlined"
                @click="Annuler"
              >
                Annuler
              </VBtn>
              <VBtn
                color="primary"
                variant="elevated"
                @click="openConfirmDialog"
              >
                Modifier
              </VBtn>
            </VCardActions>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Confirmation Dialog -->
  <VDialog
    v-model="ConfirmDialog"
    max-width="600px"
  >
    <VCard>
      <VCardTitle class="headline">
        Confirmer Modification
      </VCardTitle>
      <VCardText>
        Veuillez entrer votre mot de passe pour confirmer la modification.
        <br>
        <VAlert color="warning">
          Les modifications apportées ne seront visibles qu'après votre déconnexion
        </VAlert>
        <br>
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="currentMdp"
              label="Mot de passe actuel"
              placeholder="············"
              type="password"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="error"
          variant="outlined"
          @click="Annuler"
        >
          Annuler
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          @click="modifyUser"
        >
          Confirmer
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
