const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Utilisateur de test
const user = {
  email: 'employe@employe.fr',
  password: 'STUDi2025!',
  privilege: 'EMPLOYE',
  pseudo: 'EmployeTest'
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === user.email && password === user.password) {
    // Réponse simulée : token fictif + infos utilisateur
    return res.json({
      message: 'Connexion réussie !',
      token: 'fake-jwt-token-123456',
      user: {
        email: user.email,
        privilege: user.privilege,
        pseudo: user.pseudo,
      }
    });
  } else {
    return res.status(401).json({ message: 'Email ou mot de passe invalide.' });
  }
});

app.listen(port, () => {
  console.log(`Serveur de test démarré sur http://localhost:${port}`);
});
