<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'marque')]
class Marque
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'marque_id', type: 'integer')]
    private ?int $marque_id = null;

    #[ORM\Column(name: 'marque', type: 'string', length: 50, nullable: true)]
    private ?string $marque = null;

    public function getMarqueId(): ?int
    {
        return $this->marque_id;
    }

    public function getMarque(): ?string
    {
        return $this->marque;
    }

    public function setMarque(?string $marque): self
    {
        $this->marque = $marque;
        return $this;
    }
}