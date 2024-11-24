<script setup>
const userData = useCookie('userData')

const resolveUserRoleVariant = role => {
  if (role === 'admin')
    return {
      color: 'success',
      icon: 'tabler-server-2',
    }
  
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="text-center pt-15">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            :size="100"
            :color="!userData.avatar ? 'primary' : undefined"
            :variant="!userData.avatar ? 'tonal' : undefined"
          >
            <VImg
              v-if="userData.avatar"
              :src="userData.avatar"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(userData.nom) }}
            </span>
          </VAvatar>

          <!-- 👉 User fullName -->
          <h6 class="text-h4 mt-4">
            {{ userData.prenom }}
          </h6>

          <!-- 👉 Role chip -->
          <VChip
            label
            :color="resolveUserRoleVariant(userData.role).color"
            size="small"
            class="text-capitalize mt-3"
          >
            {{ userData.role }}
          </VChip>
        </VCardText>
        <VDivider />
        <VCardText>
          <p class="text-sm text-uppercase text-disabled">
            Details
          </p>

          <!-- 👉 User Details list -->
          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Username:
                  <span class="text-body-1">
                    {{ userData.nom }}
                  </span>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Email:
                  <span class="text-body-1">{{ userData.email }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Role:
                  <span class="text-capitalize text-body-1">{{ userData.role }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
    <!--
      <VCol cols="12">
      <VCard>
      <VCardText class="d-flex">
      pio
      </VCardText>
      </vcard>
      </VCol> 
    -->
  </VRow>
</template>
