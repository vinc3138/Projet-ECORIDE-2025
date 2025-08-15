import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../context/expiredToken';


const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    if (isTokenExpired(token)) {
      localStorage.removeItem('jwt_token');
      localStorage.setItem('logoutMessage', 'Token expiré : merci de vous reconnecter');
      navigate('/connexion');
    }
  }, [token, navigate]);

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
};

export default PrivateRoute;
