<?php
namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Utilisateur;

class TestPasswordHashCommand extends Command
{
    private $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;

        parent::__construct('app:test-password-hash');
    }

    protected function configure()
    {
        $this->setDescription('Teste le hashage du mot de passe STUDi2025!');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $dummyUser = new Utilisateur();
        $hashedPassword = $this->passwordHasher->hashPassword($dummyUser, 'STUDi2025!');

        $output->writeln('Mot de passe hashé :');
        $output->writeln($hashedPassword);

        return Command::SUCCESS;
    }
}
