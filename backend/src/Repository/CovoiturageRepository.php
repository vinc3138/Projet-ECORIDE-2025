<?php

namespace App\Repository;

use App\Entity\Covoiturage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CovoiturageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Covoiturage::class);
    }

    /**
     * Recherche des trajets avec filtres optionnels.
     *
     * @param string $depart
     * @param string $destination
     * @param string|null $date (format AAAA-MM-JJ)
     * @param bool|null $ecologique
     * @param float|null $prixMax
     * @param int|null $dureeMax (en minutes)
     * @param float|null $noteMin
     * 
     * @return Covoiturage[]
     */
    public function rechercher($depart, $destination, $date = null, $ecologique = null, $prixMax = null, $dureeMax = null, $noteMin = null)
    {
        $qb = $this->createQueryBuilder('c')
            ->join('c.chauffeur', 'u')
            ->join('c.voiture', 'v')
            ->join('c.statutCovoiturage', 'sc')
            ->where('c.villeDepart = :depart')
            ->andWhere('c.villeArrivee = :destination')
            ->andWhere('sc.id IN (:statuts)')
            ->setParameter('depart', $depart)
            ->setParameter('destination', $destination)
            ->setParameter('statuts', [0, 1]);

        if ($date) {
            $qb->andWhere('c.dateDepart >= :dateDepart')
               ->setParameter('dateDepart', new \DateTime($date));
        }

        if ($ecologique !== null) {
            $qb->andWhere('c.estEcologique = :ecologique')
               ->setParameter('ecologique', (bool)$ecologique);
        }

        if ($prixMax !== null) {
            $qb->andWhere('c.prixPassager <= :prixMax')
               ->setParameter('prixMax', $prixMax);
        }

        if ($dureeMax !== null) {
            $qb->andWhere('c.dureeTrajet <= :dureeMax')
               ->setParameter('dureeMax', $dureeMax);
        }

        if ($noteMin !== null) {
            $qb->andWhere('u.note >= :noteMin')
               ->setParameter('noteMin', $noteMin);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Retourne un covoiturage avec son chauffeur, par id
     *
     * @param int $id
     * @return Covoiturage|null
     */
    public function afficherDetailTrajet(int $id): ?Covoiturage
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.chauffeur', 'ch')
            ->addSelect('ch')
            ->where('c.covoiturage_id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

	public function findByUserWithVehicule(int $userId): array
	{
		return $this->createQueryBuilder('c')
			->select('c.id AS covoiturage_id', 'c.lieuDepart', 'c.lieuArrivee', 'c.dateDepart', 'c.heureDepart', 'c.statut', 'v.marque', 'v.modele', 'c.utilisateur AS utilisateur_id')
			->leftJoin('c.voiture', 'v')
			->where('c.utilisateur_id = :userId')
			->setParameter('userId', $userId)
			->getQuery()
			->getArrayResult();
	}

	public function findByUtilisateurId(int $userId): array
	{
		return $this->createQueryBuilder('cp')
			->select('c.id AS covoiturage_id', 'c.lieuDepart', 'c.lieuArrivee', 'c.dateDepart', 'c.heureDepart', 'c.statut', 'cp.paye', 'v.marque', 'v.modele', 'c.utilisateur AS utilisateur_id')
			->innerJoin('cp.covoiturage', 'c')
			->leftJoin('c.voiture', 'v')
			->where('cp.utilisateur_id = :userId')
			->setParameter('userId', $userId)
			->getQuery()
			->getArrayResult();
	}

}