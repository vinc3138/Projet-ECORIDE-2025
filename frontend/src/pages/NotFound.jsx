import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center" style={{ padding: '3rem' }}>
      <h1 className="display-4 text-danger">404 - Page non trouvée</h1>
      <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn btn-success mt-3">
        Retour à l'accueil
      </Link>
    </div>
  );
}