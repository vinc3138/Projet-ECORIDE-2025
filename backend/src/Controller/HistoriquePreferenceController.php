<?php

namespace App\Controller;

use App\Entity\Preference;
use App\Repository\PreferenceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class HistoriquePreferenceController extends AbstractController
{
    private $em;
    private $PreferenceRepository ;

    public function __construct(EntityManagerInterface $em, PreferenceRepository $PreferenceRepository )
    {
        $this->em = $em;
        $this->PreferenceRepository  = $PreferenceRepository ;
    }

    #[Route('/api/utilisateur/get_user_preference', name: 'get_user_preference', methods: ['GET'])]
    public function getPreference(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        // Utilise le repository de la table pivot pour récupérer les préférences de l'utilisateur
        $preferenceUtilisateurs = $this->PreferenceRepository->findByUser($user);

        // Map les résultats pour obtenir la liste des préférences
        $data = array_map(function($pu) {
            return $pu->getPreference();
        }, $preferenceUtilisateurs);

		return $this->json([
			'preferences' => $data,
		]);
    }

    #[Route('/api/utilisateur/add_preference', name: 'add_preference', methods: ['POST'])]
    public function addPreference(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        $content = json_decode($request->getContent(), true);
        if (empty($content['preference'])) {
            return $this->json(['error' => 'Préférence manquante'], 400);
        }

        $preferenceValue = $content['preference'];

        // On récupère la préférence correspondante
        $preference = $this->getDoctrine()->getRepository(Preference::class)->findOneBy(['value' => $preferenceValue]);

        if (!$preference) {
            return $this->json(['error' => 'Préférence invalide'], 400);
        }

        // Crée une nouvelle entrée dans la table PreferenceUtilisateur
        $preferenceUtilisateur = new PreferenceUtilisateur();
        $preferenceUtilisateur->setUtilisateur($user);
        $preferenceUtilisateur->setPreference($preference);
        $preferenceUtilisateur->setIsActive(true); // Si tu as une colonne isActive

        $this->em->persist($preferenceUtilisateur);
        $this->em->flush();

        return $this->json(['success' => 'Préférence ajoutée']);
    }

    #[Route('/api/utilisateur/delete_preference/{id}', name: 'delete_preference', methods: ['DELETE'])]
    public function deletePreference(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        // On récupère la préférence associée à l'utilisateur depuis la table pivot
        $preferenceUtilisateur = $this->preferenceUtilisateurRepository->findOneBy(['id' => $id, 'utilisateur' => $user]);

        if (!$preferenceUtilisateur) {
            return $this->json(['error' => 'Préférence non trouvée ou accès refusé'], 404);
        }

        $this->em->remove($preferenceUtilisateur);
        $this->em->flush();

        return $this->json(['success' => 'Préférence supprimée']);
    }
}
