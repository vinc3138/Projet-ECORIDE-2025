<?php

namespace App\Repository;

use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Utilisateur>
 */
class UtilisateurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Utilisateur::class);
    }

    // ➕ Tu peux ajouter ici des méthodes personnalisées, par exemple :

    /**
     * Trouver un utilisateur par son pseudo
     */
    public function findOneByPseudo(string $pseudo): ?Utilisateur
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.pseudo = :pseudo')
            ->setParameter('pseudo', $pseudo)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Trouver un utilisateur par son email
     */
    public function findOneByEmail(string $email): ?Utilisateur
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.email = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
