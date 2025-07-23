<?php

namespace App\Controller;

use App\Repository\CovoiturageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class MajTrajetController extends AbstractController
{
    #[Route('/api/trajets/statut', name: 'maj_statut_trajet', methods: ['POST'])]
    public function majStatut(
        Request $request,
        CovoiturageRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $trajetId = $data['covoiturage_id'] ?? null;
        $action = $data['action'] ?? null;

        if (!$trajetId || !$action) {
            return $this->json(['success' => false, 'message' => 'Paramètres manquants'], 400);
        }

        $trajet = $repo->find($trajetId);
        if (!$trajet) {
            return $this->json(['success' => false, 'message' => 'Trajet introuvable'], 404);
        }

        if ($trajet->getUtilisateur() !== $this->getUser()) {
            return $this->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        switch ($action) {
            case 'commencer':
                $trajet->setStatutCovoiturage(2);
                break;
            case 'terminer':
                $trajet->setStatutCovoiturage(3);
                break;
            case 'annuler':
                $trajet->setStatutCovoiturage(4);
                break;
            default:
                return $this->json(['success' => false, 'message' => 'Action inconnue'], 400);
        }

        $em->flush();

        return $this->json(['success' => true]);
    }
}
