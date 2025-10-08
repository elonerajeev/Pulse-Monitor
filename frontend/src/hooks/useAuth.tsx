
import { useState, useEffect } from 'react';

export const useAuth = (isDemo = false) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isDemo) {
      setIsAuthenticated(true);
      setUser({ name: 'Demo User', avatarUrl: '' });
    } else {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const userData = localStorage.getItem('user');
      
      setIsAuthenticated(authStatus);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [isDemo]);

  return { isAuthenticated, user };
};
