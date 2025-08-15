<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'role')]
class StatutRole
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'role_id', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'libelle', type: 'string', length: 50, nullable: true)]
    private ?string $libelle = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(?string $libelle): self
    {
        $this->libelle = $libelle;
        return $this;
    }
}