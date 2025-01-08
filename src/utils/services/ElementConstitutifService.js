import axios from 'axios';

class ElementConstitutifService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/EC/EC'; // URL de votre API
    }

    // Méthode pour créer un element constitutif
    async createElementConstitutif(nomEC,professeur_responsable,horaire, session, objectif, unite_enseignement_id) {
        try {
            const response = await axios.post(this.apiUrl, {
                nomEC,professeur_responsable,horaire, session, objectif, unite_enseignement_id
            });
            return response.data; // Retourne le element constitutif créé
        } catch (error) {
            console.error('Erreur lors de la création du element constitutif:', error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les element constitutifs
    async getAllElementConstitutif() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data; // Retourne la liste des element constitutifs
        } catch (error) {
            console.error('Erreur lors de la récupération des element constitutifs:', error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un element constitutif par son ID
    async updateElementConstitutif(id,nomEC, professeur_responsable,horaire,session,objectif) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, {
                id,
                nomEC, 
                professeur_responsable,
                horaire,
                session,
                objectif
            });
            return response.data; // Retourne le element constitutif mis à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du element constitutif:', error);
            throw error;
        }
    }

    // Méthode pour supprimer un element constitutif par son ID
    async deleteElementConstitutif(id) {
        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            return { message: 'element constitutif supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du element constitutif:', error);
            throw error;
        }
    }
}

export default ElementConstitutifService;
