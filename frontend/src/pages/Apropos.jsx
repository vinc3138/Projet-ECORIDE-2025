import React, { useEffect } from 'react';
import { initZoomableImages } from "../utils/zoomImage";

export default function Apropos() {
  useEffect(() => {
    const cleanup = initZoomableImages(); // Initialise le zoom
    return cleanup; // Nettoyage
  }, []);

  return (
    <div>
      <div className="row">
        <div className="column">
          <h6 className="texte_01">Les équipes EcoRide</h6>
          <img className="zoomable picture_style_02" src="/Pictures/PICTURE_EQUIPE_ECORIDE.png" alt="Equipe EcoRide" />
        </div>

        <div className="column">
          <h6 className="texte_01">Les locaux EcoRide</h6>
          <img className="zoomable picture_style_02" src="/Pictures/PICTURE_LOCAUX_ECORIDE.jpeg" alt="Locaux EcoRide" />
        </div>

        <div className="column">
          <h6 className="texte_01">Les partenaires qui nous ont fait confiance</h6>
          <img className="zoomable picture_style_02" src="/Pictures/PICTURE_PARTENAIRES_ECORIDE.png" alt="Partenaires EcoRide" />
        </div>
      </div>

      <div className="jumbotron text-center">
        <br />
        <h4 className="display-8 text-success">À propos d'EcoRide</h4>
        <p>
          Nous sommes une jeune start-up française, basée à Angers et créée en 2024.<br />
          Notre objectif est de réduire l'impact environnemental des déplacements en encourageant le covoiturage.<br />
          En constante évolution, EcoRide prône une approche écologique et compte déjà de nombreux partenaires qui nous font confiance.<br />
          Des questions ? Contactez-nous !<br />
        </p>
        <div>
          <a className="btn btn-success btn-lg" href="tel:0212345678">02.12.34.56.78</a>
          <span className="mx-2">ou</span>
          <a className="btn btn-success btn-lg" href="mailto:contact@ecoride.com">contact@ecoride.com</a>
        </div>

        <hr className="my-8" />
      </div>
    </div>
  );
}
