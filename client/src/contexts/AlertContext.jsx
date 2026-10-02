import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { alertsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await alertsAPI.getAll({ limit: 15 });
      if (res.data?.success) {
        setAlerts(res.data.alerts || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Ignore background fetch failure
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 45000); // 45 seconds refresh
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchAlerts]);

  const markRead = async (id) => {
    try {
      await alertsAPI.markRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark alert as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all alerts as read', err);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        loading,
        fetchAlerts,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
