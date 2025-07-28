import React, { useEffect, useState } from 'react';
import DashboardChart from '../context/DashboardChart';
import { BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


const FormulaireCreateEmploye = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [suspendMessage, setSuspendMessage] = useState('');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [totalCredits, setTotalCredits] = useState(0);

  const [kpiData, setKpiData] = useState([]);

  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount(c => c + 1);
  const stopLoading = () => setLoadingCount(c => Math.max(c - 1, 0));
  const isLoading = loadingCount > 0;

  const token = localStorage.getItem('jwt_token');

  // Nettoyer les messages après 10 sec
  const clearMessage = (setter) => {
    setTimeout(() => setter(''), 10000);
  };

	// 🔄 Charger liste des utilisateurs et employés
	useEffect(() => {
		startLoading();
		const fetchUsers = async () => {
			try {
				const response = await fetch(`${API_URL}/api/liste_user`, {
				  method: 'GET',
				  headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				  },
				});
				const data = await response.json();
				if (response.ok) setUsers(data);
				else setError(data.message || 'Erreur inconnue');
			} catch (err) {
				setError('Erreur de connexion au serveur');
			} finally {
				stopLoading();
			}
		};
	fetchUsers();
	}, [API_URL, token]);

	// 🔄 Charger KPIs journaliers
	useEffect(() => {
		startLoading();
		const fetchKpis = async () => {
		try {
		  const response = await fetch(`${API_URL}/api/kpi/journalier`, {
			headers: {
			  'Authorization': `Bearer ${token}`,
			  'Content-Type': 'application/json',
			}
		  });

		  if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		  }

		  const data = await response.json();

		  // Trouver la première date (assumée triée ou trouver la min)
		  const dates = data.map(kpi => new Date(kpi.date));
		  const minDate = new Date(Math.min(...dates));
		  const today = new Date();

		  // Fonction pour ajouter jours
		  const addDays = (date, days) => {
			const copy = new Date(date);
			copy.setDate(copy.getDate() + days);
			return copy;
		  };

		  // Générer toutes les dates entre minDate et today
		  const dateArray = [];
		  for (let d = minDate; d <= today; d = addDays(d, 1)) {
			dateArray.push(d.toISOString().slice(0, 10)); // format YYYY-MM-DD
		  }

		  // Créer un objet pour lookup facile
		  const dataMap = {};
		  data.forEach(kpi => {
			dataMap[kpi.date] = kpi;
		  });

		  // Construire la liste complète, en mettant 0 si pas de données
		  const fullData = dateArray.map(date => {
			if (dataMap[date]) {
			  return {
				date,
				nbCovoiturages: dataMap[date].nb_covoiturages,
				creditsGagnes: dataMap[date].credits_gagnes
			  };
			} else {
			  return {
				date,
				nbCovoiturages: 0,
				creditsGagnes: 0
			  };
			}
		  });

		  setKpiData(fullData);

		} catch (err) {
			console.error('Erreur chargement KPI :', err);
		} finally {
			stopLoading();
		}
		};
	fetchKpis();
	}, [API_URL, token]);


	// 🔄 Charger total crédits
	useEffect(() => {
		startLoading();
	const fetchTotalCredits = async () => {
		try {
		const response = await fetch(`${API_URL}/api/total_credits`, {
			method: 'GET',
			headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
			},
		});
		const data = await response.json();
		if (response.ok) setTotalCredits(data.totalCredits);
		else setError(data.message || 'Erreur inconnue');
		} catch (err) {
			setError('Erreur de connexion au serveur');
		} finally {
		  stopLoading();
		}
	};
	fetchTotalCredits();
	}, [API_URL, token]);


	// ➕ Créer employé
	const handleCreateUserSubmit = async (e) => {
	e.preventDefault();
	try {
	  const response = await fetch(`${API_URL}/api/create_employe`, {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email, pseudo, password }),
	  });
	  const result = await response.json();
	  if (response.ok) setCreateMessage('Utilisateur créé avec succès');
	  else setCreateMessage(result.error || 'Erreur inconnue');
	} catch {
	  setCreateMessage('Erreur serveur');
	} finally {
		clearMessage(setCreateMessage);
		stopLoading();
	}
	};


	// ❌ Suspendre utilisateurs et employés
	const handleSuspendUserSubmit = async (e) => {
	e.preventDefault();
	if (!selectedUserId) {
	  setSuspendMessage('Veuillez sélectionner un utilisateur.');
	  clearMessage(setSuspendMessage);
	  return;
	}
	try {
	  const response = await fetch(`${API_URL}/api/suspend_user`, {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ id: selectedUserId }),
	  });
	  const data = await response.json();
	  if (response.ok) setSuspendMessage('Utilisateur suspendu avec succès.');
	  else setSuspendMessage(data.error || 'Erreur inconnue');
	} catch {
		setSuspendMessage('Erreur de connexion au serveur');
	} finally {
		clearMessage(setSuspendMessage);
		stopLoading();
	}
	};



	// Affichage conditionnel : afficher "Chargement en cours..."
	if (isLoading) {
	return (
	  <div className="text-center mt-5">
		<div className="spinner-border text-primary" role="status" />
		<p className="mt-3">Chargement en cours...</p>
	  </div>
	);
	}


	return (
		<div className="row justify-content-center">
		  <div className="col col-lg-8 w-100">
			<div className="card shadow rounded-4 p-4">
			  <h1 className="text-center mb-4">⚙️ Espace Admin</h1>

			  {/* Création employé */}
			  <div className="card shadow rounded-4 p-4 mb-3">
				<h5 className="text-secondary mb-3">➕ Créer un nouveau compte employé</h5>
				<form onSubmit={handleCreateUserSubmit}>
				  <div className="mb-3">
					<label className="form-label">Adresse email</label>
					<input className="form-control" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
				  </div>
				  <div className="mb-3">
					<label className="form-label">Pseudo</label>
					<input className="form-control" type="text" required value={pseudo} onChange={e => setPseudo(e.target.value)} />
				  </div>
				  <div className="mb-4">
					<label className="form-label">Mot de passe</label>
					<input className="form-control" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
				  </div>
				  <button className="btn btn-success w-100">➕ Créer l’employé</button>
				</form>
				{createMessage && (
				  <div className={`alert mt-3 ${createMessage.includes('erreur') ? 'alert-danger' : 'alert-success'}`}>
					{createMessage}
				  </div>
				)}
			  </div>

			  {/* Suspension de compte */}
			  <div className="card shadow rounded-4 p-4 mb-3 mt-3">
				<h5 className="text-secondary mb-3">❌ Suspendre un compte Ecoride</h5>
				<form onSubmit={handleSuspendUserSubmit}>
				  <div className="mb-3">
					<label className="form-label">Sélectionnez un utilisateur</label>
					<select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
					  <option value="">Sélectionnez un utilisateur</option>
					  {users.map(user => (
						<option key={user.id} value={user.id}>
						  {user.pseudo} - {user.email} (Rôle: {user.role}, Privilège: {user.privilege})
						</option>
					  ))}
					</select>
				  </div>
				  <button className="btn btn-danger w-100">🗑️ Inactiver le compte</button>
				</form>
				{suspendMessage && (
				  <div className={`alert mt-3 ${suspendMessage.includes('erreur') ? 'alert-danger' : 'alert-success'}`}>
					{suspendMessage}
				  </div>
				)}
			  </div>

			  {/* Crédits total */}
			  <div className="card shadow rounded-4 p-4 mb-3 mt-3">
				<h5 className="text-secondary mb-3">💰 Gain de crédits total</h5>
				<label className="form-label">Total des crédits reçues par la plateforme depuis la mise en service :</label>
				<button type="button" className="btn btn-success w-100 fw-bold">{totalCredits} crédits</button>
			  </div>

			  {/* Graphique principal */}
			  <div className="card shadow rounded-4 p-4 mt-3">
				<h5 className="text-secondary mb-3">📈 Statistiques de trajets</h5>
				
				{/* KPI Nombre de covoiturages par jour */}
				<div className="w-full h-96 p-4 mt-4 bg-white rounded-2xl shadow">
				<h5 className="text-secondary mb-3">Gains réalisés par la plateforme, par jour</h5>
				<ResponsiveContainer width="100%" height={300}>
				  <BarChart data={kpiData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis interval={0} tickCount={Math.max(...kpiData.map(d => d.nbCovoiturages)) + 1} />
					<Tooltip />
					<Bar dataKey="nbCovoiturages" fill="#3b82f6" name="Nb Covoiturages" />
				  </BarChart>
				</ResponsiveContainer>
				</div>

				{/* KPI Gain de crédits par jour */}
				<div className="w-full h-96 p-4 mt-4 bg-white rounded-2xl shadow">
				<h5 className="text-secondary mb-3">Gains réalisés par la plateforme, par jour</h5>
				<ResponsiveContainer width="100%" height={300}>
				  <BarChart data={kpiData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Line dataKey="creditsGagnes" stroke="#10b981" strokeWidth={5} name="Crédits Gagnés" />
				  </BarChart>
				</ResponsiveContainer>
				</div>
				  
			  </div>

			</div>
		  </div>
		</div>
	);
};

export default FormulaireCreateEmploye;
