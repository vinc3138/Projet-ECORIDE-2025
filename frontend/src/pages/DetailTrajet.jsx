import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


function DetailTrajet() {
	
	const { id } = useParams();
	const [trajet, setTrajet] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const navigate = useNavigate();
	
	const handleRetour = () => {
		navigate('/recherchetrajet');
	  };
	
  useEffect(() => {
    fetchTrajet();
  }, [id]);

  const fetchTrajet = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/trajetdetail/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
	  
	  console.log("Données reçues avant setTrajet:", data);  // <--- Ici le log
	  
      setTrajet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParticiper = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setMessage("Vous devez être connecté pour participer.");

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/trajets/${id}/participer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la réservation');
      setMessage(data.message || 'Réservation réussie !');
      fetchTrajet(); // refresh
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur : {error}</p>;
  if (!trajet) return null;

  const note = trajet.chauffeur?.note ?? 0;
  const fullStars = Math.floor(note);
  const halfStar = note - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
  
    <>
  
	<div className="jumbotron text-center">
		<h1 className="display-4">EcoRide</h1>
		<p className="lead">La plateforme de covoiturage écoresponsable</p>
		<hr className="my-1" />
	</div>
  
      {/* Bouton de retour aux résultats */}
		<button
		  onClick={handleRetour}
		  className="btn btn-success"
		  style={{
			width: '100%',
			padding: '0.4rem 0.75rem',
			fontSize: '1rem',
			lineHeight: '1.2',
		  }}
		>
		  ◀️ Retour vers les résultats
		</button>

    <div className="container mt-4">
      <h2>Détail du covoiturage</h2>
      <hr />

      {/* Trajet */}
      <h4>Trajet</h4>
      <p><strong>Départ :</strong> {trajet.villeDepart}</p>
      <p><strong>Destination :</strong> {trajet.villeArrivee}</p>
      <p><strong>Date :</strong> {new Date(trajet.dateDepart).toLocaleDateString()}</p>
      <p><strong>Heure de départ :</strong> {trajet.heureDepart}</p>
      <p><strong>Prix :</strong> {trajet.prixPassager} crédits</p>
      <p><strong>Places restantes :</strong> {trajet.nbPlace}</p>

      <hr />

      {/* Conducteur */}
      <h4>Conducteur</h4>
      <p><strong>Pseudo :</strong> {trajet.chauffeur?.pseudo}</p>
      <p><strong>Nom :</strong> {trajet.chauffeur?.prenom} {trajet.chauffeur?.nom?.toUpperCase()}</p>
      <p><strong>Note moyenne :</strong> 
        {' '}
        {[...Array(fullStars)].map((_, i) => <i key={i} className="bi bi-star-fill text-warning"></i>)}
        {halfStar && <i className="bi bi-star-half text-warning"></i>}
        {[...Array(emptyStars)].map((_, i) => <i key={i} className="bi bi-star text-muted"></i>)}
        {' '}
        ({note.toFixed(1)}⭐/5)
      </p>

      <hr />

      {/* Véhicule */}
      <h4>Véhicule</h4>
      {trajet.voiture ? (
        <>
          <p><strong>Marque :</strong> {trajet.voiture.marque}</p>
          <p><strong>Modèle :</strong> {trajet.voiture.modele}</p>
          <p><strong>Énergie :</strong> {trajet.voiture.energie}</p>
        </>
      ) : <p>Informations véhicule non renseignées.</p>}

      <hr />

      {/* Préférences */}
      <h4>Préférences du conducteur</h4>
      {trajet.preferences ? (
        <ul>
          <li><strong>🎶 Musique :</strong> {trajet.preferences.musique ? "Oui" : "Non"}</li>
          <li><strong>🐶 Animaux :</strong> {trajet.preferences.animal ? "Oui" : "Non"}</li>
          <li><strong>🚬 Fumeur :</strong> {trajet.preferences.fumeur ? "Oui" : "Non"}</li>
          <li><strong>🗨️ Discussion :</strong> {trajet.preferences.discussion ? "Oui" : "Non"}</li>
        </ul>
      ) : <p>Préférences non renseignées.</p>}

      {trajet.preferences_perso && trajet.preferences_perso.length > 0 && (
        <>
          <h5>Préférences personnalisées :</h5>
          <ul>
            {trajet.preferences_perso.map((pref, i) => (
              <li key={i}>{pref}</li>
            ))}
          </ul>
        </>
      )}

      <hr />

      {/* Avis */}
      <h4>Avis</h4>
      {trajet.chauffeur?.avis?.length > 0 ? (
        trajet.chauffeur.avis.map((avis, i) => (
		<div
		  key={i}
		  className="border p-2 mb-2"
		  style={{
			backgroundColor: 'white',
			borderRadius: '6px',
			boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
		  }}
		>
		  <strong>{avis.auteurAvis}</strong> a mis <strong>{avis.noteAvis}⭐ /5</strong><br />
		  <em>{avis.commentaireAvis}</em>
		</div>
        ))
      ) : (
        <p>Aucun avis pour ce conducteur.</p>
      )}

      <hr />

      {/* Message */}
      {message && <div className="alert alert-info">{message}</div>}

      {/* Bouton Participer */}
      <button
        onClick={handleParticiper}
        disabled={trajet.nbPlace <= 0}
        className="btn btn-success"
      >
        Réserver une place
      </button>
    </div>
	
    </>
  );
  
}

export default DetailTrajet;
