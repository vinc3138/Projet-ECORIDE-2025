<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use DateTimeInterface;

#[ORM\Entity]
#[ORM\Table(name: 'avis')]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'avis_id', type: 'integer')]
    private ?int $avis_id = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $note = null;

    #[ORM\Column(name: 'statut', type: 'integer', nullable: true)]
    private ?int $statut_avis = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class, inversedBy: 'avisRecus')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'utilisateur_id', nullable: true)]
    private ?Utilisateur $auteur = null;

    #[ORM\ManyToOne(targetEntity: Covoiturage::class)]
    #[ORM\JoinColumn(name: 'covoiturage_id', referencedColumnName: 'covoiturage_id', nullable: true)]
    private ?Covoiturage $covoiturage = null;

    #[ORM\Column(name: 'date_creation_commentaire', type: 'datetime', nullable: true)]
    private ?DateTimeInterface $dateCreationCommentaire = null;

    // Getters and setters

    public function getAvisId(): ?int
    {
        return $this->avis_id;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): self
    {
        $this->commentaire = $commentaire;
        return $this;
    }

    public function getNote(): ?int
    {
        return $this->note;
    }

    public function setNote(?int $note): self
    {
        $this->note = $note;
        return $this;
    }

    public function getStatutAvis(): ?int
    {
        return $this->statut_avis;
    }

    public function setStatutAvis(?int $statutAvis): self
    {
        $this->statut_avis = $statutAvis;
        return $this;
    }

    public function getAuteur(): ?Utilisateur
    {
        return $this->auteur;
    }

    public function setAuteur(?Utilisateur $auteur): self
    {
        $this->auteur = $auteur;
        return $this;
    }

    public function getCovoiturage(): ?Covoiturage
    {
        return $this->covoiturage;
    }

    public function setCovoiturage(?Covoiturage $covoiturage): self
    {
        $this->covoiturage = $covoiturage;
        return $this;
    }

    public function getDateCreationCommentaire(): ?DateTimeInterface
    {
        return $this->dateCreationCommentaire;
    }

    public function setDateCreationCommentaire(?DateTimeInterface $dateCreationCommentaire): self
    {
        $this->dateCreationCommentaire = $dateCreationCommentaire;
        return $this;
    }
}
