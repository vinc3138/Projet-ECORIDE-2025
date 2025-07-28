import React, { useState } from 'react';
import { useAuth } from '../context/authToken'; // vrai contexte login

export default function ConnexionTester() {
	
	// --- Fonction mock pour tests sans BDD ---
	const fakeLogin = async (email, password) => {
	  if (!email.includes('@')) throw new Error('Email invalide');
	  if (password.length < 6) throw new Error('Mot de passe trop court');

	  const validUsers = [
		{ email: 'test@example.com', password: 'securePassword123' },
		{ email: 'xxxxx@xxxxxx.com', password: 'Sxxxxxxxxxxxx' },
	  ];

	  const found = validUsers.find(u => u.email === email && u.password === password);
	  if (found) return Promise.resolve();
	  else throw new Error('Identifiants invalides');
	};

  // --- Vraie fonction login du contexte ---
  const { login } = useAuth();

  const testCases = [
    {
      label: 'Email invalide (sans @)',
      email: 'invalidemail.com',
      password: 'somePassword123',
      expectError: true,
    },
    {
      label: 'Mot de passe trop court',
      email: 'test@example.com',
      password: '123',
      expectError: true,
    },
    {
      label: 'Identifiants incorrects',
      email: 'wrong@example.com',
      password: 'wrongPassword',
      expectError: true,
    },
    {
      label: 'Connexion réussie',
      email: 'passagerchauffeur@passagerchauffeur.com',
      password: 'STUDi2025!',
      expectError: false,
    },
  ];

  // --- États et résultats ---
  const [results, setResults] = useState([]);
  const [runInProgress, setRunInProgress] = useState(false);

  // Fonction commune pour exécuter une liste de tests avec une fonction login donnée
  const runTestsWithLoginFunction = async (loginFn) => {
    setRunInProgress(true);
    const newResults = [];

    for (const test of testCases) {
      try {
        await loginFn(test.email, test.password);
        if (test.expectError) {
          newResults.push({
            label: test.label,
            result: '❌ Test KO : succès inattendu',
          });
        } else {
          newResults.push({
            label: test.label,
            result: '✅ Test OK',
          });
        }
      } catch (err) {
        if (test.expectError) {
          newResults.push({
            label: test.label,
            result: `✅ Test OK (erreur capturée : ${err.message})`,
          });
        } else {
          newResults.push({
            label: test.label,
            result: `❌ Test KO : erreur inattendue (${err.message})`,
          });
        }
      }
    }

    setResults(newResults);
    setRunInProgress(false);
  };

  return (
    <div className="p-4">
      <h2>Tests automatiques du composant Connexion</h2>

      <div className="mb-3">
        <button
          onClick={() => runTestsWithLoginFunction(fakeLogin)}
          disabled={runInProgress}
          className="btn btn-secondary me-3"
        >
          Lancer tests MOCK (sans BDD)
        </button>

        <button
          onClick={() => runTestsWithLoginFunction(login)}
          disabled={runInProgress}
          className="btn btn-primary"
        >
          Lancer tests RÉELS (avec BDD)
        </button>
      </div>

      <ul className="list-group">
        {results.map((res, i) => (
          <li key={i} className="list-group-item">
            <strong>{res.label} :</strong> {res.result}
          </li>
        ))}
      </ul>
    </div>
  );
}
