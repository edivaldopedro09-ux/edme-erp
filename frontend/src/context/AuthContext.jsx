import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edme_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sincroniza os dados do utilizador (plano, maxCompanies, role) com o servidor ao abrir a app
  const refreshUser = async () => {
    const token = localStorage.getItem('edme_token');
    if (!token) return;

    try {
      const { data } = await api.get('/auth/me'); // Certifique-se de ter esta rota no backend
      const updatedUser = data.user || data;
      localStorage.setItem('edme_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      // Se o token expirou ou for inválido, limpa a sessão
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('edme_token', data.token);
    localStorage.setItem('edme_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('edme_token', data.token);
    localStorage.setItem('edme_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('edme_token');
    localStorage.removeItem('edme_user');
    localStorage.removeItem('edme_active_company');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);