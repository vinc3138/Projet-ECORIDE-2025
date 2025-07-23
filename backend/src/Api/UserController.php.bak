<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\User\UserInterface;

class UserController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(?UserInterface $user): JsonResponse
    {
        if (!$user) {
            return new JsonResponse(['error' => 'Non authentifié'], 401);
        }

        // On retourne uniquement les infos nécessaires (exclure le mot de passe etc.)
        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'pseudo' => method_exists($user, 'getPseudo') ? $user->getPseudo() : $user->getUsername(),
                'privilege' => $user->getPrivilege(), // ou autre selon ton entité
                'role' => $user->getRoles(),
            ],
        ]);
    }
}
