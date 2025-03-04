import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef();

  useEffect(() => {
    if (user) {
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  return socketRef.current;
}; 
