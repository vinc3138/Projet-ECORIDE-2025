<?php

namespace App\Controller;

use App\Repository\ReservationRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class EMPLOYEAfficherAvisNegatifController extends AbstractController
{
    #[Route('/api/avis_negatifs', name: 'avis_negatifs', methods: ['GET'])]
    public function getAvisNegatifs(ReservationRepository $reservationRepository): JsonResponse
    {
        // Récupérer les avis négatifs, qui ont le statut_reservation_id = 4 (TERMINE SIGNALE)
        $avisNegatifs = $reservationRepository->findByAvisNegatifs(); 

        return new JsonResponse($avisNegatifs);
    }
}