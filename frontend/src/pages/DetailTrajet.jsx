import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';


function DetailTrajet() {
	
	
	const API_URL = import.meta.env.VITE_API_URL;
	
	const { id } = useParams();
	const [trajet, setTrajet] = useState(null);
	
	const [loading, setLoading] = useState(true);
	
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	// Affichage des notes avec des étoiles
	//const fullStars = Math.floor(note);
	//const halfStar = note - fullStars >= 0.5;
	//const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

	// Récupérer les infos de recherche depuis le state
	const { depart = '', destination = '', date = '' } = location.state || {};
	
	const token = localStorage.getItem('jwt_token');
	



	// Retour vers la page de recherche de trajet
	const handleRetour = () => {
	  navigate(`/recherchetrajet?depart=${encodeURIComponent(depart)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
	};
	
	
	
	// Afficher le détail du trajet au chargement du composant
	useEffect(() => {
		
		fetchTrajet();
		
	}, [id]);



	// Afficher les détails du trajet
	const fetchTrajet = async () => {
	  setLoading(true);

	  try {
		const response = await fetch(`${API_URL}/api/trajetdetail/${id}`, { credentials: 'include' });
		const data = await response.json();

		if (!response.ok) {
		  // Si le back renvoie {error: "..."}
		  throw new Error(data.error || 'Erreur réseau');
		}

		console.log("Données reçues avant setTrajet:", data);
		setTrajet(data);

	  } catch (err) {
		setError(err.message);
	  } finally {
		setLoading(false);
	  }
	};



	// Participation au trajet
	const handleParticiper = async () => {

		if (!token) {
			setMessage("Vous devez être connecté pour participer.");
			return;
		}

		try {
		  const response = await fetch(`${API_URL}/api/trajets/${id}/participer`, {
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
		  fetchTrajet(); 					// refresh
		  
		} catch (err) {
		  setMessage(`Erreur : ${err.message}`);
		}
	
	};



	// Affichage de l'écran de chargement
	if (loading) {
		
		return (
		<div className="text-center mt-5">

		  <div className="spinner-border text-primary" role="status" />
		  <p className="mt-3">Chargement en cours...</p>
		  
		</div>
		);
	  
	}




	{/* ----------------------------------------------------------------------------------------------------------------------------------------------------------- */}

	{/* Affichage du Frontend */}
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



			{/* Messages d'erreur */}
			<div className="mt-3">
			
				{error && (
					<div className="alert alert-danger">Erreur : {error}</div>
				)}

				{!trajet && !error && (
					<div className="alert alert-danger">Trajet non trouvé</div>
				)}
				
			</div>

			{/* Si le trajet existe */}
			{trajet && (
			
				<div className="container mt-4">

					<h2>Détail du covoiturage</h2>
					
					<hr />
					
						{/* Trajet */}
						<h4>Trajet</h4>
						
						<p><strong>Départ :</strong> {trajet.villeDepart}</p>
						
						<p><strong>Destination :</strong> {trajet.villeArrivee}</p>
						
						<p><strong>Date :</strong> {new Date(trajet.dateDepart).toLocaleDateString()}</p>
						
						<p><strong>Heure de départ :</strong> {(() => {
							
						  const [hh, mm] = trajet.heureDepart.split(':');
						  
						  return `${hh}h${mm}`;
						})()}</p>
						
						<p><strong>Prix :</strong> {trajet.prixPassager} crédits</p>
						
						<p><strong>Places restantes :</strong> {trajet.nbPlace}</p>
						
						<p><strong>Durée :</strong> {trajet.duree}</p>
						
						<p><strong>Distance :</strong> {trajet.distance} km</p>
						
						<hr/>


						{/* Conducteur */}
						<h4>Conducteur</h4>
						
						<p><strong>Pseudo :</strong> {trajet.chauffeur?.pseudo}</p>
						
						<p><strong>Nom :</strong> {trajet.chauffeur?.prenom} {trajet.chauffeur?.nom?.toUpperCase()}</p>
						
						{(() => {
						  const note = trajet.chauffeur?.note ?? 0;
						  return (
							<p>
							  <strong>Note moyenne :</strong> {note.toFixed(1)}⭐/5
							</p>
						  );
						})()}

						{/*
						<p><strong>Note moyenne :</strong>  {note.toFixed(1)}⭐/5
						{' '}
						{[...Array(fullStars)].map((_, i) => <i key={i} className="bi bi-star-fill text-warning"></i>)}
						{halfStar && <i className="bi bi-star-half text-warning"></i>}
						{[...Array(emptyStars)].map((_, i) => <i key={i} className="bi bi-star text-muted"></i>)}
						{' '}
						</p>
						*/}

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
						
						{trajet.chauffeur?.preferences && trajet.chauffeur.preferences.length > 0 ? (() => {
							
							  const fixedPrefs = {
								MUSIQUE: false,
								CONVERSATION: false,
								ANIMAL: false,
								FUMEUR: false
							  };

							  const customPrefs = [];

							  trajet.chauffeur.preferences.forEach(pref => {
								const key = pref.preference.toUpperCase();
								if (pref.statutPreference === "FIXE" && key in fixedPrefs) {
								  fixedPrefs[key] = true;
								} else {
								  customPrefs.push(pref.preference);
								}
							  });

								return (
								
									<>
									
										<ul>
									  
											<li><strong>🎶 Musique :</strong> <span className={fixedPrefs.MUSIQUE ? "text-success" : "text-danger"}>{fixedPrefs.MUSIQUE ? "Oui" : "Non"}</span></li>

											<li><strong>🐶 Animaux :</strong> <span className={fixedPrefs.ANIMAL ? "text-success" : "text-danger"}>{fixedPrefs.ANIMAL ? "Oui" : "Non"}</span></li>

											<li><strong>🚬 Fumeur :</strong> <span className={fixedPrefs.FUMEUR ? "text-success" : "text-danger"}>{fixedPrefs.FUMEUR ? "Oui" : "Non"}</span></li>

											<li><strong>🗨️ Discussion :</strong> <span className={fixedPrefs.CONVERSATION ? "text-success" : "text-danger"}>{fixedPrefs.CONVERSATION ? "Oui" : "Non"}</span></li>

										</ul>

										{customPrefs.length > 0 && (
										
											<>
											  <h5>Préférences personnalisées :</h5>
											  
											  <ul>
											  
												{customPrefs.map((pref, index) => (
												  <li key={index}>{pref}</li>
												))}
												
											  </ul>
											  
											</>
											
										)}
									  
									</>
								
								);
							
							})() : (
							
								<p>Préférences non renseignées.</p>
						  
							)}

					<hr />

						{/* Avis */}
					  
						<h4>Avis</h4>
				  
						{trajet.chauffeur?.avis?.length > 0 ? (
						
							trajet.chauffeur.avis.map((avis, i) => (
							
								<div key={i} className="border p-2 mb-2" style={{backgroundColor: 'white',borderRadius: '6px',boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
								  
									<strong>{avis.auteurAvis}</strong> a mis <strong>{avis.noteAvis}⭐ /5</strong>
								  
									<br />
								  
									<em>{avis.commentaireAvis}</em>
								  
								</div>
							
							))
							
						) : (
						
							<p>Aucun avis pour ce conducteur.</p>
						
						)}

					<hr />

						{/* Message */}
						{message && (
						
							message === "Participation enregistrée et confirmation envoyée." ? (
							
								<div className="alert alert-success">{message}</div>
								
							) : message === "Vous devez être connecté pour participer." ? (
							
								<div className="alert alert-warning">{message}</div>
								
							) : (
							
								<div className="alert alert-danger">{message}</div>
								
							)
							
						)}
						
						{/* Bouton Participer */}
						<button
						onClick={handleParticiper}
						disabled={trajet.nbPlace <= 0}
						className="btn btn-success"
						title={trajet.nbPlace <= 0 ? "Plus de places disponibles" : "Réserver une place"}
						>
						Réserver une place
						</button>

				</div>
				
			)}
	
		</>
	
	);
  
}

export default DetailTrajet;
