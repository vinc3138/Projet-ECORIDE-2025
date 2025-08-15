<?php

namespace App\Controller;

use App\Repository\VoitureRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

class HistoriqueVoitureController extends AbstractController
{
    private VoitureRepository $voitureRepository;

    public function __construct(VoitureRepository $voitureRepository)
    {
        $this->voitureRepository = $voitureRepository;
    }

    #[Route('/api/voiture_utilisateur', name: 'api_voitures_utilisateur', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getVoituresUtilisateur(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $voitures = $this->voitureRepository->findByUtilisateur($user);

        $data = array_map(function($voiture) {
            return [
                'id' => $voiture->getVoitureId(),
                'marque' => $voiture->getMarque(),
                'modele' => $voiture->getModele(),
				'couleur' => $voiture->getCouleur(),
                'immatriculation' => $voiture->getImmatriculation(),
				'energie' => $voiture->getEnergie(),
				'nb_places' => $voiture->getNbPlacesVoiture(),
            ];
        }, $voitures);

        return $this->json($data);
    }
}
