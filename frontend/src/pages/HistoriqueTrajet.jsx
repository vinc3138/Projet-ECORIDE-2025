import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/authToken';
import { validateFormData } from '../utils/checkNewTrajet';
import { getCitySuggestions, isCityValid } from '../utils/listeVilleTrajet';
import MapComponent from '../context/USERMapTrajet';


const HistoriqueTrajet = () => {
  
	const API_URL = import.meta.env.VITE_API_URL;
 
  // Nouvel état loading
    const [loading, setLoading] = useState(true);
 
	const [trajets, setTrajets] = useState([]);
	const [message, setMessage] = useState('');
	const [userRole, setUserRole] = useState(null);
	const [formData, setFormData] = useState({
	depart: '',
	adresse_depart: '',
	destination: '',
	adresse_arrivee: '',
	date_depart: '',
	heure_depart: '',
	date_arrivee: '',
	heure_arrivee: '',
	places: 1,
	prix: 0,
	vehicule_id: '',
	});
	const [vehicules, setVehicules] = useState([]);
	const [evaluations, setEvaluations] = useState([]);
	const [noteMoyenne, setNoteMoyenne] = useState(null);

	const [formVehicule, setFormVehicule] = useState(false);
	const [newVehicule, setNewVehicule] = useState({
		marque: '',
		modele: '',
		nb_place: '',
		immatriculation: '',
		couleur: '',
		energie: '',
		});
	const [isElectrique, setIsElectrique] = useState(false);
	  
  const initialPreferences = {
    musique: false,
    conversation: false,
    fumeur: false,
    animal: false,
	optionnelles: []  // Tableau pour les préférences optionnelles
  };

	// Suggestions villes et adresses
	const [departSuggestions, setDepartSuggestions] = useState([]);
	const [destinationSuggestions, setDestinationSuggestions] = useState([]);
	const [adresseDepartSuggestions, setAdresseDepartSuggestions] = React.useState([]);
	const [adresseDestinationSuggestions, setAdresseDestinationSuggestions] = React.useState([]);
	
	// Validations
	const [departValid, setDepartValid] = useState(true);
	const [destinationValid, setDestinationValid] = useState(true);
	const [errors, setErrors] = useState({});

	// Coordonnées et info trajet
	const [startCoords, setStartCoords] = useState(null);
	const [endCoords, setEndCoords] = useState(null);
	const [distance, setDistance] = useState('');
	const [duree, setDuree] = useState('');

    const [preferencesData, setPreferencesData] = useState([]);
    const [preferences, setPreferences] = useState({});

    const [customPreference, setCustomPreference] = useState('');
    const [customPreferences, setCustomPreferences] = useState([]);
  
    const [formSubmitted, setFormSubmitted] = useState(false);
	
    const [error, setError] = useState(null);

    const token = localStorage.getItem('jwt_token');


	// Toggle bouton sur l'énergie électrique
	const handleToggle = () => {
	  const newValue = !isElectrique;
	  setIsElectrique(newValue);
	  setNewVehicule(prev => ({
		...prev,
		energie: newValue ? 'Électrique' : '',
	  }));
	};


	const handleInputChange = (e) => {
	  const { name, value } = e.target;
	  setNewVehicule(prev => ({
		...prev,
		[name]: value
	  }));
	};


	// Token

	useEffect(() => {
	if (token) {
	  try {
		const user = JSON.parse(localStorage.getItem('user'));
		if (user && user.role) {
		  setUserRole(user.role);
		}
	  } catch (error) {
		console.error('Erreur en lisant le user depuis localStorage', error);
	  }
	}
	}, [token]);


	// Interroge l'API pour récupérer une liste de suggestions de villes, dès que le champ est modifié

	// Suggestions villes depart
	useEffect(() => {
	if (formData.depart.length > 1) {
	  getCitySuggestions(formData.depart).then(setDepartSuggestions);
	} else {
	  setDepartSuggestions([]);
	}
	}, [formData.depart]);

	// Suggestions villes destination
	useEffect(() => {
	if (formData.destination.length > 1) {
	  getCitySuggestions(formData.destination).then(setDestinationSuggestions);
	} else {
	  setDestinationSuggestions([]);
	}
	}, [formData.destination]);

	// Suggestions adresses depart
	async function handleDepartChange(e) {
	  const val = e.target.value;
	  setFormData(prev => ({ ...prev, adresse_depart: val }));

	  if (val.length > 2 && formData.depart) {
		const suggestions = await getAddressDepartSuggestions(val, formData.depart);
		 console.log('Suggestions d\'adresses :', suggestions);
		 setAdresseDepartSuggestions(suggestions);
	  } else {
		setAdresseDepartSuggestions([]);
	  }
	}
	
	// Suggestions adresses destination
	async function handleDestinationChange(e) {
	  const val = e.target.value;
	  setFormData(prev => ({ ...prev, adresse_destination: val }));
		
	  if (val.length > 2 && formData.destination) {
		const suggestions = await getAddressSuggestions(val, formData.destination);
		setAdresseDestinationSuggestions(suggestions);
	  } else {
		setAdresseDestinationSuggestions([]);
	  }
	}




	// Validation en temps réel du formulaire
	useEffect(() => {
	const newErrors = validateFormData(formData);
	setErrors(newErrors);

	// Validation ville départ et arrivée avec listes suggestions
	setDepartValid(isCityValid(formData.depart, departSuggestions));
	setDestinationValid(isCityValid(formData.destination, destinationSuggestions));
	}, [formData, departSuggestions, destinationSuggestions]);
	

	// Mise à jour des coordonnées dès que les villes sont modifiées
	useEffect(() => {
	  async function updateRoute() {
		if (startCoords && endCoords) {
		  const result = await fetchRouteData(startCoords, endCoords);
		  if (result) {
			setDistance(result.distance);
			setDuree(result.duration);
		  }
		}
	  }

	  updateRoute();
	}, [startCoords, endCoords]); // Ce useEffect se relance à chaque fois que les coordonnées changent

	const handleAdresseChange = async () => {
	  const start = await geocodeAdresse(formData.adresse_depart);
	  const end = await geocodeAdresse(formData.adresse_arrivee);
	  if (start && end) {
		setStartCoords(start);
		setEndCoords(end);
	  }
	};
	

	// Récupération de distance et durée, dès qu'on a les coordonnées (se relance à chaque fois que les coordonnées changent)
	useEffect(() => {
	async function updateRoute() {
	if (startCoords && endCoords) {
	  const result = await fetchRouteData(startCoords, endCoords);
	  if (result) {
		setDistance(result.distance);
		setDuree(result.duration);
	  }
	}
	}
	updateRoute();
	}, [startCoords, endCoords]);



	
	
{/* ----------------------------------------------------------------------------------------------------------- */}


	useEffect(() => {
	  
	  if (!token) return;

		{/* ----------------------------------------------------------------------------------------------------------- */}
		{/* Fetch Trajets */}
		{/* ----------------------------------------------------------------------------------------------------------- */} 
			fetch(`${API_URL}/api/trajets/historique`, {
			  headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			  },
			})
			  .then(res => {
				if (!res.ok) throw new Error("Erreur lors du chargement des trajets");
				return res.json();
			  })
			  .then(setTrajets)
			  .catch(err => setMessage(err.message));
		  
		{/* ----------------------------------------------------------------------------------------------------------- */}
		{/* Fetch Voiture */}
		{/* ----------------------------------------------------------------------------------------------------------- */} 
			fetch(`${API_URL}/api/voiture_utilisateur`, {
			  headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			  },
			})
			  .then(res => {
				if (!res.ok) throw new Error("Erreur lors du chargement des véhicules");
				return res.json();
			  })
			  .then(setVehicules)
			  .catch(err => console.error(err));
		{/* ----------------------------------------------------------------------------------------------------------- */}
		
		
			// Récupération du rôle en premier
			const fetchUserData = async () => {
				try {
			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Fetch User */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
				  if (token) {
					const userRes = await fetch(`${API_URL}/api/user`, {
					  method: 'GET',
					  headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					  },
					});

					if (!userRes.ok) {
					  setLoading(false); // Stop loading même si erreur
					  throw new Error('Erreur lors de la récupération du rôle');
					}

					const userData = await userRes.json();
					const role = userData.role;  // Définir le rôle depuis les données utilisateur
					
					setUserRole(role);  // Mettre à jour le state avec le rôle

					// Appeler fetchOtherData avec le rôle récupéré
					fetchOtherData(role);
					
				  }
				} catch (err) {
				  console.error('Erreur Fetch du rôle :', err);
				}
			  };
		




			const fetchOtherData = async (role) => {
			  try {
				// Assure-toi que le rôle est valide avant d'effectuer les fetch
				if (role === 1 || role === 3) {

				  // -----------------------------------------------------------------------------------------------------------
				  // Fetch Avis Chauffeur
				  // -----------------------------------------------------------------------------------------------------------
				  try {
					const avisRes = await fetch(`${API_URL}/api/avis/chauffeur`, {
					  headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					  },
					});

					if (!avisRes.ok) throw new Error("Erreur lors du chargement des avis");
					const avisData = await avisRes.json();
					setEvaluations(avisData.evaluations);     // Tableau des évaluations
					setNoteMoyenne(avisData.note_moyenne);    // Note moyenne déjà calculée côté serveur
				  } catch (err) {
					console.error("Erreur Fetch Avis Chauffeur : ", err);
				  }

				  // -----------------------------------------------------------------------------------------------------------
				  // Fetch Préférences
				  // -----------------------------------------------------------------------------------------------------------
				try {
						const preferencesRes = await fetch(`${API_URL}/api/utilisateur/get_user_preference`, {
						  method: 'GET',
						  headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json',
						  },
						});

						if (!preferencesRes.ok) {
						  throw new Error(`Erreur HTTP : ${preferencesRes.status}`);
						}

						const preferencesData = await preferencesRes.json();

						// Initialisation de `initialPreferences` et `optionnelles`
						const initialPreferences = {
						  musique: false,
						  conversation: false,
						  fumeur: false,
						  animal: false,
						  optionnelles: [],  // Tableau vide pour stocker les préférences optionnelles
						};

						// Vérifie que preferencesData et preferencesData.preferences existent et sont bien définis
						const preferencesArray = preferencesData?.preferences || [];
						if (Array.isArray(preferencesArray)) {
						  preferencesArray.forEach(pref => {

							switch (pref.preference) {
							  case "MUSIQUE":
								initialPreferences.musique = true;
								break;
							  case "CONVERSATION":
								initialPreferences.conversation = true;
								break;
							  case "FUMEUR":
								initialPreferences.fumeur = true;
								break;
							  case "ANIMAL":
								initialPreferences.animal = true;
								break;
							  default:
								// Ajouter toute préférence "OPTIONNELLE" non gérée dans le tableau `optionnelles`
								if (pref.statutPreference === "OPTIONNEL") {

								  initialPreferences.optionnelles.push(pref.preference);
								}
								break;
							}
						  });
						} else {
						  console.error('La clé "preferences" ne contient pas un tableau valide');
						}

					// Vérifier l'état de initialPreferences après modification
					// console.log("initialPreferences après traitement:", initialPreferences);
					
					setPreferences(initialPreferences);

					
				  } catch (err) {
					setError('Erreur lors du chargement des préférences');
					console.error("Erreur Fetch Préférences : ", err);
				  }

				}
			  } catch (err) {
				console.error("Erreur générale lors de la récupération des données : ", err);
			  }
			finally {
			// Arrête le loading uniquement après tous les fetchs
			setLoading(false);
			}
			
			};

			if (token) {
			  fetchUserData();  // Lancer la récupération des données utilisateur
			}
	  
	  }, [token]);



{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Vérification des données d'un nouveau trajet */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	const handleChange = (e) => {
	  const { name, value } = e.target;

	  const newFormData = {
		...formData,
		[name]: value,
	  };

	  setFormData(newFormData);

	  const newErrors = validateFormData(newFormData);
	  setErrors(newErrors);
	};


{/* ----------------------------------------------------------------------------------------------------------- */}
{/* ... */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	const handleChangeVehicule = e => {
	  setForm({ ...form, [e.target.name]: e.target.value });
	};



{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Calcul automatique de l'heure d'arrivée */}
{/* ----------------------------------------------------------------------------------------------------------- */}
useEffect(() => {
  if (formData.heure_depart && duree) {
    const [hours, minutes] = formData.heure_depart.split(':').map(Number);
    const departureDate = new Date();
    departureDate.setHours(hours);
    departureDate.setMinutes(minutes);
    departureDate.setSeconds(0);

    // Ajout de la durée estimée
    departureDate.setMinutes(departureDate.getMinutes() + parseInt(duree));

    // Format en "HH:mm"
    const arrivalHour = departureDate.toTimeString().slice(0, 5);

    setFormData(prev => ({
      ...prev,
      heure_arrivee: arrivalHour
    }));
  }
}, [formData.heure_depart, duree]);


{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Calcul automatique de la date d'arrivée */}
{/* ----------------------------------------------------------------------------------------------------------- */}
useEffect(() => {
  if (formData.date_depart && formData.heure_depart && duree) {
    const [year, month, day] = formData.date_depart.split('-').map(Number);
    const [hours, minutes] = formData.heure_depart.split(':').map(Number);

    const departDate = new Date(year, month - 1, day, hours, minutes);

    // Ajout de la durée
    departDate.setMinutes(departDate.getMinutes() + parseInt(duree));

    // Format en "YYYY-MM-DD"
    const arrivalDate = departDate.toISOString().slice(0, 10);

    setFormData(prev => ({
      ...prev,
      date_arrivee: arrivalDate,
    }));
  }
}, [formData.date_depart, formData.heure_depart, duree]);


console.log(token);
{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Submit Nouveau trajet */}
{/* ----------------------------------------------------------------------------------------------------------- */} 
	const handleSubmit = async (e) => {
	  e.preventDefault();
	  setFormSubmitted(true);

	  // Étape 1 : valider les villes
	  const departIsValid = isCityValid(formData.depart, departSuggestions);
	  const destinationIsValid = isCityValid(formData.destination, destinationSuggestions);
	  setDepartValid(departIsValid);
	  setDestinationValid(destinationIsValid);

	  if (!departIsValid || !destinationIsValid) {
		setMessage("Veuillez corriger les villes de départ et d'arrivée.");
		return;
	  }

	  // Ajoute duree et distance dans formData au moment d'envoyer
		const dataToSend = {
		  ...formData,
		  duree_minutes: duree,   // durée en minutes
		  distance_km: distance      // distance en km
		};

	  // Étape 2 : valider l'ensemble du formulaire
	  const newErrors = validateFormData(formData);
	  setErrors(newErrors);

	  if (Object.keys(newErrors).length > 0) {
		setMessage("Veuillez corriger les erreurs dans le formulaire.");
		return;
	  }
	  
	  // Étape 3 : envoyer la requête à l’API
	  setLoading(true);
	  setMessage('');

	  try {
		const response = await fetch(`${API_URL}/api/create_trajet`, {
		  method: 'POST',
		  headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify(dataToSend), 
		});

		if (!response.ok) throw new Error("Erreur lors de la création du trajet");

		const data = await response.json();

		setMessage("Trajet créé avec succès !");
		setTrajets(prev => [...prev, data]);
	  } catch (err) {
		console.error(err);
		setMessage(err.message);
	  } finally {
		setLoading(false);
	  }
	};

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Ajouter Nouvelle Voiture */}
{/* ----------------------------------------------------------------------------------------------------------- */} 
  const handleVehiculeSubmit = e => {
    e.preventDefault();
    // Validation simple
    if (!form.marque || !form.modele || !form.nb_place || !form.immatriculation || !form.couleur || !form.energie) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    fetch(`${API_URL}/api/voiture/utilisateur`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        marque: form.marque,
        modele: form.modele,
        nb_place: parseInt(form.nb_place, 10),
        immatriculation: form.immatriculation,
        couleur: form.couleur
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de l\'ajout du véhicule');
        return res.json();
      })
      .then(newVehicule => {
        setVehicules(prev => [...prev, newVehicule]);
        setForm({ marque: '', modele: '', nb_place: '', immatriculation: '', couleur: '' });
      })
      .catch(err => setError(err.message));
  };

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Supprimer Voiture Existante */}
{/* ----------------------------------------------------------------------------------------------------------- */} 
  const handleDeleteVehicle = id => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;

    fetch(`${API_URL}/api/voiture/utilisateur${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de la suppression');
        setVehicules(prev => prev.filter(v => v.id !== id));
      })
      .catch(err => setError(err.message));
  };



{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Afficher les préférences de base */}
{/* ----------------------------------------------------------------------------------------------------------- */}
  function handleStandardPreferencesChange(event) {
    const { name, checked } = event.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked,
    }));
  }

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Enregistrer les préférences de base */}
{/* ----------------------------------------------------------------------------------------------------------- */}
const handleSubmitStandardPreferences = (e) => {
  e.preventDefault();

  // fetch('/api/preferences', { method: 'POST', body: JSON.stringify(preferences) })
};


{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Ajouter une préférence personnalisée */}
{/* ----------------------------------------------------------------------------------------------------------- */}
const handleAddCustomPreference = (e) => {
  e.preventDefault();
  if (customPreference.trim()) {
    setCustomPreferences((prev) => [...prev, customPreference.trim()]);
    setCustomPreference('');
  }
};

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Afficher les préférences personnalisées */}
{/* ----------------------------------------------------------------------------------------------------------- */}
  function handleStandardPreferencesChange(event) {
    const { name, checked } = event.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked,
    }));
  }
  
{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Créer les préférences personnalisées */}
{/* ----------------------------------------------------------------------------------------------------------- */}


{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Supprimer une préférence personnalisée */}
{/* ----------------------------------------------------------------------------------------------------------- */}
const handleDeleteCustomPreference = (index) => {
  setCustomPreferences((prev) => prev.filter((_, i) => i !== index));
};



{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Chargement */}
{/* ----------------------------------------------------------------------------------------------------------- */}
if (loading) {
  return (
	<div className="mt-4">
	  {/* 🔄 Loading */}
	  <div className="text-center mt-5">
		<div className="spinner-border text-primary" role="status" />
		<p className="mt-3">Chargement en cours...</p>
	  </div>
	</div>
  );
}






{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Autocomplétion formulaire villes et adresses */}
{/* ----------------------------------------------------------------------------------------------------------- */}
function FormWithAutocomplete() {
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [departCoords, setDepartCoords] = useState(null);
  const [arriveeCoords, setArriveeCoords] = useState(null);

  // Passer une fonction fetchSuggestions à AutocompleteInput
  const fetchSuggestions = async (query) => {
    const results = await fetchCityAddressSuggestions(query);
    return results;
  };
}







{/* ----------------------------------------------------------------------------------------------------------- */}
{/*AFFICHAGE FRONT*/}
{/* ----------------------------------------------------------------------------------------------------------- */} 

	return (

		<div className="row">

			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Colonne gauche - création trajet */}
			{/* ----------------------------------------------------------------------------------------------------------- */} 
			<div className="col-md-5">
			  
				{(userRole === 1 || userRole === 3) ? (
				  <div className="card mb-4">
					<div className="card-header">Créer un trajet</div>
					<div className="card-body">
					  
					<form onSubmit={handleSubmit}>
					  
						{/* Ville de départ */}
						<div className="mb-2">
						  <label htmlFor="depart" className="form-label h6">Ville de départ</label>
						  <input
							type="text"
							id="depart"
							name="depart"
							value={formData.depart}
							onChange={handleChange}
							list="depart-list"
							className={`form-control ${!departValid && formSubmitted && formData.depart.trim() !== '' ? 'is-invalid' : ''}`}
							required
						  />
						  <datalist id="depart-list">
							{departSuggestions.map((city, i) => (
							  <option key={i} value={city} />
							))}
						  </datalist>
						  {!departValid && formSubmitted && formData.depart.trim() !== '' && (
							<div className="invalid-feedback">Ville non reconnue</div>
						  )}
						</div>


						{/* Adresse départ */}
						<div className="mb-2 position-relative">
						  <label htmlFor="adresse_depart" className="form-label h6">Lieu de départ</label>
						  <input
							type="text"
							id="adresse_depart"
							name="adresse_depart"
							value={formData.adresse_depart}
							onChange={handleDepartChange} // modifié ici
							className={`form-control ${errors.adresse_depart ? 'is-invalid' : ''}`}
							autoComplete="off"
							required
						  />
						  {errors.adresse_depart && (
							<div className="invalid-feedback">{errors.adresse_depart}</div>
						  )}

						  {/* Suggestions d'adresses (ul) */}
						  {adresseDepartSuggestions.length > 0 && (
							<ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
							  {adresseDepartSuggestions.map((suggestion, i) => (
								<li
								  key={i}
								  className="list-group-item list-group-item-action"
								  style={{ cursor: 'pointer' }}
								  onClick={async () => {
									// Remplit le champ avec la suggestion choisie
									setFormData(prev => ({ ...prev, adresse_depart: suggestion }));
									setAdresseDepartSuggestions([]);

									// Récupère les coordonnées
									const coords = await getCoordinatesFromAddress(suggestion);
									if (coords) {
									  setStartCoords([coords.lon, coords.lat]);
									}
								  }}
								>
								  {suggestion}
								</li>
							  ))}
							</ul>
						  )}
						</div>

						{/* Ville arrivée */}
						<div className="mb-2">
						  <label htmlFor="destination" className="form-label h6">Destination</label>
						  <input
							type="text"
							id="destination"
							name="destination"
							value={formData.destination}
							onChange={handleChange}
							list="destination-list"
							className={`form-control ${!destinationValid && formSubmitted && formData.destination.trim() !== '' ? 'is-invalid' : ''}`}
							required
						  />
						  <datalist id="destination-list">
							{destinationSuggestions.map((city, i) => (
							  <option key={i} value={city} />
							))}
						  </datalist>
						  {!destinationValid && formSubmitted && formData.destination.trim() !== '' && (
							<div className="invalid-feedback">Ville non reconnue</div>
						  )}
						</div>

						{/* Adresse arrivée */}
						<div className="mb-2">
						  <label htmlFor="adresse_arrivee" className="form-label h6">Lieu d'arrivée</label>
						  <input
							type="text"
							id="adresse_arrivee"
							name="adresse_arrivee"
							value={formData.adresse_arrivee}
							onChange={handleChange}
							className={`form-control ${errors.adresse_arrivee ? 'is-invalid' : ''}`}
							required
						  />
						  {errors.adresse_arrivee && <div className="invalid-feedback">{errors.adresse_arrivee}</div>}
						</div>

					  {/* Date de départ */}
					  <div className="mb-2">
						<label htmlFor="date_depart" className="form-label h6">Date de départ</label>
						<input
						  id="date_depart"
						  className="form-control"
						  required
						  type="date"
						  name="date_depart"
						  value={formData.date_depart}
						  min={new Date().toISOString().split('T')[0]} 		// Date d'aujourd'hui ou supérieure 
						  onChange={handleChange}
						/>
					  </div>

					  {/* Heure de départ */}
					  <div className="mb-2">
						<label htmlFor="heure_depart" className="form-label h6">Heure de départ</label>
						<input
						  type="time"
						  id="heure_depart"
						  name="heure_depart"
						  value={formData.heure_depart}
						  onChange={handleChange}
						  className="form-control"
						  required
						/>
					  </div>

					  {/* Date d'arrivée */}
					  <div className="mb-2">
						<label htmlFor="date_arrivee" className="form-label h6">Date d'arrivée<em>(renseigné automatiquement)</em></label>
						<input
						  type="date"
						  id="date_arrivee"
						  name="date_arrivee"
						  value={formData.date_arrivee}
						  min={new Date().toISOString().split('T')[0]} 		// Date d'aujourd'hui ou supérieure
						  onChange={handleChange}
						  className="form-control"
						  required
						  disabled
						  readOnly
						/>
					  </div>

						{/* Heure d'arrivée */}
						<div className="mb-2">
							<label htmlFor="heure_arrivee" className="form-label h6">Heure d'arrivée<em>(renseigné automatiquement)</em></label>
							<input
								type="time"
								id="heure_arrivee"
								name="heure_arrivee"
								value={formData.heure_arrivee}
								onChange={handleChange}
								className={`form-control ${errors.heure_arrivee ? 'is-invalid' : ''}`}
							required
							disabled
							readOnly
						  />
						  {errors.heure_arrivee && (
							<div className="text-danger small">{errors.heure_arrivee}</div>
						  )}
						</div>

					  {/* Durée */}
					  <div className="mb-2">
						<label htmlFor="duree" className="form-label h6">Durée (min) <em>(renseigné automatiquement)</em></label>
						<input
						  placeholder="Durée (min)"
						  type="number"
						  id="duree"
						  name="duree"
						  value={duree}
						  onChange={handleChange}
						  className="form-control"
						  required
					      disabled
						  readOnly
						/>
					  </div>
					  
					  {/* Distance */}
					  <div className="mb-2">
						<label htmlFor="distance" className="form-label h6">Distance (km) <em>(renseigné automatiquement)</em></label>
						<input
						  placeholder="Distance (km)"
						  type="number"
						  id="distance"
						  name="distance"
						  value={distance}
						  onChange={handleChange}
						  className="form-control"
						  required
					      disabled
						  readOnly
						/>
					  </div>

					  {/* Nombre de places */}
					  <div className="mb-2">
						<label htmlFor="places" className="form-label h6">Nombre de places <em>(non modifiable)</em></label>
						<input
						  type="number"
						  id="places"
						  name="places"
						  min="1"
						  max="10"
						  value={formData.places}
						  onChange={handleChange}
						  className="form-control"
						  required
						  disabled
						/>
					  </div>

					  {/* Prix par personne */}
					  <div className="mb-2">
						<label htmlFor="prix" className="form-label h6">Prix par personne (crédits)</label>
						<input
						  type="number"
						  id="prix"
						  name="prix"
						  min="0"
						  max="500"
						  value={formData.prix}
						  onChange={handleChange}
						  className="form-control"
						  required
						/>
					  </div>

					  {/* Véhicule */}
					  <div className="mb-3">
						<label htmlFor="vehicule_id" className="form-label h6">Véhicule</label>
						<select
						  id="vehicule_id"
						  name="vehicule_id"
						  value={formData.vehicule_id}
						  onChange={handleChange}
						  className="form-select"
						  required
						>
						  <option value="">-- Sélectionnez un véhicule --</option>
						  {vehicules.map(v => (
							<option key={v.voiture_id} value={v.voiture_id}>
							  {v.marque?.marque ?? 'Marque inconnue'} {v.modele}
							</option>
						  ))}
						</select>
					  </div>

						{/* Carte insérée juste avant le bouton */}
						<MapComponent
						  departCity={formData.depart}
						  arriveeCity={formData.destination}
						  setDuree={setDuree}
						  setDistance={setDistance}
						/>

					  {/* Bouton de soumission */}
					  <button type="submit" className="btn btn-success w-100">Créer le trajet</button>
					  
					</form>

					{message && <div className="alert alert-success mt-4">{message}</div>}

					</div>
				  </div>
				) : (
				  <div className="alert alert-info">Connectez-vous en tant que chauffeur pour créer un trajet.</div>
				)}
			</div>

			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Colonne droite - historique trajets */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
			<div className="col-md-7">
				<div className="card mb-4">
				<div className="card-header">Historique des trajets</div>

				{trajets.length === 0 ? (
				  <p>Aucun trajet trouvé.</p>
				) : (
				  <ul>
					{trajets.map((t, index) => (
					  <li key={index} className="list-unstyled" style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem', inter: '1rem' }}>
						<p><strong>{t.ville_depart}</strong> → <strong>{t.ville_arrivee}</strong></p>
						<p>Le {t.date_depart} à {t.heure_depart}</p>
						<p>Rôle : {t.role !== 2 ? "Chauffeur" : "Passager"}</p>
						
						{/* Affichage du statut et des places selon le rôle */}
						{t.role !== 2 ? (
						  <>
							<p>Statut : {t.statut?.statutCovoiturage ?? 'Inconnu'}</p>
							<p>Place(s) restante(s) : {t.places}</p>
						  </>
						) : (
						  <>
							<p>Statut : {t.statut?.statutReservation ?? 'Inconnu'}</p>
							<p>Nb de place(s) réservée(s) : {t.places}</p>
						  </>
						)}
						
						{/* Paiement uniquement pour les passagers */}
						{t.role === 2 && (
							<p>Paiement : {t.paye ? "Effectué" : "Non payé"}</p>
						)}
						
						{t.voiture && (
						  <p>Voiture : {t.voiture.marque?.marque ?? 'Inconnue'} {t.voiture.modele}</p>
						)}
						
						
						{/* Boutons selon le statut et le rôle */}
						{t.role !== 2 ? (
						  // Chauffeur
						  <>
						{t.statut?.statutCovoiturage === 'À VENIR' && (
						  <>
							<button className="btn btn-warning" disabled>En attente de passager</button>
							<button className="btn btn-secondary ms-2">Annuler réservation</button>
						  </>
						)}

						{t.statut?.statutCovoiturage === 'CONFIRMÉ' && (
						  <>
							<button
							  className="btn btn-primary"
							  disabled={new Date(t.date_depart) > new Date()}
							>
							  Démarrer le trajet
							</button>
							<button className="btn btn-secondary ms-2">Annuler réservation</button>
						  </>
						)}

							{t.statut?.statutCovoiturage === 'EN COURS' && (
							  <button className="btn btn-success">Terminer le trajet</button>
							)}

							{t.statut?.statutCovoiturage === 'TERMINÉ' && (
							  <button className="btn btn-secondary" disabled>
								Trajet réalisé, paiement à venir
							  </button>
							)}

							{t.statut?.statutCovoiturage === 'CLÔTURÉ' && (
							  <button className="btn btn-secondary" disabled>
								Trajet réalisé et payé
							  </button>
							)}

							{t.statut?.statutCovoiturage === 'ANNULÉ' && (
							  <button className="btn btn-danger" disabled>Trajet annulé</button>
							)}
						  </>
						) : (
						  // Passager
						  <>
							{t.statut?.statutReservation === 'VALIDÉ' && (
							  <button className="btn btn-secondary">Annuler réservation</button>
							)}

							{t.statut?.statutReservation === 'TERMINÉ À PAYER' && (
							  <button className="btn btn-warning">Trajet réalisé, paiement à réaliser</button>
							)}

							{t.statut?.statutReservation === 'TERMINÉ PAYÉ' && (
							  <button className="btn btn-secondary" disabled>Trajet réalisé et payé</button>
							)}
							
							{t.statut?.statutReservation === 'ANNULÉ' && (
							  <button className="btn btn-secondary" disabled>Trajet annulé</button>
							)}
						  </>
						)}
						
						
					  </li>
					))}
				  </ul>
				)}
				</div>
			</div>

			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Section évaluations chauffeur */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
			<div className="col-md-5">
			
			{(userRole === 1 || userRole === 3) ? (
			  <div className="card mb-4">
				<div className="card-header">Notes et évaluations</div>
				<div className="card-body">
				  <section className="mt-3" aria-labelledby="titre-evaluations">
					<h4 id="titre-evaluations">Notes et évaluations</h4>

					<p>
					  <strong>Note moyenne :</strong> {noteMoyenne ? noteMoyenne.toFixed(1) + '/5' : 'N/A'}
					</p>

					{evaluations.length === 0 ? (
					  <p>Aucune évaluation pour le moment.</p>
					) : (
					  <ul className="list-unstyled">
						{evaluations.map((e) => (
						  <li key={e.note_id}>
							<article className="card mb-3" aria-label={`Évaluation de ${e.pseudo_utilisateur}`}>
							  <div className="card-body">
								<header className="card mb-2 bg-success text-white">
								  <p className="mb-0 ps-3">
									<strong>{e.pseudo_utilisateur}</strong> -{' '}
									<time dateTime={new Date(e.date_note).toISOString()}>
									  {new Date(e.date_note).toLocaleDateString('fr-FR')}
									</time>
								  </p>
								</header>

								<p className="mb-1"><strong>Note :</strong> {e.note}/5</p>
								<p className="mb-0">
								  <strong>Commentaire :</strong> {e.commentaire?.trim() || <em>Pas de commentaire</em>}
								</p>
							  </div>
							</article>
						  </li>
						))}
					  </ul>
					)}
				  </section>
				</div>
			  </div>
			  
			) : (
			  <div className="alert alert-info">Connectez-vous en tant que chauffeur pour disposer d'avis</div>
			)}
			  
			</div>

		{/* ----------------------------------------------------------------------------------------------------------- */}
		{/* Gestion des voitures */}
		{/* ----------------------------------------------------------------------------------------------------------- */}
			<div className="col-md-7">
			{(userRole && (userRole === 1 || userRole === 3)) ? (
				<div className="card mb-4">
				  <div className="card-header">Gérer mes véhicules</div>
				  <div className="card-body">
				  
					<form onSubmit={handleVehiculeSubmit}>
					
					  <div className="mb-2">
						<label htmlFor="marque" className="form-label h6">Marque</label>
						<input name="marque" className="form-control" value={newVehicule.marque} onChange={handleInputChange} required />
					  </div>
					  
					  <div className="mb-2">
						<label htmlFor="modele" className="form-label h6">Modèle</label>
						<input name="modele" className="form-control" value={newVehicule.modele} onChange={handleInputChange} required />
					  </div>
					  
					  <div className="mb-2">
						<label htmlFor="nb_places" className="form-label h6">Nombre de places</label>
						<input type="number" name="nb_places" className="form-control" value={newVehicule.nb_places} onChange={handleInputChange} required />
					  </div>
					  
					  <div className="mb-2">
						<label htmlFor="immatriculation" className="form-label h6">Immatriculation</label>
						<input name="immatriculation" className="form-control" value={newVehicule.immatriculation} onChange={handleInputChange} required />
					  </div>
					  
					  <div className="mb-2">
						<label htmlFor="couleur" className="form-label h6">Couleur</label>
						<input name="couleur" className="form-control" value={newVehicule.couleur} onChange={handleInputChange} required />
					  </div>
					  
					  <div className="form-check form-switch mb-2">
						<input
						  className="form-check-input"
						  type="checkbox"
						  id="electriqueSwitch"
						  checked={isElectrique}
						  onChange={handleToggle}
						/>
						<label className="form-check-label" htmlFor="electriqueSwitch">
						  Électrique
						</label>
					  </div>

					  <div className="mb-2">
						<label htmlFor="energie" className="form-label h6">Énergie</label>
						<input
						  name="energie"
						  className="form-control"
						  value={newVehicule.energie}
						  onChange={handleInputChange}
						  disabled={isElectrique}
						  required
						/>
					  </div>
					  
					  <button type="submit" className="btn btn-success w-100">Ajouter</button>
					  
					</form>
					
					<hr />
					<h6>Mes véhicules</h6>
					{vehicules.length === 0 ? (
					  <p className="text-muted">Pas de véhicule enregistré</p>
					) : (
					  <ul className="list-group">
						{vehicules.map(v => (
						  <li key={v.voiture_id} className="list-group-item d-flex justify-content-between align-items-center">
							{v.marque?.marque ?? v.marque} {v.modele} ({v.nb_places} places) ({v.couleur}) ({v.energie}) ({v.immatriculation})
							<button className="btn btn-sm btn-danger" onClick={() => handleDeleteVehicle(v.voiture_id)}>Supprimer</button>
						  </li>
						))}
					  </ul>
					)}
				  </div>
				</div>
				) : (
				  <div className="alert alert-info">Connectez-vous en tant que chauffeur pour gérer les voitures</div>
				)}
			</div>

			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Gestion des préférences utilisateurs */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
			{(userRole && (userRole === 1 || userRole === 3)) ? (
				<div className="col-md-5">
				<div className="card mb-4">
				  <div className="card-header">Gérer mes préférences</div>
				  <div className="card-body">

					{/* Préférences fixes */}
					<h6>Préférences de trajet</h6>
					<form onSubmit={handleSubmitStandardPreferences}>
					  <div className="form-check form-switch mb-2">
						<input
						  className="form-check-input"
						  type="checkbox"
						  id="musique"
						  name="musique"
						  checked={preferences.musique}
						  onChange={handleStandardPreferencesChange}
						/>
						<label className="form-check-label" htmlFor="🎵​ Mmusique">Musique</label>
					  </div>

					  <div className="form-check form-switch mb-2">
						<input
						  className="form-check-input"
						  type="checkbox"
						  id="conversation"
						  name="conversation"
						  checked={preferences.conversation}
						  onChange={handleStandardPreferencesChange}
						/>
						<label className="form-check-label" htmlFor="conversation">Conversation</label>
					  </div>

					  <div className="form-check form-switch mb-2">
						<input
						  className="form-check-input"
						  type="checkbox"
						  id="fumeur"
						  name="fumeur"
						  checked={preferences.fumeur}
						  onChange={handleStandardPreferencesChange}
						/>
						<label className="form-check-label" htmlFor="fumeur">Fumeur</label>
					  </div>

					  <div className="form-check form-switch mb-3">
						<input
						  className="form-check-input"
						  type="checkbox"
						  id="animal"
						  name="animal"
						  checked={preferences.animal}
						  onChange={handleStandardPreferencesChange}
						/>
						<label className="form-check-label" htmlFor="animal">Animaux acceptés</label>
					  </div>

					  <button type="submit" className="btn btn-success w-100 mb-3">Enregistrer les préférences</button>
					</form>

					<hr />

					{/* Préférences personnalisées */}
					<h6>Préférences personnalisées</h6>
					<form onSubmit={handleAddCustomPreference} className="d-flex mb-3">
					  <input 
						type="text" 
						className="form-control me-2" 
						placeholder="Ajouter une préférence..." 
						value={customPreference} 
						onChange={(e) => setCustomPreference(e.target.value)} 
						required 
					  />
					  <button type="submit" className="btn btn-success">Ajouter</button>
					</form>

					<ul className="list-group">
					  {customPreferences.map((pref, index) => (
						<li key={index} className="list-group-item d-flex justify-content-between align-items-center">
						  {pref}
						  <button 
							className="btn btn-sm btn-danger" 
							onClick={() => handleDeleteCustomPreference(index)}
						  >
							Supprimer
						  </button>
						</li>
					  ))}
					</ul>

					<hr />
					
					{/* Autres préférences non encore affichées */}
					<h6>Préférences optionnelles</h6>
					<ul className="list-group">
					  {(preferences.optionnelles && preferences.optionnelles.length === 0) ? (
						<li className="list-group-item">Aucune préférence personnalisée ajoutée</li>
					  ) : (
						preferences.optionnelles && preferences.optionnelles.map((pref, index) => (
						  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
							{pref}
							<button 
							  className="btn btn-sm btn-danger" 
							  onClick={() => handleDeletePreference(pref)} // Suppression de la préférence
							>
							  Supprimer
							</button>
						  </li>
						))
					  )}
					</ul>

				  </div>
				</div>
				</div>
			) : (
				<div className="alert alert-info">Connectez-vous en tant que chauffeur pour gérer les préférences</div>
			)}

		</div>

	);
	
};

export default HistoriqueTrajet;
