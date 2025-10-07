
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('user');
    
    setIsAuthenticated(authStatus);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return { isAuthenticated, user };
};
