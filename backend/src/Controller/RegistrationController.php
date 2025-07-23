<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
		
		
		// Gestion des erreurs
        if (!isset($data['email'], $data['password'], $data['pseudo'])) {
            return new JsonResponse(['error' => 'Email, pseudo et mot de passe requis'], 400);
        }

        $existingUser = $entityManager->getRepository(Utilisateur::class)->findOneBy(['pseudo' => $data['pseudo']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Ce pseudo est déjà utilisé'], 400);
        }

        $existingUserEmail = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $data['email']]);
        if ($existingUserEmail) {
            return new JsonResponse(['error' => 'Cet email est déjà utilisé'], 400);
        }

		// Création du User
        $user = new Utilisateur();
        $user->setEmail($data['email']);
        $user->setPseudo($data['pseudo']);
        $user->setRole(3);
        $user->setPrivilege(3);
		$user->setCredit(20);				// Ajout de 20 crédits lors de la création
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur créé avec succès'], 201);
    }
}
