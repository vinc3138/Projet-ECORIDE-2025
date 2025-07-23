<?php

namespace App\Controller;

use App\Repository\CovoiturageRepository;
use App\Repository\AvisRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DetailTrajetController extends AbstractController
{
    #[Route('/api/trajetdetail/{id}', name: 'api_trajetdetail', methods: ['GET', 'OPTIONS'])]
    public function detailTrajet(int $id, CovoiturageRepository $covoiturageRepo, AvisRepository $avisRepo): JsonResponse
    {
        $trajet = $covoiturageRepo->afficherDetailTrajet($id);

        if (!$trajet) {
            return new JsonResponse(['error' => 'Trajet non trouvé'], 404);
        }

        $chauffeur = $trajet->getChauffeur();

        if (!$chauffeur) {
            return new JsonResponse(['error' => 'Chauffeur non trouvé'], 404);
        }

        // Récupérer les avis liés au covoiturage (trajet) triés par date décroissante
        $avis = $avisRepo->findBy(
            ['covoiturage' => $trajet],
            ['dateCreationCommentaire' => 'DESC']
        );

        // Mise en forme des avis
        $avisData = array_map(function ($avis) {
            return [
                'noteAvis' => $avis->getNote(),
                'commentaireAvis' => $avis->getCommentaire(),
                'dateAvis' => $avis->getDateCreationCommentaire()?->format('Y-m-d'),
                'auteurAvis' => $avis->getAuteur()?->getPseudo() ?? 'Anonyme',
            ];
        }, $avis);

        $data = [
            'id' => $trajet->getCovoiturageId(),
            'villeDepart' => $trajet->getVilleDepart(),
            'villeArrivee' => $trajet->getVilleArrivee(),
            'dateDepart' => $trajet->getDateDepart()->format('Y-m-d'),
            'heureDepart' => $trajet->getHeureDepart()->format('H:i:s'),
            'prixPassager' => $trajet->getPrixPassager(),
            'voiture' => [
                'modele' => $trajet->getVoiture()?->getModele(),
				'energie' => $trajet->getVoiture()?->getEnergie(),
            ],
            'nbPlace' => $trajet->getNbPlace(),
            'estEcologique' => $trajet->getEstEcologique(),
            'chauffeur' => [
                'id' => $chauffeur->getId(),
                'pseudo' => $chauffeur->getPseudo(),
                'prenom' => $chauffeur->getPrenom(),
                'nom' => $chauffeur->getNom(),
                'note' => $chauffeur->getNote(),
                'photo' => $chauffeur->getPhoto() ?? null,
                'avis' => $avisData,
            ],
        ];

        return new JsonResponse($data);
    }
}
