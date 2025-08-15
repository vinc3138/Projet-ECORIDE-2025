<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'privilege')]
class Privilege
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'privilege_id', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'privilege', type: 'string', length: 50)]
    private string $privilege;

    // Getters et setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPrivilege(): string
    {
        return $this->privilege;
    }

    public function setPrivilege(string $privilege): self
    {
        $this->privilege = $privilege;
        return $this;
    }
}