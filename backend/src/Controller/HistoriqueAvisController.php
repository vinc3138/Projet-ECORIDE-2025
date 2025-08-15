<?php

namespace App\Controller;

use App\Repository\AvisRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

class HistoriqueAvisController extends AbstractController
{
    private $avisRepository;

    public function __construct(AvisRepository $avisRepository)
    {
        $this->avisRepository = $avisRepository;
    }


#[Route('/api/avis/chauffeur', name: 'api_avis_chauffeur', methods: ['GET'])]
public function getAvisChauffeur(AvisRepository $avisRepo): JsonResponse
{
    $user = $this->getUser();

    if (!$user) {
        return $this->json(['error' => 'Non authentifié'], 401);
    }

    $avis = $avisRepo->findByChauffeur($user);

    $data = array_map(function ($a) {
        return [
            'note_id' => $a->getAvisId(),
            'note' => $a->getNote(),
            'commentaire' => $a->getCommentaire(),
            'date_note' => $a->getDateCreationCommentaire()?->format('Y-m-d'),
            'pseudo_utilisateur' => $a->getAuteur()?->getPseudo() ?? 'Anonyme',
        ];
    }, $avis);

    return $this->json([
        'evaluations' => $data,
        'note_moyenne' => $user->getNote(), // ou getNoteMoyenne() selon ton entité Utilisateur
    ]);
}
}
