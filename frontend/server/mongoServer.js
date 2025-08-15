import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();
    console.log('Connecté à MongoDB');

    const db = client.db("plateforme_covoiturage");

    app.get('/api/kpi', async (req, res) => {
      try {
        // Récupérer les 2 collections
        const kpiJournalier = await db.collection("kpi_journalier").find({}).toArray();
        const covoiturages = await db.collection("covoiturages").find({}).toArray();

        // Envoyer les 2 données dans la réponse
        res.json({
          kpiJournalier,
          covoiturages
        });
      } catch (err) {
        console.error('Erreur MongoDB:', err);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    });

    const PORT = 3001;
    app.listen(PORT, () => console.log(`API MongoDB dispo sur http://localhost:${PORT}`));
  } catch (err) {
    console.error('Erreur lors de la connexion à MongoDB:', err);
  }
}

startServer();
