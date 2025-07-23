<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\Persistence\ManagerRegistry;      // <-- Add this import
use App\Entity\Utilisateur;

class TestPasswordController extends AbstractController
{
    private $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/api/test-password', name: 'test_password', methods: ['GET'])]
    public function testPassword(UserPasswordHasherInterface $passwordHasher): Response
    {
        $user = $this->doctrine->getRepository(Utilisateur::class)->findOneBy(['email' => 'admin@admin.fr']);

        if (!$user) {
            return new Response('Utilisateur non trouvé', 404);
        }

        $passwordToTest = 'STUDi2025!';

        $isValid = $passwordHasher->isPasswordValid($user, $passwordToTest);

        return new Response($isValid ? 'Mot de passe valide' : 'Mot de passe invalide');
    }
}
