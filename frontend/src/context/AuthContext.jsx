import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/services';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData) => {
    if (!userData) return null;
    const name = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email;
    return { ...userData, name };
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      const rawUser = response.data || response;
      setUser(normalizeUser(rawUser));
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const rawUser = response.data || response;
    const normalized = normalizeUser(rawUser);
    setUser(normalized);
    toast.success('Welcome back to TaskForge AI!');
    return normalized;
  };

  const register = async (firstName, lastName, email, password, role = 'ROLE_TEAM_MEMBER') => {
    const response = await authService.register({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    const rawUser = response.data || response;
    const normalized = normalizeUser(rawUser);
    setUser(normalized);
    toast.success('Account created successfully!');
    return normalized;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
