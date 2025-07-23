<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'statut_reservation')]
class StatutReservation
{
    #[ORM\Id]
    #[ORM\Column(name: 'statut_reservation_id', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'statut_reservation', type: 'string', length: 50, nullable: true)]
    private ?string $statutReservation = null;

    // Getters et setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getStatutReservation(): ?string
    {
        return $this->statutReservation;
    }

    public function setStatutReservation(?string $statutReservation): self
    {
        $this->statutReservation = $statutReservation;
        return $this;
    }
}
