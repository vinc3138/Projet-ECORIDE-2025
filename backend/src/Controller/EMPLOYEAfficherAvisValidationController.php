<?php

namespace App\Controller;

use App\Repository\AvisRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class EMPLOYEAfficherAvisValidationController extends AbstractController
{
    #[Route('/api/avis_a_valider', name: 'avis_a_valider', methods: ['GET'])]
    public function getAvisAvalider(AvisRepository $avisRepository): JsonResponse
    {
        // Récupérer les avis à valider, qui ont le statut_reservation_id = 3 (À VALIDER)
        $avisAvalider = $avisRepository->findByAvisAvalider(); 

        return new JsonResponse($avisAvalider);
    }
}