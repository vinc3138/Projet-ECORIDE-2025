import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/authToken';

export default function CompteUtilisateur() {
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  // État user initialisé avec des valeurs par défaut "chargement"
  const [user, setUser] = useState({
    user_id: '',
    pseudo: 'Chargement...',
    role: 'Chargement...',
    photo: '',
    infos: {
      prenom: '',
      nom: '',
      email: '',
      adresse: '',
      telephone: '',
      date_naissance: ''
    },
    credit: null
  });

  // Nouvel état loading
  const [loading, setLoading] = useState(true);

  const [roleMessage, setRoleMessage] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [creditMessage, setCreditMessage] = useState('');
  const [creditSuccess, setCreditSuccess] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  const token = localStorage.getItem('jwt_token');

  const fetchUserData = async () => {
    if (!token) {
      console.error("Pas de token JWT trouvé dans localStorage");
      setLoading(false); // Stop loading même si erreur
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l’utilisateur');
      }

      const data = await response.json();

      setUser({
        pseudo: data.pseudo,
        privilege: data.privilege,
        role: data.role,
        photo: data.photo,
        infos: data.infos,
        credit: data.credit,
        user_id: data.user_id,
      });
    } catch (err) {
      console.error("Erreur fetch utilisateur :", err);
    } finally {
      setLoading(false); // On arrête le loading quoi qu’il arrive
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  // Upload de photo de profil
  const handlePhotoUpload = async (e) => {
    e.preventDefault();

    if (!photo) {
      setPhotoMessage("Veuillez sélectionner une photo.");
      return;
    }

    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const response = await fetch(`${API_URL}/api/upload_user_photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPhotoMessage("📸 Photo mise à jour avec succès !");
        if (data.photo) {
          setUser(prevUser => ({ ...prevUser, photo: data.photo }));
        } else {
          fetchUserData();
        }
      } else {
        setPhotoMessage("❌ Erreur lors de l'envoi : " + (data.error || 'Inconnue'));
      }
    } catch (err) {
      setPhotoMessage("❌ Erreur réseau : " + err.message);
    }
  };

  // Fonction de mise à jour des informations utilisateur
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      infos: {
        ...prev.infos,
        [name]: value
      }
    }));
  };

  const handleSubmitInfos = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Non connecté");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/compte_utilisateur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...user.infos,
          role: user.role,
        }),
      });

      if (response.ok) {
        alert("Infos enregistrées");
        setUpdateSuccess("1");
      } else {
        const text = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          console.warn("Réponse non JSON ou vide : ", text);
        }

        alert("Erreur lors de l'enregistrement : " + (errorData.error || "Erreur inconnue"));
        setUpdateSuccess("0");
      }
    } catch (error) {
      console.error("Erreur fetch lors de la mise à jour :", error);
      alert("Erreur lors de l'enregistrement (catch) : " + error.message);
      setUpdateSuccess("0");
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();

    if (!window.confirm("Confirmer le rechargement de 100 crédits ?")) {
      return;
    }

    if (!token) {
      alert("Non connecté");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/credits/add100`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(prev => ({ ...prev, credit: data.newCredits }));
        setCreditSuccess("1");
      } else {
        setCreditSuccess("0");
      }

      setTimeout(() => setCreditSuccess(null), 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout des crédits :", error);
      setCreditSuccess("0");
      setTimeout(() => setCreditSuccess(null), 3000);
    }
  };

  // Fonction de changement de rôle
  const handleRoleChange = async () => {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      alert("Non connecté");
      return;
    }

    const newRole = user.role;
    const userId = user.user_id;

    if (!userId || !newRole) {
      alert("Utilisateur ou rôle manquant !");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/changer-role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          new_role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de rôle');
      }

      const data = await response.json();

      if (data && data.new_role) {
        setUser(prev => ({
          ...prev,
          role: data.new_role
        }));

        setRoleMessage("Rôle mis à jour avec succès !");
      } else {
        setRoleMessage("Le changement de rôle a échoué !");
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle :", error);
      alert("Erreur lors du changement de rôle.");
    }
  };

  const roleLabels = {
    1: 'CHAUFFEUR',
    2: 'PASSAGER',
    3: 'CHAUFFEUR PASSAGER',
    4: 'AUTRE',
    5: 'SUSPENDU',
  };

  const getRolesForPrivilege = (privilege) => {
    if (privilege === 1) return [1];
    if (privilege === 2) return [2];
    if (privilege === 3) return [1, 2, 3];
    return [];
  };

  const possibleRoles = getRolesForPrivilege(user.privilege);



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


  return (
  
  <>
  
  	{!loading && (
	<>
	
		<div className="row g-4">

				  {/* Colonne 1 - Profil */}
				  <div className="col-md-4">
					<div className="card mb-4" style={{ height: '450px' }}>
					  <div className="card-header">Mon profil</div>
					  <div className="card-body d-flex flex-column">
						<p><strong>Pseudo :</strong></p>
						<div className="alert alert-secondary text-center fs-5">{user.pseudo || 'Non connecté'}</div>

						<p className="mt-4"><strong>Rôle :</strong></p>
						<select
						  id="role"
						  name="role"
						  value={user.role}
						  onChange={(e) => setUser(prev => ({
							...prev,
							role: parseInt(e.target.value, 10)
						  }))}
						  className="alert form-select alert-secondary text-center mb-3"
						  disabled={possibleRoles.length === 1}
						>
						  {possibleRoles.map(roleId => (
							<option key={roleId} value={roleId}>
							  {roleLabels[roleId]}
							</option>
						  ))}
						</select>

						{/* Message de changement de rôle */}
						{roleMessage && (
						  <div className="pt-2 alert alert-success">
							<label className="form-label text-success">{roleMessage}</label>
						  </div>
						)}

						{/* Bouton de changement de rôle, collé en bas */}
						<button type="button" className="btn btn-success w-100 mt-auto" onClick={handleRoleChange}>🔄 Changer de rôle</button>
					  </div>
					</div>
				  </div>

				  {/* Colonne 2 - Photo */}
				  <div className="col-md-4">
					<div className="card mb-4 text-center" style={{ height: '450px' }}>
					  <div className="card-header">Ma photo de profil</div>
					  <div className="card-body d-flex flex-column">
						<img
						  src={user.photo || '/Pictures/PICTURE_USER_VOID.png'}
						  alt="Ma photo"
						  className="img-fluid rounded mb-3"
						  style={{ maxHeight: '190px', objectFit: 'contain' }}
						/>

						<form onSubmit={handlePhotoUpload} encType="multipart/form-data" className="d-flex flex-column mt-auto">
						  <input
							type="file"
							name="photo"
							className="form-control mb-3"
							accept="image/*"
							required
							onChange={(e) => setPhoto(e.target.files[0])}
						  />
						  {photoMessage && (
							<div className="pt-2 alert alert-success">
							  <label className="form-label text-success">{photoMessage}</label>
							</div>
						  )}

						  <button type="submit" className="btn btn-success w-100">
							⏏️ Uploader une nouvelle photo
						  </button>

						</form>
					  </div>
					</div>
				  </div>
				  
				  

				  {/* Colonne 3 - Crédits */}
				  <div className="col-md-4">
					<div className="card mb-4 text-center" style={{ height: '450px' }}>
					  <div className="card-header">Mes crédits</div>
					  <div className="card-body d-flex flex-column">
						{user.credit !== null && (
						  <p className="alert alert-success text-center fs-4">
							{user.credit} crédits
						  </p>
						)}

						{creditSuccess === "1" && (
						  <div className="alert alert-success mb-3">
							✅ Votre compte a bien été crédité de 100 crédits.
						  </div>
						)}

						{creditSuccess === "0" && (
						  <div className="alert alert-danger mb-3">
							🚫 Votre compte n'a pas pu être crédité, veuillez réessayer.
						  </div>
						)}

						{/* Formulaire de rechargement avec le bouton collé en bas */}
						<form onSubmit={handleAddCredits} className="mt-auto">
						  <button type="submit" className="btn btn-success w-100">
							🔋 Recharger de 100 crédits
						  </button>
						</form>
					  </div>
					</div>
				  </div>
				  
				  

				  {/* Colonne 4 - Infos personnelles */}
				  <div className="col-12">
					<div className="card mb-4 text-left">
					  <div className="card-header">Mes informations personnelles</div>
					  <div className="card-body">
						<form onSubmit={handleSubmitInfos}>
						  {["prenom", "nom", "email", "adresse", "telephone", "date_naissance"].map(field => (
							<div className="mb-3" key={field}>
							  <label htmlFor={field} className="form-label">
								{field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
							  </label>
							  <input
								type={field === "email" ? "email" : field === "date_naissance" ? "date" : "text"}
								name={field}
								value={user.infos[field] || ''}
								onChange={handleInputChange}
								className="form-control"
							  />
							</div>
						  ))}
						  <button type="submit" className="btn btn-success w-100">​☑️ Enregistrer</button>
						</form>

						{updateSuccess === "1" && (
						  <div className="alert alert-success mt-3">
							✅ Informations enregistrées avec succès.
						  </div>
						)}

						{updateSuccess === "0" && (
						  <div className="alert alert-danger mt-3">
							❌ Une erreur est survenue lors de la mise à jour.
						  </div>
						)}
					  </div>
					</div>
				  </div>

		</div>
	</>
	)}

  </>
  );
}
