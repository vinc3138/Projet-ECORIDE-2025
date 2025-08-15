<?php

namespace App\Repository;

use App\Entity\PreferenceUtilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PreferenceUtilisateurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PreferenceUtilisateur::class);
    }

    // Récupère toutes les préférences pour un utilisateur donné
    public function findByUser($user)
    {
        return $this->createQueryBuilder('pu')
            ->innerJoin('pu.preference', 'p')
            ->where('pu.utilisateur = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
	
    // Vérifie si la préférence existe selon l'utilisateur
	public function findOneByUserAndPreferenceIds(int $userId, int $preferenceId): ?PreferenceUtilisateur
	{
		return $this->createQueryBuilder('pu')
			->where('IDENTITY(pu.utilisateur) = :userId')
			->andWhere('IDENTITY(pu.preference) = :preferenceId')
			->setParameter('userId', $userId)
			->setParameter('preferenceId', $preferenceId)
			->getQuery()
			->getOneOrNullResult();
	}
	
}