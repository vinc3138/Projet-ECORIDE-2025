<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

class AjouterCreditController extends AbstractController
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    #[Route('/api/credits/add100', name: 'api_add_credits', methods: ['POST'])]
    public function addCredits(EntityManagerInterface $em): JsonResponse
    {
        // Récupérer l'utilisateur connecté via JWT
        $user = $this->security->getUser();

        if (!$user instanceof Utilisateur) {
            return new JsonResponse(['success' => false, 'message' => 'Utilisateur non connecté'], 401);
        }

        // Ajouter 100 crédits
        $currentCredits = $user->getCredit() ?? 0;
        $user->setCredit($currentCredits + 100);

        // Enregistrer en base
        $em->persist($user);
        $em->flush();

        return new JsonResponse([
            'success' => true,
            'newCredits' => $user->getCredit()
        ]);
    }
}
