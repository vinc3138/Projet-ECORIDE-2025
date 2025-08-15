<?php

namespace App\Repository;

use App\Entity\Marque;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MarqueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Marque::class);
    }

    /**
     * Récupère toutes les marques sous forme de tableau associatif
     * utile pour un affichage front.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findAllAsArray(): array
    {
        $qb = $this->createQueryBuilder('m')
            ->select('m.marque_id', 'm.marque');

        return $qb->getQuery()->getArrayResult();
    }
}