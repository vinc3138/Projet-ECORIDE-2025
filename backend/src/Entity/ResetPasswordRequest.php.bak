<?php

namespace App\Entity;

use App\Entity\Utilisateur;
use Doctrine\ORM\Mapping as ORM;
use SymfonyCasts\Bundle\ResetPassword\Model\ResetPasswordRequestInterface;
use SymfonyCasts\Bundle\ResetPassword\Model\ResetPasswordRequestTrait;
use App\Repository\ResetPasswordRequestRepository;

#[ORM\Entity(repositoryClass: ResetPasswordRequestRepository::class)]
#[ORM\Table(name: 'reset_password_requests')]
class ResetPasswordRequest implements ResetPasswordRequestInterface
{
    use ResetPasswordRequestTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Utilisateur $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

	public function getUser(): object
	{
		return $this->user;
	}

    public function setUser(Utilisateur $user): self
    {
        $this->user = $user;
        return $this;
    }
}
