import React, { useState, useEffect } from 'react';  // ajout de useEffect
import { checkPasswordSecurity } from '../utils/passwordCheck';
import { useAuth } from '../context/authToken';
import { useNavigate, Link } from 'react-router-dom';

export default function Connexion() {
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityColor, setSecurityColor] = useState('');
  
  // ** Nouvel état pour message de logout expiré **
  const [logoutMessage, setLogoutMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le message de logout expiré, s'il existe
    const msg = localStorage.getItem('logoutMessage');
    if (msg) {
      setLogoutMessage(msg);
      localStorage.removeItem('logoutMessage');  // le retirer après affichage
    }
  }, []);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const { message, color } = checkPasswordSecurity(value);
    setSecurityMessage(message);
    setSecurityColor(color);
  };

  const handleConnexion = async (e) => {
    e.preventDefault();

	// Suppression du message d'expiration dès nouvelle soumission
	setLogoutMessage('');
	
    try {
      setLoading(true);
	  await login(email, password);

      setMessage('Connexion réussie !');
      setError('');
      navigate('/');
	  setLoading(false);
	  
    } catch (err) {
      setLoading(false);
	  console.error('Erreur lors de la connexion :', err);
      setError('Identifiants invalides ou erreur de connexion.');
      setMessage('');
    }
  };

  return (
    <div className="container">
      <h2>Connexion</h2>

      <form onSubmit={handleConnexion}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email :</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Mot de passe :</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {securityMessage && (
            <small className={`form-text ${securityColor}`}>
              {securityMessage}
            </small>
          )}
        </div>

        <button type="submit" className="btn btn-success">Se connecter</button>
      </form>

	  <div className="btn btn-link btn-sm">
	    <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
	  </div>
	  
	  {/* 🔄 Loading */}
	  <div className="mt-4">
	    {loading && (
	      <div className="text-center mt-5">
	        <div className="spinner-border text-primary" role="status" />
	        <p className="mt-3">Chargement en cours...</p>
	      </div>
	    )}
	  </div>
	  
      {/* Affichage du message logout expiré */}
      {logoutMessage && (
        <div className="alert alert-warning" role="alert">
          {logoutMessage}
        </div>
      )}

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
	  
    </div>
  );
}
