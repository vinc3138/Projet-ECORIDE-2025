<?php

namespace App\Repository;

use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use SymfonyCasts\Bundle\ResetPassword\Model\ResetPasswordRequestInterface;
use SymfonyCasts\Bundle\ResetPassword\Persistence\ResetPasswordRequestRepositoryInterface;

class TokenRepository extends ServiceEntityRepository implements ResetPasswordRequestRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Utilisateur::class);
    }

    public function createResetPasswordRequest(
        object $user,
        \DateTimeInterface $expiresAt,
        string $selector,
        string $hashedToken
    ): ResetPasswordRequestInterface {
        if (!$user instanceof Utilisateur) {
            throw new \LogicException('Expected a Utilisateur object.');
        }

        $user->setResetSelector($selector)
             ->setResetToken($hashedToken)
             ->setResetTokenExpiresAt($expiresAt);

        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();

        // On retourne l'utilisateur directement, SymfonyCasts traitera l'objet comme ResetPasswordRequestInterface
        return new class($user) implements ResetPasswordRequestInterface {
            private $user;
            public function __construct($user) { $this->user = $user; }
            public function getUser(): object { return $this->user; }
            public function getSelector(): string { return $this->user->getResetSelector(); }
            public function getHashedToken(): string { return $this->user->getResetToken(); }
            public function getExpiresAt(): \DateTimeInterface { return $this->user->getResetTokenExpiresAt(); }
            public function getRequestedAt(): \DateTimeInterface { return new \DateTimeImmutable(); }
            public function isExpired(): bool { return $this->user->getResetTokenExpiresAt() <= new \DateTimeImmutable(); }
        };
    }

    public function persistResetPasswordRequest(ResetPasswordRequestInterface $resetPasswordRequest): void
    {
        $this->getEntityManager()->flush();
    }

    public function findResetPasswordRequest(string $selector): ?ResetPasswordRequestInterface
    {
        $user = $this->findOneBy(['resetSelector' => $selector]);

        if (!$user) {
            return null;
        }

        return $this->createResetPasswordRequest(
            $user,
            $user->getResetTokenExpiresAt(),
            $user->getResetSelector(),
            $user->getResetToken()
        );
    }

    public function getUserIdentifier(object $user): string
    {
        if (!$user instanceof Utilisateur) {
            throw new \LogicException('Expected a Utilisateur object.');
        }
        return (string) $user->getId();
    }

    public function removeResetPasswordRequest(ResetPasswordRequestInterface $resetPasswordRequest): void
    {
        $user = $resetPasswordRequest->getUser();
        if (!$user instanceof Utilisateur) {
            return;
        }

        $user->setResetSelector(null)
             ->setResetToken(null)
             ->setResetTokenExpiresAt(null);

        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function removeExpiredResetPasswordRequests(): int
    {
        $qb = $this->getEntityManager()->createQueryBuilder()
            ->update(Utilisateur::class, 'u')
            ->set('u.resetSelector', 'NULL')
            ->set('u.resetToken', 'NULL')
            ->set('u.resetTokenExpiresAt', 'NULL')
            ->where('u.resetTokenExpiresAt <= :now')
            ->setParameter('now', new \DateTimeImmutable());

        return $qb->getQuery()->execute();
    }

    public function getMostRecentNonExpiredRequestDate(object $user): ?\DateTimeInterface
    {
        if (!$user instanceof Utilisateur) {
            throw new \LogicException('Expected a Utilisateur object.');
        }

        $expiresAt = $user->getResetTokenExpiresAt();

        if ($expiresAt && $expiresAt > new \DateTimeImmutable()) {
            return $expiresAt->sub(new \DateInterval('PT1H')); // Token valable 1h
        }

        return null;
    }
}
