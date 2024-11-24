<script setup>
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf" // Importing the main PDF.js library
import { onMounted, ref, watch } from 'vue'

// Importing the main PDF.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`


const syllabusData = ref(null)
const errors = ref([])
const fileInput = ref(null)

const editedItem = ref({
  session: null,
  ec: null,
})

const sem = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']
const itemMt = ref([]) // EC items
const filteredECs = ref([]) // Filtered EC items

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
      // console.log('Received data is an array:', data)
      itemMt.value = data.map(EC => ({
        title: EC.nomEC,
        value: EC.id,
        session: EC.session,
      }))
    } else {
      console.error('Unexpected data structure:', data)
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error)
  }
}

// Fetch data on mount
onMounted(() => {
  getItemsM()
})



const parseSyllabus = text => {
  // Normalize text: remove multiple spaces, extra whitespace, and trim
  const normalizedText = text.replace(/\s+/g, ' ').trim()

  const syllabus = {
    niveau: '',
    Titre: '',
    enseignant: '',
    Objectif: '',
    horaire: '',
    chapitres: [],
  }

  let currentChapter = null

  // Match patterns in the normalized text
  syllabus.niveau = normalizedText.match(/Niveau\s*:\s*(.*?)\s+/)?.[1] || ''
  syllabus.Titre = normalizedText.match(/EC\s*:\s+(.*?)\s+Enseignant Responsable/)?.[1] || ''
  syllabus.enseignant = normalizedText.match(/Enseignant Responsable\s*:\s*(.*?)\s+Objectif/)?.[1] || ''
  syllabus.Objectif = normalizedText.match(/Objectif\s*:\s*(.*?)\s+Volume horaire/)?.[1] || ''
  syllabus.horaire = normalizedText.match(/Volume horaire\s*:\s*(\d+H)/)?.[1] || ''

  // Split the text by chapters
  const chapters = normalizedText.split(/Chapitre\s+\d+\s*:/g).slice(1) // Skip pre-chapter content

  chapters.forEach((chapterText, index) => {
    const titleMatch = chapterText.match(/^\s*(.*?)\s*•/) // Match title until the first bullet point
    if (titleMatch) {
      if (currentChapter) {
        syllabus.chapitres.push(currentChapter)
      }
      currentChapter = {
        titre: titleMatch[1].trim(),
        'sous-Chapitre': [],
      }
    }

    // Extract sub-chapters
    const subChapters = chapterText.match(/•\s*(.*?)(?=(•|Chapitre|Bibliographie|$))/g)
    if (subChapters && currentChapter) {
      currentChapter['sous-Chapitre'] = subChapters.map(sub => sub.replace('•', '').trim())
    }
  })

  // Push the last chapter
  if (currentChapter) {
    syllabus.chapitres.push(currentChapter)
  }

  return syllabus
}

const extractTextFromPDF = async file => {
  try {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise
    let text = ''

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1)
      const content = await page.getTextContent()

      text += content.items.map(item => item.str).join(' ') + '\n'
    }

    syllabusData.value = parseSyllabus(text)

    // console.log('Parsed syllabusData:', syllabusData.value)
  } catch (error) {
    errors.value.push('Failed to extract data from PDF: ' + error.message)
  }
}

const handleFileChange = event => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    extractTextFromPDF(file)
  } else {
    errors.value.push('Please upload a valid PDF file.')
  }
}

watch(()=> editedItem.value.session, () => {
  const selectedSession = editedItem.value.session

  // Filter EC items based on the selected session
  filteredECs.value = itemMt.value.filter(EC => EC.session === selectedSession)
  editedItem.value.ec = null // Reset EC when the session changes
  syllabusData.value =null
})
watch(()=> editedItem.value.ec, () =>{
  // console.log(editedItem.value.ec)
  
})

const enregistrer = async ()=>{
  try {
    if (!editedItem.value.ec) {
      console.error('Please select an EC.')
      errors.value.push('Please select an EC before saving.')
      
      return
    }

    if (!syllabusData.value) {
      console.error('No syllabus data to save.')
      errors.value.push('No syllabus data to save.')
      
      return
    }

    // Combine EC and syllabusData into one object
    const payload = {
      ecId: editedItem.value.ec, // Selected EC value (id)
      syllabus: syllabusData.value, // Syllabus data JSON
    }

    const res = await fetch('http://localhost:3000/api/syllabus/syllabus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    if (res.ok) {
      const responseData = await res.json()
      
      editedItem.value.session = null
      console.log('Save successful:', responseData)
      alert('Syllabus saved successfully!')
    } else {
      const errorData = await res.json()

      console.error('Save failed:', errorData)
      errors.value.push(errorData.message || 'Failed to save syllabus.')
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error)
    errors.value.push('An unexpected error occurred while saving.')
  }
}

const annuler = ()=>{
  editedItem.value.session = null
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
        >
          <VCardText>
            <div class="d-flex gap-4 align-items-start">
              <!-- Session Input -->
              <AppSelect
                v-model="editedItem.session"
                :items="sem"
                variant="outlined"
                label="Semestre"
                chips
                closable-chips
              />

              <!-- EC Input (shown only after session selection) -->
              <AppSelect
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

            <!-- File Input (shown only after EC selection) -->
            <div
              v-if="editedItem.ec"
              class="mt-4"
            >
              <input
                type="file"
                accept="application/pdf"
                @change="handleFileChange"
              >
            </div>

            <!-- Displaying Data -->
            <pre>{{ syllabusData }}</pre>
            <pre v-if="errors.length">{{ errors }}</pre>
            <br>
            <div class="d-flex gap-4 align-items-start">
              <VBtn
                v-if="syllabusData"
                color="primary"
                variant="elevated"
                @click="enregistrer"
              >
                Enregistrer
              </VBtn>

              <VBtn
                v-if="syllabusData"
                color="error"
                variant="outlined"
                @click="annuler"
              >
                Annuler
              </VBtn>
            </div>
          </VCardText>
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="6"
        >
          <p>Téléchargez le modèle de syllabus en cliquant sur le bouton ci-dessous :</p>
          <VBtn
            href="/syllabus-template.docx"
            target="_blank"
            download="syllabus-template.docx"
            color="primary"
            variant="elevated"
          >
            Télécharger le fichier
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style>
.error-messages {
  color: red;
}
</style>
