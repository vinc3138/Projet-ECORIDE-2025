<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Service\MailService;
use Symfony\Component\Routing\Annotation\Route;


class EnvoiFormulaireController extends AbstractController
{
    #[Route('/api/envoi_formulaire', name: 'envoi_formulaire', methods: ['POST'])]
    public function sendEmail(Request $request, MailService $mailService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $sujet = $data['sujet'] ?? null;
        $message = $data['message'] ?? null;
        $emailExpediteur = $data['email'] ?? null;

        if (!$sujet || !$message || !$emailExpediteur) {
            return $this->json(['error' => 'Champs requis manquants'], 400);
        }

        try {
            $mailService->send(
                to: 'contact@ecoride.com',
                subject: $sujet,
                content: $message,
                replyTo: $emailExpediteur
            );

            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['error' => "Erreur d'envoi : " . $e->getMessage()], 500);
        }
    }
}
