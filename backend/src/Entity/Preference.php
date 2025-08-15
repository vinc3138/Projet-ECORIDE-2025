<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
#[ORM\Table(name: 'preference')]
class Preference
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(name: "preference_id", type: 'integer')]
    private int $preferenceId;

    #[ORM\Column(name: "preference", type: 'string', length: 255, nullable: true)]
    private ?string $preference;

    #[ORM\Column(name: "statut_preference", type: 'string', length: 255)]
    private string $statutPreference;

    #[ORM\OneToMany(mappedBy: 'preference', targetEntity: PreferenceUtilisateur::class)]
    private Collection $utilisateurPreferences;

    public function __construct()
    {
        $this->utilisateurPreferences = new ArrayCollection();
    }

    public function getPreferenceId(): int
    {
        return $this->preferenceId;
    }

    public function getPreference(): ?string
    {
        return $this->preference;
    }

    public function setPreference(?string $preference): self
    {
        $this->preference = $preference;
        return $this;
    }

    public function getStatutPreference(): string
    {
        return $this->statutPreference;
    }

    public function setStatutPreference(string $statutPreference): self
    {
        $this->statutPreference = $statutPreference;
        return $this;
    }


}

