export default [
  {
    title: 'Parcours',
    to: { name: 'parcour' },
    icon: { icon: 'tabler-list-letters' },
  },

  {
    title: 'Unite d\'Enseignement',
    to: { name: 'ue' },
    icon: { icon: 'tabler-files' },
  },

  {
    title: 'Element Constitutif',
    to: { name: 'ec' },
    icon: { icon: 'tabler-file' },
  },
  {
    title: 'Syllabus',
    to: { name: 'syllabus' },
    icon: { icon: 'tabler-folder' },

    children: [
      {
        title: 'Ajouter',
        to: 'syllabus', //name not link
      }, {
        title: 'Lister',
        to: 'liste-syll',
      },
    ],
  },
  
]

/*
{
    title: 'Cahier de Texte',
    to: { name: '' },
    icon: { icon: 'tabler-book' },
  
    children: [
      {
        title: 'Ajouter',
        to: 'ajouter-cahier', //name not link
      }, {
        title: 'Lister',
        to: 'liste-cahier',
      },
    ],
  },
]
*/
