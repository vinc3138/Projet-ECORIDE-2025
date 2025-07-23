<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'statut_covoiturage')]
class StatutCovoiturage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'statut_covoiturage_id', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'statut_covoiturage', type: 'string', length: 50)]
    private string $statutCovoiturage;

    // Getters et setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatutCovoiturage(): string
    {
        return $this->statutCovoiturage;
    }

    public function setStatutCovoiturage(string $statutCovoiturage): self
    {
        $this->statutCovoiturage = $statutCovoiturage;
        return $this;
    }
}