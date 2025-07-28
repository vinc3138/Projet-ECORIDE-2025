<?php
namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

#[MongoDB\Document(collection: "kpi_journalier")]
class KpiJournalier
{
    #[MongoDB\Id(strategy: "AUTO")]
    private $id;

    #[MongoDB\Field(type: "date")]
    private ?\DateTime $date = null;

    #[MongoDB\Field(type: "int")]
    private ?int $credits_gagnes = null;

    #[MongoDB\Field(type: "int")]
    private ?int $nb_covoiturages = null;

    public function getId(): ?string
    {
        return $this->id;
    }

	public function getDate(): ?\DateTime
	{
		return $this->date;
	}

    public function setDate(\DateTime $date): self
    {
        $this->date = $date;
        return $this;
    }

	public function getCreditsGagnes(): ?int
	{
		return $this->credits_gagnes;
	}

    public function setCreditsGagnes(int $credits_gagnes): self
    {
        $this->credits_gagnes = $credits_gagnes;
        return $this;
    }

	public function getNbCovoiturages(): ?int
	{
		return $this->nb_covoiturages;
	}

    public function setNbCovoiturages(int $nb_covoiturages): self
    {
        $this->nb_covoiturages = $nb_covoiturages;
        return $this;
    }
}
