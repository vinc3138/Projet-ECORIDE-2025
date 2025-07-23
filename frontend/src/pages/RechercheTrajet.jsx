import React, { useState, useEffect } from 'react';
import { getCitySuggestions, isCityValid } from '../utils/listeVilleTrajet';
import { convertirDate } from '../utils/formatDate';


export default function RechercheTrajets() {
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [trajets, setTrajets] = useState([]);
  const [searchDone, setSearchDone] = useState(false);

  const [loading, setLoading] = useState(false);
  
  // États pour filtres avancés
  const [ecologique, setEcologique] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [dureeMax, setDureeMax] = useState('');
  const [noteMin, setNoteMin] = useState('');

  // Suggestions et validation
  const [departSuggestions, setDepartSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [departValid, setDepartValid] = useState(true);
  const [destinationValid, setDestinationValid] = useState(true);
  const [formValid, setFormValid] = useState(true);

  useEffect(() => {
    if (depart.length > 1) {
      getCitySuggestions(depart).then(setDepartSuggestions);
    } else {
      setDepartSuggestions([]);
    }
  }, [depart]);

  useEffect(() => {
    if (destination.length > 1) {
      getCitySuggestions(destination).then(setDestinationSuggestions);
    } else {
      setDestinationSuggestions([]);
    }
  }, [destination]);

	const fetchTrajets = (params) => {
	  setLoading(true);
	  const query = new URLSearchParams(params).toString();
	  fetch(`http://127.0.0.1:8000/api/recherche-trajet?${query}`)
		.then(res => res.json())
		.then(data => {
			
			      console.log("Trajets reçus :", data);
      data.forEach((trajet, i) => {
        console.log(`Chauffeur #${i} - photo :`, trajet.chauffeur?.photo?.substring(0, 80));
      });
			
		  setTrajets(data);
		  setLoading(false);
		  setSearchDone(true);  // marque la recherche comme terminée
		})
		.catch(error => {
		  console.error('Erreur lors de la recherche :', error);
		  setLoading(false);
		  setSearchDone(true);
		});
	};

  const handleSubmit = (e) => {
    e.preventDefault();

    const departIsValid = isCityValid(depart, departSuggestions);
    const destinationIsValid = isCityValid(destination, destinationSuggestions);

    setDepartValid(departIsValid);
    setDestinationValid(destinationIsValid);

    const formIsValid = departIsValid && destinationIsValid;
    setFormValid(formIsValid);

    const params = { depart, destination, date };
    fetchTrajets(params);
    setSearchDone(true);
  };

  const handleFiltreSubmit = (e) => {
    e.preventDefault();
    const params = {
      depart,
      destination,
      date,
      ecologique,
      prix_max: prixMax,
      duree_max: dureeMax,
      note_min: noteMin,
    };
    fetchTrajets(params);
  };

	return (
	  <>

		<div className="jumbotron text-center">
		  <h1 className="display-4">EcoRide</h1>
		  <p className="lead">La plateforme de covoiturage écoresponsable</p>
		  <hr className="my-1" />
		</div>
		
		<div className="jumbotron text-center">
          <p className="display-8">
            Grâce à EcoRide, vous pouvez désormais rechercher vos trajets et réserver rapidement.<br />
            Visualisez les trajets disponibles<br />
            Créez votre compte et connectez-vous !<br />
            Réservez votre trajet et voyagez !<br />
          </p>
		  <hr className="my-1" />
        </div>

		<div className="container">
		  <h2>Rechercher un trajet</h2>
		  <form onSubmit={handleSubmit}>
			<div className="mb-3 column">
			  <label htmlFor="depart" className="form-label">Départ :</label>
			  <input
				type="text"
				name="depart"
				className={`form-control ${departValid ? '' : 'is-invalid'}`}
				id="depart"
				list="depart-list"
				value={depart}
				onChange={(e) => setDepart(e.target.value)}
				required
				autoComplete="off"
			  />
			  <datalist id="depart-list">
				{departSuggestions.map((city, index) => (
				  <option key={index} value={city} />
				))}
			  </datalist>
			  {!departValid && <div className="invalid-feedback">Ville non reconnue</div>}
			</div>

			<div className="mb-3 column">
			  <label htmlFor="destination" className="form-label">Destination :</label>
			  <input
				type="text"
				name="destination"
				className={`form-control ${destinationValid ? '' : 'is-invalid'}`}
				id="destination"
				list="destination-list"
				value={destination}
				onChange={(e) => setDestination(e.target.value)}
				required
				autoComplete="off"
			  />
			  <datalist id="destination-list">
				{destinationSuggestions.map((city, index) => (
				  <option key={index} value={city} />
				))}
			  </datalist>
			  {!destinationValid && <div className="invalid-feedback">Ville non reconnue</div>}
			</div>

			<div className="mb-3 column">
			  <label htmlFor="date" className="form-label">Date (facultatif) :</label>
			  <input
				type="date"
				className="form-control"
				id="date"
				name="date"
				value={date}
				onChange={(e) => setDate(e.target.value)}
			  />
			</div>

			<button type="submit" className="btn btn-success w-100">Rechercher</button>
		  </form>

		  <div
			className="alert alert-danger mt-2"
			role="alert"
			style={{ visibility: formValid ? 'hidden' : 'visible', minHeight: '2rem' }}
		  >
			Merci de choisir des villes valides dans les suggestions.
		  </div>

		  {searchDone && departValid && destinationValid && (
			<>
			  <h3 className="mt-4">Affiner la recherche</h3>
			  <form onSubmit={handleFiltreSubmit}>
				<div className="row">
				  <div className="mb-3 col-auto">
					<label htmlFor="ecologique" className="form-label">Aspect écologique :</label>
					<select
					  name="ecologique"
					  className="form-control"
					  id="ecologique"
					  value={ecologique}
					  onChange={e => setEcologique(e.target.value)}
					>
					  <option value="">Tous</option>
					  <option value="1">Oui</option>
					  <option value="0">Non</option>
					</select>
				  </div>

				  <div className="mb-3 col-auto">
					<label htmlFor="prix_max" className="form-label">Prix maximum :</label>
					<input
					  type="number"
					  className="form-control"
					  id="prix_max"
					  name="prix_max"
					  value={prixMax}
					  min="0"
					  onChange={e => setPrixMax(e.target.value)}
					/>
				  </div>

				  <div className="mb-3 col-auto">
					<label htmlFor="duree_max" className="form-label">Durée maximale :</label>
					<input
					  type="number"
					  className="form-control"
					  id="duree_max"
					  name="duree_max"
					  value={dureeMax}
					  min="0"
					  onChange={e => setDureeMax(e.target.value)}
					/>
				  </div>

				  <div className="mb-3 col-auto">
					<label htmlFor="note_min" className="form-label">Note minimale du chauffeur :</label>
					<input
					  type="number"
					  className="form-control"
					  id="note_min"
					  name="note_min"
					  step="0.1"
					  min="0"
					  max="5"
					  value={noteMin}
					  onChange={e => setNoteMin(e.target.value)}
					/>
				  </div>

				  <div className="mb-3 col-auto align-self-end">
					<button type="submit" className="btn btn-success">Appliquer les filtres</button>
				  </div>
				</div>
			  </form>
			</>
		  )}

		  <div className="mt-4">

			{loading && <p>Chargement en cours...</p>}

			{!loading && searchDone && trajets.length === 0 && (
			  <p>Aucun trajet trouvé.</p>
			)}

			{!loading && searchDone && trajets.length > 0 && (
			<>
				<h4>Résultats :</h4>
					<ul className="list-group">
					  {trajets.map((trajet) => (
						<li
						  key={trajet.id}
						  className="list-group-item mb-4"
						  style={{
							backgroundColor: '#E6F4EA',
							borderRadius: '12px',
							border: '1px solid #cfe9db',
						  }}
						>
						  <div className="row g-3 align-items-center">
							{/* 📸 Colonne 1 : Image */}
							<div className="col-md-4 d-flex justify-content-center align-items-center">
							  <div
								className="rounded-circle shadow-sm overflow-hidden border"
								style={{
								  width: '180px',
								  height: '180px',
								  borderColor: '#b2d8c4',
								  borderWidth: '2px',
								  borderStyle: 'solid',
								  display: 'flex',
								  alignItems: 'center',
								  justifyContent: 'center',
								}}
							  >
								<img
								  src={
									trajet.chauffeur?.photo && trajet.chauffeur.photo.startsWith('data:image/')
									  ? trajet.chauffeur.photo
									  : '/Pictures/PICTURE_USER_VOID.png'
								  }
								  alt="Photo du chauffeur"
								  className="img-fluid h-100 w-100"
								  style={{ objectFit: 'cover' }}
								/>
							  </div>
							</div>

							{/* 📄 Colonne 2 & 3 : Infos + bouton */}
							<div className="col-md-8">
							  <div
								className="fw-bold text-success mb-3"
								style={{ fontSize: '1.4rem' }}
							  >
								🚗 {trajet.villeDepart} → {trajet.villeArrivee}
							  </div>

							  <div className="row">
								<div className="col-md-6">
								  <div className="mb-2">📅 <strong>Date de départ :</strong> {trajet.dateDepart}</div>
								  <div className="mb-2">💲 <strong>Prix :</strong> {trajet.prix} crédits</div>
								  <div className="mb-2">⌚ <strong>Durée :</strong> {trajet.duree}</div>
								  <div className="mb-2">📍 <strong>Distance :</strong> {trajet.distance} km</div>
								  
								  <a
									href={`/trajetdetail/${trajet.id}`}
									className="btn btn-success w-100"
								  >
									🔎​ Voir le détail du trajet
								  </a>
								  
								</div>
								<div className="col-md-6">
								  <div className="mb-2">
									🌿 <strong>Écologique :</strong>{' '}
									<span className={trajet.ecologique ? 'text-success' : 'text-danger'}>
									  {trajet.ecologique ? 'Oui' : 'Non'}
									</span>
								  </div>
								  <div className="mb-2">👤 <strong>Chauffeur :</strong> {trajet.chauffeur?.pseudo ?? 'N/A'}</div>
								  <div className="mb-2">📝 <strong>Note :</strong> {trajet.chauffeur?.note ?? 'N/A'} ⭐</div>
								  <div className="mb-2">🚗 <strong>Voiture :</strong> {trajet.voiture?.modele ?? 'N/A'}</div>
								  <div className="mb-3">💺 <strong>Places disponibles :</strong> {trajet.place}</div>

								</div>
							  </div>
							</div>
						  </div>
						</li>
					  ))}
					</ul>
			</>
			)}
		  </div>
		</div>
	  </>
	);

}
