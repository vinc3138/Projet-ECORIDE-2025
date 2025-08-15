import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/authToken';

export default function CompteEmploye() {
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [avisNegatifs, setAvisNegatifs] = useState([]);
  const [avisAValider, setAvisAValider] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [chargement, setChargement] = useState(true); // Etat pour indiquer si on charge les données

  const token = localStorage.getItem('jwt_token');
  console.log(token);

  // Récupérer les avis négatifs
  const fetchAvisNegatifs = async () => {
    try {
      const response = await fetch('${API_URL}/api/avis_negatifs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erreur inconnue');
        return;
      }

      const data = await response.json();
      setAvisNegatifs(data);
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Récupérer les avis à valider
  const fetchAvisAValider = async () => {
    try {
      const response = await fetch('${API_URL}/api/avis_a_valider', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erreur inconnue');
        return;
      }

      const data = await response.json();
      setAvisAValider(data);
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Récupérer les avis dès que le token est disponible
  useEffect(() => {
    const chargerDonnees = async () => {
      setChargement(true); // Début du chargement

      // On attend que les deux fetchs soient terminés
      await Promise.all([fetchAvisNegatifs(), fetchAvisAValider()]);

      setChargement(false); // Fin du chargement
    };

    if (token) {
      chargerDonnees();
    }
  }, [token]); // Dépendance au token

  // Fonction pour mettre à jour le statut d'un avis
  const updateAvisStatus = async (avisId, status) => {
    console.log({
      avis_id: avisId,
      action: status
    });

    try {
      const response = await fetch('${API_URL}/api/validation_avis', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avis_id: avisId,
          action: status, // "Validé" ou "Refusé"
        }),
      });

      console.log('Réponse du serveur:', response);

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erreur inconnue');
        return;
      }

      const data = await response.json();

      setMessage(data.message || 'Statut mis à jour avec succès');

      // Réactualiser la liste des avis après modification
      fetchAvisNegatifs();
      fetchAvisAValider();

    } catch (err) {
      console.error('Erreur dans la requête:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  // Affichage conditionnel : afficher "Chargement en cours..."
  if (chargement) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Chargement en cours...</p>
      </div>
    );
  }

  // Affichage principal une fois les données chargées
  return (
    <div className="col col-lg-8 w-100">
      <div className="card shadow rounded-4 p-4">
        <h1 className="text-center mb-4">🛠️ Espace Employé</h1>
        <div className="container">

          {/* Afficher les commentaires négatifs */}
          <div className="card shadow rounded-4 p-4 mb-3">
            <h5 className="text-secondary mb-3">
              🚨 Afficher les covoiturages signalés par les passagers
            </h5>

            {avisNegatifs.length === 0 ? (
              <p>Aucun avis en attente.</p>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Date du commentaire</th>
                      <th>Note</th>
                      <th>Message</th>
                      <th>N° covoiturage</th>
                      <th>Pseudo chauffeur</th>
                      <th>Email chauffeur</th>
                      <th>Pseudo passager</th>
                      <th>Email passager</th>
                      <th>Date de départ</th>
                      <th>Heure de départ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avisNegatifs.map((p) => (
                      <tr key={p.avis_id}>
                        <td>
                          {p.dateCreationCommentaire?.date
                            ? new Date(p.dateCreationCommentaire.date.split(' ')[0]).toLocaleDateString()
                            : 'Non renseigné'}
                        </td>
                        <td>{p.note}⭐/5</td>
                        <td>{p.commentaire}</td>
                        <td>{p.avis_id}</td>
                        <td>{p.chauffeurPseudo}</td>
                        <td>{p.chauffeurEmail}</td>
                        <td>{p.auteurPseudo}</td>
                        <td>{p.auteurEmail}</td>
                        <td>{new Date(p.dateDepart.date.split(' ')[0]).toLocaleDateString()}</td>
						<td>
						  {p.heureDepart?.date
							? (() => {
								const date = new Date('1970-01-01T' + p.heureDepart.date.split(' ')[1].split('.')[0]);
								const heures = date.getHours().toString().padStart(2, '0');
								const minutes = date.getMinutes().toString().padStart(2, '0');
								return `${heures}h${minutes}`;
							  })()
							: 'Non renseigné'}
						</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <hr />

          {/* Avis en attente de validation */}
          <div className="card shadow rounded-4 p-4 mb-3">
            <h5 className="text-secondary mb-3">📝 Avis en attente de validation</h5>

            {avisAValider.length === 0 ? (
              <p>Aucun avis en attente.</p>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Date du commentaire</th>
                      <th>ID</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avisAValider.map((a) => (
                      <tr key={a.avis_id}>
                        <td>{new Date(a.dateCreationCommentaire.date.split(' ')[0]).toLocaleDateString()}</td>
                        <td>{a.pseudo}</td>
                        <td>{a.commentaire}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => updateAvisStatus(a.avis_id, 'Validé')}
                          >
                            Valider
                          </button>
                          
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => updateAvisStatus(a.avis_id, 'Refusé')}
                          >
                            Refuser
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {message && (
            <div className="alert alert-success">
              <label className="form-label text-success">{message}</label>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <label className="form-label text-danger">{error}</label>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
