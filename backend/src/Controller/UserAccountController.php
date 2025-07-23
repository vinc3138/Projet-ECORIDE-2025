<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

class UserAccountController extends AbstractController
{
    #[Route('/api/user', name: 'api_user_get', methods: ['GET'])]
    public function getUserInfo(Security $security): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof Utilisateur) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }
		
        return new JsonResponse([
            'user_id' => $user->getId(),
			'pseudo' => $user->getPseudo(),
            'privilege' => $user->getPrivilege(),
			'role' => $user->getRole(),
            'photo' => $user->getPhoto(),
            'infos' => [
                'prenom' => $user->getPrenom(),
                'nom' => $user->getNom(),
                'email' => $user->getEmail(),
                'adresse' => $user->getAdresse(),
                'telephone' => $user->getTelephone(),
                'date_naissance' => $user->getDateNaissance()?->format('Y-m-d'),
            ],
            'credit' => $user->getCredit(),
        ]);
    }


#[Route('/api/compte_utilisateur', name: 'api_user_update', methods: ['POST'])]
public function updateInfos(Request $request, Security $security, EntityManagerInterface $em): JsonResponse
{
    $user = $this->getUser();

    if (!$user instanceof Utilisateur) {
        return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
    }

    try {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Données invalides'], 400);
        }
		
		if (!is_array($data) || empty($data)) {
			return new JsonResponse(['error' => 'Données invalides ou vides'], 400);
		}

        $allowedFields = ['prenom', 'nom', 'email', 'adresse', 'telephone', 'date_naissance', 'role'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                if ($field === 'date_naissance') {
                    try {
                        $user->setDateNaissance(new \DateTime($data[$field]));
                    } catch (\Exception) {
                        return new JsonResponse(['error' => 'Format de date invalide'], 400);
                    }
                } else {
                    $setter = 'set' . ucfirst($field);
                    if (method_exists($user, $setter)) {
                        $user->$setter($data[$field]);
                    } else {
                        throw new \Exception("Méthode $setter inexistante sur Utilisateur");
                    }
                }
            }
        }

        $em->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Informations mises à jour.',
        ]);
    } catch (\Exception $e) {
        return new JsonResponse([
            'error' => 'Erreur interne : ' . $e->getMessage(),
        ], 500);
    }
}

}
