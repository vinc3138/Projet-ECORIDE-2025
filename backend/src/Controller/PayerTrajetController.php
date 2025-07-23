<?php

namespace App\Controller;

use App\Repository\CovoituragePassagerRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PayerTrajetController extends AbstractController
{
    #[Route('/api/trajets/payer', name: 'payer_trajet', methods: ['POST'])]
    public function payer(
        Request $request,
        CovoituragePassagerRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non connecté'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $covoiturageId = $data['payer'] ?? null;

        if (!$covoiturageId) {
            return $this->json(['success' => false, 'message' => 'ID trajet manquant'], 400);
        }

        $relation = $repo->findOneBy([
            'covoiturage' => $covoiturageId,
            'utilisateur' => $user
        ]);

        if (!$relation) {
            return $this->json(['success' => false, 'message' => 'Relation non trouvée'], 404);
        }

        if ($relation->isPaye()) {
            return $this->json(['success' => false, 'message' => 'Déjà payé']);
        }

        // Simulation du paiement
        $relation->setPaye(true);
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Paiement effectué']);
    }
}
