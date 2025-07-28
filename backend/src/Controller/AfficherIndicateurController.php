<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\Routing\Annotation\Route;
use App\Document\KpiJournalier;

class AfficherIndicateurController extends AbstractController
{
    private DocumentManager $dm;

    public function __construct(DocumentManager $dm)
    {
        $this->dm = $dm;
    }

    #[Route('/api/kpi/journalier', name: 'api_kpi_journalier', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $start = $request->query->get('start');
        $end = $request->query->get('end');

        $criteria = [];

        if ($start && $end) {
            $criteria['date'] = [
                '$gte' => new \DateTime($start),
                '$lte' => new \DateTime($end),
            ];
        }

        $repository = $this->dm->getRepository(KpiJournalier::class);
        $kpis = $repository->findBy($criteria, ['date' => 'ASC']);

        $data = array_map(function (KpiJournalier $kpi) {
            return [
                'id' => $kpi->getId(),
                'date' => $kpi->getDate() ? $kpi->getDate()->format('Y-m-d') : null,
                'credits_gagnes' => $kpi->getCreditsGagnes(),
                'nb_covoiturages' => $kpi->getNbCovoiturages(),
            ];
        }, $kpis);

        return $this->json($data);
    }
}
