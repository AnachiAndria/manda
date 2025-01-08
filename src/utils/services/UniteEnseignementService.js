import axios from 'axios';

class UniteEnseignementService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/UE/UE'; 
    }

    // recherche UE a partir des niveau, nomParcours
    async getFilteredUnitesEnseignement(niveau, nomParcours) {
        try {
            // Récupérer toutes les unités d'enseignement
            const allUnites = await this.getAllUnitesEnseignement();
    
            // Filtrer les unités en fonction du niveau et du nom du parcours
            const filteredUnites = allUnites.filter(
                ue => ue.niveau === niveau && ue.nom_parcours === nomParcours
            );
    
            return filteredUnites;
        } catch (error) {
            console.error('Erreur lors du filtrage des unités d\'enseignement:', error);
            throw error;
        }
    }

    // Créer une unité d'enseignement
    async createUniteEnseignement(nomUE, parcours_id) {
        try {
            const response = await axios.post(this.apiUrl, { nomUE, parcours_id });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'unité d\'enseignement:', error);
            throw error;
        }
    }

    // Récupérer toutes les unités d'enseignement
    async getAllUnitesEnseignement() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des unités d\'enseignement:', error);
            throw error;
        }
    }

    // Récupérer une unité d'enseignement par ID
    async getUniteEnseignementById(id) {
        try {
            const response = await axios.get(`${this.apiUrl}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'unité d\'enseignement:', error);
            throw error;
        }
    }

    // Mettre à jour une unité d'enseignement par ID
    async updateUniteEnseignement(id, nomUE, parcours_id) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, { nomUE, parcours_id });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'unité d\'enseignement:', error);
            throw error;
        }
    }

    // Supprimer une unité d'enseignement par ID
    async deleteUniteEnseignement(id) {
        try {
            const response = await axios.delete(`${this.apiUrl}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'unité d\'enseignement:', error);
            throw error;
        }
    }
}

export default UniteEnseignementService;
