import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';


export function PublicRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    const response = await fetch('http://localhost:3000/auth/check', {
      method: 'GET',
      headers: {
        'token': token
      }
    });
    const data = await response.json();
    setIsAuthenticated(data.authenticated);
  };

  if (isAuthenticated === null) {
    return;
  }

  return isAuthenticated ? <Navigate to="/home" /> : children;
}
