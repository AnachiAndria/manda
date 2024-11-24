export default [
  {
    title: 'Syllabus',
    to: { name: 'syllabus' },
    icon: { icon: 'tabler-file' },

    children: [
      {
        title: 'Ajouter',
        to: 'syllabus', //name not link
      }, {
        title: 'List',
        to: 'liste-syll',
      },
    ],
  },
  {
    title: 'EC',
    to: { name: 'ec' },
    icon: { icon: 'tabler-file' },
  },
  {
    title: 'UE',
    to: { name: 'ue' },
    icon: { icon: 'tabler-file' },
  },
  {
    title: 'Parcour',
    to: { name: 'parcour' },
    icon: { icon: 'tabler-file' },
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
