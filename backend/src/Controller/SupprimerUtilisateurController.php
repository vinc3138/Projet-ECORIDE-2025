<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class SupprimerUtilisateurController extends AbstractController
{

    #[Route('/api/suspendre_utilisateur', name: 'suspendre_utilisateur', methods: ['GET', 'POST'])]
    public function manageUsers(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // Si c'est une requête GET, on récupère les utilisateurs
        if ($request->isMethod('GET')) {
            $users = $entityManager->getRepository(Utilisateur::class)->findBy([
                'privilege' => [2, 3],  // Privilèges 2 (EMPLOYE) et 3 (UTILISATEUR)
                'role' => [1, 2, 3, 4],    // Rôle autre 5 (SUSPENDU)
            ]);

            // Si aucun utilisateur trouvé
            if (!$users) {
                return new JsonResponse(['message' => 'Aucun utilisateur trouvé'], 404);
            }

            return new JsonResponse($users, 200);
        }

        // Si c'est une requête POST, on suspend un utilisateur
        if ($request->isMethod('POST')) {
            $data = json_decode($request->getContent(), true);
            $userId = $data['id'] ?? null;

            if (!$userId) {
                return new JsonResponse(['error' => 'L\'ID de l\'utilisateur est requis'], 400);
            }

            $user = $entityManager->getRepository(Utilisateur::class)->find($userId);

            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Suspendre l'utilisateur en modifiant son rôle
            $user->setPrivilege(4);  // 5 pour "suspendu"
            $user->setRole(5);  // 5 pour "suspendu"
            $entityManager->persist($user);
            $entityManager->flush();

            return new JsonResponse(['message' => 'Utilisateur suspendu avec succès'], 200);
        }

        return new JsonResponse(['error' => 'Méthode non autorisée'], 405);
    }
}
