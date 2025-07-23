<?php

namespace App\Controller;

use App\Repository\ReservationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class AfficherGainsPlateformeController extends AbstractController
{
    #[Route('/api/total_credits', name: 'total_credits', methods: ['GET'])]
    public function getTotalCredits(ReservationRepository $reservationRepository): JsonResponse
    {
        // Utiliser la méthode du repository pour obtenir le nombre de réservations payées
        $reservationsCount = $reservationRepository->countPaidReservations();

        // Calculer le total des crédits : chaque réservation = 2 crédits
        $totalCredits = $reservationsCount * 2;

        // Retourner la réponse en JSON avec le total des crédits
        return new JsonResponse(['totalCredits' => $totalCredits]);
    }
}

