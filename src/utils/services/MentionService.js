import axios from 'axios';

class MentionService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/mention/mention'; // URL de votre API
    }

    // Méthode pour créer un mention
    async createMention(nom_mention) {
        console.log(nom_mention)
        try {
            const response = await axios.post(this.apiUrl, {
                nom_mention
            });
            return response.data; // Retourne le mention créé
        } catch (error) {
            console.error('Erreur lors de la création du mention:', error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les mentions
    async getAllMention() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data; // Retourne la liste des mentions
        } catch (error) {
            console.error('Erreur lors de la récupération des mentions:', error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un mention par son ID
    async updateMention(id,nom_mention) {
        try {
            const response = await axios.put(`${this.apiUrl}/${id}`, {
                nom_mention
            });
            return response.data; // Retourne le mention mis à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mention:', error);
            throw error;
        }
    }

    // Méthode pour supprimer un mention par son ID
    async deleteMention(id) {
        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            return { message: 'mention supprimé avec succès.' }; // Confirmation de la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du mention:', error);
            throw error;
        }
    }
}

export default MentionService;
