<?php

namespace App\Controller;

use App\Entity\Avis;
use App\Repository\AvisRepository;
use App\Repository\CovoiturageRepository;
use App\Repository\ReservationRepository;
use App\Repository\StatutReservationRepository;
use App\Repository\StatutCovoiturageRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

class EMPLOYEAfficherCovoituragesController extends AbstractController
{

	#[Route('/api/liste_covoiturages', name: 'liste_covoiturages')]
	public function index(CovoiturageRepository $repo): JsonResponse
	{
		$covoiturages = $repo->findCovoituragesWithReservationsAndAvis();

		$statutLabels = [
			1 => 'À VALIDER',
			2 => 'VALIDÉ',
			3 => 'REFUSÉ',
			4 => 'ANNULÉ',
		];

		$covoituragesArray = array_map(function($covoiturage) use ($statutLabels) {
			return [
				'covoiturage_id' => $covoiturage->getCovoiturageId(),
				'date' => $covoiturage->getDateDepart()->format('d/m/Y'),
				'depart' => $covoiturage->getVilleDepart(),
				'arrivee' => $covoiturage->getVilleArrivee(),
				'covoiturage_statut' => $covoiturage->getStatutCovoiturage()?->getStatutCovoiturage(),
				'reservations' => array_map(function($reservation) use ($statutLabels) {
					$avis = $reservation->getAvis();
					$statutId = $avis ? $avis->getStatutAvis() : null;

					return [
						'reservation_id' => $reservation->getReservationId(),
						'reservation_statut' => $reservation->getStatutReservation()?->getStatutReservation(),
						'paiement' => $reservation->getPaiementRealise(),
						'datePaiement' => $reservation->getDatePaiement()?->format('d/m/Y'),
						'avis' => $avis ? [
							'avis_id' => $avis->getAvisId(),
							'avis_statut' => $statutId,
							'avis_statut_label' => $statutId ? $statutLabels[$statutId] : null,
							'commentaire' => $avis->getCommentaire(),
							'note' => $avis->getNote(),
						] : null,
					];
				}, $covoiturage->getReservations()->toArray()),
			];
		}, $covoiturages);

		return new JsonResponse(['covoiturages' => $covoituragesArray]);
	}

}