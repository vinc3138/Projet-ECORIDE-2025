<?php

namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;


#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\Table(name: 'utilisateur')]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: "utilisateur_id", type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    private string $email;

    #[ORM\Column(type: 'string', length: 255)]
    private string $password;

    #[ORM\Column(type: 'string', length: 50)]
    private string $pseudo;

    #[ORM\Column(name: "role_id", type: "integer")]
    private int $role;

    #[ORM\Column(name: "privilege_id", type: "integer")]
    private int $privilege;

    #[ORM\Column(name: "photo", type: "blob", nullable: true, options: ["length" => 4294967295])]
    private $photo;

    #[ORM\Column(name: "prenom", type: "string", length: 100)]
    private ?string $prenom = null;

    #[ORM\Column(name: "nom", type: "string", length: 100)]
    private ?string $nom = null;

    #[ORM\Column(name: "date_naissance", type: "date")]
    private \DateTimeInterface $dateNaissance;

    #[ORM\Column(name: "telephone", type: "string", length: 20)]
    private ?string $telephone = null;

    #[ORM\Column(name: "adresse", type: "string", length: 255)]
    private ?string $adresse = null;

    #[ORM\Column(name: "credit", type: "float")]
    private float $credit = 0.0;

    #[ORM\Column(name: "note", type: "float", nullable: true)]
    private ?float $note = null;

    // === GETTERS / SETTERS ===

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    public function getPseudo(): string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): self
    {
        $this->pseudo = $pseudo;
        return $this;
    }

    public function getRole(): int
    {
        return $this->role;
    }

    public function setRole(int $role): self
    {
        $this->role = $role;
        return $this;
    }

    public function getPrivilege(): int
    {
        return $this->privilege;
    }

    public function setPrivilege(int $privilege): self
    {
        $this->privilege = $privilege;
        return $this;
    }

	public function getPhoto(): ?string 
	{
		if ($this->photo === null) {
			return null;
		}

		// Si c'est une ressource (stream)
		if (is_resource($this->photo)) {
			$contents = stream_get_contents($this->photo);
			if ($contents === false) {
				return null;
			}

			$finfo = new \finfo(FILEINFO_MIME_TYPE);
			$mimeType = $finfo->buffer($contents);

			if (strpos($mimeType, 'image/') === 0) {
				$base64 = base64_encode($contents);
				return 'data:' . $mimeType . ';base64,' . $base64;
			}

			return null;
		}

		// Sinon, si c'est une chaîne (chemin/URL)
		if (is_string($this->photo) && strlen($this->photo) > 0) {
			return $this->photo;
		}

		return null;
	}

    public function setPhoto($photo): self
    {
        $this->photo = $photo;
        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;
        return $this;
    }

    public function getDateNaissance(): \DateTimeInterface
    {
        return $this->dateNaissance;
    }

    public function setDateNaissance(\DateTimeInterface $dateNaissance): self
    {
        $this->dateNaissance = $dateNaissance;
        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): self
    {
        $this->telephone = $telephone;
        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): self
    {
        $this->adresse = $adresse;
        return $this;
    }

    public function getCredit(): float
    {
        return $this->credit;
    }

    public function setCredit(float $credit): self
    {
        $this->credit = $credit;
        return $this;
    }

    public function getNote(): ?float
    {
        return $this->note;
    }

    public function setNote(?float $note): self
    {
        $this->note = $note;
        return $this;
    }

    // === INTERFACE UserInterface ===

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

	#[\Deprecated]
	public function eraseCredentials(): void
	{
		// méthode vide ou la logique déplacée ailleurs
	}





    #[ORM\OneToMany(mappedBy: 'utilisateur', targetEntity: PreferenceUtilisateur::class)]
    private Collection $utilisateurPreferences;

    public function __construct()
    {
        $this->utilisateurPreferences = new ArrayCollection();
    }

    public function getUtilisateurPreferences(): Collection
    {
        return $this->utilisateurPreferences;
    }	
	
	
}
