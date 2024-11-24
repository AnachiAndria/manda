export default [
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
  