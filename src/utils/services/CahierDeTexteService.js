import axios from 'axios';

class CahierDeTexteService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/cahier-de-texte/cahier-de-texte'; // URL de votre API
    }

    // Méthode pour créer un cahier de texte
    async createCahierDeTexte(dateCours, heureDebut, heureFin, descriptionCours, element_constitutif_id, sous_chapitre_id) {
        try {
            const response = await axios.post(this.apiUrl, {
                dateCours,
                heureDebut,
                heureFin,
                descriptionCours,
                element_constitutif_id,
                sous_chapitre_id
            });
            return response.data; // Retourne le cahier de texte créé
        } catch (error) {
            console.error('Erreur lors de la création du cahier de texte:', error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les cahiers de texte
    async getAllCahierDeTexte() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data; // Retourne la liste des cahiers de texte
        } catch (error) {
            console.error('Erreur lors de la récupération des cahiers de texte:', error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un cahier de texte par son ID
    async updateCahierDeTexte(id, dateCours, heureDebut, heureFin, descriptionCours, element_constitutif_id, sous_chapitre_id) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, {
                dateCours,
                heureDebut,
                heureFin,
                descriptionCours,
                element_constitutif_id,
                sous_chapitre_id
            });
            return response.data; // Retourne le cahier de texte mis à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du cahier de texte:', error);
            throw error;
        }
    }

    // Méthode pour supprimer un cahier de texte par son ID
    async deleteCahierDeTexte(id) {
        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            return { message: 'Cahier de texte supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du cahier de texte:', error);
            throw error;
        }
    }
}

export default CahierDeTexteService;
