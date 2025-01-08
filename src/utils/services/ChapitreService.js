import axios from 'axios';

class ChapitreService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/chapitre/chapitre'; // URL de votre API
    }

    // Méthode pour créer un chapitre
    async createChapitre(titre, element_constitutif_id) {
        try {
            const response = await axios.post(this.apiUrl, {
                titre, 
                element_constitutif_id
            });
            return response.data; // Retourne le chapitre créé
        } catch (error) {
            console.error('Erreur lors de la création du chapitre:', error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les chapitres
    async getAllChapitre() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data; // Retourne la liste des chapitres
        } catch (error) {
            console.error('Erreur lors de la récupération des chapitres:', error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un chapitre par son ID
    async updateChapitre(id,titre, element_constitutif_id) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, {
                titre, 
                element_constitutif_id
            });
            return response.data; // Retourne le chapitre mis à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du chapitre:', error);
            throw error;
        }
    }

    // Méthode pour supprimer un chapitre par son ID
    async deleteChapitre(id) {
        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            return { message: 'chapitre supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du chapitre:', error);
            throw error;
        }
    }
}

export default ChapitreService;
