<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use \DateTimeImmutable;

#[ORM\Entity]
#[ORM\Table(name: 'reservation')]
class Reservation
{
    #[ORM\Id]
    #[ORM\Column(name: 'reservation_id', type: 'integer')]
	#[ORM\GeneratedValue]
    private ?int $reservationId = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'utilisateur_id', nullable: true)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\ManyToOne(targetEntity: Covoiturage::class)]
    #[ORM\JoinColumn(name: 'covoiturage_id', referencedColumnName: 'covoiturage_id', nullable: true)]
    private ?Covoiturage $covoiturage = null;

    #[ORM\Column(name: 'date_reservation',type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateReservation = null;

    public function __construct()
    {
        $this->dateReservation = new DateTimeImmutable();
    }

    #[ORM\Column(name: 'nb_places_reservees', type: 'integer', nullable: true)]
    private ?int $nbPlacesReservees = null;

	#[ORM\ManyToOne(targetEntity: StatutReservation::class)]
	#[ORM\JoinColumn(name: 'statut_reservation_id', referencedColumnName: 'statut_reservation_id')]
	private ?StatutReservation $statutReservation = null;

    #[ORM\Column(name: 'paiement_realise', type: 'boolean', options: ['default' => false])]
    private bool $paiementRealise = false;

    #[ORM\Column(name: 'avis_redige', type: 'boolean', options: ['default' => false])]
    private bool $avisRedige = false;

    #[ORM\Column(name: 'note_envoye', type: 'boolean', options: ['default' => false])]
    private bool $noteEnvoye = false;

    // Getters et Setters

    public function getReservationId(): ?int
    {
        return $this->reservationId;
    }

    public function setReservationId(int $id): self
    {
        $this->reservationId = $id;
        return $this;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): self
    {
        $this->utilisateur = $utilisateur;
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

    public function getDateReservation(): ?\DateTimeInterface
    {
        return $this->dateReservation;
    }

    public function setDateReservation(?\DateTimeInterface $date): self
    {
        $this->dateReservation = $date;
        return $this;
    }

    public function getNbPlacesReservees(): ?int
    {
        return $this->nbPlacesReservees;
    }

    public function setNbPlacesReservees(?int $nb): self
    {
        $this->nbPlacesReservees = $nb;
        return $this;
    }

    public function getStatutReservation(): ?StatutReservation
    {
        return $this->statutReservation;
    }

    public function setStatutReservation(?StatutReservation $statut): self
    {
        $this->statutReservation = $statut;
        return $this;
    }

    public function isPaiementRealise(): bool
    {
        return $this->paiementRealise;
    }

    public function setPaiementRealise(bool $val): self
    {
        $this->paiementRealise = $val;
        return $this;
    }

    public function isAvisRedige(): bool
    {
        return $this->avisRedige;
    }

    public function setAvisRedige(bool $val): self
    {
        $this->avisRedige = $val;
        return $this;
    }

    public function isNoteEnvoye(): bool
    {
        return $this->noteEnvoye;
    }

    public function setNoteEnvoye(bool $val): self
    {
        $this->noteEnvoye = $val;
        return $this;
    }
}