<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class USEREnregistrerPhotoController extends AbstractController
{
    #[Route('/api/upload_user_photo', name: 'upload_user_photo', methods: ['POST'])]
    public function upload(Request $request, EntityManagerInterface $em): Response
    {
		
		$user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
		
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        $file = $request->files->get('photo');
        if (!$file) {
            return new JsonResponse(['error' => 'Aucun fichier reçu'], 400);
        }

        $photoData = file_get_contents($file->getPathname());
        $user->setPhoto($photoData);
        $em->flush();

        return new JsonResponse(['success' => true]);
    }
}
