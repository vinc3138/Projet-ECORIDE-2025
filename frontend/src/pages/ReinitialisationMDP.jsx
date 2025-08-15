import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { checkPasswordSecurity } from '../utils/passwordCheck';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState('');

  const [securityMessage, setSecurityMessage] = useState('');
  const [securityColor, setSecurityColor] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const handlePasswordChange = (value) => {
    setPassword(value);

    const { message, color } = checkPasswordSecurity(value);
    setSecurityMessage(message);
    setSecurityColor(color);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setAlertType('');

    try {
      const response = await fetch(`${API_URL}/api/reset_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlertType('success');
        setMessage('✅ Mot de passe réinitialisé avec succès !');
      } else {
        setAlertType('danger');
        setMessage(`❌ ${data.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setAlertType('danger');
      setMessage('❌ Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

	return (
	
		<div className="container mt-5">
		  
		  <h3>Définir un nouveau mot de passe</h3>
		  
			<form onSubmit={handleSubmit}>
			
				<input
				  type="password"
				  className="form-control"
				  placeholder="Nouveau mot de passe"
				  value={password}
				  onChange={(e) => handlePasswordChange(e.target.value)}
				  required
				/>

				{securityMessage && (
				  <small className={`form-text ${securityColor}`}>{securityMessage}</small>
				)}

				<button
				  type="submit"
				  className="btn btn-success w-100 mt-3"
				  disabled={loading}
				>
				  {loading ? 'Envoi...' : 'Valider'}
				</button>
			
		  </form>

		  {message && (
			<div className={`alert alert-${alertType} mt-3`}>{message}</div>
		  )}
		</div>
	
	);
}
