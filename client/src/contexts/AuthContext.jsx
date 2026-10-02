import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('drugtrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('drugtrack_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('drugtrack_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('drugtrack_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('drugtrack_token', receivedToken);
      localStorage.setItem('drugtrack_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Authentication failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('drugtrack_token', receivedToken);
      localStorage.setItem('drugtrack_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout().catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('drugtrack_token');
      localStorage.removeItem('drugtrack_user');
    }
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    if (res.data?.success && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('drugtrack_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data?.message || 'Profile update failed');
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  // Helper function to return dashboard route based on user role
  const getRoleDashboardRoute = (role = user?.role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SUPPLIER':
        return '/supplier/dashboard';
      case 'WAREHOUSE_MANAGER':
        return '/warehouse/dashboard';
      case 'PHARMACY_MANAGER':
        return '/pharmacy/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        hasRole,
        getRoleDashboardRoute,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
