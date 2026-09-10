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

  const handleTokens = (authData) => {
    if (authData?.accessToken) {
      localStorage.setItem('accessToken', authData.accessToken);
    }
    if (authData?.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await authService.getCurrentUser();
      const rawUser = response.data || response;
      setUser(normalizeUser(rawUser));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const rawData = response.data || response;
    handleTokens(rawData);
    const normalized = normalizeUser(rawData);
    setUser(normalized);
    toast.success('Welcome back to TaskForge AI!');
    return normalized;
  };

  const googleLogin = async (idToken) => {
    const response = await authService.googleLogin(idToken);
    const rawData = response.data || response;
    handleTokens(rawData);
    const normalized = normalizeUser(rawData);
    setUser(normalized);
    toast.success('Signed in with Google!');
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

    // Automatically log in after registration to acquire JWT tokens
    const loginResponse = await authService.login({ email, password });
    const rawLoginData = loginResponse.data || loginResponse;
    handleTokens(rawLoginData);

    const normalized = normalizeUser(rawLoginData || rawUser);
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
        googleLogin,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
