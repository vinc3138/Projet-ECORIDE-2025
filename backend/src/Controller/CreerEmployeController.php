<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class CreerEmployeController extends AbstractController
{

    // Route pour récupérer tous les utilisateurs non suspendus et non administrateurs
    #[Route('/api/liste_user', name: 'liste_user', methods: ['GET'])]
    public function getUsers(EntityManagerInterface $entityManager): JsonResponse
    {
        // Recherche des utilisateurs avec les critères suivants :
        // - Privilege != 1 (pas un admin)
        // - Privilege != 4 (pas suspendu)
        // - Role != 5 (pas suspendu)
        $users = $entityManager->getRepository(Utilisateur::class)->findBy([
            'privilege' => [2, 3],  // Privileges 2 et 3 (pas 1 pour admin)
            'role' => [2, 3, 4],    // Roles 2, 3, 4 (pas 1 pour admin et pas 5 pour suspendu)
        ]);

        // Si aucun utilisateur trouvé
        if (!$users) {
            return new JsonResponse(['message' => 'Aucun utilisateur trouvé'], 404);
        }

        // Récupérer les informations à afficher
        $data = [];
        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'pseudo' => $user->getPseudo(),
                'email' => $user->getEmail(),
                'privilege' => $user->getPrivilege(),
                'role' => $user->getRole(),
            ];
        }

        return new JsonResponse($data, 200);
    }

	// Route pour créer un employé
    #[Route('/api/create_employe', name: 'create_employe', methods: ['POST'])]
    public function createEmployee(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        // Récupérer les données envoyées via le formulaire
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
        $user->setRole(4);
        $user->setPrivilege(2);
		$user->setCredit(20);
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur créé avec succès'], 201);
    }
	
	// Route pour inactiver un utilisateur
    #[Route('/api/suspend_user', name: 'suspend_user', methods: ['POST'])]
    public function suspendUser(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // Récupération de l'ID utilisateur envoyé dans le body de la requête
        $data = json_decode($request->getContent(), true);
        $userId = $data['id'] ?? null;

        if (!$userId) {
            return new JsonResponse(['error' => 'ID utilisateur requis'], 400);
        }

        // Chercher l'utilisateur par son ID
        $user = $entityManager->getRepository(Utilisateur::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier que l'utilisateur n'est pas déjà suspendu
        if ($user->getRole() === 5) {
            return new JsonResponse(['error' => 'L\'utilisateur est déjà suspendu'], 400);
        }

        // Modifier son rôle à 5 (SUSPENDU)
        $user->setRole(5);
        $user->setPrivilege(4);
		$user->setCredit(0);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur suspendu avec succès'], 200);
    }
	
}
