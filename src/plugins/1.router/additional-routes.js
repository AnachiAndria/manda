// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend
      const userData = useCookie('userData')
      const userRole = userData.value?.role
      if (userRole === 'admin')
        return { name: 'dashboards' }
      if (userRole === 'client')
        return { name: 'access-control' }
      
      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]
export const routes = [
  // routes cahier
  {
    path: '/cahier-texte/add',
    name: 'ajouter-cahier',
    component: () => import('@/pages/cahier/addCahier.vue'),
  },
  {
    path: '/cahier-texte/list',
    name: 'liste-cahier',
    component: () => import('@/pages/cahier/listeCahier.vue'),
  },

  //prof
  {
    path: '/mention',
    name: 'mention',
    component: () => import('@/pages/mention/mention.vue'),
  },

  //Utilisateur
  {
    path: '/utilisateur/profil',
    name: 'profil',
    component: () => import('@/pages/utilisateur/userProfil.vue'),
  },
  {
    path: '/utilisateur/liste',
    name: 'utilisateur',
    component: () => import('@/pages/utilisateur/utilisateur.vue'),
  },
  
  //administration
  {
    path: '/Syllabus',
    name: 'syllabus',
    component: () => import('@/pages/syllabus/syllabus.vue'),
  },
  {
    path: '/Syllabus/list',
    name: 'liste-syll',
    component: () => import('@/pages/syllabus/syllabusListe.vue'),
  },
  {
    path: '/EC',
    name: 'ec',
    component: () => import('@/pages/admin/EC.vue'),
  },
  {
    path: '/UE',
    name: 'ue',
    component: () => import('@/pages/admin/UE.vue'),
  },
  {
    path: '/Parcour',
    name: 'parcour',
    component: () => import('@/pages/admin/Parcour.vue'),
  },

  //
]
