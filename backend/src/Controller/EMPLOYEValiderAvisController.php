<?php

namespace App\Controller;

use App\Entity\Avis;
use App\Repository\AvisRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

class EMPLOYEValiderAvisController extends AbstractController
{
    private $entityManager;
    private $avisRepository;

    public function __construct(EntityManagerInterface $entityManager, AvisRepository $avisRepository)
    {
        $this->entityManager = $entityManager;
        $this->avisRepository = $avisRepository;
    }

    #[Route('/api/validation_avis', name: 'validation_avis', methods: ['PUT'])]
    public function validationAvis(Request $request): JsonResponse
    {
        // Récupérer les données
        $data = json_decode($request->getContent(), true);
        $avisId = $data['avis_id'] ?? null;
        $action = $data['action'] ?? null;

        // Vérification de l'existence de l'avis
        $avis = $this->avisRepository->find($avisId);
        if (!$avis) {
            return new JsonResponse(['message' => 'Avis non trouvé.'], 404);
        }

        // Traitement de l'action
        if ($action === 'Validé') {
            $avis->setStatutAvis(4);  // Statut 4 = Validé
        } elseif ($action === 'Refusé') {
            $avis->setStatutAvis(5);  // Statut 5 = Refusé
        } else {
            return new JsonResponse(['message' => 'Action inconnue.'], 400);
        }

        // Sauvegarder les changements
        $this->entityManager->flush();

        return new JsonResponse(['message' => "Avis mis à jour avec succès - ID de l'avis : {$avisId} - Action : {$action}. Actualiser la page pour mettre à jour la liste."]);

    }
}
