<?php

namespace App\Controller;

use App\Repository\CovoiturageRepository;
use App\Repository\ReservationRepository;
use App\Repository\AvisRepository;
use App\Entity\Avis;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Security;

class HistoriqueTrajetController extends AbstractController
{
    private CovoiturageRepository $covoiturageRepo;
    private ReservationRepository $reservationRepo;

    public function __construct(CovoiturageRepository $covoiturageRepo, ReservationRepository $reservationRepo)
    {
        $this->covoiturageRepo = $covoiturageRepo;
        $this->reservationRepo = $reservationRepo;
    }

    #[Route('/api/trajets/historique', name: 'trajet_historique', methods: ['GET'])]
    public function historique(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        // Chauffeur : trajets créés par lui
        $chauffeurTrajets = $this->covoiturageRepo->findBy(['chauffeur' => $user]);
        $chauffeurList = array_map(function ($covoit) {
            return [
                'id' => $covoit->getCovoiturageId(),
                'statut' => $covoit->getStatutCovoiturage(),
                'ville_depart' => $covoit->getVilleDepart(),
                'ville_arrivee' => $covoit->getVilleArrivee(),
                'date_depart' => $covoit->getDateDepart()?->format('Y-m-d'),
                'heure_depart' => $covoit->getHeureDepart()?->format('H:i'),
                'places' => $covoit->getNbPlace(),
                'role' => 1, // Chauffeur
                'paye' => true,
                'voiture' => $covoit->getVoiture() ? [
                    'marque' => $covoit->getVoiture()->getMarque(),
                    'modele' => $covoit->getVoiture()->getModele(),
                ] : null,
            ];
        }, $chauffeurTrajets);

        // Passager : réservations faites
        $reservations = $this->reservationRepo->findBy(['utilisateur' => $user]);
        $passagerList = array_map(function ($res) {
            $covoit = $res->getCovoiturage();
            return [
                'id' => $covoit?->getCovoiturageId(),
                'statut' => $res->getStatutReservation(),
                'ville_depart' => $covoit?->getVilleDepart(),
                'ville_arrivee' => $covoit?->getVilleArrivee(),
                'date_depart' => $covoit?->getDateDepart()?->format('Y-m-d'),
                'heure_depart' => $covoit?->getHeureDepart()?->format('H:i'),
                'places' => $res->getNbPlacesReservees(),
                'role' => 2, // Passager
                'paye' => $res->isPaiementRealise(),
                'voiture' => $covoit->getVoiture() ? [
                    'marque' => $covoit->getVoiture()->getMarque(),
                    'modele' => $covoit->getVoiture()->getModele(),
                ] : null,
            ];
        }, $reservations);

        // Fusion & tri
        $all = array_merge($chauffeurList, $passagerList);

        usort($all, function ($a, $b) {
            return strtotime($b['date_depart'] . ' ' . $b['heure_depart']) <=> strtotime($a['date_depart'] . ' ' . $a['heure_depart']);
        });

        return $this->json($all);
    }

}
