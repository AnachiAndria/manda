<script setup>
const router = useRouter()
const ability = useAbility()

const userData = useCookie('userData')

const logout = async () => {
  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userData" from cookie
  useCookie('userData').value = null

  // Trigger a reactivity update by refreshing the page or redirecting to the login page
  await router.push('/login')

  // Remove "userAbilityRules" and reset abilities
  useCookie('userAbilityRules').value = null
  ability.update([]) // Reset ability
}
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg
        v-if="userData.avatar"
        :src="userData.avatar"
      />
      <span
        v-else
        class="text-2xl font-weight-medium"
      >
        {{ avatarText(userData.nom) }}
      </span>

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg
                      v-if="userData.avatar"
                      :src="userData.avatar"
                    />
                    <span
                      v-else
                      class="text-2xl font-weight-medium"
                    >
                      {{ avatarText(userData.nom) }}
                    </span>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userData.prenom ? userData.prenom : userData.nom }}
            </VListItemTitle>
            <VListItemSubtitle>
              {{ userData.email }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem
            link
            @click="() =>{router.push('/utilisateur/profil')}"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-user"
                size="22"
              />
            </template>

            <VListItemTitle>Profil</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Déconnexion</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
