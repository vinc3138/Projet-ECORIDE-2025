import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/authToken';
import { validateFormData } from '../utils/checkNewTrajet';
import { getCitySuggestions, isCityValid } from '../utils/listeVilleTrajet';
import MapComponent from '../context/USERMapTrajet';


const HistoriqueTrajet = () => {
  
	const API_URL = import.meta.env.VITE_API_URL;
 
    
	// Bouton de filtres des trajets affichés
	const [activeButton, setActiveButton] = useState("tous");
 
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
	
	
	// Notes utilisateurs
	const [evaluations, setEvaluations] = useState([]);
	const [noteMoyenne, setNoteMoyenne] = useState(null);
	
	
	// Véhicules
	const [vehicules, setVehicules] = useState([]);
	const [formVehicule, setFormVehicule] = useState(false);
	const [newVehicule, setNewVehicule] = useState({
		marque: '',
		modele: '',
		nb_place: '',
		immatriculation: '',
		date_immatriculation: '',
		couleur: '',
		energie: '',
		});
	const [isElectrique, setIsElectrique] = useState(false);
	const [marques, setMarques] = useState([]);
	
	
	// Préférences chauffeur
	const initialPreferences = {
	musique: false,
	conversation: false,
	fumeur: false,
	animal: false,
	optionnelles: []  // Tableau pour les préférences optionnelles
	};
	const [newPreference, setNewPreference] = useState('');
		
	// Page déroulante - Gestion des voitures	
	const [voitureOpen, setVoitureOpen] = useState(true);
	
	// Récupérer la voiture sélectionnée selon formData.vehicule_id
	const voitureSelectionnee = vehicules.find(v => v.id === parseInt(formData.vehicule_id, 10));

	
	// Suggestions villes et adresses
	const [departSuggestions, setDepartSuggestions] = useState([]);
	const [destinationSuggestions, setDestinationSuggestions] = useState([]);
	const [adresseDepartSuggestions, setAdresseDepartSuggestions] = React.useState([]);
	const [adresseDestinationSuggestions, setAdresseDestinationSuggestions] = React.useState([]);
	
	// Validations
	const [departValid, setDepartValid] = useState(true);
	const [destinationValid, setDestinationValid] = useState(true);
	const [errors, setErrors] = useState({});
	
	// Messages et erreurs Voiture
	const [voitureSuccess, setVoitureSuccess] = useState('');
	const [voitureError, setVoitureError] = useState('');

	// Messages et erreurs Preference
	const [preferenceSuccess, setPreferenceSuccess] = useState('');
	const [preferenceError, setPreferenceError] = useState('');

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

	// Commentaires et note rédigés par le passager
	const [commentaire, setCommentaire] = useState('');
	const [note, setNote] = useState('');

  // Récupération du token stocké en local
    const token = localStorage.getItem('jwt_token');

  // Récupération des données du chauffeur
    const user = JSON.parse(localStorage.getItem('user'));



	// Affichage du filtre sélectionné pour l'affichage des trajets
	const handleClick = (buttonName) => {
	setActiveButton(buttonName);
	};




	
	// Fonction qui retourne les trajets filtrés uniquement (tous, archivés, actions à faire, à venir)
	const filteredTrajets = () => {
		switch(activeButton) {
		
		case "tous":
		  return trajets;
		
		case "archives": // trajets terminés ou annulés
		  return trajets.filter(t => 
			t.statut.statutCovoiturage === "CLÔTURÉ" || 
			t.statut.statutCovoiturage === "ANNULÉ" || 
			t.statut.statutReservation === "TERMINÉ PAYÉ" ||
			t.statut.statutReservation === "CLÔTURÉ"
		  );
		
		case "actions": 												// trajets à débuter, à terminer ou à payer
		  const today = new Date();
		  today.setHours(0, 0, 0, 0);

		  return trajets.filter(t => {
			if (t.statut.statutCovoiturage === "ANNULÉ") return false;

			const depart = new Date(t.date_depart);
			depart.setHours(0, 0, 0, 0);

			return (
			  t.statut.statutReservation !== 'TERMINÉ SIGNALÉ' && 
			  t.statut.statutReservation !== "CLÔTURÉ" &&
			  t.statut.statutReservation !== "TERMINÉ PAYÉ" && "chauffeur" in t &&
			  (t.statut.statutCovoiturage === "EN COURS" ||            								// Chauffeur
			  (t.statut.statutCovoiturage === "TERMINÉ" && "passagers" in t) ||						// Passager
			  depart <= today)                                        								// Chauffeur
			);
		  });
		
		case "avenir":
			return trajets.filter(t => {
			    const today = new Date();
			    today.setHours(0, 0, 0, 0);
				
				const depart = new Date(t.date_depart);
				depart.setHours(0, 0, 0, 0);							 // Ignorer l'heure

				const statutValide = t.statut.statutCovoiturage === "À VENIR" || t.statut.statutCovoiturage === "CONFIRMÉ";
				return statutValide && depart >= today;
			});
		
		case "paiement":
			return trajets.filter(t => {

				return (
					t.statut.statutCovoiturage === 'TERMINÉ'
				);
				
			});

		case "signale":
			return trajets.filter(t => {

				return (
					t.statut.statutReservation === 'TERMINÉ SIGNALÉ'
				);
				
			});
		
		default:
		  return trajets;
		}
	};
	
	
	
	// Création d'un nouveau véhicule
	const handleInputChange = (e) => {
	  const { name, value } = e.target;

	  if (name === 'nb_places') {
	  	const intValue = parseInt(value, 10);
	  	if (intValue < 1) return;
	  }

	  setNewVehicule(prev => ({
		...prev,
		[name]: value,
	  }));
	};


	// Token
	useEffect(() => {
	if (token) {
	  try {
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


	
	const fetchVehicules = () => {

	fetch(`${API_URL}/api/liste_voiture_chauffeur`, {
	  headers: {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
	  },
	})
	  .then(res => {
		if (!res.ok) throw new Error("Erreur lors du chargement des véhicules");
		return res.json();
	  })
	  .then(data => {
		setVehicules(data);
	  })
	  .catch(err => console.error(err));
	};
	
{/* ----------------------------------------------------------------------------------------------------------- */}


	useEffect(() => {
	  
	  if (!token) return;

		{/* ----------------------------------------------------------------------------------------------------------- */}
		{/* Fetch Trajets */}
		{/* ----------------------------------------------------------------------------------------------------------- */} 
			const fetchTrajetData = async () => {
			  try {
				const res = await fetch(`${API_URL}/api/trajets/historique`, {
				  headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				  },
				});

				if (!res.ok) throw new Error("Erreur lors du chargement des trajets");

				const trajets = await res.json();
				setTrajets(trajets);
			  } catch (err) {
				console.error(err);
				setMessage(err.message);
			  }
			};
			fetchTrajetData();
			
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
		



			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Fetch User */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
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



					{/* ----------------------------------------------------------------------------------------------------------- */}
					{/* Fetch Voiture */}
					{/* ----------------------------------------------------------------------------------------------------------- */} 
						
						// Appel du fetch Voiture
						fetchVehicules();


				  // -----------------------------------------------------------------------------------------------------------
				  // Fetch Préférences
				  // -----------------------------------------------------------------------------------------------------------
					const fetchPreferences = () => {
					  fetch(`${API_URL}/api/liste_preference_chauffeur`, {
						method: 'GET',
						headers: {
						  Authorization: `Bearer ${token}`,
						  'Content-Type': 'application/json',
						},
					  })
					  .then(res => {
						if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
						return res.json();
					  })
					  .then(preferencesData => {
						const initialPreferences = {
						  musique: false,
						  conversation: false,
						  fumeur: false,
						  animal: false,
						  optionnelles: [],
						};

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
								if (pref.statutPreference === "OPTIONNEL") {
								  // On push l'objet complet ici (et pas juste la string)
								  initialPreferences.optionnelles.push(pref);
								}
								break;
							}
						  });
						} else {
						  console.error('La clé "preferences" ne contient pas un tableau valide');
						}

						setPreferences(initialPreferences);
					  })
					  .catch(err => {
						setError('Erreur lors du chargement des préférences');
						console.error("Erreur Fetch Préférences : ", err);
					  });
					};

					// Appel du fetchPreferences
					fetchPreferences();
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
		  duree_minutes: duree,  	 // durée en minutes
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
{/* Fetch Trajets */}
{/* ----------------------------------------------------------------------------------------------------------- */} 
	const fetchUpdateTrajetData = async () => {
	  try {
		const res = await fetch(`${API_URL}/api/trajets/historique`, {
		  headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		  },
		});

		if (!res.ok) throw new Error("Erreur lors du chargement des trajets");

		const trajets = await res.json();
		setTrajets(trajets);
	  } catch (err) {
		console.error(err);
		setMessage(err.message);
	  }
	};

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* MàJ statut trajet - Annulation d'un covoiturage */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	async function handleCancelCovoiturage(covoiturageId) {

	  try {

			// Appeler l'API pour mettre à jour le statut en "Annulé"
			const response = await fetch(`${API_URL}/api/maj_statut_trajet`, {
				
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				
				body: JSON.stringify({
					covoiturage_id: covoiturageId,
					chauffeur_id: user,
					action: 'Annuler'
				}),
				
			});

			if (!response.ok) {
				
			  throw new Error('Erreur lors de l\'annulation');
			  
			}

			alert('Réservation annulée avec succès !');

			await fetchUpdateTrajetData();
		
		} catch (error) {
		  
			alert('Erreur : ' + error.message);
		
		}

	}
{/* ----------------------------------------------------------------------------------------------------------- */}

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* MàJ statut trajet - Démarrage d'un covoiturage */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	async function handleDebutCovoiturage(covoiturageId) {

	  try {

			// Appeler l'API pour mettre à jour le statut en "Annulé"
			const response = await fetch(`${API_URL}/api/maj_statut_trajet`, {
				
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				
				body: JSON.stringify({
					covoiturage_id: covoiturageId,
					chauffeur_id: user,
					action: 'Commencer'
				}),
				
			});

			if (!response.ok) {
				
			  throw new Error('Erreur lors du début du covoiturage');
			  
			}

			alert('Covoiturage débuté avec succès !');

			await fetchUpdateTrajetData();
		
		} catch (error) {
		  
			alert('Erreur : ' + error.message);
		
		}

	}
{/* ----------------------------------------------------------------------------------------------------------- */}

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* MàJ statut trajet - Fin d'un covoiturage */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	async function handleFinCovoiturage(covoiturageId) {

	  try {

			// Appeler l'API pour mettre à jour le statut en "Annulé"
			const response = await fetch(`${API_URL}/api/maj_statut_trajet`, {
				
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				
				body: JSON.stringify({
					covoiturage_id: covoiturageId,
					chauffeur_id: user,
					action: 'Terminer'
				}),
				
			});

			if (!response.ok) {
				
			  throw new Error('Erreur lors de la fin du covoiturage');
			  
			}

			alert('Covoiturage terminé avec succès !');

			await fetchUpdateTrajetData();
		
		} catch (error) {
		  
			alert('Erreur : ' + error.message);
		
		}

	}
{/* ----------------------------------------------------------------------------------------------------------- */}


{/* ----------------------------------------------------------------------------------------------------------- */}
{/* MàJ statut trajet - Annulation d'une réservation */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	async function handleAnnulerReservation(covoiturageId) {

	  try {

			// Appeler l'API pour mettre à jour le statut en "Annulé"
			const response = await fetch(`${API_URL}/api/maj_statut_trajet`, {
				
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				
				body: JSON.stringify({
					covoiturage_id: covoiturageId,
					chauffeur_id: user,
					action: 'Annuler'
				}),
				
			});

			if (!response.ok) {
				
			  throw new Error('Erreur lors de l\'annulation');
			  
			}

			alert('Réservation annulée avec succès !');

			await fetchUpdateTrajetData();
		
		} catch (error) {
		  
			alert('Erreur : ' + error.message);
		
		}

	}
{/* ----------------------------------------------------------------------------------------------------------- */}

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* MàJ statut trajet - Paiement d'une réservation */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	async function handlePayerReservation(reservationId, covoiturageId) {

	  try {

			// Appeler l'API pour mettre à jour le statut en "TERMINÉ PAYÉ"
			const response = await fetch(`${API_URL}/api/avis_ou_signalement`, {
				
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				
				body: JSON.stringify({
					reservation_id: reservationId,
					covoiturage_id: covoiturageId,
					passager_id: user,
					action: 'Payer',
					commentaire: commentaire,
					note: note
				}),
				
			});

			if (!response.ok) {
				
			  throw new Error('Erreur lors du début du covoiturage');
			  
			}

			alert('Avis enregistré avec succès, et le paiement a bien été réalisé. Une validation de l\'avis est en cours');

			await fetchUpdateTrajetData();
		
		} catch (error) {
		  
			alert('Erreur : ' + error.message);
		
		}

	}
{/* ----------------------------------------------------------------------------------------------------------- */}

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* MàJ statut trajet - Signalement d'une réservation */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	async function handleSignalerReservation(reservationId, covoiturageId) {
console.log({
	reservation_id: reservationId,
	passager_id: user, // ici tu verras si c'est un objet complexe
	action: 'Signaler',
	commentaire,
	note
});
	  try {

			// Appeler l'API pour mettre à jour le statut en "TERMINÉ SIGNALÉ"
			const response = await fetch(`${API_URL}/api/avis_ou_signalement`, {

				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				
				body: JSON.stringify({
					reservation_id: reservationId,
					covoiturage_id: covoiturageId,
					passager_id: user,
					action: 'Signaler',
					commentaire: commentaire,
					note: note
				}),
				
			});

			if (!response.ok) {
				
			  throw new Error('Erreur lors du début du covoiturage');
			  
			}

			alert('Avis enregistré avec succès, une analyse va être réalisée sur le signalement');

			await fetchUpdateTrajetData();
		
		} catch (error) {
		  
			alert('Erreur : ' + error.message);
		
		}

	}
{/* ----------------------------------------------------------------------------------------------------------- */}









{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Toggle bouton sur l'énergie électrique */}
{/* ----------------------------------------------------------------------------------------------------------- */} 	
	const handleToggle = () => {
	  const newValue = !isElectrique;
	  setIsElectrique(newValue);
	  setNewVehicule(prev => ({
		...prev,
		energie: newValue ? 'Électrique' : '',
	  }));
	};

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Ajouter Nouvelle Voiture */}
{/* ----------------------------------------------------------------------------------------------------------- */} 
	const handleVehiculeSubmit = e => {
	  e.preventDefault();

	  // Reset messages
	  setVoitureSuccess('');
	  setVoitureError('');

	  if (
		!newVehicule.marque ||
		!newVehicule.modele ||
		!newVehicule.nb_places ||
		!newVehicule.immatriculation ||
		!newVehicule.date_immatriculation ||
		!newVehicule.couleur ||
		!newVehicule.energie
	  ) {
		setVoitureError('Veuillez remplir tous les champs.');
		return;
	  }

	  fetch(`${API_URL}/api/ajout_voiture_chauffeur`, {
		method: 'POST',
		headers: {
		  Authorization: `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  marque: newVehicule.marque,
		  modele: newVehicule.modele,
		  nb_place: parseInt(newVehicule.nb_places, 10),
		  immatriculation: newVehicule.immatriculation,
		  date_immatriculation: newVehicule.date_immatriculation,
		  couleur: newVehicule.couleur,
		  energie: newVehicule.energie,
		}),
	  })
		.then(async res => {
		  if (!res.ok) {
			const errorData = await res.json();
			throw new Error(errorData.error || "Erreur lors de l'ajout du véhicule");
		  }
		  return res.json();
		})
		.then(newVehicule => {
		  setVoitureSuccess('Véhicule ajouté avec succès !');
		  setNewVehicule({
			marque: '',
			modele: '',
			nb_places: '',
			immatriculation: '',
			date_immatriculation: '',
			couleur: '',
			energie: '',
		  });
		  fetchVehicules();
		})
		.catch(err => setVoitureError(err.message));
	};


{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Supprimer Voiture Existante */}
{/* ----------------------------------------------------------------------------------------------------------- */} 
	const handleDeleteVehicle = id => {
	  if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;

	  fetch(`${API_URL}/api/suppression_voiture_chauffeur/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	  })
		.then(res => {
		  if (!res.ok) {
			throw new Error('Erreur lors de la suppression');
		  }
		  setVehicules(prev => prev.filter(v => v.id !== id));
		  setVoitureSuccess('Véhicule supprimé avec succès !');
		  setVoitureError(''); // Réinitialise l'erreur s'il y en avait une
		})
		.catch(err => {
		  setVoitureError(err.message);
		  setVoitureSuccess('');
		});
	};

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Afficher la liste des marques de voitures sous forme de liste(pour la création de véhicule) */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	useEffect(() => {
	  fetch(`${API_URL}/api/liste_marques`, {
		headers: { Authorization: `Bearer ${token}` }
	  })
		.then(res => res.json())
		.then(data => {
		  // Si la réponse est un tableau :
		  setMarques(data);
		})
		.catch(() => setMarques([]));
	}, []);









{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Fetch préférences*/}
{/* ----------------------------------------------------------------------------------------------------------- */}
	const fetchPreferencesData = () => {
	  fetch(`${API_URL}/api/liste_preference_chauffeur`, {
		method: 'GET',
		headers: {
		  Authorization: `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
	  })
	  .then(res => {
		if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
		return res.json();
	  })
	  .then(preferencesData => {
		const initialPreferences = {
		  musique: false,
		  conversation: false,
		  fumeur: false,
		  animal: false,
		  optionnelles: [],
		};

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
				if (pref.statutPreference === "OPTIONNEL") {
				  // On push l'objet complet ici (et pas juste la string)
				  initialPreferences.optionnelles.push(pref);
				}
				break;
			}
		  });
		} else {
		  console.error('La clé "preferences" ne contient pas un tableau valide');
		}

		setPreferences(initialPreferences);
	  })
	  .catch(err => {
		setError('Erreur lors du chargement des préférences');
		console.error("Erreur Fetch Préférences : ", err);
	  });
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

	  fetch(`${API_URL}/api/enregistrer_preferences_base_chauffeur`, {
		method: 'POST',
		headers: {
		  Authorization: `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  preference_musique: preferences.musique,
		  preference_conversation: preferences.conversation,
		  preference_fumeur: preferences.fumeur,
		  preference_animaux: preferences.animal,
		}),
	  })
	  .then(async res => {
		if (!res.ok) {
		  const errorData = await res.json();
		  throw new Error(errorData.error || "Erreur lors de l'ajout des préférences de base");
		}
		return res.json();
	  })
	  .then(() => {
		setPreferenceSuccess('Préférences ajoutées avec succès !');
		setPreferenceError('');
		//fetchPreferencesData();
	  })
	  .catch(err => {
		setPreferenceError(err.message);
		setPreferenceSuccess('');
	  });
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
{/* Ajouter les préférences personnalisées */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	const handleAddCustomPreference = e => {
	  e.preventDefault();

	  // Reset messages
	  setPreferenceSuccess('');
	  setPreferenceError('');
	  setVoitureError(''); // aussi reset l'erreur voiture si besoin

	  if (!customPreference) {
		setVoitureError('Veuillez indiquer la préférence personnalisée');
		return;
	  }

	  fetch(`${API_URL}/api/ajout_preference_chauffeur`, {
		method: 'POST',
		headers: {
		  Authorization: `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  preference_personnalisee: customPreference,
		}),
	  })
		.then(async res => {
		  if (!res.ok) {
			const errorData = await res.json();
			throw new Error(errorData.error || "Erreur lors de l'ajout de la préférence");
		  }
		  return res.json();
		})
		.then(() => {
		  setPreferenceSuccess('Préférence ajoutée avec succès !');
		  setPreferenceError('');
		  setNewPreference({
			customPreference: '',
		  });
		  fetchPreferencesData();
		})
		.catch(err => {
		  setPreferenceError(err.message);
		  setPreferenceSuccess('');
		});
	};

{/* ----------------------------------------------------------------------------------------------------------- */}
{/* Supprimer une préférence personnalisée */}
{/* ----------------------------------------------------------------------------------------------------------- */}
	const handleDeleteCustomPreference = (preferenceId) => {
	  if (!window.confirm('Voulez-vous vraiment supprimer cette préférence personnalisée ?')) return;

	  fetch(`${API_URL}/api/suppression_preference_chauffeur/${preferenceId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	  })
		.then(res => {
		  if (!res.ok) {
			throw new Error('Erreur lors de la suppression');
		  }
		  // Met à jour la liste côté client en filtrant la préférence supprimée
		  setCustomPreferences(prev => prev.filter(pref => pref.preference_id !== preferenceId));
		  setPreferenceSuccess('Préférence supprimée avec succès !');
		  setPreferenceError('');
		  fetchPreferencesData();
		})
		.catch(err => {
		  setPreferenceError(err.message);
		  setPreferenceSuccess('');
		});
	};
{/* ----------------------------------------------------------------------------------------------------------- */}






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
{/*AFFICHAGE FRONT*/}
{/* ----------------------------------------------------------------------------------------------------------- */} 

	return (

		<div className="row">

<div className="col-12 col-md-5 d-flex flex-column">

			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Colonne gauche - création trajet */}
			{/* ----------------------------------------------------------------------------------------------------------- */} 
			<div className="col-12">
			  
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
						<label htmlFor="date_arrivee" className="form-label h6">Date d'arrivée<em style={{ fontSize: "0.75rem" }}> (renseigné automatiquement)</em></label>
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
							<label htmlFor="heure_arrivee" className="form-label h6">Heure d'arrivée<em style={{ fontSize: "0.75rem" }}> (renseigné automatiquement)</em></label>
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
						<label htmlFor="duree" className="form-label h6">Durée (min) <em style={{ fontSize: "0.75rem" }}> (renseigné automatiquement)</em></label>
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
						<label htmlFor="distance" className="form-label h6">Distance (km) <em style={{ fontSize: "0.75rem" }}> (renseigné automatiquement)</em></label>
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
						<label htmlFor="places" className="form-label h6">Nombre de places <em style={{ fontSize: "0.75rem" }}>(automatique, dépend de la voiture indiquée)</em></label>
						
						<input
						  type="number"
						  id="places"
						  name="places"
						  min="1"
						  max="10"
						  value={voitureSelectionnee ? voitureSelectionnee.nb_places : ""}
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
							<option key={v.id} value={v.id}>
							  {v.marque} {v.modele}
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
				  <div className="alert alert-info">Connectez-vous en tant que 'Chauffeur' ou 'Chauffeur Passager' pour créer un trajet, disposer d'avis, gérer vos préférences et de gérer les véhicules.</div>
				)}
			</div>


			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Colonne gauche - Section évaluations chauffeur */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
			<div className="col-12">
			
			{(userRole === 1 || userRole === 3) ? (
			  <div className="card mb-4">
				<div className="card-header">Notes et évaluations</div>
				<div className="card-body">
				  <section className="mt-3" aria-labelledby="titre-evaluations">
					<h4 id="titre-evaluations">Notes et évaluations</h4>

					<p>
					  <strong>Note moyenne :</strong> {noteMoyenne ? noteMoyenne.toFixed(1) + '⭐ /5' : 'Non noté'}
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
			    <> {/* <div className="alert alert-info">Connectez-vous en tant que chauffeur pour disposer d'avis</div> */} </>
			)}
			  
			</div>


			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Colonne gauche - Gestion des préférences utilisateurs */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
			{(userRole && (userRole === 1 || userRole === 3)) ? (
				<div className="col-12">
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
						<label className="form-check-label" htmlFor="musique">🎶 Musique</label>
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
						<label className="form-check-label" htmlFor="conversation">🗨 Conversation</label>
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
						<label className="form-check-label" htmlFor="fumeur">🚬 Fumeur</label>
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
						<label className="form-check-label" htmlFor="animal">🐶 Animaux acceptés</label>
					  </div>

					  <button type="submit" className="btn btn-success w-100 mb-3">Enregistrer les préférences</button>
					  
					</form>

					<hr />

					{/* Affichage des messages */}
					{preferenceSuccess && (
					  <div className="alert alert-success" role="alert">
						{preferenceSuccess}
					  </div>
					)}
					{preferenceError && (
					  <div className="alert alert-danger" role="alert">
						{preferenceError}
					  </div>
					)}

					{/* Créer une préférences personnalisées */}
					<h6>Préférences personnalisées</h6>
					<form onSubmit={handleAddCustomPreference} className="row g-2 mb-3 align-items-center">
					  <div className="col-12 col-sm-9">
						<input 
						  type="text" 
						  className="form-control" 
						  placeholder="Ajouter une préférence..." 
						  value={customPreference} 
						  onChange={(e) => setCustomPreference(e.target.value)} 
						  required 
						/>
					  </div>
					  <div className="col-12 col-sm-3">
						<button type="submit" className="btn btn-success w-100">
						  Ajouter
						</button>
					  </div>
					</form>

					{/*<ul className="list-group">
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
					</ul>*/}

					<hr />
					
					{/* Liste des préférences personnalisées existantes */}
					<h6>Préférences optionnelles</h6>
					<ul className="list-group">
					  {(preferences.optionnelles && preferences.optionnelles.length === 0) ? (
						<li className="list-group-item">Aucune préférence personnalisée ajoutée</li>
					  ) : (
						preferences.optionnelles && preferences.optionnelles.map((pref, index) => (
						  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
							{pref.preference}
							<button 
							  className="btn btn-sm btn-danger" 
							  onClick={() => handleDeleteCustomPreference(pref.preference_id)} // Suppression de la préférence
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
				<> {/* <div className="alert alert-info">Connectez-vous en tant que chauffeur pour gérer les préférences</div> */} </>
			)}

      </div>


<div className="col-12 col-md-7 d-flex flex-column">


			{/* ----------------------------------------------------------------------------------------------------------- */}
			{/* Colonne droite - historique trajets */}
			{/* ----------------------------------------------------------------------------------------------------------- */}
			<div className="col-12">
			
				<div className="card mb-4 pb-3">
				
					<div className="card-header">
					<h5>Historique des trajets</h5>

					{/* Onglets Bootstrap */}
					<ul className="nav nav-tabs card-header-tabs mt-2" role="tablist">
					
					  {["tous", "archives", "actions", "avenir", "paiement", "signale"].map((type) => (
					  
							<li className="nav-item" role="presentation" key={type}>
							  
							  <button
								className={`nav-link ${activeButton === type ? "active" : ""}`}
								id={`${type}-tab`}
								data-bs-toggle="tab"
								type="button"
								role="tab"
								aria-controls={type}
								aria-selected={activeButton === type}
								onClick={() => setActiveButton(type)}
							  >
								{type === "tous"
								  ? "Tous trajets"
								  : type === "archives"
								  ? "Trajets archivés"
								  : type === "actions"
								  ? "Actions à gérer"
								  : type === "paiement"
								  ? "Paiement passager"
								  : type === "signale"
								  ? "Trajets signalés"
								  : "Trajets à venir"}
							  </button>
							  
							</li>
						
					  ))}
					  
					</ul>
					
					</div>

					{trajets.length === 0 ? (
					
					  <p>Aucun trajet trouvé.</p>
					  
					) : (
					
					<div className="overflow-auto" style={{ maxHeight: "2500px" }} >  
					
					  <ul className="ms-0">
					  
						{/* Affichage si aucun trajet selon le filtre */}
						{filteredTrajets().length === 0 ? (
							<li className="list-unstyled p-3">
							  {activeButton === "tous" && "Aucun trajet disponible"}
							  {activeButton === "archives" && "Aucun trajet archivé pour le moment"}
							  {activeButton === "actions" && "Aucune trajet nécessitant une action actuellement en attente"}
							  {activeButton === "avenir" && "Aucun trajet à venir"}
							  {activeButton === "paiement" && "Aucun trajet en attente de paiement"}				  
							  {activeButton === "signale" && "Aucun trajet signalé"}  
							</li>
						) : (

							// Affichage des trajets, en fonction du bouton de filtrage sélectionné
							filteredTrajets().map((t, index) => (
							
							  <li key={index} className="list-unstyled" style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem', inter: '1rem' }}>
							  
								<p><strong>{t.ville_depart}</strong> → <strong>{t.ville_arrivee}</strong></p>
								
								{(() => {
									
								  const date = new Date(t.date_depart);
								  
									let heure = '';
									if (typeof t.heure_depart === 'string') {
									  heure = t.heure_depart;
									} else if (t.heure_depart instanceof Date) {
									  // Formatage heure en "HH:mm"
									  const h = t.heure_depart.getHours().toString().padStart(2, '0');
									  const m = t.heure_depart.getMinutes().toString().padStart(2, '0');
									  heure = `${h}:${m}`;
									} else {
									  // Valeur par défaut si rien d’autre
									  heure = '00:00';
									}

								  const jour = String(date.getDate()).padStart(2, '0');
								  const mois = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
								  const annee = date.getFullYear();

								  const [heures, minutes] = heure.split(':');

								  return (
								  
									<p>🗓️ Date : le {jour}/{mois}/{annee} à {heures}h{minutes}</p>
									
								  );
								  
								})()}
								
								<p>⚙️ Rôle : {t.role !== 2 ? "Chauffeur" : "Passager"}</p>
								
								{/* Affichage du statut et des places selon le rôle */}
								{t.role !== 2 ? (
								  <>
								  
									<p>📌 Statut : <strong>{t.statut?.statutCovoiturage ?? 'Inconnu'}</strong></p>
									<p>💺 Place(s) restante(s) : {t.places}</p>
									
								  </>
								) : (
								  <>
								  
									<p>📌 Statut : <strong>{t.statut?.statutReservation ?? 'Inconnu'}</strong></p>
									<p>💺 Nb de place(s) réservée(s) : {t.places}</p>
									
								  </>
								)}
								
								{/* Paiement uniquement pour les passagers */}
								{t.role === 2 && (
									<p>💳 Paiement : <strong>{t.paye ? "Effectué" : "Non payé"}</strong></p>
								)}
								
								{t.voiture && (
								  <p>🚗 Voiture : {t.voiture.marque?.marque ?? 'Inconnue'} {t.voiture.modele}</p>
								)}
								
								
								{/* Affichage des pseudos et images des passagers présents sur un covoiturage réalisé comme chauffeur */}
								{t.role !== 2 ? (
								  // Affichage des passagers (conducteur ou conducteur/passager)
								  <div style={{ marginBottom: "1rem" }}>
									<p>💳 Passagers :</p>
									<div
									  style={{
										display: "flex",
										flexWrap: "wrap",
										gap: "15px",
										justifyContent: "flex-start",
									  }}
									>
									  {t.passagers && t.passagers.length > 0 ? (
										t.passagers.map((passager, index) => (
										  <div
											className="passager-item"
											key={index}
											style={{
											  width: "18%",
											  textAlign: "center",
											}}
										  >
											<img
											  src={
												passager.photo?.startsWith("data:image/")
												  ? passager.photo
												  : "/Pictures/PICTURE_USER_VOID.png"
											  }
											  alt="Photo du passager"
											  style={{
												width: "50px",
												height: "50px",
												objectFit: "cover",
												borderRadius: "50%",
												border: "2px solid #000000",
												padding: "2px",
												backgroundColor: "#fff",
												display: "block",
												margin: "0 auto 5px auto",
											  }}
											/>
											<p style={{ fontSize: "0.75rem", margin: 0 }}>
											  {passager.pseudo || "N/A"}
											</p>
										  </div>
										))
									  ) : (
										<p>Aucun passager</p>
									  )}
									</div>
								  </div>
								) : (

								  // Affichage du conducteur (pour le passager)
								  <div style={{ marginBottom: "1rem" }}>
									<p>🚘 Conducteur :</p>
									<div
									  style={{
										display: "flex",
										flexWrap: "wrap",
										gap: "10px",
										justifyContent: "flex-start",
									  }}
									>
									  {t.chauffeur ? (
										<div
										  className="passager-item"
										  style={{
											width: "18%",
											textAlign: "center",
										  }}
										>
										  <img
											src={
											  t.chauffeur.photo?.startsWith("data:image/")
												? t.chauffeur.photo
												: "/Pictures/PICTURE_USER_VOID.png"
											}
											alt="Photo du chauffeur"
											style={{
											  width: "50px",
											  height: "50px",
											  objectFit: "cover",
											  borderRadius: "50%",
											  border: "2px solid #000000",
											  padding: "2px",
											  backgroundColor: "#fff",
											  display: "block",
											  margin: "0 auto 5px auto",
											}}
										  />
										  <p style={{ fontSize: "0.75rem", margin: 0 }}>
											{t.chauffeur.pseudo || "N/A"}
										  </p>
										</div>
									  ) : (
										<p>Chauffeur non trouvé</p>
									  )}
									</div>
								  </div>
								)}
								
								{/* Boutons selon le statut et le rôle */}
								{t.role !== 2 ? (
								
									// Chauffeur ou Chauffeur / Passager
									<>
									

									{/* STATUT COVOITURAGE = À VENIR */}
									{t.statut?.statutCovoiturage === 'À VENIR' && (
									
										<>
							  
										  {
											new Date(t.date_depart) > new Date() ? (
											
											  // Date de départ future → Annulation possible
											  <>
											  
												<button
													className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2"
													data-bs-toggle="tooltip"
													data-bs-placement="top"
													title="Cliquez ici pour annuler la réservation"
													onClick={() => handleCancelCovoiturage(t.id)}
												>
													Annuler la réservation
												</button>
												  
												<button className="btn btn-warning w-md-100 mt-sm-2 me-lg-2" disabled>En attente de passager</button>

											  </>
											  
											) : new Date(t.date_arrivee).toDateString() === new Date().toDateString() ? (

											  // Date d'arrivée aujourd'hui → Non annulable
											  <>
											  
												<button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" disabled>Non annulable</button>
												<button className="btn btn-warning w-md-100 mt-sm-2 me-lg-2" disabled>En attente de passager</button>
												
											  </>

											) : (
											
												// Date d'arrivée passée → Trajet à passer en 'Terminé'							
												<>
												
												  <button className="btn btn-secondary mt-sm-2 me-lg-2" disabled>Date dépassée : absence de réservation</button>
												  <button
													className="btn btn-warning w-md-100 mt-sm-2 me-lg-2"
													data-bs-toggle="tooltip"
													data-bs-placement="top"
													title="Cliquez ici pour actualiser le statut du trajet"
												  >
													Annuler le trajet</button>
												</>
											  
											)
											
										  }
										  
										</>
										
									)}
									
									{/* STATUT COVOITURAGE = CONFIRMÉ */}
									{t.statut?.statutCovoiturage === 'CONFIRMÉ' && (

										<>
										<button className="btn btn-success w-md-100 mt-sm-2 me-lg-2" onClick={() => handleDebutCovoiturage(t.id)}>Démarrer le trajet</button>
										{/* <button className="btn btn-success" disabled={new Date(t.date_depart) onClick={() => handleDebutCovoiturage(t.id)} => handleDebutCovoiturage(t.id)}> new Date()}>Démarrer le trajet</button> */}
										<button className="btn btn-warning w-md-100 mt-sm-2 me-lg-2" onClick={() => handleCancelCovoiturage(t.id)}>Annuler la réservation</button>
										
										</>
										
									)}

									{/* STATUT COVOITURAGE = EN COURS */}
									{t.statut?.statutCovoiturage === 'EN COURS' && (
										<button className="btn btn-success w-md-100 mt-sm-2 me-lg-2" onClick={() => handleFinCovoiturage(t.id)}>Terminer le trajet</button>
									)}

									{/* STATUT COVOITURAGE = TERMINÉ */}
									{t.statut?.statutCovoiturage === 'TERMINÉ' && (
										<button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" disabled>Trajet réalisé, paiement à venir</button>	
									)}
									
									{/* STATUT COVOITURAGE = CLÔTURÉ */}
									{t.statut?.statutCovoiturage === 'CLÔTURÉ' && (
										<button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" disabled>Trajet réalisé et payé</button>
									)}
									
									{/* STATUT COVOITURAGE = ANNULÉ */}
									{t.statut?.statutCovoiturage === 'ANNULÉ' && (
										<button className="btn btn-danger w-md-100 mt-sm-2 me-lg-2" disabled>Trajet annulé</button>
									)}
									
									</>
									
								) : (
								
								  // Passager

								  <>
								  
									{/* STATUT COVOITURAGE = VALIDÉ */}
									{t.statut?.statutReservation === 'VALIDÉ' && (
									  <button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" onClick={() => handleAnnulerReservation(t.statut.id)}>Annuler la réservation</button>
									)}

									{/* STATUT COVOITURAGE = TERMINÉ À PAYER */}
									{t.statut?.statutReservation === 'TERMINÉ À PAYER' && (
									  <>
									  
										<form onSubmit={handleVehiculeSubmit}>

											<div className="mb-3">
											
												<label htmlFor="note" className="form-label">
												  Merci de noter (de 1 à 5) et de commenter votre expérience sur ce trajet :
												</label>
												
												<select
												  id="note"
												  name="note"
												  className="form-select"
												  required
												  value={note}
												  onChange={(e) => setNote(e.target.value)}
												>
												  <option value="">-- Choisir --</option>
												  {[1, 2, 3, 4, 5].map((i) => (
													<option key={i} value={i}>
													  {i} ⭐
													</option>
												  ))}
												</select>
											
											</div>

											<div className="mt-3">
											
												<label htmlFor="commentaire" className="form-label">
												  Commentaire :
												</label>
												
												<textarea
												  id="commentaire"
												  name="commentaire"
												  className="form-control"
												  rows="4"
												  placeholder="Partagez votre expérience..."
												  required
												  value={commentaire}
												  onChange={(e) => setCommentaire(e.target.value)}
												/>
												
											</div>

											<button
											type="button"
											className="btn btn-success w-md-100 mt-sm-2 me-lg-2"
											onClick={() => handlePayerReservation(t.reservation_id, t.id)}
											>
											Trajet réalisé, paiement à réaliser
											</button>

											<button
											type="button"
											className="btn btn-warning w-md-100 mt-sm-2 me-lg-2"
											onClick={() => handleSignalerReservation(t.reservation_id, t.id)}
											>
											Trajet réalisé, signaler le covoiturage
											</button>
										  
										</form>

									  </>
									)}

									{/* STATUT COVOITURAGE = TERMINÉ PAYÉ */}
									{t.statut?.statutReservation === 'TERMINÉ PAYÉ' && (
									  <button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" disabled>Trajet réalisé et payé</button>
									)}

									{/* STATUT COVOITURAGE = TERMINÉ SIGNALÉ */}
									{t.statut?.statutReservation === 'TERMINÉ SIGNALÉ' && (
									  <button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" disabled>Trajet réalisé et signalé</button>
									)}

									{/* STATUT COVOITURAGE = ANNULÉ */}
									{t.statut?.statutReservation === 'ANNULÉ' && (
									  <button className="btn btn-secondary w-md-100 mt-sm-2 me-lg-2" disabled>Trajet annulé</button>
									)}
									
								  </>

								)}
								
							  </li>
							  
							))
		
						)}
					
					  </ul>
					  
					</div>  
					
					)}		
					
				</div>
			
			</div>



		{/* ----------------------------------------------------------------------------------------------------------- */}
		{/* Gestion des voitures */}
		{/* ----------------------------------------------------------------------------------------------------------- */}
			<div className="col-12">
			{(userRole && (userRole === 1 || userRole === 3)) ? (
			
				<div className="card mb-4">
				
					{/* Page déroulante */}
					<div 
					  className="card-header" 
					  style={{ cursor: 'pointer' }} 
					  onClick={() => setVoitureOpen(!voitureOpen)}
					  aria-expanded={voitureOpen}
					  aria-controls="collapseVoiture"
					>
					  Gérer mes véhicules
					  <span style={{ float: 'right' }}>{voitureOpen ? '▲' : '▼'}</span>
					</div>
				
				  <div className={`collapse ${voitureOpen ? 'show' : ''}`} id="collapseVoiture">
				  
					  <div className="card-body">
					  
						<form onSubmit={handleVehiculeSubmit}>
						
							<div className="mb-2">
							  <label htmlFor="marque" className="form-label h6">Marque (renseigner 'Autre' si non présente)</label>
							  <select
								name="marque"
								className="form-control"
								value={newVehicule.marque}
								onChange={handleInputChange}
								required
							  >
								<option value="">-- Sélectionner une marque --</option>
								{marques.map(marque => (
								  <option key={marque.id} value={marque.nom}>
									{marque.nom}
								  </option>
								))}
							  </select>
							</div>
						  
							<div className="mb-2">
								<label htmlFor="modele" className="form-label h6">Modèle</label>
								<input name="modele" className="form-control" value={newVehicule.modele} onChange={handleInputChange} required />
							</div>

							<div className="mb-2">
								<label htmlFor="nb_places" className="form-label h6">Nombre de places</label>
								<input type="number" name="nb_places" className="form-control" value={newVehicule.nb_places} min="1" onChange={handleInputChange} required />
							</div>

							<div className="mb-2">
								<label htmlFor="immatriculation" className="form-label h6">Immatriculation</label>
								<input name="immatriculation" className="form-control" value={newVehicule.immatriculation} onChange={handleInputChange} required />
							</div>

							<div className="mb-2">
							  <label htmlFor="date_immatriculation" className="form-label h6">Date d'immatriculation</label>
							  <input
								type="date"
								name="date_immatriculation"
								className="form-control"
								value={newVehicule.date_immatriculation}
								onChange={handleInputChange}
								max={new Date().toISOString().split("T")[0]}  // Date du jour au format YYYY-MM-DD
								required
							  />
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
						
						{/* Voiture : message succès */}
						{voitureSuccess && (
						  <div className="alert alert-success mt-4" role="alert">
							{voitureSuccess}
						  </div>
						)}
						
						{/* Voiture : message erreur */}
						{voitureError && (
						  <div className="alert alert-danger mt-4" role="alert">
							{voitureError}
						  </div>
						)}

						<hr />
						<h6>Mes véhicules</h6>
						{vehicules.length === 0 ? (
						  <p className="text-muted">Pas de véhicule enregistré</p>
						) : (
						  <ul className="list-group">
							{vehicules.map(v => (
							<li key={v.id} className="list-group-item">
							  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2">

								{/* Infos véhicule */}
								<div className="d-flex flex-column flex-lg-row flex-wrap gap-2">
									<div style={{ fontSize: "1.0rem" }}>
										<strong>🚗 {(v.marque?.marque ?? v.marque)?.toUpperCase()} {v.modele}</strong>
									</div>
									<div className="ps-5" style={{ fontSize: "0.85rem" }}>💺 {v.nb_places} places</div>
									<div style={{ fontSize: "0.85rem" }}>🎨 {v.couleur}</div>
									<div style={{ fontSize: "0.85rem" }}>⛽ {v.energie}</div>
									<div style={{ fontSize: "0.85rem" }}>🆔 {v.immatriculation}</div>
								</div>

								{/* Bouton suppression */}
								<div className="mt-2 mt-lg-0">
								  <button
									className="btn btn-sm btn-danger"
									onClick={() => handleDeleteVehicle(v.id)}
								  >
									Supprimer
								  </button>
								</div>
								
							  </div>
							</li>
							))}
						  </ul>
						)}
					  </div>
				  </div>
				  
				</div>
				) : (

				  <> {/* <div className="alert alert-info">Connectez-vous en tant que chauffeur pour gérer les voitures</div> */} </>
				  
				)}
			</div>

      </div>

		</div>

	);
	
};

export default HistoriqueTrajet;
