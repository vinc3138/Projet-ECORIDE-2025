import React from 'react';
import { Navigate } from 'react-router-dom';

export function RedirectIfAuthenticated({ children }) {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    
    return <Navigate to="/" replace />; 	// L'utilisateur est connecté → redirection vers la page d'accueil
  }

  return children; 							// Sinon, on affiche la page protégée (ex: connexion)
}