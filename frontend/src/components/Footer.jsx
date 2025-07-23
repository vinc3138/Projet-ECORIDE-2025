import React from 'react';
import { Link } from 'react-router-dom';


export default function Footer() {
  return (
    
	<footer className="bg-dark text-white d-flex justify-content-center align-items-center">

    <div className="container">
          
      <div className="d-flex">
          
        {/* 1ère colonne - Mentions légales  */}
		<div className="col mb-0 text-center">
		  <Link to="/mentions-legales" className="text-decoration-none text-white">
			Mentions légales
		  </Link>
		</div>
            
        {/* 2ème colonne - Intitulé */}
        <div className="col mb-0 text-center">&copy; 2025 EcoRide. Tous droits réservés.</div>

        {/* 3ème colonne - Mail de contact */}
        <div className="col mb-0 text-center">
          <a className="text-white" href="mailto:contact@ecoride.com">
            contact@ecoride.com
          </a>
        </div>
          
      </div>
      
    </div>
	  
  </footer>
	
  );
}