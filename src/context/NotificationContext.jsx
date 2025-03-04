import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to Socket.io server
      const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.io');
        // Join user's room for private notifications
        newSocket.emit('join', user._id);
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      setSocket(newSocket);

      // Fetch existing notifications
      fetchNotifications();

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
            credentials: 'include'
        });
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]); // Ensure it's an empty array if error occurs
    }
};


  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications: notifications || [], // Ensure it's always an array
    unreadCount: (notifications || []).filter(n => !n.read).length,
    markAsRead,
    markAllAsRead
};


  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
