<?php

namespace App\Controller;

use App\Repository\CovoiturageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class RechercheTrajetController extends AbstractController
{
    #[Route('/api/recherche-trajet', name: 'recherche_trajet', methods: ['GET'])]
    public function rechercheTrajets(Request $request, CovoiturageRepository $covoiturageRepository): JsonResponse
    {
        $depart = $request->query->get('depart');
        $destination = $request->query->get('destination');
        $date = $request->query->get('date');

        $ecologique = $request->query->get('ecologique');
        $prixMax = $request->query->get('prix_max');
        $dureeMax = $request->query->get('duree_max');
        $noteMin = $request->query->get('note_min');

        // Vérifie que départ et destination sont fournis
        if (!$depart || !$destination) {
            return new JsonResponse(['error' => 'Paramètres manquants.'], 400);
        }

        // Appelle une méthode personnalisée dans le repository
        $trajets = $covoiturageRepository->rechercher(
            // Champs obligatoires :
			$depart,
            $destination,
            // Champs facultatifs :
			$date,
			// Filtres :
            $ecologique,
            $prixMax,
            $dureeMax,
            $noteMin
        );

        $results = array_map(function($trajet) {
			return [
			'id' => $trajet->getCovoiturageId(),
			'villeDepart' => $trajet->getVilleDepart(),
			'villeArrivee' => $trajet->getVilleArrivee(),
			'dateDepart' => $trajet->getDateDepart() ? $trajet->getDateDepart()->format('Y-m-d') : null,
			'prix' => $trajet->getPrixPassager(),
			'duree' => sprintf(
				'%02dh%02d',
				floor($trajet->getDureeTrajet() / 60),
				$trajet->getDureeTrajet() % 60
			),
			'distance' => $trajet->getDistanceTrajet(),
			'ecologique' => $trajet->getEstEcologique(),
			'chauffeur' => [
			  'pseudo' => $trajet->getChauffeur()->getPseudo(),
			  'note' => $trajet->getChauffeur()->getNote(),
			  'photo' => $trajet->getChauffeur()->getPhoto()
			],
			'voiture' => [
				'modele' => $trajet->getVoiture()?->getModele(),
			],
			'place' => $trajet->getNbPlace(),
			];
		}, $trajets);

		return new JsonResponse($results, 200);
    }
}

