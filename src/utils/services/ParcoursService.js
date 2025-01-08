import axios from 'axios';

class ParcoursService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/parcours/parcours'; // URL de votre API
    }

    // Méthode pour créer un parcours
    async createParcours(nom_parcours, niveau, mention_id) {
        console.log(nom_parcours+ " " +  niveau + " " + mention_id);
        try {
            const response = await axios.post(this.apiUrl, {
                nom_parcours, 
                niveau, 
                mention_id
            });
            return response.data; // Retourne le parcours créé
        } catch (error) {
            console.error('Erreur lors de la création du parcours:', error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les parcourss
    async getAllParcours() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data; // Retourne la liste des parcourss
        } catch (error) {
            console.error('Erreur lors de la récupération des parcourss:', error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un parcours par son ID
    async updateParcours(id,nom_parcours, niveau, mention_id) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, {
                nom_parcours, 
                niveau, 
                mention_id
            });
            return response.data; // Retourne le parcours mis à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du parcours:', error);
            throw error;
        }
    }

    // Méthode pour supprimer un parcours par son ID
    async deleteParcours(id) {
        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            return { message: 'parcours supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du parcours:', error);
            throw error;
        }
    }
}

export default ParcoursService;
