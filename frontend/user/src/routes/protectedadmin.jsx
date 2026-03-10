import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch('http://localhost:3000/auth/check/admin', {
        method: 'GET',
        headers: { token }
      });

      const data = await response.json();

      if (!data.authenticated) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

    } catch (err) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) return null;

  return isAuthenticated ? children : <Navigate to="/auth" />;
}