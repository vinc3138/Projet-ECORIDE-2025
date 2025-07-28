/* Imports */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authToken';
import '../responsive.css';


/* Paramétrage du header */
export default function Header() {
	
    // État pour gérer l'ouverture/fermeture du menu hamburger
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(prev => !prev);
	
	// Constante pour récupérer depuis la fonction les données utilisateur et la fonction de déconnexion
    const { user, logout } = useAuth();

    // Constante pour le statut de connexion de l'utilisateur (Vrai / Faux)
	const isLoggedIn = !!user;

	// Constante pour récupérer le privilège depuis le hook
    const privilegeId = user?.privilege || null;

	// Constante navigate pour permettre la redirection
	const navigate = useNavigate();

    // Constante pour le message de notification
    const [message, setMessage] = useState('');

	// Constante pour le logout et la redirection vers la page d'accueil
	const handleLogout = () => {
		logout();
		
		setMessage('Vous avez bien été déconnecté');
		// Efface le message après 3 secondes (3000 ms)
		setTimeout(() => setMessage(''), 3000);
		
		navigate('/');
		
    // Fermer le menu hamburger si ouvert
    setMenuOpen(false);
	};



	// Définition des pages avec le typage Publique / Privé et les condtions d'affichage liées aux privilèges
	const navLinks = [
		{ to: '/', label: 'Accueil', public: true },
		{ to: '/recherchetrajet', label: 'Rechercher un trajet', public: true },
		{ to: '/apropos', label: 'À propos', public: true },
		{ to: '/inscription', label: "S'inscrire", public: true, hideIfLoggedIn: true },
		
		{ to: '/compteutilisateur', label: 'Compte Utilisateur', privilege: [3], private: true },
		{ to: '/compteemploye', label: 'Compte Employé', privilege: [2], private: true },
		{ to: '/compteadministrateur', label: 'Compte Administrateur', privilege: [1], private: true },
		{ to: '/historiquetrajet', label: 'Historique Trajet', privilege: [3], private: true },
	];

	// Définition des pages publiques
	const publicLinks = navLinks.filter(link => {
		// Faux si le lien doit être caché pour un utilisateur connecté
		if (link.public) {
		    if (link.hideIfLoggedIn && isLoggedIn) return false;
			return true;
		}
		return false;
	});

	// Définition des pages privées : si non publique, utilisateur connecté et privilège ok
	const privateLinks = navLinks.filter(link => {
		return !link.public && isLoggedIn && link.privilege?.includes(privilegeId);
	});

	// Affichage du Header en Front
	return (
		<header>
<div className="header_background mb-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 1rem' }}>
  {/* Groupe logo + titre */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <img src="/Pictures/LOGO_ECORIDE.png" className="logo_display rounded ms-5" alt="Logo EcoRide" />
    <h1 className="navbar-brand mb-0">EcoRide</h1>
  </div>

  {/* Bouton hamburger, visible seulement en mobile et tablette */}
  <div className="container_hamburger">
    <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </button>
  </div>
				
				{/* Navbar desktop - affichée uniquement au dessus de 992px */}
				<div className="wrapper wrapper-desktop" style={{ flexGrow: 1, alignItems: 'center', gap: '1rem' }}>
				  <nav className="nav" style={{ display: 'flex', gap: '1rem', flexGrow: 1 }}>
					{publicLinks.map(link => (
					  <Link key={link.to} to={link.to}>{link.label}</Link>
					))}
				  </nav>
				  {isLoggedIn ? (
					<div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 'bold', marginRight: '13%' }}>
					  <span>👤 {user.pseudo || user.username}</span>
					  {privateLinks.map(link => (
						<Link key={link.to} to={link.to}>{link.label}</Link>
					  ))}
					  <span style={{ cursor: 'pointer' }} onClick={handleLogout}>Se déconnecter</span>
					</div>
				  ) : (
					<div style={{ marginLeft: 'auto', marginRight: '20%' }}>
					  <Link to="/connexion">Se connecter</Link>
					</div>
				  )}
				</div>

				{/* Navbar mobile - affichée uniquement en dessous de 992px et quand menu ouvert */}
				{menuOpen && (
				  <div className="wrapper-mobile" style={{
					/* position: 'absolute',
					top: '60px', 				// ajuste selon la hauteur du header
					left: 0,
					right: 0,
					backgroundColor: 'white',
					display: 'flex',
					flexDirection: 'column',
					paddingLeft: '4rem',  		// espace horizontal
					gap: '1rem',
					zIndex: 1000,  */
				  }}>
				<nav className={`nav ${menuOpen ? 'open' : ''}`}>
				  {publicLinks.map(link => (
					<Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
					  ))}
					  {isLoggedIn ? (
						<>
						  <span style={{ fontWeight: 'bold', marginTop: '1rem' }}>👤 {user.pseudo || user.username}</span>
						  {privateLinks.map(link => (
							<Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
						  ))}
						  <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { handleLogout(); setMenuOpen(false); }}>Se déconnecter</span>
						</>
					  ) : (
						<Link to="/connexion" onClick={() => setMenuOpen(false)}>Se connecter</Link>
					  )}
					</nav>
				  </div>
				)}
			  </div>

			  {/* Message temporaire de déconnexion */}
			  {message && (
				<div style={{
				  position: 'fixed',
				  top: 10,
				  right: 10,
				  backgroundColor: '#4caf50',
				  color: 'white',
				  padding: '10px 20px',
				  borderRadius: '5px',
				  zIndex: 9999,
				  boxShadow: '0 0 10px rgba(0,0,0,0.3)'
				}}>
				  {message}
				</div>
			  )}
		</header>

	);
}
