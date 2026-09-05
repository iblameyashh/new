import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access');
      if (token) {
        const { data } = await api.get('/auth/me/');
        setUser(data);
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login/', { username: email, password });
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      await checkUser();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
