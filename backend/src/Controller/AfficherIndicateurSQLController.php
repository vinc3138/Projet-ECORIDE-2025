<?php
namespace App\Controller;

use App\Repository\CovoiturageRepository;
use App\Repository\ReservationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;



class AfficherIndicateurSQLController extends AbstractController
{

	#[Route('/api/kpi_SQL_journalier', name: 'kpi_SQL_journalier', methods: ['GET'])]
	public function index(
		Request $request,
		CovoiturageRepository $covoiturageRepo,
		ReservationRepository $reservationRepo
	): JsonResponse {
		$start = $request->query->get('start');
		$end   = $request->query->get('end');

		// Filtre de date optionnel
		$dateStart = $start ? new \DateTimeImmutable($start) : null;
		$dateEnd   = $end ? new \DateTimeImmutable($end) : null;

		// --- Appel des deux méthodes de KPI ---
		$covoituragesParJour = $covoiturageRepo->countKPICovoituragesParJour($dateStart, $dateEnd);
		$creditsParJour      = $reservationRepo->countKPICreditsParJour($dateStart, $dateEnd);

		// --- Retour JSON combiné ---
		return $this->json([
			'covoiturages' => $covoituragesParJour,
			'credits'      => $creditsParJour
		]);
	}

}
