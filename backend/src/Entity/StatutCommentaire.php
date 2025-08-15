<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'statut_commentaire')]
class StatutCommentaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_statut_commentaire', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'statut_commentaire', type: 'string', length: 50)]
    private string $statutCommentaire;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatutCommentaire(): string
    {
        return $this->statutCommentaire;
    }

    public function setStatutCommentaire(string $statutCommentaire): self
    {
        $this->statutCommentaire = $statutCommentaire;
        return $this;
    }
}