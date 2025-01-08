import axios from 'axios';

class SousChapitreService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/sousChapitre/sousChapitre'; // URL de votre API
    }

    // Méthode pour créer un sous-chapitre
    async createSousChapitre(soustitre, chapitre_id) {
        try {
            const response = await axios.post(this.apiUrl, {
                soustitre,
                chapitre_id,
            });
            return response.data; // Retourne le sous-chapitre créé
        } catch (error) {
            console.error('Erreur lors de la création du sous-chapitre:', error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les sous-chapitres
    async getAllSousChapitre() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data; // Retourne la liste des sous-chapitres
        } catch (error) {
            console.error('Erreur lors de la récupération des sous-chapitres:', error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un sous-chapitre par son ID
    async updateSousChapitre(id, soustitre, chapitre_id) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, {
                soustitre,
                chapitre_id,
            });
            return response.data; // Retourne le sous-chapitre mis à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du sous-chapitre:', error);
            throw error;
        }
    }

    // Méthode pour supprimer un sous-chapitre par son ID
    async deleteSousChapitre(id) {
        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            return { message: 'Sous-chapitre supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du sous-chapitre:', error);
            throw error;
        }
    }
    // Méthode pour supprimer un sous-chapitre par chapitre
    async deleteSousChapitreChapitre(id) {
        try {
            await axios.delete(`${this.apiUrl}/Delete/${id}`);
            return { message: 'Sous-chapitre supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du sous-chapitre:', error);
            throw error;
        }
    }
}

export default SousChapitreService;
