<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

class USERChangerRoleController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/api/changer-role', name: 'changer-role', methods: ['PUT'])]
    public function changerRole(Request $request): JsonResponse
    {
        // Récupérer les données envoyées
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id'] ?? null;
        $newRole = $data['new_role'] ?? null;

        // Vérifier si les paramètres nécessaires sont fournis
        if (!$userId || !$newRole) {
            return new JsonResponse(['message' => 'ID utilisateur ou nouveau rôle manquant.'], 400);
        }

        // Récupérer l'utilisateur depuis la base de données
        $utilisateur = $this->entityManager->getRepository(Utilisateur::class)->find($userId);
        if (!$utilisateur) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé.'], 404);
        }

        // Vérifier si le rôle est valide
        $validRoles = [1, 2, 3];

        if (!in_array($newRole, $validRoles)) {
            return new JsonResponse(['message' => 'Rôle invalide.'], 400);
        }

        // Mettre à jour le rôle de l'utilisateur
        $utilisateur->setRole($newRole);

        // Sauvegarder les modifications
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Rôle mis à jour avec succès.', 'new_role' => $newRole]);
    }
}