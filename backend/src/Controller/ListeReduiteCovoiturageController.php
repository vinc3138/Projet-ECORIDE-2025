<?php

namespace App\Controller;

use App\Repository\CovoiturageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ListeReduiteCovoiturageController extends AbstractController
{
    #[Route('/api/liste_reduite_covoiturage', name: 'liste_reduite_covoiturage', methods: ['GET'])]
    public function previews(CovoiturageRepository $repo): JsonResponse
    {
        $covoiturages = $repo->findListeCovoiturages() ?? [];

        $data = array_map(fn($c) => [
            'covoiturage_id' => $c->getCovoiturageId(),
            'dateDepart' => $c->getDateDepart()->format('d/m/Y'),
			'heureDepart' => $c->getHeureDepart()->format('H:i'),
            'villeDepart' => $c->getVilleDepart(),
            'villeArrivee' => $c->getVilleArrivee(),
            'prix' => $c->getPrixPassager(),
            'chauffeur' => $c->getChauffeur()->getPseudo(),
        ], $covoiturages);

        return $this->json($data);
    }
}
