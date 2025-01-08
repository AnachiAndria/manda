<script setup>
import { onMounted, ref, watch, watchEffect } from 'vue';

//import Service
import ChapitreService from "@/utils/services/ChapitreService";
import ElementConstitutifService from "@/utils/services/ElementConstitutifService";
import MentionService from "@/utils/services/MentionService";
import ParcoursService from "@/utils/services/ParcoursService";
import SousChapitreService from "@/utils/services/SousChapitreService";
import UniteEnseignementService from '@/utils/services/UniteEnseignementService';

// Importing the main PDF.js library
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

//importing CHAT-GPT-API

// Initialize services
const chapitreService = new ChapitreService()
const sousChapitreService = new SousChapitreService()
const elementConstitutifService = new ElementConstitutifService()
const mentionService = new MentionService()
const parcoursService = new ParcoursService()
const uniteEnseignementService = new UniteEnseignementService()

//Reactive state
const inputFile = ref(null)
const pdfText = ref("")
const resutGPT = ref("")
const contentTable = ref({})
const completTable = ref(false)
const unitesEnseignement = ref({})
const soustitre = ref("")
const chapitre_id = ref("")
const sousChapitres = ref([])
const nomEC = ref("")
const professeur_responsable = ref("")
const session = ref("")
const unite_enseignement_id = ref("")
const elementConstitutifs = ref([])
const titre = ref("")
const element_constitutif_id = ref("")
const chapitres = ref([])
const nomMention = ref("")
const mentions = ref([])
const nom_parcours = ref("")
const niveau = ref("")
const mention_id = ref("")
const parcours = ref([])
const rechercheResultat = ref({})
const newEC = ref([])
const ueOptions = ref([])

const syllabusData = ref(null)
const errors = ref([])

const Snackbar = ref(false)
const progresSave = ref(false)

const editedItem = ref({
  session: null,
  ec: null,
  ue: null,
  semm:null
})

const sem = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']
const semestreOptions = ['Impair','Pair']
const itemMt = ref([]) // EC items

const filteredECs = ref([]) // Filtered EC items

//get ITEM EC
const getItemsM = async () => {
  try {
    const res = await useFetch('http://localhost:3000/api/EC/EC', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let data = res.data.value

    // Ensure data is parsed correctly
    if (typeof data === 'string') {
      data = JSON.parse(data) // Parse if stringified JSON
    }

    // Validate and map data
    if (Array.isArray(data)) {
      itemMt.value = data.map(EC => ({
        title: EC.nomEC + ', ('+EC.nom_parcours+')',
        value: EC.id,
        session: EC.session,
        parc: EC.nom_parcours
      }))
    } else {
      console.error('Unexpected data structure:', data)
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error)
  }
}

// Fetch data on mount
onMounted(
  async () => {
    try {
      await fetchUnitesEnseignement();
      await fetchSousChapitres();
      await fetchElementConstitutif();
      await fetchChapitre();
      await fetchMention();
      await fetchParcours();
      await getItemsM();
    } catch (error) {
      console.error("Erreur lors du chargement initial :", error);
    }
  }
)

//get UE in fonction of niveau parcours
const fetchUEOptions = async () => {
  if (contentTable.value.niveau && contentTable.value.parcours) {
    try {
      ueOptions.value = await uniteEnseignementService.getFilteredUnitesEnseignement(
        contentTable.value.niveau,
        contentTable.value.parcours
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des options UE:', error);
    }
    console.log(ueOptions);
    
  } else {
    ueOptions.value = [];
  }
};

//watch 
watchEffect(() => {
  if (contentTable.value.niveau && contentTable.value.parcours) {
    fetchUEOptions()
  } else {
    ueOptions.value = [] // Vider les options si les données ne sont pas disponibles
  }
})
watch(Snackbar, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      Snackbar.value = false;
    }, 3000); // Délai de 3 secondes (ajustable)
  }
})

//save Syllabus
const saveData = async () => {
  if (editedItem.value.ec) {//EC specifique

    progresSave.value = true
    const EC = editedItem.value.ec//id EC
    const FindEcChapitre = chapitres.value.find((ec) => ec.element_constitutif_id === EC)

    // update nom EC,save info complementaire
    await editElementConstitutif(
      EC,
      contentTable.value.matiere,
      contentTable.value.enseignant,
      contentTable.value.horaire,
      editedItem.value.session,
      contentTable.value.objectif
    )

    if (!FindEcChapitre) {//aucun chapitre du mm idEC trouver
      try {//add chap & sous chap
        for (const chapitre of contentTable.value.chapitres) {
          await addChapitre(chapitre.titre, EC);
          const dernierElement = chapitres.value[chapitres.value.length - 1];
  
          for (const sousChapitre of chapitre["sous-chapitres"]) {
            await addSousChapitre(sousChapitre, dernierElement["id"]);
          }
        }
        fetchElementConstitutif()

        //renitialiser valeur
        editedItem.value = {
          session: null,
          ec: null,
          ue: null,
        };
        progresSave.value = false
        inputFile.value = null
        contentTable.value = {};

        Snackbar.value = true//envoyer notif

      } catch (error) {
        console.error("Erreur lors de l'ajout du syllabus:", error);
      }

    } else {
      await deleteChapitre(FindEcChapitre.id);
      await saveData();
    }
  
  } else if (editedItem.value.ue) { //EC indeterminer
    progresSave.value = true
    const UE = editedItem.value.ue
    
    //creation EC
    await addElementConstitutif(
      contentTable.value.matiere,
      contentTable.value.enseignant,
      contentTable.value.horaire,
      contentTable.value.objectif,
      editedItem.value.ue,
      contentTable.value.niveau
    )

    //addChapitre
    if (newEC.value.id) {
      const EC = newEC.value.id;

      try {//add chap & sous chap
        for (const chapitre of contentTable.value.chapitres) {
          await addChapitre(chapitre.titre, EC);
          const dernierElement = chapitres.value[chapitres.value.length - 1];
  
          for (const sousChapitre of chapitre["sous-chapitres"]) {
            await addSousChapitre(sousChapitre, dernierElement["id"]);
          }
        }
        fetchElementConstitutif()

        //renitialiser valeur
        editedItem.value = {
          session: null,
          ec: null,
          ue: null,
          semm: null
        };
        progresSave.value = false
        inputFile.value = null
        contentTable.value = {};

        Snackbar.value = true//envoyer notif

      } catch (error) {
        console.error("Erreur lors de l'ajout du syllabus:", error);
      }
      
    }

  } else {
    
  }
}

//Watch the event input Semestre and EC
watch(()=> editedItem.value.session, () => {
  const selectedSession = editedItem.value.session

  // Filter EC items based on the selected session
  filteredECs.value = itemMt.value.filter(EC => EC.session === selectedSession)
  editedItem.value.ec = null // Reset EC when the session changes
  syllabusData.value =null
})
watch(()=> editedItem.value.ue, () =>{
  const test = editedItem.value.ue
  console.log(test);
  
})

/* METHODE MANDA */
// Methods
async function handlePdfUpload(file) {
    // const prompt = `Extraire le nom du professeur,horaire,objectif,parcours,niveau(une seule niveau :L1 ou L2 ou L3 ou M1 ou M2), la matière enseignée, ainsi que les chapitres et sous-chapitres sous format json et repond directement avec cette structure
    // {
    //       "enseignant": "...",
    //       "parcours":"...",
    //       "matiere": "...",
    //       "horaire": "...",
    //       "objectif": "..."
    //       "niveau": "...",
    //       "chapitres": [
    //         {
    //           "titre":"...", "chapitre": 1,
    //            "titre" : "le titre",
    //           "sous-chapitres": [
    //             "...",
    //             ...
    //           ]
    //         }...
    // } 
    // et laisse vide si l'information n'est pas dans le texte suivant,?\n\n${file}`;
    
    try {
    //   const gtp = new Gpt(prompt);
    //   const gptResponse = await gtp.callGptApi();
    //   resutGPT.value += gptResponse.result;
    
      // contentTable.value = convertStringToJson(gptResponse.result);
      let resp = `
      
      {
        "enseignant": "Herijaona RANDRIAMITAHITSOA",
        "parcours": "ASR",
        "matiere": "English",
        "horaire": "12",
        "objectif": "Development of fundamental linguistic skills and introduction of vocabulary and concepts related to computer science",
        "niveau": "L1",
        "chapitres": [
            {
                "titre": "Introduction to English and Basic Communication",
                "chapitre": 1,
                "sous-chapitres": [
                    "Introduction to the English alphabet and pronunciation",
                    "Greetings and introducing oneself",
                    "Simple questions and answers",
                    "Basic vocabulary for numbers, days of the week, and months",
                    "Role - play exercises for basic interactions"
                ]
            },
            {
                "titre": "Grammar - Present Simple Tense",
                "chapitre": 2,
                "sous-chapitres": [
                    "Affirmative, negative, and interrogative sentences",
                    "Everyday routines and habits",
                    "Adverbs of frequency",
                    "Practice exercises, dialogues, and short essays"
                ]
            },
            {
                "titre": "Vocabulary - Computer Science Basics",
                "chapitre": 3,
                "sous-chapitres": [
                    "Introduction to computer science terminology",
                    "Common hardware and software terms",
                    "Describing computer parts and functions",
                    "Role - play exercises on buying and setting up a computer"
                ]
            },
            {
                "titre": "Grammar - Present Continuous Tense",
                "chapitre": 4,
                "sous-chapitres": [
                    "Actions happening now",
                    "Affirmative, negative, and interrogative sentences",
                    "Expressing future plans",
                    "Practical exercises, dialogues, and short presentations"
                ]
            },
            {
                "titre": "Vocabulary - Internet and Networking",
                "chapitre": 5,
                "sous-chapitres": [
                    "Internet-related vocabulary",
                    "Describing web browsing and email",
                    "Discussing online safety",
                    "Role - play exercises on booking flights and using email"
                ]
            },
            {
                "titre": "Grammar - Past Simple Tense",
                "chapitre": 6,
                "sous-chapitres": [
                    "Past actions and events",
                    "Regular and irregular verbs",
                    "Storytelling and recounting personal experiences",
                    "Practice exercises, narratives, and discussions"
                ]
            },
            {
                "titre": "Computer Science Discussions",
                "chapitre": 7,
                "sous-chapitres": [
                    "Discussing computer science topics and innovations",
                    "Group discussions and presentations on technology trends",
                    "Computer science-related projects and presentations"
                ]
            }
        ]
      }
    `;
      contentTable.value = convertStringToJson(resp);
      // rechercheResultat.value = searchUE(
      //   contentTable.value.matiere,
      //   contentTable.value.niveau
      // );
      // console.log(gptResponse.result);

    } catch (error) {
      console.error("Error in GPT API call:", error);
    }
  }
  
  function convertStringToJson(text) {
    // const jsonMatch = text.match(/```json([\s\S]*?)```/);
    // if (jsonMatch && jsonMatch[1]) {
    //   const jsonText = jsonMatch[1].trim();
    //   return JSON.parse(jsonText);
    // }
    // console.log("Aucun JSON trouvé dans le texte.");
    // return {};
    return JSON.parse(text);
  }
  
  async function onFileChange(e) {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
        let extractedText = "";
  
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          extractedText += pageText + "<br>";
        }
  
        pdfText.value = extractedText;
        await handlePdfUpload(pdfText.value);
      };
      reader.readAsArrayBuffer(file);
    }
    
  }
  
  // Service methods
  
  async function fetchUnitesEnseignement() {
    try {
      unitesEnseignement.value = await uniteEnseignementService.getAllUnitesEnseignement();
    } catch (error) {
      console.error("Erreur lors de la récupération des unités d'enseignement:", error);
    }
  }
  
  async function fetchSousChapitres() {
    try {
      sousChapitres.value = await sousChapitreService.getAllSousChapitre();
    } catch (error) {
      console.error("Erreur lors de la récupération des sous chapitres:", error);
    }
  }
  
  async function addSousChapitre(soustitreVal, chapitreIdVal) {
    try {
      await sousChapitreService.createSousChapitre(soustitreVal, chapitreIdVal);
      await fetchSousChapitres();
    } catch (error) {
      console.error("Erreur lors de l'ajout du sous chapitre:", error);
    }
  }
  
  async function deleteSousChapitreChapitre(id) {
    try {
      await sousChapitreService.deleteSousChapitreChapitre(id);
      await fetchSousChapitres();
    } catch (error) {
      console.error("Erreur lors de la suppression du sous chapitre:", error);
    }
  }

  async function addElementConstitutif(nomEC, professeur_responsable, horaire,  objectif, unite_enseignement_id, niveau) {

    // Calculer la session en fonction du niveau et de la valeur "paire" ou "impaire"
    const niveauBase =  niveau.startsWith("L") ? parseInt(niveau.replace(/\D/g, ""), 10) : 
                        niveau.startsWith("M") ? parseInt(niveau.replace(/\D/g, ""), 10) + 6 : 0; 
    const session = editedItem.value.semm == "paire" ? niveauBase * 2 - 1 : niveauBase * 2;

    try {
      newEC.value = await elementConstitutifService.createElementConstitutif(nomEC,professeur_responsable,horaire, session, objectif, unite_enseignement_id);
    } catch (err) {
      console.error("Erreur lors de la creation de EC:", error);
    }

  }
  
  async function fetchElementConstitutif() {
    try {
      elementConstitutifs.value = await elementConstitutifService.getAllElementConstitutif();
    } catch (error) {
      console.error("Erreur lors de la récupération des elements constitutifs:", error);
    }
  }
  
  async function editElementConstitutif(id, nomEC, professeur_responsable, horaire, session, objectif) {
    try {
      await elementConstitutifService.updateElementConstitutif(
        id,
        nomEC, 
        professeur_responsable,
        horaire,
        session,
        objectif     
      );
      await fetchElementConstitutif();
    } catch (error) {
      console.error("Erreur lors de la modification de l'element constitutif:", error);
    }
  }
  
  async function fetchChapitre() {
    try {
      chapitres.value = await chapitreService.getAllChapitre();
    } catch (error) {
      console.error("Erreur lors de la récupération des chapitres:", error);
    }
  }
  
  async function addChapitre(titreVal, elementConstitutifId) {
    try {
      await chapitreService.createChapitre(titreVal, elementConstitutifId);
      await fetchChapitre();
    } catch (error) {
      console.error("Erreur lors de l'ajout du chapitre:", error);
    }
  }
  
  async function deleteChapitre(id) {
    try {
      await chapitreService.deleteChapitre(id);
      await fetchChapitre();
    } catch (error) {
      console.error("Erreur lors de la suppression du chapitre:", error);
    }
  }
  
  async function fetchMention() {
    try {
      mentions.value = await mentionService.getAllMention();
    } catch (error) {
      console.error("Erreur lors de la récupération des mentions:", error);
    }
  }
  
  async function fetchParcours() {
    try {
      parcours.value = await parcoursService.getAllParcours();
    } catch (error) {
      console.error("Erreur lors de la récupération des parcours:", error);
    }
  }
</script>

<template>
  <VCard class="mb-6">
    <VCardText>
      <h2>Syllabus</h2>
      <VRow class="match-height">
        <VCol
          cols="12"
          md="6"
          lg="6"
          class="mr-md-3"
        >
          <p>Vous pouvez sélectionner un élément constitutif existant ou importer directement le fichier PDF du syllabus en utilisant les options ci-dessous.</p>
          <VAlert 
            variant="tonal" 
            color="info"
            class="mb-4"
          >
            <strong>NB: Si vous ajoutez directement un syllabus sans sélectionner un élément constitutif existant, un nouvel élément sera automatiquement créé 
              dans la base de données avec les informations du syllabus.
            </strong>
          </VAlert>

          <!-- input for Semestre & EC -->
          <div class="d-flex gap-4 align-items-start">
            <!-- Session Input -->
            <VSelect
              v-model="editedItem.session"
              :items="sem"
              variant="outlined"
              label="Semestre"
              chips
              closable-chips
            />

            <!-- EC Input (shown only after session selection) -->
            <VSelect
              v-if="editedItem.session"
              v-model="editedItem.ec"
              :items="filteredECs"
              item-title="title"
              item-value="value"
              variant="outlined"
              label="EC"
              chips
              closable-chips
            />
          </div>

          <!-- input file -->
          <div class="mt-4">
              <VFileInput
                v-model="inputFile"
                label="File input"
                accept="application/pdf"
                @change="onFileChange"
              />
          </div>

          <div
            class="mt-4"
            v-if="inputFile"
          >
            <VProgressCircular
              v-if="!contentTable.matiere"
              indeterminate
              color="primary"
            />

          </div>

          <!-- Displaying Data -->
          <div v-if="contentTable.matiere">
            <div class="mt-4">
              <h2 v-if="contentTable.enseignant != ''">
                Nom du Professeur : {{ contentTable.enseignant }}
              </h2>
              <h3>EC : {{ contentTable.matiere }}</h3>
              <h3>niveau : {{ contentTable.niveau }}</h3>
              <h3>Parcours : {{ contentTable.parcours }}</h3>

              <!-- liste chapitre - sousChapitre  -->
                <div v-for="(chapitre, index) in contentTable.chapitres" :key="index">
                  <h4>Chapitre {{ chapitre.chapitre }} : {{ chapitre.titre }}</h4>
                  <ul>
                    <li
                      v-for="(sousChapitre, subIndex) in chapitre['sous-chapitres']"
                      :key="subIndex"
                    >
                      {{ subIndex + 1 }} - {{ sousChapitre }}
                    </li>
                  </ul>
                </div>
             
            </div>
            
            <!--  get UE if ec vide-->
            <div class="mt-4">
              <div v-if="!editedItem.session">
              <VSelect 
                v-model="editedItem.ue"
                :items="ueOptions"
                item-title="nomUE" 
                item-value="id" 
                variant="outlined"
                label="UE"
                chips
                closable-chips
              />
              <VSelect 
                class="mt-4"
                v-model="editedItem.semm"
                :items="semestreOptions"
                variant="outlined"
                label="Semestre"
                chips
                closable-chips
              />
              
              </div>
              

              <VBtn
                class="mt-4" 
                color="primary"
                variant="elevated"
                @click="saveData"
              >
                Enregistrer
              </VBtn>
              <VProgressCircular 
                v-if="progresSave"
                class="mt-4 ml-4" 
                indeterminate
                color="primary"
              />

            </div>

          </div>
          
          
        </VCol>

        <!-- template SYLLABUS -->
        <VCol
          cols="12"
          md="5"
          lg="5"
          style="padding-inline-start: 5%"
        >
          <p>Téléchargez le modèle de syllabus en cliquant sur le bouton ci-dessous :</p>
          <VBtn
            href="/syllabus-template.docx"
            target="_blank"
            download="syllabus-template.docx"
            color="secondary"
            variant="elevated"
          >
            Télécharger le modele
            <!-- SyllabusENI-Niveau-NomMatiere-Parcours -->
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <VSnackbar
    v-model="Snackbar"
    transition="scroll-y-reverse-transition"
    location="top end"
    color="success"
  >
    Syllabus Enregistrer
  </VSnackbar>
</template>

<style>
.error-messages {
  color: red;
}
</style>
