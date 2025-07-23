<?php

namespace App\Controller;

use App\Entity\Covoiturage;
use App\Entity\StatutCovoiturage;
use App\Repository\VoitureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

class USERCreerTrajetController extends AbstractController
{
    #[Route('/api/create_trajet', name: 'create_trajet', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        VoitureRepository $voitureRepository,
        LoggerInterface $logger
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }

        $data = json_decode($request->getContent(), true);
        $modele = $data['vehicule_id'] ?? null;

		// Récupérer l'objet StatutCovoiturage avec l'id 1
		$statut = $em->getRepository(StatutCovoiturage::class)->find(1);

		if (!$statut) {
			return $this->json([
				'success' => false,
				'message' => 'Statut covoiturage introuvable'
			], 400);
		}

        try {
            // Recherche de la voiture liée à l'utilisateur
            $fullModele = $data['vehicule_id'] ?? null;
			$voiture = $voitureRepository->findOneByUtilisateurAndMarqueModele($user, $fullModele);

            if (!$voiture) {
                return $this->json([
                    'success' => false,
                    'message' => 'Voiture introuvable ou non liée à cet utilisateur',
                    'user_id' => $user->getId(),
                    'username' => $user->getPseudo(),
                    'modele_vehicule' => $modele,
                ], 400);
            }

            // Création du trajet
            $trajet = new Covoiturage();
            $trajet->setVilleDepart($data['depart']);
            $trajet->setAdresseDepart($data['adresse_depart']);
            $trajet->setVilleArrivee($data['destination']);
            $trajet->setAdresseArrivee($data['adresse_arrivee']);
            $trajet->setDateDepart(new \DateTime($data['date_depart']));
            $trajet->setHeureDepart(new \DateTime($data['heure_depart']));
            $trajet->setDateArrivee(new \DateTime($data['date_arrivee']));
            $trajet->setHeureArrivee(new \DateTime($data['heure_arrivee']));
            $trajet->setNbPlace($data['places']);
            $trajet->setPrixPassager($data['prix']);
            $trajet->setVoiture($voiture);
            $trajet->setChauffeur($user);
            $trajet->setStatutCovoiturage($statut);
			$trajet->setDateCreation(new \DateTime());
            $em->persist($trajet);
            $em->flush();

            return $this->json([
                'success' => true,
                'trajet_id' => $trajet->getCovoiturageId()
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'error' => $e->getMessage(),
                'data_received' => $data
            ], 500);
        }
    }
}
