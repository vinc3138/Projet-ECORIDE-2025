<?php

namespace App\Repository;

use App\Entity\Preference;
use App\Entity\PreferenceUtilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityRepository;


class PreferenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PreferenceUtilisateur::class);
    }

    // Récupère toutes les préférences pour un utilisateur donné
    public function findByUser($user)
    {
        return $this->createQueryBuilder('pu')
            ->innerJoin('pu.preference', 'p') // Jointure avec la table Preference
            ->where('pu.utilisateur = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}
